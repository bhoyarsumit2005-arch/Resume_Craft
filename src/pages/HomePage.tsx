import { Link } from "react-router";
import { ArrowRight, Eye, LayoutTemplate, FileDown, ShieldCheck, Files, PenLine, UserPlus, ClipboardList, Palette, Download, Sparkles, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ResumeThumbnail from "@/components/resume/ResumeThumbnail";
import TemplateCard, { sampleResume } from "@/components/resume/TemplateCard";
import { useAuth } from "@/context/AuthContext";
import { TEMPLATES } from "@/lib/resume-types";

const FEATURES = [
  { icon: <PenLine size={22} />, title: "Easy Resume Builder", text: "Guided, section-by-section forms with helpful placeholders — no design skills required." },
  { icon: <Eye size={22} />, title: "Live Preview", text: "See every keystroke reflected instantly on an A4 page. What you see is exactly what you download." },
  { icon: <LayoutTemplate size={22} />, title: "Professional Templates", text: "Modern, Classic and Minimal designs. Switch anytime — your content stays intact." },
  { icon: <FileDown size={22} />, title: "PDF Export", text: "One-click A4 PDF with smart page breaks, plus a print-ready view for quick sharing." },
  { icon: <ShieldCheck size={22} />, title: "Secure Storage", text: "JWT authentication and hashed passwords keep your account and resumes private." },
  { icon: <Files size={22} />, title: "Multiple Resumes", text: "Create tailored versions for each role, duplicate in a click and manage them from one dashboard." },
];

const STEPS = [
  { icon: <UserPlus size={20} />, title: "Create Account", text: "Sign up free in seconds with just your name and email." },
  { icon: <ClipboardList size={20} />, title: "Enter Your Details", text: "Fill in education, projects, skills, experience and more." },
  { icon: <Palette size={20} />, title: "Customize Your Resume", text: "Choose a template, accent color and font size that fits you." },
  { icon: <Download size={20} />, title: "Download & Share", text: "Export a polished A4 PDF and apply with confidence." },
];

export default function HomePage() {
  const { user } = useAuth();
  const primaryHref = user ? "/resumes/new" : "/register";

  return (
    <>
      <Navbar />
      <main id="home">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10" style={{ background: "radial-gradient(60% 60% at 80% 10%, #e0e7ff 0%, transparent 60%), radial-gradient(40% 40% at 10% 80%, #dbeafe 0%, transparent 60%)" }} />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
            <div className="fade-up">
              <span className="badge"><Sparkles size={12} /> Smart Resume Builder for Students</span>
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight" style={{ color: "var(--color-primary)" }}>
                Build a Resume That Gets You Noticed.
              </h1>
              <p className="mt-5 text-lg text-gray-600 max-w-xl">
                Create professional, ATS-friendly resumes in minutes with live preview, customizable templates, and easy PDF export.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={primaryHref} className="btn btn-primary btn-lg">
                  Create My Resume <ArrowRight size={18} />
                </Link>
                <Link to="/templates" className="btn btn-secondary btn-lg">
                  Explore Templates
                </Link>
                <Link to="/demo" className="btn btn-secondary btn-lg">
                  Try Demo →
                </Link>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                {["No credit card", "Free forever", "Export unlimited PDFs"].map((t) => (
                  <li key={t} className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> {t}</li>
                ))}
              </ul>
            </div>

            <div className="relative flex justify-center lg:justify-end fade-up" style={{ animationDelay: "120ms" }}>
              <div className="absolute -inset-6 rounded-3xl bg-white/50 blur-2xl -z-10" />
              <div className="relative">
                <div className="rounded-xl overflow-hidden shadow-2xl border border-white/60 rotate-[-2deg] transition-transform duration-300 hover:rotate-0">
                  <ResumeThumbnail resume={{ ...sampleResume(), template: "modern" }} width={340} />
                </div>
                <div className="absolute -right-6 -bottom-6 hidden sm:block rounded-xl overflow-hidden shadow-xl border border-white/60 rotate-[4deg]">
                  <ResumeThumbnail resume={{ ...sampleResume(), template: "minimal", accentColor: "green" }} width={170} />
                </div>
                <div className="absolute -left-8 top-10 hidden md:flex card px-3 py-2 items-center gap-2 text-xs font-medium shadow-lg">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live preview on
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <span className="badge">Features</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold">Everything you need to land the interview</h2>
            <p className="mt-3 text-gray-500">Focused on what matters: clean content, professional design and zero friction.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card card-hover p-6">
                <span className="h-11 w-11 rounded-xl grid place-items-center bg-indigo-50 text-indigo-600">{f.icon}</span>
                <h3 className="mt-4 font-semibold text-lg">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="bg-white border-y" style={{ borderColor: "var(--color-border)" }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
            <div className="text-center max-w-2xl mx-auto">
              <span className="badge">How It Works</span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold">From blank page to job-ready in 4 steps</h2>
            </div>
            <ol className="mt-12 grid gap-6 md:grid-cols-4">
              {STEPS.map((s, i) => (
                <li key={s.title} className="relative p-6 rounded-xl border bg-gray-50" style={{ borderColor: "var(--color-border)" }}>
                  <div className="flex items-center gap-3">
                    <span className="h-10 w-10 rounded-full grid place-items-center text-white font-bold" style={{ background: "var(--color-primary)" }}>{i + 1}</span>
                    <span className="text-indigo-600">{s.icon}</span>
                  </div>
                  <h3 className="mt-4 font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-gray-500">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Templates */}
        <section id="templates" className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <span className="badge">Templates</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold">Pick a design. Switch anytime.</h2>
            <p className="mt-3 text-gray-500">All templates use the same data, so changing your look never means re-typing.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TEMPLATES.map((t) => (
              <TemplateCard key={t.id} id={t.id} name={t.name} description={t.description} tags={t.tags} width={240} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/templates" className="btn btn-secondary">
              View all templates <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
          <div className="rounded-2xl px-6 py-14 text-center text-white" style={{ background: "linear-gradient(135deg, #0f1f3d 0%, #312e81 100%)" }}>
            <h2 className="text-3xl sm:text-4xl font-bold">Your next opportunity starts with a great resume.</h2>
            <p className="mt-3 text-indigo-100 max-w-xl mx-auto">Join students building standout resumes with ResumeCraft. It takes less than 10 minutes.</p>
            <Link to={primaryHref} className="btn btn-lg mt-8 bg-white text-indigo-700 hover:bg-indigo-50">
              Create Your Resume <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}