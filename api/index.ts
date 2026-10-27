/**
 * Vercel serverless entry point: `vercel.json` rewrites `/api/*` to this
 * function, and the Express app owns every `/api` route. The platform sets
 * `VERCEL`, so the local listener inside `server/index.ts` never starts here.
 */
export { default } from "../server/index";
