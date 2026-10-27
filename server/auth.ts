import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomInt, timingSafeEqual } from "node:crypto";
import { Types } from "mongoose";
import type { Request, Response } from "express";
import { connect } from "./db";
import { users } from "./schema";

const COOKIE_NAME = "rc_token";
/** The session cookie is only ever needed by the API itself. */
const COOKIE_PATH = "/api";
const TOKEN_TTL = "7d";
const RESET_TTL = "15m";

const DEV_JWT_SECRET = "resumecraft-dev-secret-change-me";
const DEV_OTP_SECRET = "resumecraft-otp-secret";

/**
 * Secrets must be real values in production: a publicly known default would
 * let anyone forge password-reset tokens — and therefore take over any account.
 * `STRICT_JWT_SECRET=true` also enforces this outside production.
 */
function getSecret(name: "JWT_SECRET" | "OTP_SECRET", devFallback: string): string {
  const secret = process.env[name];
  if (secret) return secret;
  const production = process.env.NODE_ENV === "production";
  const strict = process.env.STRICT_JWT_SECRET === "true";
  if (production || strict) {
    throw new Error(`${name} is required${production ? " in production" : ""}. Set it to a long random string.`);
  }
  return devFallback;
}

export interface TokenPayload {
  sub: string;
  email: string;
  /** Sessions carry "access"; reset tokens carry "reset" and never open a session. */
  purpose?: string;
  /** Mirrors user.tokenVersion — bumping it revokes every previously issued token. */
  tv?: number;
}

export function generateToken(payload: TokenPayload, tokenVersion = 0): string {
  return jwt.sign({ ...payload, purpose: "access", tv: tokenVersion }, getSecret("JWT_SECRET", DEV_JWT_SECRET), { expiresIn: TOKEN_TTL });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, getSecret("JWT_SECRET", DEV_JWT_SECRET)) as jwt.JwtPayload;
    if (typeof decoded.sub === "undefined") return null;
    // Any explicitly typed token that is not an access token must never open a
    // session — even if it was signed with the same secret (defence in depth).
    if (decoded.purpose !== undefined && decoded.purpose !== "access") return null;
    return {
      sub: String(decoded.sub),
      email: String(decoded.email ?? ""),
      purpose: "access",
      tv: typeof decoded.tv === "number" ? decoded.tv : 0,
    };
  } catch {
    return null;
  }
}

/** Short-lived, single-use token that authorises exactly one password reset. */
export function generateResetToken(sub: string, email: string): string {
  return jwt.sign({ sub, email, purpose: "reset" }, getSecret("OTP_SECRET", DEV_OTP_SECRET), { expiresIn: RESET_TTL });
}

export function verifyResetToken(token: string): jwt.JwtPayload | null {
  try {
    const payload = jwt.verify(token, getSecret("OTP_SECRET", DEV_OTP_SECRET)) as jwt.JwtPayload;
    if (payload.purpose !== "reset") return null;
    if (typeof payload.sub !== "string" || !Types.ObjectId.isValid(payload.sub)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Cryptographically secure 6-digit code (Math.random is predictable). */
export function generateOtp(): string {
  return randomInt(100000, 1000000).toString();
}

/** Constant-time string comparison so OTP checks leak no timing information. */
export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length === 0 || left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function setAuthCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: COOKIE_PATH,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, {
    path: COOKIE_PATH,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export type SafeUser = { id: string; name: string; email: string; createdAt: string };

type UserLike = { _id: unknown; name: string; email: string; createdAt: Date };

export function toSafeUser(u: UserLike): SafeUser {
  return { id: String(u._id), name: u.name, email: u.email, createdAt: u.createdAt.toISOString() };
}

/** Reads token from Authorization header or httpOnly cookie and returns the authenticated user. */
export async function getAuthUser(req: Request): Promise<SafeUser | null> {
  let token: string | undefined;
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) token = header.slice(7);
  if (!token) token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  if (!Types.ObjectId.isValid(payload.sub)) return null;
  await connect();
  const user = await users.findById(payload.sub).lean();
  if (!user) return null;
  // A password change bumps tokenVersion, invalidating every older token.
  if ((payload.tv ?? 0) !== (user.tokenVersion ?? 0)) return null;
  return toSafeUser({ _id: user._id, name: user.name, email: user.email, createdAt: new Date(user.createdAt as unknown as string) });
}

export class ApiError extends Error {
  status: number;
  /** Seconds to wait — surfaced as the `Retry-After` header on 429s. */
  retryAfter?: number;
  constructor(status: number, message: string, retryAfter?: number) {
    super(message);
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

export async function requireAuth(req: Request): Promise<SafeUser> {
  const user = await getAuthUser(req);
  if (!user) throw new ApiError(401, "Not authorized. Please log in.");
  return user;
}

/** Central error handler – never leaks stack traces to clients. */
export function handleApiError(error: unknown, res: Response) {
  if (error instanceof ApiError) {
    if (error.retryAfter !== undefined) res.setHeader("Retry-After", String(error.retryAfter));
    res.status(error.status).json({ message: error.message });
    return;
  }
  console.error("[api]", error);
  res.status(500).json({ message: "Something went wrong. Please try again." });
}

/** express.json() already parses the body; this narrows the type (throws nothing). */
export function readJson<T = Record<string, unknown>>(req: Request): T {
  return (req.body ?? {}) as T;
}

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/** bcrypt silently truncates input at 72 bytes — longer secrets would be misleading. */
export const MAX_PASSWORD_LENGTH = 72;
