# ResumeCraft — Smart Resume Builder

> **Build Your Resume. Showcase Your Skills. Get Career Ready.**

ResumeCraft is a full-stack, production-style resume builder built as a college mini-project. Users register, create multiple resumes, edit them in a two-column editor with an instant **live A4 preview**, switch between **five professional templates**, customise accent colour / font size, and export a **multi-page A4 PDF** (or print) — all backed by a secure JWT-authenticated REST API (Express) and a MongoDB Atlas database (Mongoose).

---

## ✨ Features

| Area | Details |
| --- | --- |
| **Authentication** | Register / Login / Logout, bcrypt password hashing, JWT (httpOnly cookie + Bearer), protected pages & APIs |
| **Dashboard** | Welcome header, live stats (total resumes, last updated, templates used), resume cards with real thumbnails, empty state |
| **Resume CRUD** | Create, read, update, delete, **duplicate**, rename — every resume is owned by exactly one user |
| **Editor** | Personal info (+ photo), summary (with rule-based **Improve Summary**), education, experience, projects (tech tags), skills (add / remove / reorder), certifications, achievements, languages, social links |
| **Section controls** | Collapsible sections, hide/show any section, empty sections never render in the resume |
| **Live preview** | Auto-scaled A4 page that updates on every keystroke |
| **Templates** | Modern (accent header, two-column skills), Classic (ATS-friendly, B&W, serif), Minimal (whitespace, label-column layout), Executive (dark sidebar, two-column), Creative (bold accent header + colour rail) — same data, switch anytime |
| **Customisation** | 5 accent colours (Blue, Indigo, Green, Black, Purple) and 3 font sizes |
| **PDF export** | html2canvas-pro + jsPDF, A4, smart page breaks that avoid cutting entries, no UI controls in output; **Print Resume** fallback |
| **Auto-save** | Debounced auto-save with "Saved / Saving… / Unsaved changes" indicator + explicit Save button |
| **Profile** | Update name, change password, logout |
| **Demo mode** | `/demo` — try the full editor without an account (stored in the browser only) |
| **UX polish** | Toast notifications, loading states, error states, empty states, 404 page, responsive (desktop / tablet / mobile), keyboard-friendly, semantic HTML |

---

## 🛠 Tech Stack

A modern **MERN-style** split: a Vite + React SPA talking to a standalone Express REST API, with MongoDB Atlas as the database.

**Frontend**

- Vite 7 + React 19 + TypeScript (SPA, react-router 7)
- Context API (`AuthContext`, `ToastContext`)
- Tailwind CSS v4 + CSS variables for theming
- lucide-react icons
- html2canvas-pro + jsPDF for PDF export

**Backend**

- Express 5 + TypeScript (run with `tsx`), serving `/api/*` plus the built SPA in production
- MongoDB Atlas + Mongoose 9 (resumes stored as JSON documents, timestamps on every document)
- jsonwebtoken, bcryptjs, cookie-parser
- Central error handling (`ApiError`), input sanitisation/validation, proper HTTP status codes

---

## 📁 Folder Structure

```
├── server/                  # Express API (TypeScript)
│   ├── index.ts             # App, routes, static SPA serving, error handling
│   ├── auth.ts              # JWT sign / verify, requireAuth middleware
│   ├── db.ts                # Mongoose connection
│   ├── schema.ts            # users + resumes Mongoose schemas
│   └── resume-validation.ts # Resume sanitisation / validation
├── src/
│   ├── main.tsx, App.tsx    # Entry + router (react-router 7)
│   ├── pages/               # Home, Login, Register, Dashboard, NewResume,
│   │                        # EditResume, PreviewResume, Templates, Profile, Demo, NotFound
│   ├── components/
│   │   ├── common/          # Button, Input, Modal, DeleteConfirmationModal, LoadingSpinner, BrandIcons
│   │   ├── auth/            # ProtectedRoute, AuthLayout, PasswordInput
│   │   ├── dashboard/       # ResumeCard
│   │   ├── layout/          # Navbar, Footer
│   │   └── resume/          # ResumeEditor, ResumeForm, ResumePreview, ResumeThumbnail, PDFButton,
│   │                        # TemplateSelector, TemplateCard, SectionCard, PersonalInfoForm, SummaryForm,
│   │                        # EducationForm, ExperienceForm, ProjectForm, SkillsForm, CertificationForm,
│   │                        # AchievementForm, LanguageForm, SocialLinksForm, ResumeNotFound
│   ├── templates/           # Modern, Classic, Minimal, Executive, Creative, shared
│   ├── context/             # AuthContext, ToastContext
│   ├── services/            # api.ts, authService.ts, resumeService.ts
│   ├── hooks/               # useResume.ts
│   ├── utils/               # pdf.ts (A4 export + page breaks), summary.ts (Improve Summary)
│   └── lib/                 # resume-types.ts (types, defaults, sample data)
├── dist/                    # Built SPA (served by Express in production)
└── vite.config.ts           # Vite :5173, /api proxy → :3001
```

---

## 🚀 Installation & Running

Requirements: Node.js 18+ and a MongoDB Atlas cluster (or any MongoDB URI).

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env        # edit MONGODB_URI and JWT_SECRET

# 3. Run in development (web + API together)
npm run dev                 # web at http://localhost:5173, API at http://localhost:3001
```

`npm run dev` starts both processes with `concurrently` — the Vite dev server proxies `/api` requests to the Express server on port 3001, so there is **no** database setup or migration step (Atlas is already hosted).

```bash
# Production (Express serves the built SPA itself)
npm run build               # output → dist/
npm start                   # http://localhost:3001

# Checks
npm run lint                # ESLint
npm run typecheck           # tsc --noEmit
```

---

## 🔐 Environment Variables

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string (Mongoose) |
| `PORT` | Port for the Express API (default `3001`) |
| `JWT_SECRET` | Secret used to sign JWTs (use a long random string) |
| `STRICT_JWT_SECRET` | Optional. `true` → refuse to start in production without `JWT_SECRET` |

Secrets are only ever read on the server (`process.env` via `dotenv`) and are never shipped to the browser.

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | — | Create account (name, email, password ≥ 6) |
| POST | `/api/auth/login` | — | Login, returns user + JWT (also sets httpOnly cookie) |
| GET | `/api/auth/me` | ✅ | Current user |
| POST | `/api/auth/logout` | ✅ | Clear session cookie |
| GET | `/api/resumes` | ✅ | List the user's resumes |
| POST | `/api/resumes` | ✅ | Create resume |
| GET | `/api/resumes/:id` | ✅ | Get one resume (404 if not owned) |
| PUT | `/api/resumes/:id` | ✅ | Update resume |
| DELETE | `/api/resumes/:id` | ✅ | Delete resume |
| POST | `/api/resumes/:id/duplicate` | ✅ | Duplicate resume |
| GET | `/api/profile` | ✅ | Get profile |
| PUT | `/api/profile` | ✅ | Update name / change password |
| GET | `/api/health` | — | Health check |

Status codes: `400` validation, `401` unauthenticated, `404` not found / not owned, `500` unexpected (no stack traces exposed).

---

## 🗄 Database Models

**users** — `_id`, `name`, `email` (unique), `password` (bcrypt hash), `createdAt`, `updatedAt`

**resumes** — `_id`, `userId` (ref → users), `title`, `template`, `accentColor`, `fontSize`, `personalInfo`, `summary`, `education[]`, `experience[]`, `projects[]`, `skills[]`, `certifications[]`, `achievements[]`, `languages[]`, `socialLinks[]`, `hiddenSections[]`, `createdAt`, `updatedAt`

Resumes are stored as JSON documents (mirroring the editor's data shape), and every query checks `userId` so users can only ever access their own data.

---

## 📸 Screenshots

_Add screenshots of the landing page, dashboard, editor with live preview, and the exported PDF here._

---

## ✅ Test Checklist (verified)

- Auth: register, duplicate email rejected, login, invalid credentials → 401, protected routes → 401, logout
- Resume: create, list, read, update, rename, duplicate, delete; cross-user access → 404
- Editor: all sections, hide/show, template & accent switching without data loss, live preview
- PDF: A4 pages, smart page breaks, no UI controls, print fallback
- Security: bcrypt hashes in DB, JWT, ownership checks, input sanitisation

---

## 🔮 Future Enhancements

- Real AI-powered summary & bullet suggestions
- Drag-and-drop section ordering
- Public shareable resume links
- Cover letter builder
- More templates & colour themes
- Import from LinkedIn / JSON Resume

---

## 👤 Author

**Khushal Paunkar** — B.Tech Computer Science Student | Full Stack Developer

Built with ❤️ as a college mini-project.