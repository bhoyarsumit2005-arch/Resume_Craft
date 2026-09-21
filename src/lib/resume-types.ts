export type TemplateId = "modern" | "classic" | "minimal" | "executive" | "creative";
export type AccentColor = "blue" | "indigo" | "green" | "black" | "purple";
export type FontSize = "small" | "medium" | "large";

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
    description: "Clean header with accent color, professional typography and a two-column skills area.",
    tags: ["Accent color", "Two-column skills", "Popular"],
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional black & white structure. Minimal styling and fully ATS-friendly.",
    tags: ["ATS-friendly", "Traditional", "Black & white"],
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Generous whitespace, modern typography and simple section separators.",
    tags: ["Whitespace", "Modern type", "Elegant"],
  },
  {
    id: "executive",
    name: "Executive",
    description: "Strong two-column layout with a dark sidebar for contact, skills and certifications.",
    tags: ["Dark sidebar", "Professional", "Two-column"],
  },
  {
    id: "creative",
    name: "Creative",
    description: "Bold accent header with monogram and a colourful rail — great for standing out.",
    tags: ["Stand-out", "Bold", "Colourful"],
  },
];

export const ACCENT_COLORS: { id: AccentColor; label: string; hex: string }[] = [
  { id: "blue", label: "Blue", hex: "#2563eb" },
  { id: "indigo", label: "Indigo", hex: "#4f46e5" },
  { id: "green", label: "Green", hex: "#059669" },
  { id: "black", label: "Black", hex: "#111827" },
  { id: "purple", label: "Purple", hex: "#7c3aed" },
];

export const FONT_SIZES: { id: FontSize; label: string; px: number }[] = [
  { id: "small", label: "S", px: 12 },
  { id: "medium", label: "M", px: 13.5 },
  { id: "large", label: "L", px: 15 },
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

export function createSampleResume(): ResumeData {
  return createEmptyResume({
    title: "Sumit Bhoyar – Full Stack Resume",
    template: "modern",
    accentColor: "indigo",
    personalInfo: {
      fullName: "Sumit Bhoyar",
      title: "B.Tech Computer Science Student | Full Stack Developer",
      email: "sumit.bhoyar@example.com",
      phone: "+91 98765 43210",
      location: "Nagpur, Maharashtra, India",
      linkedin: "https://linkedin.com/in/sumitbhoyar",
      github: "https://github.com/sumitbhoyar",
      portfolio: "https://sumitbhoyar.dev",
      photo: "",
    },
    summary:
      "Motivated B.Tech Computer Science student with hands-on experience building full stack web applications using the MERN stack. Passionate about clean UI, scalable APIs, and solving real-world problems through technology. Seeking a software development internship to contribute to impactful products while continuing to grow as an engineer.",
    education: [
      {
        id: uid(),
        degree: "B.Tech in Computer Science & Engineering",
        institution: "G H Raisoni College of Engineering",
        location: "Nagpur, India",
        startYear: "2022",
        endYear: "2026",
        grade: "CGPA 8.6 / 10",
        description: "Relevant coursework: Data Structures, DBMS, Operating Systems, Web Technologies, Machine Learning.",
      },
      {
        id: uid(),
        degree: "Higher Secondary (Science)",
        institution: "Dinanath Junior College",
        location: "Nagpur, India",
        startYear: "2020",
        endYear: "2022",
        grade: "88%",
        description: "",
      },
    ],
    experience: [
      {
        id: uid(),
        jobTitle: "Full Stack Developer Intern",
        company: "TechNova Solutions",
        location: "Remote",
        startDate: "Jun 2025",
        endDate: "",
        current: true,
        description:
          "Developed responsive React dashboards used by 500+ daily users.\nBuilt REST APIs with Node.js and Express, reducing response times by 30%.\nCollaborated with a 5-member agile team using Git and Jira.",
      },
    ],
    projects: [
      {
        id: uid(),
        name: "Lost & Found Web Application",
        description:
          "A campus-wide platform to report and recover lost items with image uploads, category filters, and email notifications.",
        technologies: ["React", "Node.js", "Express", "MongoDB", "Cloudinary"],
        githubUrl: "https://github.com/sumitbhoyar/lost-and-found",
        liveUrl: "",
      },
      {
        id: uid(),
        name: "ResumeCraft",
        description:
          "Smart resume builder with live preview, multiple templates, JWT authentication, and one-click PDF export.",
        technologies: ["React", "Node.js", "JWT", "jsPDF"],
        githubUrl: "https://github.com/sumitbhoyar/resumecraft",
        liveUrl: "https://resumecraft.app",
      },
      {
        id: uid(),
        name: "KisaanMitra AI",
        description:
          "AI-powered assistant for farmers offering crop recommendations, weather insights, and market price tracking in regional languages.",
        technologies: ["Python", "Flask", "React", "OpenWeather API"],
        githubUrl: "https://github.com/sumitbhoyar/kisaanmitra-ai",
        liveUrl: "",
      },
    ],
    skills: ["JavaScript", "React.js", "Node.js", "Express.js", "MongoDB", "Java", "Python", "Git & GitHub", "REST APIs", "SQL"],
    certifications: [
      {
        id: uid(),
        name: "Full Stack Web Development",
        organization: "Coursera – Meta",
        date: "Mar 2025",
        credentialUrl: "https://coursera.org/verify/example",
      },
      {
        id: uid(),
        name: "Java Programming Masterclass",
        organization: "Udemy",
        date: "Nov 2024",
        credentialUrl: "",
      },
    ],
    achievements: [
      { id: uid(), title: "Winner – Smart India Hackathon 2024 (College Level)", description: "Led a team of 6 to build a civic-issue reporting app." },
      { id: uid(), title: "Top 5% – CodeChef Starters", description: "Consistently ranked in the top 5% across 10+ contests." },
      { id: uid(), title: "Technical Head – Coding Club", description: "Organised 8 workshops on web development for 300+ students." },
    ],
    languages: [
      { id: uid(), name: "English", proficiency: "Professional" },
      { id: uid(), name: "Hindi", proficiency: "Fluent" },
      { id: uid(), name: "Marathi", proficiency: "Native" },
    ],
    socialLinks: [
      { id: uid(), label: "LeetCode", url: "https://leetcode.com/sumitbhoyar" },
    ],
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
