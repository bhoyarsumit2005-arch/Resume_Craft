import type { ReactNode } from "react";
import { Link } from "react-router";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/layout/Navbar";

export default function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <aside className="hidden lg:flex flex-col justify-between p-12 text-white" style={{ background: "linear-gradient(160deg, #0f1f3d 0%, #1e2a5a 60%, #312e81 100%)" }}>
        <Logo />
        <div>
          <h2 className="text-4xl font-bold leading-tight">Build Your Resume.<br />Showcase Your Skills.<br />Get Career Ready.</h2>
          <ul className="mt-8 space-y-3 text-indigo-100">
            {["Live preview while you type", "5 professional templates", "One-click A4 PDF export", "Secure, private storage"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-indigo-200">© {new Date().getFullYear()} ResumeCraft</p>
      </aside>
      <main className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md fade-up">
          <div className="lg:hidden mb-8">
            <Logo dark />
          </div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-gray-500 mt-1 mb-6">{subtitle}</p>
          {children}
          <p className="mt-6 text-sm text-gray-600 text-center">{footer}</p>
          <p className="mt-3 text-center text-xs text-gray-400">
            <Link to="/" className="hover:underline">← Back to home</Link>
          </p>
        </div>
      </main>
    </div>
  );
}