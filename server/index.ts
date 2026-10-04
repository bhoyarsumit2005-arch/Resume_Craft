import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { connect } from "./db";
import { resumes, users, type ResumeRow } from "./schema";
import { sanitizeResume, serializeResume } from "./resume-validation";
import { sendOtpEmail, sendRegistrationOtpEmail } from "./email";
import { bulletsSuggestion, rateLimit, summarySuggestion, type BulletsInput, type SummaryInput } from "./ai";
import {
  ApiError,
  clearAuthCookie,
  comparePassword,
  generateToken,
  handleApiError,
  hashPassword,
  isValidEmail,
  readJson,
  requireAuth,
  setAuthCookie,
  toSafeUser,
} from "./auth";

const app = express();
app.disable("x-powered-by");
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));

// Keep malformed request bodies on the same JSON error contract as everything else,
// instead of Express's default HTML error page.
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err && typeof err === "object" && (err as { type?: string }).type === "entity.parse.failed") {
    json(res, { message: "Invalid JSON body." }, 400);
    return;
  }
  if (err && typeof err === "object" && (err as { type?: string }).type === "entity.too.large") {
    json(res, { message: "Request body is too large." }, 413);
    return;
  }
  next(err);
});

// Security headers
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

const json = <T>(res: Response, data: T, status = 200) => res.status(status).json(data);

// Wraps async handlers so errors flow through the central error handler.
const route =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, _next: NextFunction) => {
    fn(req, res).catch((err) => handleApiError(err, res));
  };

function parseId(raw: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(raw)) throw new ApiError(400, "Invalid resume id.");
  return new Types.ObjectId(raw);
}

const toSafe = (u: { _id: unknown; name: string; email: string; createdAt: unknown }) =>
  toSafeUser({ _id: u._id, name: u.name, email: u.email, createdAt: new Date(u.createdAt as unknown as string) });

// ---------------------------------------------------------------- auth

app.post(
  "/api/auth/register/send-otp",
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

    const existing = await users.findOne({ email });
    if (existing) {
      if (existing.isVerified) throw new ApiError(400, "An account with this email already exists.");

      // Re-send OTP for an unverified account
      const otp = generateOtp();
      const registrationOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      const hashed = await hashPassword(password);
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

    const otp = generateOtp();
    const registrationOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const hashed = await hashPassword(password);

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

app.post(
  "/api/auth/register/verify",
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

    if (user.registrationOtp !== otp) throw new ApiError(400, "Invalid OTP.");
    if (new Date() > user.registrationOtpExpiry) {
      await users.findByIdAndUpdate(user._id, { $set: { registrationOtp: undefined, registrationOtpExpiry: undefined } });
      throw new ApiError(400, "OTP has expired. Please request a new one.");
    }

    await users.findByIdAndUpdate(user._id, {
      $set: { isVerified: true, registrationOtp: undefined, registrationOtpExpiry: undefined },
    });

    const token = generateToken({ sub: String(user._id), email: user.email });
    setAuthCookie(res, token);
    json(res, { user: toSafe(user), token });
  })
);

app.post(
  "/api/auth/login",
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

    const token = generateToken({ sub: String(user._id), email: user.email });
    setAuthCookie(res, token);
    json(res, { user: toSafe(user), token });
  })
);

app.get(
  "/api/auth/me",
  route(async (req, res) => {
    const user = await requireAuth(req);
    json(res, { user });
  })
);

app.post(
  "/api/auth/logout",
  route(async (_req, res) => {
    clearAuthCookie(res);
    json(res, { message: "Logged out." });
  })
);

// ---------------------------------------------------------------- forgot password

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const OTP_SECRET = process.env.OTP_SECRET || "resumecraft-otp-secret";
const OTP_TTL = "15m";

app.post(
  "/api/auth/forgot-password",
  route(async (req, res) => {
    await connect();
    const body = readJson<{ email?: string }>(req);
    const email = (body.email ?? "").trim().toLowerCase();
    if (!email || !isValidEmail(email)) throw new ApiError(400, "Please enter a valid email address.");

    const user = await users.findOne({ email });
    if (!user) {
      json(res, { message: "If an account exists with this email, an OTP has been sent." });
      return;
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

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

app.post(
  "/api/auth/verify-otp",
  route(async (req, res) => {
    await connect();
    const body = readJson<{ email?: string; otp?: string }>(req);
    const email = (body.email ?? "").trim().toLowerCase();
    const otp = (body.otp ?? "").trim();

    if (!email || !isValidEmail(email)) throw new ApiError(400, "Please enter a valid email address.");
    if (!otp || otp.length !== 6) throw new ApiError(400, "Please enter a valid 6-digit OTP.");

    const user = await users.findOne({ email });
    if (!user || !user.otp || !user.otpExpiry) throw new ApiError(400, "Invalid or expired OTP.");

    if (user.otp !== otp) throw new ApiError(400, "Invalid OTP.");
    if (new Date() > user.otpExpiry) {
      await users.findByIdAndUpdate(user._id, { $set: { otp: undefined, otpExpiry: undefined } });
      throw new ApiError(400, "OTP has expired. Please request a new one.");
    }

    const resetToken = jwt.sign({ sub: String(user._id), email: user.email, purpose: "reset" }, OTP_SECRET, { expiresIn: OTP_TTL });

    json(res, { resetToken });
  })
);

app.post(
  "/api/auth/reset-password",
  route(async (req, res) => {
    await connect();
    const body = readJson<{ resetToken?: string; newPassword?: string }>(req);
    const resetToken = body.resetToken ?? "";
    const newPassword = body.newPassword ?? "";

    if (!resetToken) throw new ApiError(400, "Reset token is required.");
    if (!newPassword || newPassword.length < 6) throw new ApiError(400, "Password must be at least 6 characters.");

    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(resetToken, OTP_SECRET) as jwt.JwtPayload;
    } catch {
      throw new ApiError(400, "Invalid or expired reset token.");
    }

    if (payload.purpose !== "reset" || typeof payload.sub !== "string" || !Types.ObjectId.isValid(payload.sub)) {
      throw new ApiError(400, "Invalid reset token.");
    }

    const hashed = await hashPassword(newPassword);
    await users.findByIdAndUpdate(payload.sub, {
      $set: { password: hashed, otp: undefined, otpExpiry: undefined },
    });

    json(res, { message: "Password reset successful. You can now log in." });
  })
);

// ---------------------------------------------------------------- profile

app.get(
  "/api/profile",
  route(async (req, res) => {
    const user = await requireAuth(req);
    json(res, { user });
  })
);

app.put(
  "/api/profile",
  route(async (req, res) => {
    const auth = await requireAuth(req);
    await connect();
    const body = readJson<{ name?: string; currentPassword?: string; newPassword?: string }>(req);

    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (typeof body.name === "string") {
      const name = body.name.trim();
      if (name.length < 2) throw new ApiError(400, "Name must be at least 2 characters.");
      updates.name = name.slice(0, 120);
    }

    if (body.newPassword) {
      if (body.newPassword.length < 6) throw new ApiError(400, "New password must be at least 6 characters.");
      const row = await users.findById(auth.id).lean();
      if (!row) throw new ApiError(404, "User not found.");
      const ok = await comparePassword(body.currentPassword ?? "", row.password);
      if (!ok) throw new ApiError(400, "Current password is incorrect.");
      updates.password = await hashPassword(body.newPassword);
    }

    const updated = await users.findByIdAndUpdate(auth.id, { $set: updates }, { returnDocument: "after" }).lean();
    if (!updated) throw new ApiError(404, "User not found.");
    json(res, { user: toSafe(updated) });
  })
);

// ---------------------------------------------------------------- resumes

app.get(
  "/api/resumes",
  route(async (req, res) => {
    const user = await requireAuth(req);
    await connect();
    const rows = await resumes.find({ userId: user.id }).sort({ updatedAt: -1 }).lean();
    json(res, { resumes: rows.map((r) => serializeResume(r as ResumeRow)) });
  })
);

app.post(
  "/api/resumes",
  route(async (req, res) => {
    const user = await requireAuth(req);
    await connect();
    const data = sanitizeResume(readJson(req));
    const row = await resumes.create({ ...data, userId: user.id });
    json(res, { resume: serializeResume(row as ResumeRow) }, 201);
  })
);

app.get(
  "/api/resumes/:id",
  route(async (req, res) => {
    const user = await requireAuth(req);
    await connect();
    const id = parseId(String(req.params.id));
    const row = await resumes.findOne({ _id: id, userId: user.id }).lean();
    if (!row) throw new ApiError(404, "Resume not found.");
    json(res, { resume: serializeResume(row as ResumeRow) });
  })
);

app.put(
  "/api/resumes/:id",
  route(async (req, res) => {
    const user = await requireAuth(req);
    await connect();
    const id = parseId(String(req.params.id));
    const data = sanitizeResume(readJson(req));
    const row = await resumes.findOneAndUpdate({ _id: id, userId: user.id }, { $set: { ...data, updatedAt: new Date() } }, { returnDocument: "after" }).lean();
    if (!row) throw new ApiError(404, "Resume not found.");
    json(res, { resume: serializeResume(row as ResumeRow) });
  })
);

app.delete(
  "/api/resumes/:id",
  route(async (req, res) => {
    const user = await requireAuth(req);
    await connect();
    const id = parseId(String(req.params.id));
    const result = await resumes.deleteOne({ _id: id, userId: user.id });
    if (result.deletedCount === 0) throw new ApiError(404, "Resume not found.");
    json(res, { message: "Resume deleted." });
  })
);

app.post(
  "/api/resumes/:id/duplicate",
  route(async (req, res) => {
    const user = await requireAuth(req);
    await connect();
    const raw = String(req.params.id);
    if (!Types.ObjectId.isValid(raw)) throw new ApiError(400, "Invalid resume id.");

    const source = await resumes.findOne({ _id: new Types.ObjectId(raw), userId: user.id }).lean();
    if (!source) throw new ApiError(404, "Resume not found.");

    const { _id, userId, createdAt, updatedAt, __v, title, ...rest } = source;
    void _id; void userId; void createdAt; void updatedAt; void __v;
    const copy = await resumes.create({ ...rest, userId: user.id, title: `${title} (Copy)`.slice(0, 160) });
    json(res, { resume: serializeResume(copy as ResumeRow) }, 201);
  })
);

// ---------------------------------------------------------------- ai

app.post(
  "/api/ai/summary",
  route(async (req, res) => {
    const user = await requireAuth(req);
    rateLimit(`ai:${user.id}`, 10, 60_000);
    const body = readJson<SummaryInput>(req);
    json(res, await summarySuggestion(body));
  })
);

app.post(
  "/api/ai/bullets",
  route(async (req, res) => {
    const user = await requireAuth(req);
    rateLimit(`ai:${user.id}`, 10, 60_000);
    const body = readJson<BulletsInput>(req);
    json(res, await bulletsSuggestion(body));
  })
);

// ---------------------------------------------------------------- health / static

app.get(
  "/api/health",
  route(async (_req, res) => {
    await connect();
    json(res, { status: "ok" });
  })
);

// JSON 404 for any unmatched /api route (keeps client error messages clean).
app.use("/api", (_req, res) => json(res, { message: "Not found." }, 404));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "..", "dist");
const indexHtml = path.join(distDir, "index.html");

// Serve static SPA in production (local dev uses Vite's dev server instead).
app.use(express.static(distDir));
app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api/")) return next();
  res.sendFile(indexHtml);
});

// Local dev server — on Vercel the platform calls the exported app directly.
if (!process.env.VERCEL) {
  const PORT = Number(process.env.PORT ?? 3001);
  app.listen(PORT, () => {
    console.log(`[resumecraft] API listening on http://localhost:${PORT}`);
  });
}

export default app;