import { Router } from "express";
import { connect } from "../db";
import { json, route } from "../http";
import { byIp, limiter } from "../rate-limit";
import authRouter from "./auth";
import profileRouter from "./profile";
import resumesRouter from "./resumes";
import aiRouter from "./ai";

const router = Router();

// Global backstop for the whole API: smooths traffic spikes and blunts
// credential stuffing / scraping before any route handler runs.
router.use(limiter({ max: 300, windowMs: 60_000, key: byIp("api"), message: "Too many requests." }));

router.use("/auth", authRouter);
router.use("/profile", profileRouter);
router.use("/resumes", resumesRouter);
router.use("/ai", aiRouter);

router.get(
  "/health",
  route(async (_req, res) => {
    await connect();
    json(res, { status: "ok" });
  })
);

// JSON 404 for any unmatched /api route (keeps client error messages clean).
router.use((_req, res) => json(res, { message: "Not found." }, 404));

export default router;
