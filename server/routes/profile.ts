import { Router } from "express";
import { connect } from "../db";
import { users } from "../schema";
import { json, route, toSafe } from "../http";
import { clientIp, limiter } from "../rate-limit";
import {
  ApiError,
  MAX_PASSWORD_LENGTH,
  comparePassword,
  generateToken,
  hashPassword,
  readJson,
  requireAuth,
  setAuthCookie,
} from "../auth";

const router = Router();

/** Keep a compromised-but-authenticated client from grinding through password changes. */
const passwordChangeLimit = limiter({
  max: 10,
  windowMs: 15 * 60_000,
  key: (req) => `profile-password:${clientIp(req)}`,
  message: "Too many password change attempts.",
});

router.get(
  "/",
  route(async (req, res) => {
    const user = await requireAuth(req);
    json(res, { user });
  })
);

router.put(
  "/",
  passwordChangeLimit,
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

    let changingPassword = false;
    if (body.newPassword) {
      if (body.newPassword.length < 6) throw new ApiError(400, "New password must be at least 6 characters.");
      if (body.newPassword.length > MAX_PASSWORD_LENGTH) throw new ApiError(400, `New password must be at most ${MAX_PASSWORD_LENGTH} characters.`);
      const row = await users.findById(auth.id).lean();
      if (!row) throw new ApiError(404, "User not found.");
      const ok = await comparePassword(body.currentPassword ?? "", row.password);
      if (!ok) throw new ApiError(400, "Current password is incorrect.");
      updates.password = await hashPassword(body.newPassword);
      changingPassword = true;
    }

    // A password change bumps tokenVersion: every other session's token dies.
    const updated = await users.findByIdAndUpdate(
      auth.id,
      changingPassword ? { $set: updates, $inc: { tokenVersion: 1 } } : { $set: updates },
      { returnDocument: "after" }
    ).lean();
    if (!updated) throw new ApiError(404, "User not found.");

    // Re-issue this session's cookie so the tab that changed the password stays in.
    if (changingPassword) setAuthCookie(res, generateToken({ sub: String(updated._id), email: updated.email }, updated.tokenVersion ?? 0));

    json(res, { user: toSafe(updated) });
  })
);

export default router;
