import { api } from "./api";
import type { Resume, ResumeData } from "@/lib/resume-types";

export const resumeService = {
  async list() {
    const data = await api<{ resumes: Resume[] }>("/resumes");
    return data.resumes;
  },
  async get(id: string) {
    const data = await api<{ resume: Resume }>(`/resumes/${id}`);
    return data.resume;
  },
  async create(payload: ResumeData) {
    const data = await api<{ resume: Resume }>("/resumes", { method: "POST", body: payload });
    return data.resume;
  },
  async update(id: string, payload: ResumeData) {
    const data = await api<{ resume: Resume }>(`/resumes/${id}`, { method: "PUT", body: payload });
    return data.resume;
  },
  async remove(id: string) {
    await api(`/resumes/${id}`, { method: "DELETE" });
  },
  async duplicate(id: string) {
    const data = await api<{ resume: Resume }>(`/resumes/${id}/duplicate`, { method: "POST" });
    return data.resume;
  },
};
