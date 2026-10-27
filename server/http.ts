import type { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { ApiError, handleApiError, toSafeUser } from "./auth";

/** JSON response helper (returns void so handlers can `return json(...)`). */
export const json = <T>(res: Response, data: T, status = 200): void => {
  res.status(status).json(data);
};

/** Wraps an async handler so its errors flow through the central error handler. */
export const route =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, _next: NextFunction): void => {
    void fn(req, res).catch((err: unknown) => handleApiError(err, res));
  };

export function parseId(raw: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(raw)) throw new ApiError(400, "Invalid resume id.");
  return new Types.ObjectId(raw);
}

type SafeUserInput = { _id: unknown; name: string; email: string; createdAt: unknown };

/** Normalises a user row (Mongoose doc or lean result) for JSON responses. */
export const toSafe = (u: SafeUserInput) =>
  toSafeUser({ _id: u._id, name: u.name, email: u.email, createdAt: new Date(u.createdAt as unknown as string) });
