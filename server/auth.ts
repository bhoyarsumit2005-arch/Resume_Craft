import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import type { Request, Response } from "express";
import { connect } from "./db";
import { users } from "./schema";

const COOKIE_NAME = "rc_token";
const TOKEN_TTL = "7d";

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET is required in production");
    }
    return "resumecraft-dev-secret-change-me";
  }
  return secret;
}

export interface TokenPayload {
  sub: string;
  email: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: TOKEN_TTL });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, getSecret()) as jwt.JwtPayload;
    if (typeof decoded.sub === "undefined") return null;
    return { sub: String(decoded.sub), email: String(decoded.email ?? "") };
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

export function setAuthCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
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
  return toSafeUser({ _id: user._id, name: user.name, email: user.email, createdAt: new Date(user.createdAt as unknown as string) });
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
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