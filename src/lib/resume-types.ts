export type TemplateId = "modern" | "classic" | "minimal" | "executive" | "creative" | "timeline";
export type AccentColor = "blue" | "indigo" | "green" | "black" | "purple";
export type FontSize = "small" | "medium" | "large";
export type FontFamily = "arial" | "calibri" | "helvetica" | "georgia" | "times" | "verdana";

export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  photo: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startYear: string;
  endYear: string;
  grade: string;
  description: string;
}

export interface Experience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  liveUrl: string;
}

export interface Certification {
  id: string;
  name: string;
  organization: string;
  date: string;
  credentialUrl: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: string;
}

export interface SocialLink {
  id: string;
  label: string;
  url: string;
}

export type SectionKey =
  | "summary"
  | "education"
  | "experience"
  | "projects"
  | "skills"
  | "certifications"
  | "achievements"
  | "languages"
  | "socialLinks";

export interface ResumeData {
  title: string;
  template: TemplateId;
  accentColor: AccentColor;
  fontSize: FontSize;
  fontFamily: FontFamily;
  personalInfo: PersonalInfo;
  summary: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: string[];
  certifications: Certification[];
  achievements: Achievement[];
  languages: Language[];
  socialLinks: SocialLink[];
  hiddenSections: SectionKey[];
}

export interface Resume extends ResumeData {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export const TEMPLATES: { id: TemplateId; name: string; description: string; tags: string[] }[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean single-column ATS layout with a strong accent header and standard section headings.",
    tags: ["ATS-friendly", "Single column", "Popular"],
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional black-and-white ATS format with a centered header and clear section rules.",
    tags: ["ATS-friendly", "Single column", "Traditional"],
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Airy single-column ATS layout with quiet headings and generous whitespace.",
    tags: ["ATS-friendly", "Single column", "Elegant"],
  },
  {
    id: "executive",
    name: "Executive",
    description: "Compact single-column ATS layout with strong serif typography and clear date lines.",
    tags: ["ATS-friendly", "Single column", "Professional"],
  },
  {
    id: "creative",
    name: "Creative",
    description: "Expressive typography inside a safe single-column ATS structure — no graphics or sidebars.",
    tags: ["ATS-friendly", "Single column", "Stand-out"],
  },
  {
    id: "timeline",
    name: "Timeline",
    description: "Date-led single-column ATS layout that keeps your career story easy to scan.",
    tags: ["ATS-friendly", "Single column", "Recruiter-friendly"],
  },
];

export const ACCENT_COLORS: { id: AccentColor; label: string; hex: string }[] = [
  { id: "blue", label: "Sky Blue", hex: "#2baccb" },
  { id: "indigo", label: "Cerulean Blue", hex: "#007ba7" },
  { id: "green", label: "Green", hex: "#059669" },
  { id: "black", label: "Jet Black", hex: "#0a0a0a" },
  { id: "purple", label: "Neon Rose", hex: "#ff4f9a" },
];

export const FONT_SIZES: { id: FontSize; label: string; px: number }[] = [
  { id: "small", label: "S", px: 12 },
  { id: "medium", label: "M", px: 13.5 },
  { id: "large", label: "L", px: 15 },
];

/**
 * ATS-safe font families. Every option is a standard system font that
 * applicant tracking systems can parse reliably; no web fonts are loaded.
 */
export const FONT_FAMILIES: { id: FontFamily; label: string; stack: string; kind: "sans" | "serif" }[] = [
  { id: "arial", label: "Arial", stack: "Arial, Helvetica, sans-serif", kind: "sans" },
  { id: "calibri", label: "Calibri", stack: "Calibri, 'Segoe UI', Arial, sans-serif", kind: "sans" },
  { id: "helvetica", label: "Helvetica", stack: "Helvetica, Arial, sans-serif", kind: "sans" },
  { id: "verdana", label: "Verdana", stack: "Verdana, Geneva, Arial, sans-serif", kind: "sans" },
  { id: "georgia", label: "Georgia", stack: "Georgia, 'Times New Roman', serif", kind: "serif" },
  { id: "times", label: "Times New Roman", stack: "'Times New Roman', Times, Georgia, serif", kind: "serif" },
];

export const OPTIONAL_SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "summary", label: "Summary" },
  { key: "education", label: "Education" },
  { key: "experience", label: "Experience" },
  { key: "projects", label: "Projects" },
  { key: "skills", label: "Skills" },
  { key: "certifications", label: "Certifications" },
  { key: "achievements", label: "Achievements" },
  { key: "languages", label: "Languages" },
  { key: "socialLinks", label: "Social Links" },
];

export function accentHex(color: AccentColor | string): string {
  return ACCENT_COLORS.find((c) => c.id === color)?.hex ?? ACCENT_COLORS[0].hex;
}

export function fontSizePx(size: FontSize | string): number {
  return FONT_SIZES.find((f) => f.id === size)?.px ?? 13.5;
}

/** CSS font stack for the selected ATS-safe family (falls back to Arial). */
export function fontFamilyStack(family: FontFamily | string | undefined): string {
  return FONT_FAMILIES.find((f) => f.id === family)?.stack ?? FONT_FAMILIES[0].stack;
}

/** Whether the selected family is serif — used to pick a matching PDF font. */
export function fontFamilyKind(family: FontFamily | string | undefined): "sans" | "serif" {
  return FONT_FAMILIES.find((f) => f.id === family)?.kind ?? "sans";
}

export function templateName(id: string): string {
  return TEMPLATES.find((t) => t.id === id)?.name ?? "Modern";
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function emptyPersonalInfo(): PersonalInfo {
  return {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
    photo: "",
  };
}

export function createEmptyResume(overrides: Partial<ResumeData> = {}): ResumeData {
  return {
    title: "Untitled Resume",
    template: "modern",
    accentColor: "blue",
    fontSize: "medium",
    fontFamily: "arial",
    personalInfo: emptyPersonalInfo(),
    summary: "",
    education: [],
    experience: [],
    projects: [],
    skills: [],
    certifications: [],
    achievements: [],
    languages: [],
    socialLinks: [],
    hiddenSections: [],
    ...overrides,
  };
}

export const SAMPLE_RESUME_PDF = "/files/Sumit-Bhoyar-Resume.pdf";

/**
 * Demo resume data — mirrors Sumit Bhoyar's actual resume so the live preview
 * on /demo renders the real content, not placeholder text.
 */
export function createSampleResume(): ResumeData {
  return createEmptyResume({
    title: "Sumit Bhoyar – Full Stack Resume",
    template: "modern",
    accentColor: "indigo",
    personalInfo: {
      fullName: "Sumit Bhoyar",
      title: "B.Tech AI Engineering Student | Full Stack Developer",
      email: "bhoyarsumit2005@gmail.com",
      phone: "+91 8788831152",
      location: "Nagpur, Maharashtra, India",
      linkedin: "https://www.linkedin.com/in/sumit-bhoyar-ai-engineer",
      github: "https://github.com/bhoyarsumit2005-arch",
      portfolio: "",
      photo: "",
    },
    summary:
      "To obtain an internship or entry-level opportunity where I can apply my programming and web development skills, gain practical experience, and contribute to the growth of the organization while continuously improving my technical knowledge. Skilled in JavaScript, React.js, Node.js, Express.js. Built multiple hands-on projects demonstrating practical problem-solving ability.",
    education: [
      {
        id: uid(),
        degree: "B.Tech in Artificial Intelligence",
        institution: "G H Raisoni College of Engineering & Management",
        location: "Nagpur, India",
        startYear: "2024",
        endYear: "2028",
        grade: "CGPA 8.15 / 10",
        description: "",
      },
      {
        id: uid(),
        degree: "Higher Secondary (Science)",
        institution: "SPM High School & Jr. College, Wani",
        location: "",
        startYear: "2022",
        endYear: "2023",
        grade: "60.17%",
        description: "Maharashtra State Board",
      },
    ],
    experience: [],
    projects: [
      {
        id: uid(),
        name: "ResumeCraft",
        description:
          "Smart resume builder with live preview, multiple templates, JWT authentication, and one-click PDF export.",
        technologies: ["React", "Node.js", "JWT", "jsPDF", "TypeScript"],
        githubUrl: "https://github.com/bhoyarsumit2005-arch/Resume_Craft",
        liveUrl: "",
      },
      {
        id: uid(),
        name: "Sigma_GPT",
        description:
          "Developed SigmaGPT, an AI-powered chat application using React.js, Node.js, Express.js, MongoDB, and the Groq API to generate AI responses. Implemented JWT-based authentication, secure user sessions, and user-specific chat history with backend access control.",
        technologies: ["React", "Vite", "Node.js", "Express.js", "MongoDB", "Groq API", "JWT Authentication"],
        githubUrl: "https://github.com/bhoyarsumit2005-arch/Sigma_GPT",
        liveUrl: "",
      },
    ],
    skills: ["JavaScript", "React.js", "Node.js", "Express.js", "MongoDB", "Java", "Python", "Git & GitHub", "REST APIs", "SQL"],
    certifications: [
      {
        id: uid(),
        name: "Full Stack Web Development",
        organization: "Apna College",
        date: "",
        credentialUrl: "",
      },
      {
        id: uid(),
        name: "Data Science",
        organization: "Code with Harry",
        date: "",
        credentialUrl: "",
      },
    ],
    achievements: [],
    languages: [
      { id: uid(), name: "English", proficiency: "Professional" },
      { id: uid(), name: "Hindi", proficiency: "Fluent" },
      { id: uid(), name: "Marathi", proficiency: "Native" },
    ],
    socialLinks: [],
  });
}

/** Returns true if a section has content and is not hidden. */
export function sectionVisible(resume: ResumeData, key: SectionKey): boolean {
  if (resume.hiddenSections?.includes(key)) return false;
  switch (key) {
    case "summary":
      return resume.summary.trim().length > 0;
    case "skills":
      return resume.skills.length > 0;
    case "education":
      return resume.education.some((e) => e.degree || e.institution);
    case "experience":
      return resume.experience.some((e) => e.jobTitle || e.company);
    case "projects":
      return resume.projects.some((p) => p.name);
    case "certifications":
      return resume.certifications.some((c) => c.name);
    case "achievements":
      return resume.achievements.some((a) => a.title);
    case "languages":
      return resume.languages.some((l) => l.name);
    case "socialLinks":
      return resume.socialLinks.some((s) => s.url);
  }
}

export function isValidUrl(value: string): boolean {
  if (!value) return true;
  try {
    const u = new URL(value.startsWith("http") ? value : `https://${value}`);
    return !!u.hostname && u.hostname.includes(".");
  } catch {
    return false;
  }
}

export function prettyUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

export function ensureHttp(url: string): string {
  if (!url) return "";
  return url.startsWith("http") ? url : `https://${url}`;
}

export function formatDate(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function timeAgo(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr${h > 1 ? "s" : ""} ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return formatDate(d);
}
