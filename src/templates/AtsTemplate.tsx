import type { CSSProperties, ReactNode } from "react";
import { Bullets, Placeholder, contactItems, dateRange, show, type TemplateProps } from "./shared";
import { ensureHttp, prettyUrl, type TemplateId } from "@/lib/resume-types";

interface VariantStyle {
  page: CSSProperties;
  header: CSSProperties;
  name: CSSProperties;
  title: CSSProperties;
  contacts: CSSProperties;
  heading: CSSProperties;
  entry: CSSProperties;
  entryTitle: CSSProperties;
  meta: CSSProperties;
  body: CSSProperties;
  small: CSSProperties;
}

/**
 * Every ATS template uses the same accessible, single-column structure:
 * plain text contact details, standard section headings, simple bullets,
 * no tables, no icons, no photos and no sidebars.
 *
 * The font stack comes from the editor's ATS-safe font picker and is applied
 * to the whole page so the preview and the exported PDF match.
 */
function getStyle(variant: TemplateId, accent: string, family: string): VariantStyle {
  const base: VariantStyle = {
    page: { fontFamily: family, color: "#111827", padding: "44px 46px" },
    header: { borderBottom: `2px solid ${accent}`, paddingBottom: 12 },
    name: { fontSize: "2.05em", fontWeight: 800, letterSpacing: "0.01em", color: "#111827", lineHeight: 1.12, margin: 0 },
    title: { fontSize: "1em", fontWeight: 600, color: accent, margin: "5px 0 0" },
    contacts: { fontSize: "0.85em", color: "#374151", margin: "8px 0 0", lineHeight: 1.5 },
    heading: {
      fontSize: "0.8em",
      fontWeight: 700,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: accent,
      borderBottom: `1px solid ${accent}`,
      paddingBottom: 4,
      margin: "1.25em 0 0.55em",
    },
    entry: { marginBottom: "0.85em" },
    entryTitle: { fontSize: "1.02em", fontWeight: 700, color: "#111827" },
    meta: { fontSize: "0.86em", color: "#4b5563", whiteSpace: "nowrap" },
    body: { fontSize: "1em", color: "#111827", lineHeight: 1.55, margin: 0 },
    small: { fontSize: "0.9em", color: "#4b5563", lineHeight: 1.5 },
  };

  switch (variant) {
    case "classic":
      return {
        ...base,
        page: { ...base.page, color: "#111", padding: "44px 48px" },
        header: { textAlign: "center", borderBottom: "3px double #111", paddingBottom: 14 },
        name: { ...base.name, fontSize: "1.95em", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" },
        title: { ...base.title, fontStyle: "italic", color: "#111" },
        contacts: { ...base.contacts, fontSize: "0.87em", color: "#222", textAlign: "center" },
        heading: {
          ...base.heading,
          fontSize: "0.9em",
          letterSpacing: "0.08em",
          color: "#111",
          borderBottom: "1px solid #111",
          paddingBottom: 3,
        },
        meta: { ...base.meta, fontStyle: "italic" },
      };
    case "minimal":
      return {
        ...base,
        page: { ...base.page, padding: "52px 50px" },
        header: { borderBottom: "1px solid #e5e7eb", paddingBottom: 20 },
        name: { ...base.name, fontSize: "2.2em", fontWeight: 600, letterSpacing: "-0.01em" },
        title: { ...base.title, fontWeight: 500 },
        contacts: { ...base.contacts, color: "#4b5563" },
        heading: {
          ...base.heading,
          fontSize: "0.72em",
          fontWeight: 600,
          letterSpacing: "0.16em",
          color: "#6b7280",
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: 6,
          margin: "1.6em 0 0.65em",
        },
        entry: { marginBottom: "1em" },
        entryTitle: { ...base.entryTitle, fontWeight: 600 },
        meta: { ...base.meta, color: "#6b7280" },
        body: { ...base.body, lineHeight: 1.65 },
        small: { ...base.small, color: "#6b7280" },
      };
    case "executive":
      return {
        ...base,
        page: { ...base.page, padding: "40px 46px" },
        header: { borderBottom: `3px solid ${accent}`, paddingBottom: 14 },
        name: { ...base.name, fontSize: "2.1em", letterSpacing: "0.02em" },
        title: { ...base.title, fontWeight: 700, fontSize: "0.95em" },
        heading: {
          ...base.heading,
          fontSize: "0.84em",
          letterSpacing: "0.12em",
          borderBottom: `2px solid ${accent}`,
          paddingBottom: 4,
          margin: "1.3em 0 0.55em",
        },
      };
    case "creative":
      return {
        ...base,
        page: { ...base.page, padding: "42px 46px" },
        header: { borderBottom: `4px solid ${accent}`, paddingBottom: 16 },
        name: { ...base.name, fontSize: "2.1em", color: accent, letterSpacing: "-0.01em" },
        title: { ...base.title, color: "#111827", fontWeight: 600 },
        heading: {
          ...base.heading,
          fontSize: "0.78em",
          fontWeight: 800,
          letterSpacing: "0.16em",
          color: accent,
          borderBottom: `1px solid ${accent}55`,
          paddingBottom: 5,
        },
      };
    case "timeline":
      return {
        ...base,
        page: { ...base.page, padding: "42px 46px" },
        header: { borderBottom: "1px solid #d1d5db", paddingBottom: 14 },
        name: { ...base.name, fontSize: "2em" },
        title: { ...base.title, fontWeight: 600 },
        heading: {
          ...base.heading,
          fontSize: "0.78em",
          fontWeight: 800,
          letterSpacing: "0.14em",
          color: "#111827",
          borderBottom: `2px solid ${accent}`,
          paddingBottom: 4,
        },
        meta: { ...base.meta, color: accent, fontWeight: 700 },
        body: { ...base.body, lineHeight: 1.5 },
      };
    default:
      return base;
  }
}

export default function AtsTemplate({
  resume,
  accent,
  fontSize,
  fontFamily,
  links = true,
  variant,
}: TemplateProps & { variant: TemplateId }) {
  const p = resume.personalInfo;
  const contacts = contactItems(resume);
  const s = getStyle(variant, accent, fontFamily);
  const dateFirst = variant === "timeline";

  const contactNode = (c: (typeof contacts)[number]) => {
    if (!c.href || !links) return <>{c.text}</>;
    return (
      <a href={c.href} target="_blank" rel="noreferrer" style={{ color: "inherit" }}>
        {c.text}
      </a>
    );
  };

  const Link = ({ href, children }: { href: string; children: ReactNode }) =>
    links ? (
      <a href={ensureHttp(href)} target="_blank" rel="noreferrer" style={{ color: "inherit" }}>
        {children}
      </a>
    ) : (
      <>{children}</>
    );

  const Heading = ({ children }: { children: ReactNode }) => <h2 style={s.heading}>{children}</h2>;

  const Entry = ({
    title,
    meta,
    sub,
    children,
  }: {
    title: string;
    meta?: string;
    sub?: string;
    children?: ReactNode;
  }) => (
    <div className="avoid-break" style={s.entry}>
      {dateFirst && meta && <div style={s.meta}>{meta}</div>}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
        <strong style={s.entryTitle}>{title}</strong>
        {!dateFirst && meta && <span style={s.meta}>{meta}</span>}
      </div>
      {sub && <div style={s.small}>{sub}</div>}
      {children}
    </div>
  );

  return (
    <div className="resume-paper" style={{ ...s.page, fontSize }}>
      <header style={s.header}>
        <h1 style={s.name}>{p.fullName || "Your Name"}</h1>
        {p.title && <p style={s.title}>{p.title}</p>}
        {contacts.length > 0 && (
          <p style={s.contacts}>
            {contacts.map((c, i) => (
              <span key={i}>
                {i > 0 && " | "}
                {contactNode(c)}
              </span>
            ))}
          </p>
        )}
      </header>

      <Placeholder name={p.fullName} />

      {show(resume, "summary") && (
        <section className="avoid-break">
          <Heading>Professional Summary</Heading>
          <p style={s.body}>{resume.summary}</p>
        </section>
      )}

      {show(resume, "experience") && (
        <section>
          <Heading>Work Experience</Heading>
          {resume.experience.map((e) => (
            <Entry
              key={e.id}
              title={e.jobTitle}
              meta={dateRange(e.startDate, e.endDate, e.current)}
              sub={[e.company, e.location].filter(Boolean).join(", ")}
            >
              <div style={{ marginTop: 2 }}>
                <Bullets text={e.description} />
              </div>
            </Entry>
          ))}
        </section>
      )}

      {show(resume, "education") && (
        <section>
          <Heading>Education</Heading>
          {resume.education.map((e) => (
            <Entry
              key={e.id}
              title={e.degree}
              meta={dateRange(e.startYear, e.endYear)}
              sub={[e.institution, e.location, e.grade].filter(Boolean).join(", ")}
            >
              {e.description && <p style={{ ...s.small, margin: "2px 0 0" }}>{e.description}</p>}
            </Entry>
          ))}
        </section>
      )}

      {show(resume, "projects") && (
        <section>
          <Heading>Projects</Heading>
          {resume.projects.map((pr) => (
            <div key={pr.id} className="avoid-break" style={s.entry}>
              <strong style={s.entryTitle}>{pr.name}</strong>
              {pr.technologies.length > 0 && <div style={s.small}>Technologies: {pr.technologies.join(", ")}</div>}
              {pr.description && <p style={{ ...s.body, margin: "2px 0 0" }}>{pr.description}</p>}
              {(pr.githubUrl || pr.liveUrl) && (
                <p style={{ ...s.small, margin: "2px 0 0" }}>
                  {pr.githubUrl && (
                    <>
                      GitHub: <Link href={pr.githubUrl}>{prettyUrl(pr.githubUrl)}</Link>
                    </>
                  )}
                  {pr.githubUrl && pr.liveUrl && " | "}
                  {pr.liveUrl && (
                    <>
                      Live: <Link href={pr.liveUrl}>{prettyUrl(pr.liveUrl)}</Link>
                    </>
                  )}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {show(resume, "skills") && (
        <section className="avoid-break">
          <Heading>Skills</Heading>
          <p style={s.body}>{resume.skills.join(", ")}</p>
        </section>
      )}

      {show(resume, "certifications") && (
        <section>
          <Heading>Certifications</Heading>
          {resume.certifications.map((c) => (
            <Entry key={c.id} title={c.name} meta={c.date}>
              <div style={s.small}>
                {c.organization}
                {c.organization && c.credentialUrl && " | "}
                {c.credentialUrl && (
                  <>
                    Credential: <Link href={c.credentialUrl}>{prettyUrl(c.credentialUrl)}</Link>
                  </>
                )}
              </div>
            </Entry>
          ))}
        </section>
      )}

      {show(resume, "achievements") && (
        <section className="avoid-break">
          <Heading>Achievements</Heading>
          <ul className="bullets" style={{ ...s.body, margin: "0.2em 0 0" }}>
            {resume.achievements.map((a) => (
              <li key={a.id}>
                <strong>{a.title}</strong>
                {a.description && ` — ${a.description}`}
              </li>
            ))}
          </ul>
        </section>
      )}

      {show(resume, "languages") && (
        <section className="avoid-break">
          <Heading>Languages</Heading>
          <p style={s.body}>{resume.languages.map((l) => `${l.name}${l.proficiency ? ` (${l.proficiency})` : ""}`).join(", ")}</p>
        </section>
      )}

      {show(resume, "socialLinks") && (
        <section className="avoid-break">
          <Heading>Links</Heading>
          {resume.socialLinks
            .filter((l) => l.url)
            .map((l) => (
              <p key={l.id} style={{ ...s.body, margin: "0 0 2px" }}>
                {l.label ? `${l.label}: ` : ""}
                <Link href={l.url}>{prettyUrl(l.url)}</Link>
              </p>
            ))}
        </section>
      )}
    </div>
  );
}
