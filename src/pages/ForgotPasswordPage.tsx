import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, KeyRound, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { authService } from "@/services/authService";

type Step = "email" | "otp" | "password" | "done";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";
    setErrors(errs);
    if (Object.keys(errs).length) { triggerShake(); return; }

    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
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
      await authService.forgotPassword(email.trim());
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
      const data = await authService.verifyOtp(email.trim(), otpStr);
      setResetToken(data.resetToken);
      setStep("password");
      setErrors({});
    } catch (err) {
      setErrors({ otp: err instanceof Error ? err.message : "Invalid OTP" });
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!newPassword || newPassword.length < 6) errs.newPassword = "Password must be at least 6 characters";
    if (newPassword !== confirmPassword) errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    if (Object.keys(errs).length) { triggerShake(); return; }

    setLoading(true);
    try {
      await authService.resetPassword(resetToken, newPassword);
      setStep("done");
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Failed to reset password" });
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={step === "done" ? "All done!" : "Reset your password"}
      subtitle={
        step === "email"
          ? "Enter your email and we'll send you an OTP."
          : step === "otp"
          ? `We sent a 6-digit code to ${email}`
          : step === "password"
          ? "Enter your new password below."
          : "Your password has been reset successfully."
      }
      footer={
        step === "done" ? (
          <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
            Go to login
          </Link>
        ) : (
          <>
            Remember your password?{" "}
            <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
              Log in
            </Link>
          </>
        )
      }
    >
      {step === "done" ? (
        <div className="text-center py-8">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-100 grid place-items-center mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <p className="text-gray-600 mb-6">Your password has been updated. You can now log in with your new password.</p>
          <Button onClick={() => navigate("/login")} className="w-full" size="lg">
            Continue to Login <ArrowRight size={18} />
          </Button>
        </div>
      ) : step === "email" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          {errors.form && (
            <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2 animate-fade-in">
              <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
              {errors.form}
            </div>
          )}
          <div className={`transition-transform ${shake ? "animate-shake" : ""}`}>
            <Input
              label="Email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
              error={errors.email}
            />
          </div>
          <Button type="submit" className="w-full group" size="lg" loading={loading} icon={!loading ? <Mail size={18} className="group-hover:translate-x-0.5 transition-transform" /> : undefined}>
            Send OTP
          </Button>
        </form>
      ) : step === "otp" ? (
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
            Verify OTP
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
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          {errors.form && (
            <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2 animate-fade-in">
              <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
              {errors.form}
            </div>
          )}
          <div className={`transition-transform ${shake ? "animate-shake" : ""}`}>
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => ({ ...p, newPassword: "" })); }}
              error={errors.newPassword}
            />
          </div>
          <div className={`transition-transform ${shake ? "animate-shake" : ""}`} style={{ animationDelay: "50ms" }}>
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: "" })); }}
              error={errors.confirmPassword}
            />
          </div>
          <Button type="submit" className="w-full group" size="lg" loading={loading} icon={!loading ? <Lock size={18} className="group-hover:translate-x-0.5 transition-transform" /> : undefined}>
            Reset Password
          </Button>
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
