import { Bullets, ExtLink, Placeholder, contactItems, dateRange, show, type TemplateProps } from "./shared";
import { ensureHttp, prettyUrl } from "@/lib/resume-types";

/** Timeline – single-column layout with a vertical accent timeline for experience and education. */
export default function TimelineTemplate({ resume, accent, fontSize, links = true }: TemplateProps) {
  const p = resume.personalInfo;
  const contacts = contactItems(resume);

  const H = ({ children }: { children: React.ReactNode }) => (
    <h2
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        fontSize: "0.8em",
        fontWeight: 800,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "#0f172a",
        margin: "1.45em 0 0.65em",
      }}
    >
      <span style={{ width: 20, height: 3, borderRadius: 999, background: accent, flexShrink: 0 }} />
      {children}
    </h2>
  );

  const DatePill = ({ children }: { children?: string }) =>
    children ? (
      <span
        style={{
          fontSize: "0.8em",
          fontWeight: 600,
          color: "#6b7280",
          background: "#f3f4f6",
          border: "1px solid #e5e7eb",
          borderRadius: 999,
          padding: "2px 9px",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </span>
    ) : null;

  const TimelineItem = ({ last, children }: { last?: boolean; children: React.ReactNode }) => (
    <div
      className="avoid-break"
      style={{ display: "grid", gridTemplateColumns: "14px minmax(0, 1fr)", gap: 12, paddingBottom: last ? 2 : 16, position: "relative" }}
    >
      <div style={{ position: "relative" }}>
        <span
          style={{
            position: "absolute",
            left: 2.5,
            top: 4,
            width: 9,
            height: 9,
            borderRadius: 999,
            border: `2px solid ${accent}`,
            background: "#fff",
            zIndex: 1,
          }}
        />
        {!last && <span style={{ position: "absolute", left: 6.5, top: 15, bottom: -14, width: 1, background: "#e2e8f0" }} />}
      </div>
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );

  return (
    <div className="resume-paper" style={{ fontSize, fontFamily: "Inter, system-ui, sans-serif", color: "#1f2937" }}>
      <div style={{ height: 7, background: accent }} />

      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", gap: 20, padding: "30px 40px 18px", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: "2.2em", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.05, color: "#0f172a" }}>
            {p.fullName || "Your Name"}
          </h1>
          {p.title && <p style={{ margin: "6px 0 0", fontSize: "1em", fontWeight: 600, color: accent }}>{p.title}</p>}
          {contacts.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 15px", marginTop: 12, fontSize: "0.84em", color: "#4b5563" }}>
              {contacts.map((c, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, minWidth: 0 }}>
                  <span style={{ color: accent, display: "inline-flex", flexShrink: 0 }}>{c.icon}</span>
                  {c.href ? (
                    links ? (
                      <a href={c.href} target="_blank" rel="noreferrer" style={{ color: "#4b5563" }}>
                        {c.text}
                      </a>
                    ) : (
                      <span>{c.text}</span>
                    )
                  ) : (
                    <span>{c.text}</span>
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
            style={{ width: 86, height: 86, borderRadius: 20, objectFit: "cover", flexShrink: 0 }}
          />
        )}
      </header>

      <div style={{ padding: "4px 40px 40px" }}>
        <Placeholder name={p.fullName} />

        {show(resume, "summary") && (
          <section className="avoid-break">
            <H>Profile</H>
            <p style={{ margin: 0, lineHeight: 1.6, color: "#374151" }}>{resume.summary}</p>
          </section>
        )}

        {show(resume, "experience") && (
          <section>
            <H>Experience</H>
            {resume.experience.map((e, i) => (
              <TimelineItem key={e.id} last={i === resume.experience.length - 1}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
                  <strong style={{ fontSize: "1.02em", color: "#0f172a" }}>{e.jobTitle}</strong>
                  <DatePill>{dateRange(e.startDate, e.endDate, e.current)}</DatePill>
                </div>
                <div style={{ fontSize: "0.94em", marginTop: 2 }}>
                  <span style={{ color: accent, fontWeight: 600 }}>{e.company}</span>
                  {e.location && <span style={{ color: "#9ca3af" }}> · {e.location}</span>}
                </div>
                <div style={{ color: "#374151", lineHeight: 1.5, marginTop: 3 }}>
                  <Bullets text={e.description} />
                </div>
              </TimelineItem>
            ))}
          </section>
        )}

        {show(resume, "education") && (
          <section>
            <H>Education</H>
            {resume.education.map((e, i) => (
              <TimelineItem key={e.id} last={i === resume.education.length - 1}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
                  <strong style={{ color: "#0f172a" }}>{e.degree}</strong>
                  <DatePill>{dateRange(e.startYear, e.endYear)}</DatePill>
                </div>
                <div style={{ fontSize: "0.94em", marginTop: 2 }}>
                  <span style={{ color: accent, fontWeight: 600 }}>{e.institution}</span>
                  {e.location && <span style={{ color: "#9ca3af" }}> · {e.location}</span>}
                  {e.grade && <span style={{ color: "#4b5563" }}> · {e.grade}</span>}
                </div>
                {e.description && <p style={{ margin: "3px 0 0", fontSize: "0.93em", color: "#4b5563", lineHeight: 1.5 }}>{e.description}</p>}
              </TimelineItem>
            ))}
          </section>
        )}

        {show(resume, "projects") && (
          <section>
            <H>Projects</H>
            {resume.projects.map((pr) => (
              <div
                key={pr.id}
                className="avoid-break"
                style={{ borderLeft: `3px solid ${accent}`, background: "#f8fafc", borderRadius: "0 8px 8px 0", padding: "9px 12px", marginBottom: 10 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
                  <strong style={{ color: "#0f172a" }}>{pr.name}</strong>
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
                {pr.description && <p style={{ margin: "3px 0 5px", color: "#374151", lineHeight: 1.5 }}>{pr.description}</p>}
                {pr.technologies.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {pr.technologies.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: "0.75em",
                          fontWeight: 600,
                          color: accent,
                          background: `${accent}12`,
                          border: `1px solid ${accent}33`,
                          borderRadius: 999,
                          padding: "2px 8px",
                        }}
                      >
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "5px 18px" }}>
              {resume.skills.map((s) => (
                <span key={s} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "0.94em" }}>
                  <span style={{ width: 5, height: 5, borderRadius: 999, background: accent, flexShrink: 0 }} />
                  <span style={{ minWidth: 0 }}>{s}</span>
                </span>
              ))}
            </div>
          </section>
        )}

        {show(resume, "certifications") && (
          <section className="avoid-break">
            <H>Certifications</H>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "8px 20px" }}>
              {resume.certifications.map((c) => (
                <div key={c.id}>
                  <strong style={{ color: "#0f172a", fontSize: "0.95em" }}>{c.name}</strong>
                  <div style={{ fontSize: "0.86em", color: "#6b7280" }}>
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
            </div>
          </section>
        )}

        {show(resume, "achievements") && (
          <section className="avoid-break">
            <H>Achievements</H>
            <ul className="bullets" style={{ color: "#374151" }}>
              {resume.achievements.map((a) => (
                <li key={a.id} style={{ marginBottom: 3 }}>
                  <strong style={{ color: "#0f172a" }}>{a.title}</strong>
                  {a.description && <span> — {a.description}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: show(resume, "languages") && show(resume, "socialLinks") ? "1fr 1fr" : "1fr",
            gap: "0 28px",
          }}
        >
          {show(resume, "languages") && (
            <section className="avoid-break">
              <H>Languages</H>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 16px", fontSize: "0.94em" }}>
                {resume.languages.map((l) => (
                  <span key={l.id}>
                    <strong style={{ color: "#0f172a" }}>{l.name}</strong>
                    {l.proficiency && <span style={{ color: "#6b7280" }}> — {l.proficiency}</span>}
                  </span>
                ))}
              </div>
            </section>
          )}

          {show(resume, "socialLinks") && (
            <section className="avoid-break">
              <H>Links</H>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: "0.92em" }}>
                {resume.socialLinks
                  .filter((s) => s.url)
                  .map((s) =>
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
