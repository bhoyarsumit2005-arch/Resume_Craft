import { Bullets, ExtLink, Placeholder, contactItems, dateRange, show, type TemplateProps } from "./shared";
import { ensureHttp, prettyUrl } from "@/lib/resume-types";

/** Creative – bold accent header with monogram, colourful two-column layout for standout pitches. */
export default function CreativeTemplate({ resume, accent, fontSize, links = true }: TemplateProps) {
  const p = resume.personalInfo;
  const contacts = contactItems(resume);
  const initial = (p.fullName || "?").trim().charAt(0).toUpperCase() || "R";

  const H = ({ children }: { children: React.ReactNode }) => (
    <h2
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: "0.8em",
        fontWeight: 800,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: accent,
        margin: "1.2em 0 0.55em",
      }}
    >
      <span style={{ width: 9, height: 9, borderRadius: 2, background: accent, flexShrink: 0 }} />
      {children}
    </h2>
  );

  return (
    <div className="resume-paper" style={{ fontSize, fontFamily: "Inter, system-ui, sans-serif", color: "#1f2937" }}>
      {/* Header */}
      <header style={{ borderBottom: `4px solid ${accent}`, padding: "26px 30px 22px", display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
        <span
          className="avoid-break"
          style={{ flexShrink: 0, width: 62, height: 62, borderRadius: 16, background: accent, color: "#fff", display: "grid", placeItems: "center", fontSize: "1.9em", fontWeight: 800 }}
        >
          {initial}
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1 style={{ fontSize: "1.8em", fontWeight: 800, letterSpacing: "-0.01em", margin: 0, color: "#111827", lineHeight: 1.1 }}>
            {p.fullName || "Your Name"}
          </h1>
          {p.title && <p style={{ margin: "5px 0 0", color: accent, fontWeight: 600, fontSize: "0.98em" }}>{p.title}</p>}
        </div>
        {p.photo && (
          <img
            src={p.photo}
            alt={p.fullName ? `${p.fullName} profile photo` : "Profile photo"}
            style={{ width: 70, height: 70, borderRadius: "50%", objectFit: "cover", border: `3px solid ${accent}`, flexShrink: 0 }}
          />
        )}
        {contacts.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.82em", color: "#4b5563", minWidth: 0 }}>
            {contacts.map((c, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: accent, display: "inline-flex" }}>{c.icon}</span>
                {c.href ? (
                  links ? (
                    <a href={c.href} target="_blank" rel="noreferrer" style={{ color: "#374151" }}>
                      {c.text}
                    </a>
                  ) : (
                    <span style={{ color: "#374151" }}>{c.text}</span>
                  )
                ) : (
                  <span style={{ color: "#374151" }}>{c.text}</span>
                )}
              </span>
            ))}
          </div>
        )}
      </header>

      <div style={{ padding: "6px 30px 30px", display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 0.95fr)", gap: 26 }}>
        {/* Main column */}
        <div style={{ minWidth: 0 }}>
          <Placeholder name={p.fullName} />

          {show(resume, "summary") && (
            <section className="avoid-break">
              <H>About Me</H>
              <p style={{ margin: 0, lineHeight: 1.6, color: "#374151" }}>{resume.summary}</p>
            </section>
          )}

          {show(resume, "experience") && (
            <section>
              <H>Experience</H>
              {resume.experience.map((e) => (
                <div key={e.id} className="avoid-break" style={{ marginBottom: "0.85em" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <strong style={{ fontSize: "1.02em", color: "#111827" }}>{e.jobTitle}</strong>
                    <span style={{ color: "#6b7280", fontSize: "0.88em" }}>{dateRange(e.startDate, e.endDate, e.current)}</span>
                  </div>
                  <div style={{ color: accent, fontWeight: 600, fontSize: "0.92em" }}>
                    {e.company}
                    {e.location && <span style={{ color: "#6b7280", fontWeight: 400 }}> · {e.location}</span>}
                  </div>
                  <div style={{ color: "#374151", lineHeight: 1.5 }}>
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
                <div key={e.id} className="avoid-break" style={{ marginBottom: "0.75em" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <strong style={{ color: "#111827" }}>{e.degree}</strong>
                    <span style={{ color: "#6b7280", fontSize: "0.88em" }}>{dateRange(e.startYear, e.endYear)}</span>
                  </div>
                  <div style={{ fontSize: "0.95em", color: "#374151" }}>
                    <span style={{ color: accent, fontWeight: 600 }}>{e.institution}</span>
                    {e.location && <span> · {e.location}</span>}
                    {e.grade && <span> · {e.grade}</span>}
                  </div>
                  {e.description && <p style={{ margin: "0.2em 0 0", color: "#6b7280", fontSize: "0.92em" }}>{e.description}</p>}
                </div>
              ))}
            </section>
          )}

          {show(resume, "projects") && (
            <section>
              <H>Projects</H>
              {resume.projects.map((pr) => (
                <div key={pr.id} className="avoid-break" style={{ marginBottom: "0.85em" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
                    <strong style={{ fontSize: "1em", color: "#111827" }}>{pr.name}</strong>
                    <span style={{ display: "flex", gap: 12, fontSize: "0.82em" }}>
                      {pr.githubUrl && (
                        <ExtLink href={pr.githubUrl} color={accent} links={links}>
                          Code
                        </ExtLink>
                      )}
                      {pr.liveUrl && (
                        <ExtLink href={pr.liveUrl} color={accent} links={links}>
                          Live
                        </ExtLink>
                      )}
                    </span>
                  </div>
                  {pr.description && <p style={{ margin: "0.15em 0 0.3em", color: "#374151" }}>{pr.description}</p>}
                  {pr.technologies.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {pr.technologies.map((t) => (
                        <span key={t} style={{ fontSize: "0.75em", padding: "2px 8px", borderRadius: 999, background: `${accent}18`, color: accent, fontWeight: 600 }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          {show(resume, "achievements") && (
            <section className="avoid-break">
              <H>Achievements</H>
              <ul className="bullets" style={{ color: "#374151" }}>
                {resume.achievements.map((a) => (
                  <li key={a.id}>
                    <strong style={{ color: "#111827" }}>{a.title}</strong>
                    {a.description && <span> — {a.description}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Rail */}
        <div style={{ borderLeft: `1px solid ${accent}33`, paddingLeft: 22, minWidth: 0 }}>
          {show(resume, "skills") && (
            <section className="avoid-break">
              <H>Skills</H>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {resume.skills.map((s) => (
                  <span key={s} style={{ fontSize: "0.8em", padding: "4px 10px", borderRadius: 999, background: `${accent}12`, border: `1px solid ${accent}33`, color: "#334155", fontWeight: 600 }}>
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {show(resume, "certifications") && (
            <section className="avoid-break">
              <H>Certifications</H>
              {resume.certifications.map((c) => (
                <div key={c.id} style={{ marginBottom: 8 }}>
                  <strong style={{ color: "#111827", fontSize: "0.93em" }}>{c.name}</strong>
                  <div style={{ fontSize: "0.85em", color: "#6b7280" }}>
                    {[c.organization, c.date].filter(Boolean).join(" · ")}
                    {c.credentialUrl && (
                      <>
                        {" · "}
                        <ExtLink href={c.credentialUrl} color={accent} links={links}>
                          verify
                        </ExtLink>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </section>
          )}

          {show(resume, "languages") && (
            <section className="avoid-break">
              <H>Languages</H>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {resume.languages.map((l) => (
                  <span key={l.id} style={{ fontSize: "0.9em" }}>
                    <strong style={{ color: "#111827" }}>{l.name}</strong>
                    {l.proficiency && <span style={{ color: "#6b7280" }}> — {l.proficiency}</span>}
                  </span>
                ))}
              </div>
            </section>
          )}

          {show(resume, "socialLinks") && (
            <section className="avoid-break">
              <H>Links</H>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: "0.9em" }}>
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