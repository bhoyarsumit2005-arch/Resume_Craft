import { Router } from "express";
import { connect } from "../db";
import { users } from "../schema";
import { json, route, toSafe } from "../http";
import { byEmailOrIp, byIp, limiter } from "../rate-limit";
import {
  ApiError,
  MAX_PASSWORD_LENGTH,
  clearAuthCookie,
  comparePassword,
  generateOtp,
  generateResetToken,
  generateToken,
  hashPassword,
  isValidEmail,
  readJson,
  requireAuth,
  safeEqual,
  setAuthCookie,
  verifyResetToken,
} from "../auth";
import { sendOtpEmail, sendRegistrationOtpEmail } from "../email";

const router = Router();

const MIN = 60_000;
/** The limits below are the brute-force wall around email OTPs and passwords. */
const otpSendEmail = limiter({ max: 3, windowMs: 15 * MIN, key: byEmailOrIp("register-send"), message: "Too many OTP requests for this email." });
const otpSendIp = limiter({ max: 10, windowMs: 15 * MIN, key: byIp("register-send"), message: "Too many OTP requests from this device." });
const otpVerifyEmail = limiter({ max: 10, windowMs: 15 * MIN, key: byEmailOrIp("register-verify"), message: "Too many verification attempts for this email." });
const otpVerifyIp = limiter({ max: 20, windowMs: 15 * MIN, key: byIp("register-verify"), message: "Too many verification attempts from this device." });
const loginEmail = limiter({ max: 10, windowMs: 15 * MIN, key: byEmailOrIp("login"), message: "Too many login attempts for this account." });
const loginIp = limiter({ max: 20, windowMs: 15 * MIN, key: byIp("login"), message: "Too many login attempts from this device." });
const forgotEmail = limiter({ max: 5, windowMs: 15 * MIN, key: byEmailOrIp("forgot"), message: "Too many reset requests for this email." });
const forgotIp = limiter({ max: 10, windowMs: 15 * MIN, key: byIp("forgot"), message: "Too many reset requests from this device." });
const resetOtpEmail = limiter({ max: 10, windowMs: 15 * MIN, key: byEmailOrIp("verify-otp"), message: "Too many OTP attempts for this email." });
const resetOtpIp = limiter({ max: 20, windowMs: 15 * MIN, key: byIp("verify-otp"), message: "Too many OTP attempts from this device." });
const resetIp = limiter({ max: 10, windowMs: 15 * MIN, key: byIp("reset"), message: "Too many password reset attempts from this device." });

/** bcrypt truncates at 72 bytes — refuse longer inputs instead of silently ignoring the tail. */
function assertPasswordLength(password: string): void {
  if (password.length > MAX_PASSWORD_LENGTH) throw new ApiError(400, `Password must be at most ${MAX_PASSWORD_LENGTH} characters.`);
}

// ---------------------------------------------------------------- registration

router.post(
  "/register/send-otp",
  otpSendEmail,
  otpSendIp,
  route(async (req, res) => {
    await connect();
    const body = readJson<{ name?: string; email?: string; password?: string }>(req);
    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";

    if (!name || !email || !password) throw new ApiError(400, "Name, email and password are required.");
    if (name.length < 2) throw new ApiError(400, "Name must be at least 2 characters.");
    if (!isValidEmail(email)) throw new ApiError(400, "Please enter a valid email address.");
    if (password.length < 6) throw new ApiError(400, "Password must be at least 6 characters.");
    assertPasswordLength(password);

    const otp = generateOtp();
    const registrationOtpExpiry = new Date(Date.now() + 10 * MIN);
    const hashed = await hashPassword(password);

    const existing = await users.findOne({ email });
    if (existing) {
      if (existing.isVerified) throw new ApiError(400, "An account with this email already exists.");

      // Re-send OTP for an unverified account
      await users.findByIdAndUpdate(existing._id, {
        $set: { name, password: hashed, registrationOtp: otp, registrationOtpExpiry },
      });
      try {
        await sendRegistrationOtpEmail(email, otp, name);
      } catch (err) {
        console.error("[register] Failed to send email:", err);
        throw new ApiError(500, "Failed to send OTP. Please try again.");
      }
      json(res, { message: "OTP sent to your email." });
      return;
    }

    try {
      await users.create({ name, email, password: hashed, isVerified: false, registrationOtp: otp, registrationOtpExpiry });
    } catch (err) {
      if ((err as { code?: number })?.code === 11000) throw new ApiError(400, "An account with this email already exists.");
      throw err;
    }

    try {
      await sendRegistrationOtpEmail(email, otp, name);
    } catch (err) {
      console.error("[register] Failed to send email:", err);
      throw new ApiError(500, "Failed to send OTP. Please try again.");
    }

    json(res, { message: "OTP sent to your email." });
  })
);

router.post(
  "/register/verify",
  otpVerifyEmail,
  otpVerifyIp,
  route(async (req, res) => {
    await connect();
    const body = readJson<{ email?: string; otp?: string }>(req);
    const email = (body.email ?? "").trim().toLowerCase();
    const otp = (body.otp ?? "").trim();

    if (!email || !isValidEmail(email)) throw new ApiError(400, "Please enter a valid email address.");
    if (!otp || otp.length !== 6) throw new ApiError(400, "Please enter a valid 6-digit OTP.");

    const user = await users.findOne({ email });
    if (!user) throw new ApiError(400, "No pending registration found for this email.");
    if (user.isVerified) throw new ApiError(400, "This account is already verified. Please log in.");
    if (!user.registrationOtp || !user.registrationOtpExpiry) throw new ApiError(400, "Invalid or expired OTP.");

    if (!safeEqual(user.registrationOtp, otp)) throw new ApiError(400, "Invalid OTP.");
    if (new Date() > user.registrationOtpExpiry) {
      await users.findByIdAndUpdate(user._id, { $set: { registrationOtp: undefined, registrationOtpExpiry: undefined } });
      throw new ApiError(400, "OTP has expired. Please request a new one.");
    }

    const updated = await users.findByIdAndUpdate(user._id, {
      $set: { isVerified: true, registrationOtp: undefined, registrationOtpExpiry: undefined },
    }, { returnDocument: "after" });

    setAuthCookie(res, generateToken({ sub: String(user._id), email: user.email }, updated?.tokenVersion ?? 0));
    json(res, { user: toSafe(updated ?? user) });
  })
);

// ---------------------------------------------------------------- login / session

router.post(
  "/login",
  loginEmail,
  loginIp,
  route(async (req, res) => {
    await connect();
    const body = readJson<{ email?: string; password?: string }>(req);
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    if (!email || !password) throw new ApiError(400, "Email and password are required.");

    const user = await users.findOne({ email }).lean();
    if (!user) throw new ApiError(401, "Invalid email or password.");
    if (!user.isVerified) throw new ApiError(400, "Please verify your email before logging in. Check your inbox for the OTP.");

    const ok = await comparePassword(password, user.password);
    if (!ok) throw new ApiError(401, "Invalid email or password.");

    setAuthCookie(res, generateToken({ sub: String(user._id), email: user.email }, user.tokenVersion ?? 0));
    json(res, { user: toSafe(user) });
  })
);

router.get(
  "/me",
  route(async (req, res) => {
    const user = await requireAuth(req);
    json(res, { user });
  })
);

router.post(
  "/logout",
  route(async (_req, res) => {
    clearAuthCookie(res);
    json(res, { message: "Logged out." });
  })
);

// ---------------------------------------------------------------- forgot password

router.post(
  "/forgot-password",
  forgotEmail,
  forgotIp,
  route(async (req, res) => {
    await connect();
    const body = readJson<{ email?: string }>(req);
    const email = (body.email ?? "").trim().toLowerCase();
    if (!email || !isValidEmail(email)) throw new ApiError(400, "Please enter a valid email address.");

    const user = await users.findOne({ email });
    if (!user) {
      // Same response either way — never reveal which addresses exist.
      json(res, { message: "If an account exists with this email, an OTP has been sent." });
      return;
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * MIN);

    await users.findByIdAndUpdate(user._id, { $set: { otp, otpExpiry } });

    try {
      await sendOtpEmail(email, otp, user.name);
    } catch (err) {
      console.error("[otp] Failed to send email:", err);
      throw new ApiError(500, "Failed to send OTP. Please try again.");
    }

    json(res, { message: "OTP sent to your email." });
  })
);

router.post(
  "/verify-otp",
  resetOtpEmail,
  resetOtpIp,
  route(async (req, res) => {
    await connect();
    const body = readJson<{ email?: string; otp?: string }>(req);
    const email = (body.email ?? "").trim().toLowerCase();
    const otp = (body.otp ?? "").trim();

    if (!email || !isValidEmail(email)) throw new ApiError(400, "Please enter a valid email address.");
    if (!otp || otp.length !== 6) throw new ApiError(400, "Please enter a valid 6-digit OTP.");

    const user = await users.findOne({ email });
    if (!user || !user.otp || !user.otpExpiry) throw new ApiError(400, "Invalid or expired OTP.");

    if (!safeEqual(user.otp, otp)) throw new ApiError(400, "Invalid OTP.");
    if (new Date() > user.otpExpiry) {
      await users.findByIdAndUpdate(user._id, { $set: { otp: undefined, otpExpiry: undefined } });
      throw new ApiError(400, "OTP has expired. Please request a new one.");
    }

    json(res, { resetToken: generateResetToken(String(user._id), user.email) });
  })
);

router.post(
  "/reset-password",
  resetIp,
  route(async (req, res) => {
    await connect();
    const body = readJson<{ resetToken?: string; newPassword?: string }>(req);
    const resetToken = body.resetToken ?? "";
    const newPassword = body.newPassword ?? "";

    if (!resetToken) throw new ApiError(400, "Reset token is required.");
    if (!newPassword || newPassword.length < 6) throw new ApiError(400, "Password must be at least 6 characters.");
    assertPasswordLength(newPassword);

    const payload = verifyResetToken(resetToken);
    if (!payload) throw new ApiError(400, "Invalid or expired reset token.");

    const hashed = await hashPassword(newPassword);
    // Bumping tokenVersion signs every outstanding session out — the reset token
    // itself expires in minutes, so only someone who knows the new password returns.
    await users.findByIdAndUpdate(payload.sub, {
      $set: { password: hashed, otp: undefined, otpExpiry: undefined },
      $inc: { tokenVersion: 1 },
    });

    json(res, { message: "Password reset successful. You can now log in." });
  })
);

export default router;
