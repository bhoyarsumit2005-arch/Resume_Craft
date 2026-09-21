import { useEffect, useState, useRef, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { FileText, LayoutDashboard, LayoutTemplate, User, LogOut, Plus, Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight" aria-label="ResumeCraft home">
      <span className="h-8 w-8 rounded-lg grid place-items-center text-white" style={{ background: "var(--color-accent)" }}>
        <FileText size={17} />
      </span>
      <span style={{ color: dark ? "var(--color-primary)" : "#fff" }}>ResumeCraft</span>
    </Link>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isLanding = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isLanding) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLanding]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    toast.success("You have been logged out.");
    navigate("/");
  };

  const handleLandingLink = (e: ReactMouseEvent<HTMLAnchorElement>, href: string) => {
    if (!isLanding || !href.startsWith("/#")) return;
    const targetId = href.slice(2);
    const el = targetId ? document.getElementById(targetId) : null;
    if (!el) return;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const headerH = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
    const top = Math.max(el.getBoundingClientRect().top + window.scrollY - headerH, 0);
    window.scrollTo({ top, behavior: "smooth" });
    window.history.replaceState(window.history.state, "", href);
  };

  type NavLink = { href: string; label: string; icon?: ReactNode };
  const landingLinks: NavLink[] = [
    { href: "/#home", label: "Home" },
    { href: "/#features", label: "Features" },
    { href: "/#templates", label: "Templates" },
    { href: "/#how-it-works", label: "How It Works" },
  ];
  const appLinks: NavLink[] = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { href: "/templates", label: "Templates", icon: <LayoutTemplate size={16} /> },
    { href: "/profile", label: "Profile", icon: <User size={16} /> },
  ];

  const navLinks = user && !isLanding ? appLinks : landingLinks;

  const navBg = isLanding && !scrolled
    ? "bg-transparent"
    : "bg-[#1e1b4b] backdrop-blur-xl shadow-lg";

  const linkClass = (href: string) => {
    const active = pathname === href;
    if (isLanding && !scrolled) {
      return `text-sm font-bold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
        active
          ? "bg-indigo-100 text-indigo-700"
          : "text-gray-700 hover:text-indigo-700 hover:bg-gray-100"
      }`;
    }
    return `text-sm font-bold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
      active
        ? "bg-white/20 text-white"
        : "text-white hover:text-white hover:bg-white/10"
    }`;
  };

  const actions = user ? (
    <>
      {isLanding && (
        <Link to="/dashboard" className={`btn btn-sm ${scrolled ? "bg-white/10 text-white hover:bg-white/20 border border-white/20" : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"}`} onClick={() => setMenuOpen(false)}>
          <LayoutDashboard size={15} /> Dashboard
        </Link>
      )}
      <Link to="/resumes/new" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
        <Plus size={15} /> Create Resume
      </Link>
    </>
  ) : (
    <>
      <Link to="/login" className={`btn btn-sm ${scrolled ? "bg-white text-indigo-700 hover:bg-indigo-50 border border-white/20 font-semibold" : "bg-indigo-600 text-white hover:bg-indigo-700 font-semibold"}`} onClick={() => setMenuOpen(false)}>
        Login
      </Link>
      <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
        Create Resume
      </Link>
    </>
  );

  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <header className={`no-print sticky top-0 z-40 transition-all duration-300 ${navBg}`}>
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Logo dark={isLanding && !scrolled} />

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link key={l.href} to={l.href} className={linkClass(l.href)} onClick={(e) => handleLandingLink(e, l.href)}>
              {l.icon ?? null}
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {actions}

          {user && !isLanding && (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-white/10"
              >
                <span className="h-7 w-7 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                  {userInitial}
                </span>
                <ChevronDown size={14} className={`transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#1e1b4b] backdrop-blur-xl border border-white/15 shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-white/50 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                  <Link
                    to="/resumes/new"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Plus size={15} /> New Resume
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <User size={15} /> Profile
                  </Link>
                  <div className="border-t border-white/10 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors w-full text-left"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          className={`md:hidden p-2 rounded-lg transition-colors ${isLanding && !scrolled ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100" : "text-white/80 hover:text-white hover:bg-white/10"}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden bg-[#1e1b4b] backdrop-blur-xl border-t border-white/15 px-4 py-4 space-y-1 shadow-2xl">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className={linkClass(l.href)}
              onClick={(e) => {
                handleLandingLink(e, l.href);
                setMenuOpen(false);
              }}
            >
              {l.icon ?? null}
              {l.label}
            </Link>
          ))}
          <div className="flex items-center gap-2 pt-3 mt-2 border-t border-white/10">
            {actions}
          </div>
        </div>
      )}
    </header>
  );
}
