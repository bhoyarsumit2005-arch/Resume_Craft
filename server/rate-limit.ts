import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ApiError } from "./auth";

interface Bucket {
  count: number;
  resetAt: number;
}

/** Fixed-window counters keyed by IP / email / user id. */
const buckets = new Map<string, Bucket>();

const MAX_BUCKETS = 20_000;

/** Safety valve for long-running processes: drop stale windows first, never everyone's counters. */
function pruneBuckets(now: number): void {
  if (buckets.size <= MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
  while (buckets.size > MAX_BUCKETS) {
    const oldest = buckets.keys().next();
    if (oldest.done) break;
    buckets.delete(oldest.value);
  }
}

/**
 * Counts one hit against `key`. Returns 0 when the request is allowed,
 * otherwise the number of whole seconds to wait before trying again.
 */
export function hit(key: string, max: number, windowMs: number): number {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    pruneBuckets(now);
    return 0;
  }
  bucket.count += 1;
  if (bucket.count <= max) return 0;
  return Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
}

/** Throwing variant for use inside a handler (e.g. the AI endpoints). */
export function rateLimit(
  key: string,
  max: number,
  windowMs: number,
  message = "Too many requests. Please wait and try again."
): void {
  const retryAfter = hit(key, max, windowMs);
  if (retryAfter > 0) throw new ApiError(429, `${message} Try again in ${retryAfter}s.`, retryAfter);
}

export interface LimiterOptions {
  max: number;
  windowMs: number;
  /** Counter key — typically the client IP, an email address or a user id. */
  key: (req: Request) => string;
  message?: string;
}

/** Express middleware that answers with JSON 429 + a `Retry-After` header. */
export function limiter({ max, windowMs, key, message = "Too many requests. Please wait and try again." }: LimiterOptions): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const retryAfter = hit(key(req), max, windowMs);
    if (retryAfter === 0) return next();
    res.setHeader("Retry-After", String(retryAfter));
    res.status(429).json({ message: `${message} Try again in ${retryAfter}s.` });
  };
}

/** Client IP (only meaningful once `trust proxy` is configured behind a proxy). */
export const clientIp = (req: Request): string => req.ip || req.socket.remoteAddress || "unknown";

/** Lower-cased email from an already-parsed JSON body, or "" — used for per-account limits. */
export function bodyEmail(req: Request): string {
  const email = (req.body as { email?: unknown } | undefined)?.email;
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

/** Key by account when the body carries an email, otherwise by client IP. */
export const byEmailOrIp =
  (prefix: string) =>
  (req: Request): string => {
    const email = bodyEmail(req);
    return email ? `${prefix}:email:${email}` : `${prefix}:ip:${clientIp(req)}`;
  };

export const byIp = (prefix: string) => (req: Request): string => `${prefix}:ip:${clientIp(req)}`;
