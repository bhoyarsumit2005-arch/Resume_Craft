import { Link } from "react-router";
import { Logo } from "./Navbar";
import { Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/common/BrandIcons";

export default function Footer() {
  return (
    <footer className="no-print border-t bg-white" style={{ borderColor: "var(--color-border)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo dark />
          <p className="mt-3 text-sm text-gray-500 leading-relaxed">
            Build Your Resume. Showcase Your Skills. Get Career Ready.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link to="/" className="hover:text-indigo-600">Home</Link></li>
            <li><Link to="/templates" className="hover:text-indigo-600">Templates</Link></li>
            <li><Link to="/login" className="hover:text-indigo-600">Login</Link></li>
            <li><Link to="/register" className="hover:text-indigo-600">Register</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Features</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link to="/#features" className="hover:text-indigo-600">Live Preview</Link></li>
            <li><Link to="/#templates" className="hover:text-indigo-600">Professional Templates</Link></li>
            <li><Link to="/#features" className="hover:text-indigo-600">PDF Export</Link></li>
            <li><Link to="/#features" className="hover:text-indigo-600">Secure Storage</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <a href="mailto:bhoyarsumit2005@gmail.com" className="flex items-center gap-2 hover:text-indigo-600">
                <Mail size={14} /> bhoyarsumit2005@gmail.com
              </a>
            </li>
            <li>
              <a href="https://github.com/bhoyarsumit2005-arch" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-indigo-600">
                <GithubIcon size={14} /> GitHub
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/in/sumit-bhoyar-ai-engineer" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-indigo-600">
                <LinkedinIcon size={14} /> LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t py-5 text-center text-xs text-gray-500" style={{ borderColor: "var(--color-border)" }}>
        © {new Date().getFullYear()} ResumeCraft. All rights reserved. Built as a project.
      </div>
    </footer>
  );
}