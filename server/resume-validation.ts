import {
  createEmptyResume,
  emptyPersonalInfo,
  type ResumeData,
  type PersonalInfo,
  type TemplateId,
  type AccentColor,
  type FontSize,
  type FontFamily,
  type SectionKey,
  TEMPLATES,
  ACCENT_COLORS,
  FONT_SIZES,
  FONT_FAMILIES,
  OPTIONAL_SECTIONS,
  uid,
} from "../src/lib/resume-types";
import type { ResumeRow } from "./schema";
import { ApiError } from "./auth";

type Obj = Record<string, unknown>;
const str = (v: unknown, max = 2000): string => (typeof v === "string" ? v.slice(0, max) : "");
const bool = (v: unknown): boolean => v === true;
const arr = (v: unknown): Obj[] => (Array.isArray(v) ? (v.filter((x) => x && typeof x === "object") as Obj[]).slice(0, 50) : []);
const id = (v: unknown): string => (typeof v === "string" && v ? v.slice(0, 40) : uid());

/** Picks a value only when it is one of the allowed enum members. */
const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

/** Date → ISO string, tolerating missing/invalid values from older documents. */
const iso = (value: unknown, fallback: Date): string => {
  const date = value instanceof Date ? value : new Date(typeof value === "string" || typeof value === "number" ? value : NaN);
  return Number.isNaN(date.getTime()) ? fallback.toISOString() : date.toISOString();
};

const list = <T>(value: readonly T[] | undefined | null): T[] => (Array.isArray(value) ? [...value] : []);

/**
 * Sanitizes & validates an incoming resume payload from the client.
 * Unknown fields are stripped, strings are length-limited, enums are checked.
 */
export function sanitizeResume(input: unknown): ResumeData {
  if (!input || typeof input !== "object") throw new ApiError(400, "Resume payload is required.");
  const body = input as Obj;
  const base = createEmptyResume();

  const template = TEMPLATES.some((t) => t.id === body.template) ? (body.template as TemplateId) : base.template;
  const accentColor = ACCENT_COLORS.some((c) => c.id === body.accentColor) ? (body.accentColor as AccentColor) : base.accentColor;
  const fontSize = FONT_SIZES.some((f) => f.id === body.fontSize) ? (body.fontSize as FontSize) : base.fontSize;
  const fontFamily = FONT_FAMILIES.some((f) => f.id === body.fontFamily) ? (body.fontFamily as FontFamily) : base.fontFamily;

  const title = str(body.title, 160).trim() || "Untitled Resume";

  const pi = (body.personalInfo && typeof body.personalInfo === "object" ? body.personalInfo : {}) as Obj;
  const personalInfo = { ...emptyPersonalInfo() };
  personalInfo.fullName = str(pi.fullName, 120);
  personalInfo.title = str(pi.title, 160);
  personalInfo.email = str(pi.email, 160);
  personalInfo.phone = str(pi.phone, 40);
  personalInfo.location = str(pi.location, 120);
  personalInfo.linkedin = str(pi.linkedin, 300);
  personalInfo.github = str(pi.github, 300);
  personalInfo.portfolio = str(pi.portfolio, 300);
  personalInfo.photo = str(pi.photo, 400_000); // base64 data URL (small images)

  const hiddenSections = Array.isArray(body.hiddenSections)
    ? (body.hiddenSections.filter((s) => OPTIONAL_SECTIONS.some((o) => o.key === s)) as SectionKey[])
    : [];

  return {
    title,
    template,
    accentColor,
    fontSize,
    fontFamily,
    personalInfo,
    summary: str(body.summary, 2000),
    education: arr(body.education).map((e) => ({
      id: id(e.id),
      degree: str(e.degree, 160),
      institution: str(e.institution, 160),
      location: str(e.location, 120),
      startYear: str(e.startYear, 20),
      endYear: str(e.endYear, 20),
      grade: str(e.grade, 40),
      description: str(e.description, 1000),
    })),
    experience: arr(body.experience).map((e) => ({
      id: id(e.id),
      jobTitle: str(e.jobTitle, 160),
      company: str(e.company, 160),
      location: str(e.location, 120),
      startDate: str(e.startDate, 30),
      endDate: str(e.endDate, 30),
      current: bool(e.current),
      description: str(e.description, 2000),
    })),
    projects: arr(body.projects).map((p) => ({
      id: id(p.id),
      name: str(p.name, 160),
      description: str(p.description, 1500),
      technologies: Array.isArray(p.technologies) ? p.technologies.map((t) => str(t, 40)).filter(Boolean).slice(0, 30) : [],
      githubUrl: str(p.githubUrl, 300),
      liveUrl: str(p.liveUrl, 300),
    })),
    skills: Array.isArray(body.skills) ? body.skills.map((s) => str(s, 50).trim()).filter(Boolean).slice(0, 60) : [],
    certifications: arr(body.certifications).map((c) => ({
      id: id(c.id),
      name: str(c.name, 160),
      organization: str(c.organization, 160),
      date: str(c.date, 30),
      credentialUrl: str(c.credentialUrl, 300),
    })),
    achievements: arr(body.achievements).map((a) => ({
      id: id(a.id),
      title: str(a.title, 200),
      description: str(a.description, 600),
    })),
    languages: arr(body.languages).map((l) => ({
      id: id(l.id),
      name: str(l.name, 60),
      proficiency: str(l.proficiency, 40),
    })),
    socialLinks: arr(body.socialLinks).map((s) => ({
      id: id(s.id),
      label: str(s.label, 60),
      url: str(s.url, 300),
    })),
    hiddenSections,
  };
}

/**
 * Shapes a database row into the JSON contract the client expects.
 * Older documents may predate `fontFamily`, `hiddenSections` or even
 * timestamps, so every field is normalised instead of passed through —
 * one legacy row must never turn a list request into a 500.
 */
export function serializeResume(row: ResumeRow) {
  const now = new Date();
  const pi = (row.personalInfo ?? {}) as Partial<PersonalInfo>;

  const personalInfo: PersonalInfo = {
    ...emptyPersonalInfo(),
    fullName: str(pi.fullName, 120),
    title: str(pi.title, 160),
    email: str(pi.email, 160),
    phone: str(pi.phone, 40),
    location: str(pi.location, 120),
    linkedin: str(pi.linkedin, 300),
    github: str(pi.github, 300),
    portfolio: str(pi.portfolio, 300),
    photo: str(pi.photo, 400_000),
  };

  const hiddenSections = list(row.hiddenSections).filter((s) => OPTIONAL_SECTIONS.some((o) => o.key === s)) as SectionKey[];

  return {
    id: String(row._id),
    userId: String(row.userId),
    title: str(row.title, 160).trim() || "Untitled Resume",
    template: oneOf(row.template, TEMPLATES.map((t) => t.id), "modern"),
    accentColor: oneOf(row.accentColor, ACCENT_COLORS.map((c) => c.id), "blue"),
    fontSize: oneOf(row.fontSize, FONT_SIZES.map((f) => f.id), "medium"),
    fontFamily: oneOf(row.fontFamily, FONT_FAMILIES.map((f) => f.id), "arial"),
    personalInfo,
    summary: str(row.summary, 2000),
    education: list(row.education),
    experience: list(row.experience),
    projects: list(row.projects),
    skills: list(row.skills),
    certifications: list(row.certifications),
    achievements: list(row.achievements),
    languages: list(row.languages),
    socialLinks: list(row.socialLinks),
    hiddenSections,
    createdAt: iso(row.createdAt, now),
    updatedAt: iso(row.updatedAt, now),
  };
}