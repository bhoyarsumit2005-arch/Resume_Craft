import { Router } from "express";
import { Types } from "mongoose";
import { connect } from "../db";
import { resumes, type ResumeRow } from "../schema";
import { sanitizeResume, serializeResume } from "../resume-validation";
import { json, parseId, route } from "../http";
import { clientIp, limiter } from "../rate-limit";
import { ApiError, readJson, requireAuth } from "../auth";

const router = Router();

/** Caps runaway auto-save loops without bothering normal editing. */
const createLimit = limiter({
  max: 60,
  windowMs: 60_000,
  key: (req) => `resume-create:${clientIp(req)}`,
  message: "Too many resume creations.",
});

router.get(
  "/",
  route(async (req, res) => {
    const user = await requireAuth(req);
    await connect();
    const rows = await resumes.find({ userId: user.id }).sort({ updatedAt: -1 }).lean();
    json(res, { resumes: rows.map((r) => serializeResume(r as ResumeRow)) });
  })
);

router.post(
  "/",
  createLimit,
  route(async (req, res) => {
    const user = await requireAuth(req);
    await connect();
    const data = sanitizeResume(readJson(req));
    const row = await resumes.create({ ...data, userId: user.id });
    json(res, { resume: serializeResume(row as ResumeRow) }, 201);
  })
);

router.get(
  "/:id",
  route(async (req, res) => {
    const user = await requireAuth(req);
    await connect();
    const id = parseId(String(req.params.id));
    const row = await resumes.findOne({ _id: id, userId: user.id }).lean();
    if (!row) throw new ApiError(404, "Resume not found.");
    json(res, { resume: serializeResume(row as ResumeRow) });
  })
);

router.put(
  "/:id",
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

router.delete(
  "/:id",
  route(async (req, res) => {
    const user = await requireAuth(req);
    await connect();
    const id = parseId(String(req.params.id));
    const result = await resumes.deleteOne({ _id: id, userId: user.id });
    if (result.deletedCount === 0) throw new ApiError(404, "Resume not found.");
    json(res, { message: "Resume deleted." });
  })
);

router.post(
  "/:id/duplicate",
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

export default router;
