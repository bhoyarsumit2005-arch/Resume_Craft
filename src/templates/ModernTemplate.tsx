import { Bullets, ExtLink, Placeholder, contactItems, dateRange, show, type TemplateProps } from "./shared";
import { ensureHttp, prettyUrl } from "@/lib/resume-types";

export default function ModernTemplate({ resume, accent, fontSize, links = true }: TemplateProps) {
  const p = resume.personalInfo;
  const contacts = contactItems(resume);

  const H = ({ children }: { children: React.ReactNode }) => (
    <h2
      style={{
        fontSize: "0.85em",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: accent,
        borderBottom: `2px solid ${accent}`,
        paddingBottom: 4,
        margin: "1.3em 0 0.6em",
      }}
    >
      {children}
    </h2>
  );

  return (
    <div className="resume-paper" style={{ fontSize, fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{ background: accent, color: "#fff", padding: "28px 36px", display: "flex", gap: 20, alignItems: "center" }}>
        {p.photo && (
          <img
            src={p.photo}
            alt={p.fullName ? `${p.fullName} profile photo` : "Profile photo"}
            style={{ width: 84, height: 84, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,0.6)" }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: "2.1em", fontWeight: 800, letterSpacing: "0.02em", textTransform: "uppercase", lineHeight: 1.1, margin: 0 }}>
            {p.fullName || "Your Name"}
          </h1>
          {p.title && <p style={{ margin: "6px 0 0", fontSize: "1.05em", opacity: 0.92, fontWeight: 500 }}>{p.title}</p>}
          {contacts.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: 12, fontSize: "0.85em", opacity: 0.95 }}>
              {contacts.map((c, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  {c.icon}
                  {c.href ? (
                    links ? (
                      <a href={c.href} target="_blank" rel="noreferrer" style={{ color: "#fff" }}>
                        {c.text}
                      </a>
                    ) : (
                      <span style={{ color: "#fff" }}>{c.text}</span>
                    )
                  ) : (
                    c.text
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <div style={{ padding: "8px 36px 36px" }}>
        <Placeholder name={p.fullName} />

        {show(resume, "summary") && (
          <section className="avoid-break">
            <H>Professional Summary</H>
            <p style={{ margin: 0, color: "#374151" }}>{resume.summary}</p>
          </section>
        )}

        {show(resume, "experience") && (
          <section>
            <H>Experience</H>
            {resume.experience.map((e) => (
              <div key={e.id} className="avoid-break" style={{ marginBottom: "0.9em" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <strong style={{ fontSize: "1.05em" }}>{e.jobTitle}</strong>
                  <span style={{ color: "#6b7280", fontSize: "0.9em" }}>{dateRange(e.startDate, e.endDate, e.current)}</span>
                </div>
                <div style={{ color: accent, fontWeight: 600, fontSize: "0.95em" }}>
                  {e.company}
                  {e.location && <span style={{ color: "#6b7280", fontWeight: 400 }}> · {e.location}</span>}
                </div>
                <div style={{ color: "#374151" }}>
                  <Bullets text={e.description} />
                </div>
              </div>
            ))}
          </section>
        )}

        {show(resume, "education") && (
          <section>
            <H>Education</H>
            {resume.education.map((e) => (
              <div key={e.id} className="avoid-break" style={{ marginBottom: "0.8em" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <strong>{e.degree}</strong>
                  <span style={{ color: "#6b7280", fontSize: "0.9em" }}>{dateRange(e.startYear, e.endYear)}</span>
                </div>
                <div style={{ fontSize: "0.95em" }}>
                  <span style={{ color: accent, fontWeight: 600 }}>{e.institution}</span>
                  {e.location && <span style={{ color: "#6b7280" }}> · {e.location}</span>}
                  {e.grade && <span style={{ color: "#374151" }}> · {e.grade}</span>}
                </div>
                {e.description && <p style={{ margin: "0.2em 0 0", color: "#374151", fontSize: "0.95em" }}>{e.description}</p>}
              </div>
            ))}
          </section>
        )}

        {show(resume, "projects") && (
          <section>
            <H>Projects</H>
            {resume.projects.map((pr) => (
              <div key={pr.id} className="avoid-break" style={{ marginBottom: "0.9em" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
                  <strong style={{ fontSize: "1.02em" }}>{pr.name}</strong>
                  <span style={{ display: "flex", gap: 12, fontSize: "0.85em" }}>
                    {pr.githubUrl && <ExtLink href={pr.githubUrl} color={accent} links={links}>GitHub</ExtLink>}
                    {pr.liveUrl && <ExtLink href={pr.liveUrl} color={accent} links={links}>Live Demo</ExtLink>}
                  </span>
                </div>
                {pr.description && <p style={{ margin: "0.15em 0 0.35em", color: "#374151" }}>{pr.description}</p>}
                {pr.technologies.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {pr.technologies.map((t) => (
                      <span key={t} style={{ fontSize: "0.78em", padding: "2px 8px", borderRadius: 999, background: `${accent}18`, color: accent, fontWeight: 600 }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {show(resume, "skills") && (
          <section className="avoid-break">
            <H>Skills</H>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px" }}>
              {resume.skills.map((s) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: accent, flexShrink: 0 }} />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <div style={{ display: "grid", gridTemplateColumns: show(resume, "certifications") && show(resume, "achievements") ? "1fr 1fr" : "1fr", gap: "0 28px" }}>
          {show(resume, "certifications") && (
            <section className="avoid-break">
              <H>Certifications</H>
              {resume.certifications.map((c) => (
                <div key={c.id} style={{ marginBottom: "0.6em" }}>
                  <strong style={{ fontSize: "0.98em" }}>{c.name}</strong>
                  <div style={{ fontSize: "0.9em", color: "#6b7280" }}>
                    {[c.organization, c.date].filter(Boolean).join(" · ")}
                    {c.credentialUrl && (
                      <>
                        {" · "}
                        <ExtLink href={c.credentialUrl} color={accent} links={links}>Credential</ExtLink>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </section>
          )}

          {show(resume, "achievements") && (
            <section className="avoid-break">
              <H>Achievements</H>
              <ul className="bullets" style={{ color: "#374151" }}>
                {resume.achievements.map((a) => (
                  <li key={a.id} style={{ marginBottom: 3 }}>
                    <strong style={{ color: "#111827" }}>{a.title}</strong>
                    {a.description && <span> — {a.description}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: show(resume, "languages") && show(resume, "socialLinks") ? "1fr 1fr" : "1fr", gap: "0 28px" }}>
          {show(resume, "languages") && (
            <section className="avoid-break">
              <H>Languages</H>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 18px" }}>
                {resume.languages.map((l) => (
                  <span key={l.id}>
                    <strong>{l.name}</strong>
                    {l.proficiency && <span style={{ color: "#6b7280" }}> — {l.proficiency}</span>}
                  </span>
                ))}
              </div>
            </section>
          )}
          {show(resume, "socialLinks") && (
            <section className="avoid-break">
              <H>Links</H>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: "0.95em" }}>
                {resume.socialLinks.filter((s) => s.url).map((s) =>
                  links ? (
                    <a key={s.id} href={ensureHttp(s.url)} target="_blank" rel="noreferrer" style={{ color: accent }}>
                      {s.label ? `${s.label}: ` : ""}
                      {prettyUrl(s.url)}
                    </a>
                  ) : (
                    <span key={s.id} style={{ color: accent }}>
                      {s.label ? `${s.label}: ` : ""}
                      {prettyUrl(s.url)}
                    </span>
                  )
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
