import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handleApiError } from "./auth";
import { noStoreApi, securityHeaders } from "./security";
import apiRoutes from "./routes/index";

const app = express();
app.disable("x-powered-by");

// Correct client IPs for rate limiting when running behind Vercel's proxy.
if (process.env.VERCEL) app.set("trust proxy", 1);

app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));

// Keep malformed request bodies on the same JSON error contract as everything else,
// instead of Express's default HTML error page. Registered right after the parser
// so its errors are the ones this handler sees.
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err && typeof err === "object" && (err as { type?: string }).type === "entity.parse.failed") {
    res.status(400).json({ message: "Invalid JSON body." });
    return;
  }
  if (err && typeof err === "object" && (err as { type?: string }).type === "entity.too.large") {
    res.status(413).json({ message: "Request body is too large." });
    return;
  }
  next(err);
});

// Hardening headers first, so static files, the SPA and the API all carry them.
app.use(securityHeaders);
app.use(noStoreApi);

// All API routes live in routers under /api (health + JSON 404 included).
app.use("/api", apiRoutes);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "..", "dist");
const indexHtml = path.join(distDir, "index.html");

// Serve static SPA in production (local dev uses Vite's dev server instead).
app.use(express.static(distDir));
app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api/")) return next();
  res.sendFile(indexHtml);
});

// Final safety net: anything that escapes a router becomes JSON, never
// Express's default HTML error page.
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  handleApiError(err, res);
});

// Local dev server — on Vercel the platform calls the exported app directly.
if (!process.env.VERCEL) {
  const PORT = Number(process.env.PORT ?? 3001);
  app.listen(PORT, () => {
    console.log(`[resumecraft] API listening on http://localhost:${PORT}`);
  });
}

export default app;
