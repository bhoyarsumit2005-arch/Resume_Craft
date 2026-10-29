/**
 * ATS-safe PDF export.
 *
 * The PDF is generated with real, selectable text (no canvas screenshots), so
 * applicant tracking systems can parse names, roles, dates and keywords.
 */

import { accentHex, fontFamilyKind, prettyUrl, sectionVisible, type ResumeData } from "@/lib/resume-types";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 48;
const MARGIN_TOP = 48;
const MARGIN_BOTTOM = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

type FontStyle = "normal" | "bold" | "italic";
type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  const value = hex.replace("#", "");
  const normalized = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  const num = Number.parseInt(normalized, 16);
  if (!Number.isFinite(num)) return [17, 24, 39];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/** Standard PDF fonts use WinAnsi encoding; normalise dashes for reliable extraction. */
function cleanText(value: string): string {
  return value.replace(/[\u2013\u2014]/g, "-").replace(/\u00a0/g, " ");
}

export async function exportResumePdf(filename: string, resume: ResumeData): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4", compress: true });

  const accent = accentHex(resume.accentColor);
  const accentRgb = hexToRgb(accent);
  // jsPDF ships the ATS-standard PDF fonts only: Helvetica (sans) and Times (serif).
  const pdfFont = fontFamilyKind(resume.fontFamily) === "serif" ? "times" : "helvetica";
  const ink: Rgb = [17, 24, 39];
  const muted: Rgb = [75, 85, 99];

  const name = resume.personalInfo.fullName.trim() || "Your Name";
  doc.setProperties({
    title: `${name} - Resume`,
    author: name,
    subject: "Resume",
    keywords: resume.skills.join(", "),
    creator: "ResumeCraft",
  });

  let y = MARGIN_TOP + 16;

  const newPage = () => {
    doc.addPage();
    y = MARGIN_TOP + 12;
  };

  const ensure = (height: number) => {
    if (y + height > PAGE_HEIGHT - MARGIN_BOTTOM) newPage();
  };

  const setFont = (style: FontStyle, size: number, color: Rgb) => {
    doc.setFont(pdfFont, style);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
  };

  const paragraph = (value: string, opts: { size?: number; color?: Rgb; indent?: number; after?: number; style?: FontStyle } = {}) => {
    const { size = 10, color = ink, indent = 0, after = 4, style = "normal" } = opts;
    const text = cleanText(value).trim();
    if (!text) return;
    setFont(style, size, color);
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH - indent) as string[];
    const lineHeight = size * 1.38;
    lines.forEach((line) => {
      ensure(lineHeight);
      doc.text(line, MARGIN_X + indent, y);
      y += lineHeight;
    });
    y += after;
  };

  const bullets = (value: string) => {
    const items = cleanText(value)
      .split(/\r?\n/)
      .map((line) => line.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean);
    if (items.length === 0) return;
    if (items.length === 1) {
      paragraph(items[0], { size: 9.5, indent: 10, after: 3 });
      return;
    }
    const size = 9.5;
    const lineHeight = size * 1.38;
    items.forEach((item) => {
      setFont("normal", size, ink);
      const lines = doc.splitTextToSize(item, CONTENT_WIDTH - 26) as string[];
      lines.forEach((line, index) => {
        ensure(lineHeight);
        doc.text(index === 0 ? `- ${line}` : line, MARGIN_X + (index === 0 ? 10 : 22), y);
        y += lineHeight;
      });
    });
    y += 3;
  };

  const heading = (title: string) => {
    ensure(34);
    y += 6;
    setFont("bold", 10, accentRgb);
    doc.text(cleanText(title).toUpperCase(), MARGIN_X, y);
    doc.setDrawColor(accentRgb[0], accentRgb[1], accentRgb[2]);
    doc.setLineWidth(0.8);
    doc.line(MARGIN_X, y + 4, PAGE_WIDTH - MARGIN_X, y + 4);
    y += 16;
  };

  const entryHeader = (title: string, meta: string) => {
    ensure(32);
    setFont("bold", 10.5, ink);
    const titleLines = doc.splitTextToSize(cleanText(title), CONTENT_WIDTH) as string[];
    titleLines.forEach((line) => {
      doc.text(line, MARGIN_X, y);
      y += 14;
    });
    if (meta) paragraph(meta, { size: 9.5, color: muted, after: 2 });
    else y += 2;
  };

  const dateRange = (start: string, end: string, current?: boolean) => {
    const finish = current ? "Present" : end;
    if (start && finish) return `${start} - ${finish}`;
    return start || finish || "";
  };

  /* ---------- Header (plain text, no photo or icons) ---------- */
  setFont("bold", 20, ink);
  doc.text(cleanText(name), MARGIN_X, y);
  y += 22;

  const title = resume.personalInfo.title.trim();
  if (title) {
    setFont("normal", 10.5, accentRgb);
    doc.text(cleanText(title), MARGIN_X, y);
    y += 15;
  }

  const p = resume.personalInfo;
  const contact = [p.email, p.phone, p.location, prettyUrl(p.linkedin), prettyUrl(p.github), prettyUrl(p.portfolio)]
    .filter(Boolean)
    .join(" | ");
  if (contact) {
    setFont("normal", 9, muted);
    const lines = doc.splitTextToSize(cleanText(contact), CONTENT_WIDTH) as string[];
    lines.forEach((line) => {
      doc.text(line, MARGIN_X, y);
      y += 12;
    });
  }

  y += 5;
  doc.setDrawColor(accentRgb[0], accentRgb[1], accentRgb[2]);
  doc.setLineWidth(1.4);
  doc.line(MARGIN_X, y, PAGE_WIDTH - MARGIN_X, y);
  y += 16;

  /* ---------- Sections ---------- */
  if (sectionVisible(resume, "summary") && resume.summary.trim()) {
    heading("Professional Summary");
    paragraph(resume.summary, { size: 10, after: 3 });
  }

  if (sectionVisible(resume, "experience") && resume.experience.length > 0) {
    heading("Work Experience");
    resume.experience.forEach((e) => {
      const dates = dateRange(e.startDate, e.endDate, e.current);
      const meta = [e.company, e.location, dates].filter(Boolean).join(" | ");
      entryHeader(e.jobTitle, meta);
      bullets(e.description);
      y += 3;
    });
  }

  if (sectionVisible(resume, "education") && resume.education.length > 0) {
    heading("Education");
    resume.education.forEach((e) => {
      const meta = [e.institution, e.location, dateRange(e.startYear, e.endYear), e.grade].filter(Boolean).join(" | ");
      entryHeader(e.degree, meta);
      if (e.description) paragraph(e.description, { size: 9.5, color: muted, after: 2 });
      y += 4;
    });
  }

  if (sectionVisible(resume, "projects") && resume.projects.length > 0) {
    heading("Projects");
    resume.projects.forEach((project) => {
      entryHeader(project.name, "");
      if (project.technologies.length > 0) {
        paragraph(`Technologies: ${project.technologies.join(", ")}`, { size: 9.5, color: muted, after: 2 });
      }
      if (project.description) paragraph(project.description, { size: 10, after: 2 });
      const links = [
        project.githubUrl ? `GitHub: ${prettyUrl(project.githubUrl)}` : "",
        project.liveUrl ? `Live: ${prettyUrl(project.liveUrl)}` : "",
      ]
        .filter(Boolean)
        .join(" | ");
      if (links) paragraph(links, { size: 9, color: muted, after: 3 });
      y += 3;
    });
  }

  if (sectionVisible(resume, "skills") && resume.skills.length > 0) {
    heading("Skills");
    paragraph(resume.skills.join(", "), { size: 10, after: 3 });
  }

  if (sectionVisible(resume, "certifications") && resume.certifications.length > 0) {
    heading("Certifications");
    resume.certifications.forEach((c) => {
      entryHeader(c.name, c.date);
      const detail = [c.organization, c.credentialUrl ? `Credential: ${prettyUrl(c.credentialUrl)}` : ""].filter(Boolean).join(" | ");
      if (detail) paragraph(detail, { size: 9.5, color: muted, after: 3 });
    });
  }

  if (sectionVisible(resume, "achievements") && resume.achievements.length > 0) {
    heading("Achievements");
    resume.achievements.forEach((a) => {
      const text = a.description ? `${a.title}: ${a.description}` : a.title;
      bullets(text);
    });
  }

  if (sectionVisible(resume, "languages") && resume.languages.length > 0) {
    heading("Languages");
    paragraph(
      resume.languages.map((l) => `${l.name}${l.proficiency ? ` (${l.proficiency})` : ""}`).join(", "),
      { size: 10, after: 3 }
    );
  }

  if (sectionVisible(resume, "socialLinks") && resume.socialLinks.some((s) => s.url)) {
    heading("Links");
    resume.socialLinks
      .filter((s) => s.url)
      .forEach((s) => {
        paragraph(`${s.label ? `${s.label}: ` : ""}${prettyUrl(s.url)}`, { size: 9.5, after: 1 });
      });
  }

  doc.save(filename);
}

export function safeFilename(name: string): string {
  const base = name.trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "_") || "Resume";
  return `${base}.pdf`;
}
