import { api } from "./api";

export interface AiSummaryInput {
  mode: "rewrite" | "generate";
  summary: string;
  title?: string;
  skills: string[];
  projects: number;
}

export interface AiSummaryResult {
  text: string;
  source: "ai" | "fallback";
}

export interface AiBulletsInput {
  kind: "experience" | "project";
  jobTitle: string;
  company?: string;
  description: string;
  skills: string[];
}

export interface AiBulletsResult {
  bullets: string[];
}

export const aiService = {
  summary(input: AiSummaryInput) {
    return api<AiSummaryResult>("/ai/summary", { method: "POST", body: input });
  },
  bullets(input: AiBulletsInput) {
    return api<AiBulletsResult>("/ai/bullets", { method: "POST", body: input });
  },
};
