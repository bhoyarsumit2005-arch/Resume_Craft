import { Bullets, ExtLink, Placeholder, contactItems, dateRange, show, type TemplateProps } from "./shared";
import { ensureHttp, prettyUrl } from "@/lib/resume-types";

/** Minimal – lots of whitespace, modern type, thin separators, left-label layout. */
export default function MinimalTemplate({ resume, accent, fontSize, links = true }: TemplateProps) {
  const p = resume.personalInfo;
  const contacts = contactItems(resume);

  const Section = ({ title, children, avoid }: { title: string; children: React.ReactNode; avoid?: boolean }) => (
    <section
      className={avoid ? "avoid-break" : undefined}
      style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 20, padding: "16px 0", borderTop: "1px solid #e5e7eb" }}
    >
      <h2 style={{ fontSize: "0.75em", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#9ca3af", margin: 0, paddingTop: 3 }}>
        {title}
      </h2>
      <div style={{ minWidth: 0 }}>{children}</div>
    </section>
  );

  const Meta = ({ children }: { children: React.ReactNode }) => (
    <span style={{ color: "#6b7280", fontSize: "0.88em" }}>{children}</span>
  );

  return (
    <div className="resume-paper" style={{ fontSize, fontFamily: "Inter, system-ui, sans-serif", padding: "48px 48px 40px", color: "#1f2937" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 24, alignItems: "flex-start", paddingBottom: 24 }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: "2.3em", fontWeight: 300, letterSpacing: "-0.01em", lineHeight: 1.05, margin: 0, color: "#111827" }}>
            {p.fullName ? (
              <>
                <span style={{ fontWeight: 700 }}>{p.fullName.split(" ")[0]}</span>{" "}
                {p.fullName.split(" ").slice(1).join(" ")}
              </>
            ) : (
              "Your Name"
            )}
          </h1>
          {p.title && <p style={{ margin: "8px 0 0", color: accent, fontWeight: 500, fontSize: "1.02em" }}>{p.title}</p>}
          {contacts.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginTop: 14, fontSize: "0.85em", color: "#4b5563" }}>
              {contacts.map((c, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: accent, display: "inline-flex" }}>{c.icon}</span>
                  {c.href ? (
                    links ? (
                      <a href={c.href} target="_blank" rel="noreferrer">
                        {c.text}
                      </a>
                    ) : (
                      c.text
                    )
                  ) : (
                    c.text
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
        {p.photo && (
          <img
            src={p.photo}
            alt={p.fullName ? `${p.fullName} profile photo` : "Profile photo"}
            style={{ width: 88, height: 88, borderRadius: 14, objectFit: "cover", flexShrink: 0 }}
          />
        )}
      </header>

      <Placeholder name={p.fullName} />

      {show(resume, "summary") && (
        <Section title="Profile" avoid>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{resume.summary}</p>
        </Section>
      )}

      {show(resume, "experience") && (
        <Section title="Experience">
          {resume.experience.map((e, i) => (
            <div key={e.id} className="avoid-break" style={{ marginBottom: i === resume.experience.length - 1 ? 0 : 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <strong style={{ color: "#111827" }}>{e.jobTitle}</strong>
                <Meta>{dateRange(e.startDate, e.endDate, e.current)}</Meta>
              </div>
              <Meta>{[e.company, e.location].filter(Boolean).join(" · ")}</Meta>
              <div style={{ marginTop: 2, lineHeight: 1.55 }}>
                <Bullets text={e.description} />
              </div>
            </div>
          ))}
        </Section>
      )}

      {show(resume, "education") && (
        <Section title="Education">
          {resume.education.map((e, i) => (
            <div key={e.id} className="avoid-break" style={{ marginBottom: i === resume.education.length - 1 ? 0 : 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <strong style={{ color: "#111827" }}>{e.degree}</strong>
                <Meta>{dateRange(e.startYear, e.endYear)}</Meta>
              </div>
              <Meta>{[e.institution, e.location, e.grade].filter(Boolean).join(" · ")}</Meta>
              {e.description && <p style={{ margin: "3px 0 0", fontSize: "0.95em" }}>{e.description}</p>}
            </div>
          ))}
        </Section>
      )}

      {show(resume, "projects") && (
        <Section title="Projects">
          {resume.projects.map((pr, i) => (
            <div key={pr.id} className="avoid-break" style={{ marginBottom: i === resume.projects.length - 1 ? 0 : 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
                <strong style={{ color: "#111827" }}>{pr.name}</strong>
                <span style={{ display: "flex", gap: 10, fontSize: "0.85em" }}>
                  {pr.githubUrl && <ExtLink href={pr.githubUrl} color={accent} links={links}>Code</ExtLink>}
                  {pr.liveUrl && <ExtLink href={pr.liveUrl} color={accent} links={links}>Live</ExtLink>}
                </span>
              </div>
              {pr.description && <p style={{ margin: "2px 0 4px", lineHeight: 1.55 }}>{pr.description}</p>}
              {pr.technologies.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {pr.technologies.map((t) => (
                    <span key={t} style={{ fontSize: "0.78em", padding: "1px 8px", borderRadius: 4, border: "1px solid #e5e7eb", color: "#4b5563" }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {show(resume, "skills") && (
        <Section title="Skills" avoid>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 8px" }}>
            {resume.skills.map((s) => (
              <span key={s} style={{ padding: "3px 10px", borderRadius: 6, background: "#f3f4f6", fontSize: "0.9em", fontWeight: 500 }}>
                {s}
              </span>
            ))}
          </div>
        </Section>
      )}

      {show(resume, "certifications") && (
        <Section title="Certifications" avoid>
          {resume.certifications.map((c) => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
              <span>
                <strong style={{ color: "#111827" }}>{c.name}</strong>
                {c.organization && <Meta> · {c.organization}</Meta>}
                {c.credentialUrl && (
                  <span style={{ fontSize: "0.85em", marginLeft: 6 }}>
                    <ExtLink href={c.credentialUrl} color={accent} links={links}>verify</ExtLink>
                  </span>
                )}
              </span>
              <Meta>{c.date}</Meta>
            </div>
          ))}
        </Section>
      )}

      {show(resume, "achievements") && (
        <Section title="Achievements" avoid>
          {resume.achievements.map((a) => (
            <div key={a.id} style={{ marginBottom: 6 }}>
              <strong style={{ color: "#111827" }}>{a.title}</strong>
              {a.description && <p style={{ margin: "1px 0 0", fontSize: "0.95em", color: "#4b5563" }}>{a.description}</p>}
            </div>
          ))}
        </Section>
      )}

      {show(resume, "languages") && (
        <Section title="Languages" avoid>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 20px" }}>
            {resume.languages.map((l) => (
              <span key={l.id}>
                <strong style={{ color: "#111827" }}>{l.name}</strong>
                {l.proficiency && <Meta> — {l.proficiency}</Meta>}
              </span>
            ))}
          </div>
        </Section>
      )}

      {show(resume, "socialLinks") && (
        <Section title="Links" avoid>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {resume.socialLinks.filter((s) => s.url).map((s) =>
              links ? (
                <a key={s.id} href={ensureHttp(s.url)} target="_blank" rel="noreferrer" style={{ color: accent }}>
                  {s.label ? `${s.label} — ` : ""}
                  {prettyUrl(s.url)}
                </a>
              ) : (
                <span key={s.id} style={{ color: accent }}>
                  {s.label ? `${s.label} — ` : ""}
                  {prettyUrl(s.url)}
                </span>
              )
            )}
          </div>
        </Section>
      )}
    </div>
  );
}
