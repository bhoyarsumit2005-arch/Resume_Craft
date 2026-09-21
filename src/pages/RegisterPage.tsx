import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { UserPlus, KeyRound } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

type Step = "form" | "otp";

export default function RegisterPage() {
  const { sendRegistrationOtp, verifyRegistrationOtp, user, loading: authLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!authLoading && user) navigate("/dashboard", { replace: true });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    else if (form.name.trim().length < 2) errs.name = "Name is too short";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (form.confirm !== form.password) errs.confirm = "Passwords do not match";
    setErrors(errs);
    if (Object.keys(errs).length) { triggerShake(); return; }

    setLoading(true);
    try {
      await sendRegistrationOtp(form.name.trim(), form.email.trim(), form.password);
      setCooldown(60);
      setStep("otp");
      setErrors({});
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Failed to send OTP" });
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    try {
      await sendRegistrationOtp(form.name.trim(), form.email.trim(), form.password);
      setCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Failed to resend OTP" });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setErrors((prev) => ({ ...prev, otp: "" }));

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((d) => !d);
    otpRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpStr = otp.join("");
    if (otpStr.length !== 6) {
      setErrors({ otp: "Please enter all 6 digits" });
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      await verifyRegistrationOtp(form.email.trim(), otpStr);
      toast.success("Registration successful! Welcome to ResumeCraft.");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setErrors({ otp: err instanceof Error ? err.message : "Invalid OTP" });
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : /[A-Z]/.test(form.password) && /\d/.test(form.password) && form.password.length >= 8 ? 3 : 2;

  return (
    <AuthLayout
      title="Create your account"
      subtitle={step === "form" ? "Start building your professional resume in minutes." : `We sent a 6-digit code to ${form.email}`}
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
            Login
          </Link>
        </>
      }
    >
      {step === "form" ? (
        <form onSubmit={handleSendOtp} className="space-y-4" noValidate>
          {errors.form && (
            <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
              {errors.form}
              {errors.form.includes("already exists") && (
                <Link to="/login" className="ml-1 font-semibold text-indigo-600 hover:underline whitespace-nowrap">
                  Log in
                </Link>
              )}
            </div>
          )}
          <div className={`transition-transform ${shake ? "animate-shake" : ""}`}>
            <Input label="Full Name" name="name" required autoComplete="name" placeholder="Sumit Bhoyar" value={form.name} onChange={set("name")} error={errors.name} />
          </div>
          <div className={`transition-transform ${shake ? "animate-shake" : ""}`} style={{ animationDelay: "50ms" }}>
            <Input label="Email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set("email")} error={errors.email} />
          </div>
          <div className={`transition-transform ${shake ? "animate-shake" : ""}`} style={{ animationDelay: "100ms" }}>
            <PasswordInput label="Password" name="password" autoComplete="new-password" placeholder="At least 6 characters" value={form.password} onChange={set("password")} error={errors.password} />
            {form.password && (
              <div className="mt-2 flex gap-1" aria-hidden>
                {[1, 2, 3].map((i) => (
                  <span key={i} className="h-1 flex-1 rounded-full" style={{ background: strength >= i ? ["#dc2626", "#f59e0b", "#059669"][strength - 1] : "#e5e7eb" }} />
                ))}
              </div>
            )}
          </div>
          <div className={`transition-transform ${shake ? "animate-shake" : ""}`} style={{ animationDelay: "150ms" }}>
            <PasswordInput label="Confirm Password" name="confirm" autoComplete="new-password" placeholder="Re-enter password" value={form.confirm} onChange={set("confirm")} error={errors.confirm} />
          </div>
          <Button type="submit" className="w-full" size="lg" loading={loading} icon={<UserPlus size={18} />}>
            {loading ? "Sending OTP..." : "Send Verification OTP"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          {errors.form && (
            <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2 animate-fade-in">
              <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
              {errors.form}
            </div>
          )}
          <div className={`transition-transform ${shake ? "animate-shake" : ""}`}>
            <label className="label">Enter OTP</label>
            <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className={`w-12 h-12 text-center text-lg font-bold rounded-lg border transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none ${
                    errors.otp ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
                  }`}
                />
              ))}
            </div>
            {errors.otp && <p className="field-error mt-2">{errors.otp}</p>}
          </div>
          <Button type="submit" className="w-full group" size="lg" loading={loading} icon={!loading ? <KeyRound size={18} className="group-hover:translate-x-0.5 transition-transform" /> : undefined}>
            Verify & Create Account
          </Button>
          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={cooldown > 0}
              className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
            </button>
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={() => { setStep("form"); setErrors({}); setOtp(["", "", "", "", "", ""]); }}
              className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
            >
              ← Back to registration form
            </button>
          </div>
        </form>
      )}

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
