/**
 * Local, rule-based summary improver (no external AI required).
 * Strengthens weak phrasing, capitalises sentences, and fills in details from the resume.
 */
export function improveSummary(summary: string, ctx: { title?: string; skills: string[]; projects: number }): string {
  let text = summary.trim();
  const replacements: [RegExp, string][] = [
    [/\bi am\b/gi, "I am"],
    [/\bi'm\b/gi, "I am"],
    [/\bgood at\b/gi, "proficient in"],
    [/\bknow(s)? about\b/gi, "experienced with"],
    [/\bworked on\b/gi, "developed"],
    [/\bmade\b/gi, "built"],
    [/\bdid\b/gi, "delivered"],
    [/\bhelped\b/gi, "contributed to"],
    [/\bvery\s+/gi, ""],
    [/\ba lot of\b/gi, "extensive"],
    [/\bwant to\b/gi, "seeking to"],
    [/\blooking for\b/gi, "seeking"],
    [/\bhard[- ]working\b/gi, "results-driven"],
    [/\bpassionate about\b/gi, "eager to contribute to"],
  ];
  for (const [re, rep] of replacements) text = text.replace(re, rep);

  // Capitalise sentence starts and ensure punctuation.
  text = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .map((s) => (/[.!?]$/.test(s) ? s : `${s}.`))
    .join(" ");

  if (!text) {
    const role = ctx.title || "aspiring software developer";
    const skillText = ctx.skills.length ? ` with hands-on experience in ${ctx.skills.slice(0, 4).join(", ")}` : "";
    text = `Motivated ${role}${skillText}. Passionate about building clean, scalable, user-focused applications and continuously learning new technologies. Seeking an opportunity to contribute to impactful projects and grow as an engineer.`;
  } else {
    const lower = text.toLowerCase();
    if (ctx.skills.length && !ctx.skills.some((s) => lower.includes(s.toLowerCase()))) {
      text += ` Skilled in ${ctx.skills.slice(0, 4).join(", ")}.`;
    }
    if (ctx.projects > 0 && !/project/i.test(text)) {
      text += ` Built ${ctx.projects} hands-on project${ctx.projects > 1 ? "s" : ""} demonstrating practical problem-solving ability.`;
    }
    if (!/(seeking|looking|aim|goal|opportunit)/i.test(text)) {
      text += " Seeking an opportunity to apply these skills to real-world challenges and grow professionally.";
    }
  }
  return text;
}
