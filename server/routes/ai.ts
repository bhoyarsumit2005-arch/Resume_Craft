import { Router } from "express";
import { json, route } from "../http";
import { rateLimit } from "../rate-limit";
import { readJson, requireAuth } from "../auth";
import { bulletsSuggestion, summarySuggestion, type BulletsInput, type SummaryInput } from "../ai";

const router = Router();

/** Protects the free-tier AI quota: 10 requests per user per minute. */
const quota = (userId: string) => rateLimit(`ai:${userId}`, 10, 60_000, "Too many AI requests.");

router.post(
  "/summary",
  route(async (req, res) => {
    const user = await requireAuth(req);
    quota(user.id);
    json(res, await summarySuggestion(readJson<SummaryInput>(req)));
  })
);

router.post(
  "/bullets",
  route(async (req, res) => {
    const user = await requireAuth(req);
    quota(user.id);
    json(res, await bulletsSuggestion(readJson<BulletsInput>(req)));
  })
);

export default router;
