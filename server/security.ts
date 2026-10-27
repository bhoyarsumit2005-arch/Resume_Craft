import type { RequestHandler } from "express";

/**
 * The SPA never talks to a third party (fonts aside) and ships no inline
 * scripts, so the policy can be strict. Inline *styles* are allowed because
 * React style attributes and Tailwind need them.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
].join("; ");

const isProduction = () => process.env.NODE_ENV === "production";

/**
 * Browser hardening headers for every response (API JSON and, when Express
 * serves the built SPA, the HTML document). `vercel.json` mirrors these for
 * deployments where Vercel serves the HTML instead.
 */
export const securityHeaders: RequestHandler = (_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  // Legacy XSS auditor: disabling it is the current recommendation (it is buggy).
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("Content-Security-Policy", CONTENT_SECURITY_POLICY);
  if (isProduction()) res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
};

/** API responses carry account and resume data — never let a proxy cache them. */
export const noStoreApi: RequestHandler = (req, res, next) => {
  if (req.originalUrl.startsWith("/api/")) res.setHeader("Cache-Control", "no-store");
  next();
};

export const csp = CONTENT_SECURITY_POLICY;
