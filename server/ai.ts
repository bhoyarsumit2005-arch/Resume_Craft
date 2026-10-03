import { ApiError } from "./auth";
import { improveSummary } from "../src/utils/summary";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const TIMEOUT_MS = 30_000;

const MODEL = () => process.env.OPENROUTER_MODEL || "openrouter/free";

export function aiConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

/** Simple fixed-window per-user rate limiter (protects the free-tier AI quota). */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, max: number, windowMs: number): void {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 5000) buckets.clear(); // safety valve for long-running processes
    return;
  }
  bucket.count += 1;
  if (bucket.count > max) {
    const wait = Math.ceil((bucket.resetAt - now) / 1000);
    throw new ApiError(429, `Too many AI requests. Please wait ${wait}s and try again.`);
  }
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function chat(messages: ChatMessage[], opts: { maxTokens?: number; temperature?: number } = {}): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new ApiError(503, "AI is not configured on this server.");

  // Retry once: free-tier routing can pick reasoning models that spend the whole
  // token budget on reasoning and return an empty completion.
  let lastError: ApiError | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    let res: Response;
    try {
      res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          "X-Title": "ResumeCraft",
        },
        body: JSON.stringify({
          model: MODEL(),
          messages,
          max_tokens: opts.maxTokens ?? 1200,
          temperature: opts.temperature ?? 0.7,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch {
      throw new ApiError(504, "The AI service timed out. Please try again.");
    }

    if (res.status === 401 || res.status === 403) throw new ApiError(503, "AI is not configured correctly on this server.");
    if (res.status === 429) throw new ApiError(429, "The AI service is busy right now. Please try again in a moment.");
    if (!res.ok) throw new ApiError(502, "The AI service returned an error. Please try again.");

    const contentType = res.headers.get("content-type") ?? "";
    const rawBody = await res.text().catch(() => "");

    let data: unknown;
    try {
      data = JSON.parse(rawBody);
    } catch {
      console.warn(`[ai] non-JSON response (status ${res.status}, type "${contentType}"): ${rawBody.slice(0, 300)}`);
      lastError = new ApiError(502, "The AI service returned an invalid response. Please try again.");
      continue;
    }

    const content = (data as { choices?: { message?: { content?: unknown } }[] })?.choices?.[0]?.message?.content;
    if (typeof content === "string" && content.trim()) return content.trim();
    lastError = new ApiError(502, "The AI returned an empty response. Please try again.");
  }
  throw lastError ?? new ApiError(502, "The AI returned an empty response. Please try again.");
}

/** Extracts and parses JSON from a model response (tolerates code fences and surrounding prose). */
function parseJson<T>(raw: string): T {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();
  const start = text.search(/[{[]/);
  if (start >= 0) {
    const end = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
    if (end > start) text = text.slice(start, end + 1);
  }
  return JSON.parse(text) as T;
}

const clamp = (v: unknown, max: number): string => (typeof v === "string" ? v.trim().slice(0, max) : "");

// ---------------------------------------------------------------- summary

export interface SummaryInput {
  mode?: "rewrite" | "generate";
  summary?: string;
  title?: string;
  skills?: unknown;
  projects?: unknown;
}

export interface SummaryResult {
  text: string;
  source: "ai" | "fallback";
}

export async function summarySuggestion(body: SummaryInput): Promise<SummaryResult> {
  const mode = body.mode === "generate" ? "generate" : "rewrite";
  const summary = clamp(body.summary, 2000);
  const title = clamp(body.title, 120);
  const skills = Array.isArray(body.skills) ? body.skills.map((s) => clamp(s, 60)).filter(Boolean).slice(0, 30) : [];
  const projects = typeof body.projects === "number" && Number.isFinite(body.projects) ? Math.min(Math.max(body.projects, 0), 50) : 0;

  if (mode === "rewrite" && summary.length < 20) throw new ApiError(400, "Write a short summary first, or use generate mode.");
  if (mode === "generate" && summary.length >= 20) throw new ApiError(400, "Clear the summary before generating a new one.");

  const context = [
    `Target role/title: ${title || "unspecified"}`,
    `Skills: ${skills.length ? skills.join(", ") : "unspecified"}`,
    `Number of projects: ${projects}`,
  ].join("\n");

  const system =
    "You are an expert resume writer. Reply with the summary text ONLY — no preamble, no quotes, no markdown, no bullet points. " +
    "Write 2-4 sentences (roughly 300-550 characters), in first person, confident and specific, naming concrete skills and value delivered. " +
    "Never invent employers, degrees, years of experience, or certifications not present in the provided context.";

  const user =
    mode === "rewrite"
      ? `Improve this professional summary for a resume.\n\n${context}\n\nCurrent summary:\n${summary}`
      : `Write a professional summary from scratch for this resume.\n\n${context}`;

  if (aiConfigured()) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const text = await chat(
          [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          { maxTokens: 1000, temperature: 0.7 }
        );
        const cleaned = text.replace(/^["'\s]+|["'\s]+$/g, "");
        if (cleaned.length >= 40) return { text: cleaned, source: "ai" };
      } catch (err) {
        if (err instanceof ApiError && err.status === 429) throw err; // surface rate limits
        console.warn("[ai] summary suggestion failed:", err);
      }
    }
    console.warn("[ai] summary suggestion fell back to local rules after retries");
  }

  // Offline / failure fallback: the local rule-based improver.
  const fallback = improveSummary(summary, { title, skills, projects });
  if (mode === "generate" && fallback === summary) throw new ApiError(503, "AI is unavailable. Please try again later.");
  return { text: fallback, source: "fallback" };
}

// ---------------------------------------------------------------- bullets

export interface BulletsInput {
  jobTitle?: string;
  company?: string;
  description?: string;
  skills?: unknown;
  kind?: "experience" | "project";
}

export interface BulletsResult {
  bullets: string[];
}

export async function bulletsSuggestion(body: BulletsInput): Promise<BulletsResult> {
  const kind = body.kind === "project" ? "project" : "experience";
  const jobTitle = clamp(body.jobTitle, 160);
  const company = clamp(body.company, 160);
  const description = clamp(body.description, 1500);
  const skills = Array.isArray(body.skills) ? body.skills.map((s) => clamp(s, 60)).filter(Boolean).slice(0, 30) : [];

  if (kind === "experience" && !jobTitle && !company) throw new ApiError(400, "Add a job title or company first.");
  if (kind === "project" && !jobTitle) throw new ApiError(400, "Add a project name first.");

  const context =
    kind === "experience"
      ? `Role: ${jobTitle || "unspecified"}\nCompany: ${company || "unspecified"}\nSkills: ${skills.join(", ") || "unspecified"}\nExisting notes/description:\n${description || "(none)"}`
      : `Project: ${jobTitle}\nTechnologies/notes: ${description || "(none)"}\nSkills: ${skills.join(", ") || "unspecified"}`;

  const system =
    'You write resume bullet points. Respond with JSON ONLY in the form {"bullets":["...","..."]} — no prose, no markdown fences. ' +
    "Return 4-6 bullets. Each bullet: one line, starts with a strong past-tense action verb, no first person pronouns (no I/my), " +
    "quantifies impact with plausible metrics when the notes support it, under 22 words. " +
    "Never invent employers, job titles, dates, or credentials that contradict the provided notes.";

  const minLen = 20;
  let last: string[] = [];

  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await chat(
      [
        { role: "system", content: system },
        { role: "user", content: `Write bullet points for this ${kind} entry.\n\n${context}` },
      ],
      { maxTokens: 1200, temperature: 0.7 }
    );

    let parsed: unknown;
    try {
      parsed = parseJson(raw);
    } catch {
      // Some models reply with plain lines instead of JSON — treat each line as a bullet.
      parsed = { bullets: raw.split("\n").map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim()) };
    }

    const list = (parsed as { bullets?: unknown })?.bullets;
    last = (Array.isArray(list) ? list : [])
      .map((b) => clamp(b, 300))
      .filter((b) => b.length >= minLen && b.length <= 300)
      .slice(0, 6);

    if (last.length >= 3) return { bullets: last };
  }

  if (last.length >= 2) return { bullets: last };
  throw new ApiError(502, "The AI could not suggest bullets. Please try again.");
}
