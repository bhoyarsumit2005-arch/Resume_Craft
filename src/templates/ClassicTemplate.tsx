import { Bullets, Placeholder, contactItems, dateRange, show, type TemplateProps } from "./shared";
import { ensureHttp, prettyUrl } from "@/lib/resume-types";

/** Classic – traditional, black & white, ATS-friendly. Accent is used only for subtle rules. */
export default function ClassicTemplate({ resume, fontSize, links = true }: TemplateProps) {
  const p = resume.personalInfo;
  const contacts = contactItems(resume);
  const serif = "Georgia, 'Times New Roman', serif";

  const H = ({ children }: { children: React.ReactNode }) => (
    <h2
      style={{
        fontSize: "0.95em",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        borderBottom: "1px solid #111",
        paddingBottom: 3,
        margin: "1.2em 0 0.5em",
        fontFamily: serif,
      }}
    >
      {children}
    </h2>
  );

  const Row = ({ left, right }: { left: React.ReactNode; right?: string }) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      <span>{left}</span>
      {right && <span style={{ fontStyle: "italic", color: "#333" }}>{right}</span>}
    </div>
  );

  return (
    <div className="resume-paper" style={{ fontSize, fontFamily: serif, padding: "40px 44px", color: "#111" }}>
      <header style={{ textAlign: "center", borderBottom: "2px solid #111", paddingBottom: 12 }}>
        {p.photo && (
          <img
            src={p.photo}
            alt={p.fullName ? `${p.fullName} profile photo` : "Profile photo"}
            style={{ width: 76, height: 76, borderRadius: 6, objectFit: "cover", margin: "0 auto 10px", display: "block", filter: "grayscale(20%)" }}
          />
        )}
        <h1 style={{ fontSize: "2em", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>
          {p.fullName || "Your Name"}
        </h1>
        {p.title && <p style={{ margin: "4px 0 0", fontSize: "1.02em" }}>{p.title}</p>}
        {contacts.length > 0 && (
          <p style={{ margin: "8px 0 0", fontSize: "0.88em", color: "#333" }}>
            {contacts.map((c, i) => (
              <span key={i}>
                {i > 0 && <span style={{ margin: "0 6px" }}>|</span>}
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
          </p>
        )}
      </header>

      <Placeholder name={p.fullName} />

      {show(resume, "summary") && (
        <section className="avoid-break">
          <H>Summary</H>
          <p style={{ margin: 0, textAlign: "justify" }}>{resume.summary}</p>
        </section>
      )}

      {show(resume, "education") && (
        <section>
          <H>Education</H>
          {resume.education.map((e) => (
            <div key={e.id} className="avoid-break" style={{ marginBottom: "0.7em" }}>
              <Row left={<strong>{e.institution}</strong>} right={dateRange(e.startYear, e.endYear)} />
              <Row left={<em>{e.degree}{e.grade ? `, ${e.grade}` : ""}</em>} right={e.location} />
              {e.description && <p style={{ margin: "0.15em 0 0", fontSize: "0.95em" }}>{e.description}</p>}
            </div>
          ))}
        </section>
      )}

      {show(resume, "experience") && (
        <section>
          <H>Experience</H>
          {resume.experience.map((e) => (
            <div key={e.id} className="avoid-break" style={{ marginBottom: "0.8em" }}>
              <Row left={<strong>{e.jobTitle}</strong>} right={dateRange(e.startDate, e.endDate, e.current)} />
              <Row left={<em>{e.company}</em>} right={e.location} />
              <Bullets text={e.description} />
            </div>
          ))}
        </section>
      )}

      {show(resume, "projects") && (
        <section>
          <H>Projects</H>
          {resume.projects.map((pr) => (
            <div key={pr.id} className="avoid-break" style={{ marginBottom: "0.75em" }}>
              <Row
                left={
                  <>
                    <strong>{pr.name}</strong>
                    {pr.technologies.length > 0 && <span> | <em>{pr.technologies.join(", ")}</em></span>}
                  </>
                }
              />
              {pr.description && <p style={{ margin: "0.15em 0 0" }}>{pr.description}</p>}
              {(pr.githubUrl || pr.liveUrl) && (
                <p style={{ margin: "0.15em 0 0", fontSize: "0.9em" }}>
                  {pr.githubUrl && links && <>GitHub: <a href={ensureHttp(pr.githubUrl)} target="_blank" rel="noreferrer">{prettyUrl(pr.githubUrl)}</a></>}
                  {pr.githubUrl && !links && <>GitHub: {prettyUrl(pr.githubUrl)}</>}
                  {pr.githubUrl && pr.liveUrl && " | "}
                  {pr.liveUrl && links && <>Live: <a href={ensureHttp(pr.liveUrl)} target="_blank" rel="noreferrer">{prettyUrl(pr.liveUrl)}</a></>}
                  {pr.liveUrl && !links && <>Live: {prettyUrl(pr.liveUrl)}</>}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {show(resume, "skills") && (
        <section className="avoid-break">
          <H>Technical Skills</H>
          <p style={{ margin: 0 }}>{resume.skills.join("  •  ")}</p>
        </section>
      )}

      {show(resume, "certifications") && (
        <section className="avoid-break">
          <H>Certifications</H>
          {resume.certifications.map((c) => (
            <Row
              key={c.id}
              left={
                <>
                  <strong>{c.name}</strong>
                  {c.organization && <span> — {c.organization}</span>}
                  {c.credentialUrl && links && (
                    <span style={{ fontSize: "0.9em" }}> (<a href={ensureHttp(c.credentialUrl)} target="_blank" rel="noreferrer">credential</a>)</span>
                  )}
                  {c.credentialUrl && !links && (
                    <span style={{ fontSize: "0.9em" }}> (credential)</span>
                  )}
                </>
              }
              right={c.date}
            />
          ))}
        </section>
      )}

      {show(resume, "achievements") && (
        <section className="avoid-break">
          <H>Achievements</H>
          <ul className="bullets">
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
          <H>Languages</H>
          <p style={{ margin: 0 }}>
            {resume.languages.map((l) => `${l.name}${l.proficiency ? ` (${l.proficiency})` : ""}`).join("  •  ")}
          </p>
        </section>
      )}

      {show(resume, "socialLinks") && (
        <section className="avoid-break">
          <H>Links</H>
          {resume.socialLinks.filter((s) => s.url).map((s) => (
            <p key={s.id} style={{ margin: "0 0 2px" }}>
              {s.label ? `${s.label}: ` : ""}
              {links ? <a href={ensureHttp(s.url)} target="_blank" rel="noreferrer">{prettyUrl(s.url)}</a> : prettyUrl(s.url)}
            </p>
          ))}
        </section>
      )}
    </div>
  );
}
