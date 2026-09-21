import { Bullets, ExtLink, Placeholder, contactItems, dateRange, show, type TemplateProps } from "./shared";
import { ensureHttp, prettyUrl } from "@/lib/resume-types";

/** Executive – dark sidebar with contact/skills, strong two-column professional layout. */
export default function ExecutiveTemplate({ resume, accent, fontSize, links = true }: TemplateProps) {
  const p = resume.personalInfo;
  const contacts = contactItems(resume);

  const SidebarH = ({ children }: { children: React.ReactNode }) => (
    <h2
      style={{
        fontSize: "0.75em",
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: accent,
        borderBottom: "1px solid rgba(255,255,255,0.18)",
        paddingBottom: 4,
        margin: "1.4em 0 0.6em",
      }}
    >
      {children}
    </h2>
  );

  const MainH = ({ children }: { children: React.ReactNode }) => (
    <h2
      style={{
        fontSize: "0.82em",
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: accent,
        borderBottom: "1px solid #e2e8f0",
        paddingBottom: 4,
        margin: "1.2em 0 0.6em",
      }}
    >
      {children}
    </h2>
  );

  return (
    <div
      className="resume-paper"
      style={{ fontSize, fontFamily: "Inter, system-ui, sans-serif", display: "grid", gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.5fr)", color: "#1e293b" }}
    >
      {/* Sidebar */}
      <aside style={{ background: "#0f172a", color: "#cbd5e1", padding: "30px 24px" }}>
        {p.photo && (
          <img
            src={p.photo}
            alt={p.fullName ? `${p.fullName} profile photo` : "Profile photo"}
            style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: `3px solid ${accent}`, marginBottom: 18 }}
          />
        )}
        <h1 style={{ color: "#fff", fontSize: "1.9em", fontWeight: 800, lineHeight: 1.15, margin: 0 }}>{p.fullName || "Your Name"}</h1>
        {p.title && <p style={{ color: accent, fontWeight: 600, fontSize: "0.95em", margin: "6px 0 0" }}>{p.title}</p>}

        {contacts.length > 0 && (
          <>
            <SidebarH>Contact</SidebarH>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: "0.85em" }}>
              {contacts.map((c, i) => (
                <span key={i} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <span style={{ color: accent, display: "inline-flex", flexShrink: 0 }}>{c.icon}</span>
                  {c.href ? (
                    links ? (
                      <a href={c.href} target="_blank" rel="noreferrer" style={{ color: "#e2e8f0", wordBreak: "break-word" }}>
                        {c.text}
                      </a>
                    ) : (
                      <span style={{ color: "#e2e8f0", wordBreak: "break-word" }}>{c.text}</span>
                    )
                  ) : (
                    <span style={{ color: "#e2e8f0", wordBreak: "break-word" }}>{c.text}</span>
                  )}
                </span>
              ))}
            </div>
          </>
        )}

        {show(resume, "skills") && (
          <>
            <SidebarH>Skills</SidebarH>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {resume.skills.map((s) => (
                <span key={s} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.88em" }}>
                  <span style={{ width: 7, height: 7, borderRadius: 999, background: accent, flexShrink: 0 }} />
                  {s}
                </span>
              ))}
            </div>
          </>
        )}

        {show(resume, "languages") && (
          <>
            <SidebarH>Languages</SidebarH>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {resume.languages.map((l) => (
                <span key={l.id} style={{ fontSize: "0.88em" }}>
                  <span style={{ color: "#fff", fontWeight: 600 }}>{l.name}</span>
                  {l.proficiency && <span> — {l.proficiency}</span>}
                </span>
              ))}
            </div>
          </>
        )}

        {show(resume, "certifications") && (
          <>
            <SidebarH>Certifications</SidebarH>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {resume.certifications.map((c) => (
                <div key={c.id} style={{ fontSize: "0.85em" }}>
                  <strong style={{ color: "#fff", fontWeight: 600 }}>{c.name}</strong>
                  {c.organization && <div style={{ color: "#94a3b8" }}>{c.organization}</div>}
                  {c.date && <div style={{ color: "#94a3b8" }}>{c.date}</div>}
                  {c.credentialUrl && (
                    <div>
                      <ExtLink href={c.credentialUrl} color={accent} links={links}>
                        verify
                      </ExtLink>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </aside>

      {/* Main column */}
      <div style={{ padding: "30px 28px", minWidth: 0 }}>
        <Placeholder name={p.fullName} />

        {show(resume, "summary") && (
          <section className="avoid-break">
            <MainH>Profile</MainH>
            <p style={{ margin: 0, color: "#374151", lineHeight: 1.55 }}>{resume.summary}</p>
          </section>
        )}

        {show(resume, "experience") && (
          <section>
            <MainH>Experience</MainH>
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
            <MainH>Education</MainH>
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
            <MainH>Projects</MainH>
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
                      <span key={t} style={{ fontSize: "0.75em", padding: "2px 8px", borderRadius: 4, background: `${accent}14`, color: accent, fontWeight: 600 }}>
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
            <MainH>Achievements</MainH>
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

        {show(resume, "socialLinks") && (
          <section className="avoid-break">
            <MainH>Links</MainH>
            <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: "0.92em" }}>
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
  );
}