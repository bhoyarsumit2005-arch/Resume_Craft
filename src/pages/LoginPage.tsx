import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { LogIn, Mail } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("rc_remember_email");
    if (saved) setEmail(saved);
  }, []);

  useEffect(() => {
    if (!authLoading && user) navigate(next, { replace: true });
  }, [authLoading, user, navigate, next]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    setErrors(errs);
    if (Object.keys(errs).length) {
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const u = await login(email.trim(), password);
      if (remember) window.localStorage.setItem("rc_remember_email", email.trim());
      else window.localStorage.removeItem("rc_remember_email");
      toast.success(`Welcome back, ${u.name.split(" ")[0]}!`);
      navigate(next, { replace: true });
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Login failed" });
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to manage your resumes."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-semibold text-indigo-600 hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        {errors.form && (
          <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2 animate-fade-in">
            <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
            {errors.form}
          </div>
        )}

        <div className={`transition-transform ${shake ? "animate-shake" : ""}`}>
          <div className="relative">
            <Input
              label="Email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              error={errors.email}
              className={`transition-all duration-200 ${focusedField === "email" ? "scale-[1.01]" : ""}`}
            />
            {!errors.email && (
              <span className={`absolute right-3 top-9 transition-all duration-200 ${focusedField === "email" ? "opacity-100 text-indigo-500" : "opacity-0"}`}>
                <Mail size={16} />
              </span>
            )}
          </div>
        </div>

        <div className={`transition-transform ${shake ? "animate-shake" : ""}`} style={{ animationDelay: "50ms" }}>
          <PasswordInput
            label="Password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
            error={errors.password}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer group">
            <input
              type="checkbox"
              className="checkbox group-hover:scale-110 transition-transform"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline font-medium">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full group" size="lg" loading={loading} icon={!loading ? <LogIn size={18} className="group-hover:translate-x-0.5 transition-transform" /> : undefined}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </AuthLayout>
  );
}
