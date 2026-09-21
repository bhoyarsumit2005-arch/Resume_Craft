import type { ReactNode } from "react";
import { Mail, Phone, MapPin, Globe, Link as LinkIcon } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/common/BrandIcons";
import { ensureHttp, prettyUrl, sectionVisible, type ResumeData, type SectionKey } from "@/lib/resume-types";

export interface TemplateProps {
  resume: ResumeData;
  accent: string;
  fontSize: number;
  /** When false, URLs render as plain text instead of <a> tags (used in thumbnails to avoid nested anchors). */
  links?: boolean;
}

export function contactItems(resume: ResumeData) {
  const p = resume.personalInfo;
  const items: { icon: ReactNode; text: string; href?: string }[] = [];
  if (p.email) items.push({ icon: <Mail size={12} />, text: p.email, href: `mailto:${p.email}` });
  if (p.phone) items.push({ icon: <Phone size={12} />, text: p.phone });
  if (p.location) items.push({ icon: <MapPin size={12} />, text: p.location });
  if (p.linkedin) items.push({ icon: <LinkedinIcon size={12} />, text: prettyUrl(p.linkedin), href: ensureHttp(p.linkedin) });
  if (p.github) items.push({ icon: <GithubIcon size={12} />, text: prettyUrl(p.github), href: ensureHttp(p.github) });
  if (p.portfolio) items.push({ icon: <Globe size={12} />, text: prettyUrl(p.portfolio), href: ensureHttp(p.portfolio) });
  return items;
}

export function show(resume: ResumeData, key: SectionKey) {
  return sectionVisible(resume, key);
}

export function Bullets({ text }: { text: string }) {
  const lines = text
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
  if (lines.length === 0) return null;
  if (lines.length === 1) return <p style={{ margin: "0.2em 0 0" }}>{lines[0]}</p>;
  return (
    <ul className="bullets">
      {lines.map((l, i) => (
        <li key={i}>{l}</li>
      ))}
    </ul>
  );
}

export function dateRange(start: string, end: string, current?: boolean) {
  const e = current ? "Present" : end;
  if (start && e) return `${start} – ${e}`;
  return start || e || "";
}

export function ExtLink({ href, children, color, links = true }: { href: string; children: ReactNode; color?: string; links?: boolean }) {
  const inner = (
    <>
      <LinkIcon size={10} /> {children}
    </>
  );
  if (!links) {
    return <span style={{ color, display: "inline-flex", alignItems: "center", gap: 3 }}>{inner}</span>;
  }
  return (
    <a href={ensureHttp(href)} target="_blank" rel="noreferrer" style={{ color, display: "inline-flex", alignItems: "center", gap: 3 }}>
      {inner}
    </a>
  );
}

/** Ordered list of visible sections – used by all templates. */
export const SECTION_ORDER: SectionKey[] = [
  "summary",
  "experience",
  "education",
  "projects",
  "skills",
  "certifications",
  "achievements",
  "languages",
  "socialLinks",
];

export function Placeholder({ name }: { name?: string }) {
  if (name) return null;
  return (
    <div style={{ padding: "40px 32px", color: "#9ca3af", textAlign: "center", fontSize: 13 }}>
      Start typing in the form — your resume will appear here instantly.
    </div>
  );
}
