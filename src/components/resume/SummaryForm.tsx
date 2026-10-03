import { useState } from "react";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { Textarea } from "@/components/common/Input";
import { improveSummary } from "@/utils/summary";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { aiService } from "@/services/aiService";
import { ApiRequestError } from "@/services/api";

interface Props {
  value: string;
  onChange: (v: string) => void;
  context: { title?: string; skills: string[]; projects: number };
}

export default function SummaryForm({ value, onChange, context }: Props) {
  const toast = useToast();
  const { user } = useAuth();
  const [busy, setBusy] = useState<null | "improve" | "generate">(null);
  const len = value.length;
  const status = len === 0 ? "Aim for 300–500 characters." : len < 200 ? "A bit short — add your key strengths." : len > 600 ? "Consider trimming to keep it concise." : "Great length!";

  const signInHint = () => toast.info("AI suggestions need an account — log in to use them.");

  const improve = async () => {
    if (!user) {
      onChange(improveSummary(value, context));
      toast.info("Applied smart local edits. Sign in for AI-powered suggestions.");
      return;
    }
    setBusy("improve");
    try {
      const res = await aiService.summary({ mode: "rewrite", summary: value, ...context });
      onChange(res.text);
      toast.success(res.source === "ai" ? "Summary improved with AI." : "Summary improved with smart suggestions.");
    } catch (err) {
      if (err instanceof ApiRequestError && (err.status === 429 || err.status === 401)) {
        toast.error(err.message);
      } else {
        onChange(improveSummary(value, context));
        toast.info("AI is unavailable right now — applied smart local edits instead.");
      }
    } finally {
      setBusy(null);
    }
  };

  const generate = async () => {
    if (!user) {
      signInHint();
      return;
    }
    setBusy("generate");
    try {
      const res = await aiService.summary({ mode: "generate", summary: "", ...context });
      onChange(res.text);
      toast.success("Summary drafted with AI. Tweak it to fit your voice.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not generate a summary.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <Textarea
        label="Professional Summary"
        name="summary"
        rows={5}
        placeholder="Write 2–4 lines about your experience, skills, career goals, and strengths."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={2000}
      />
      <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
        <span className={`text-xs ${len > 600 ? "text-amber-600" : "text-gray-500"}`}>
          {len} characters · {status}
        </span>
        <div className="flex items-center gap-2">
          {len < 20 && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={generate} disabled={busy !== null}>
              {busy === "generate" ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} className="text-indigo-600" />} Generate Draft
            </button>
          )}
          <button type="button" className="btn btn-secondary btn-sm" onClick={improve} disabled={busy !== null || len === 0}>
            {busy === "improve" ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-indigo-600" />} Improve Summary
          </button>
        </div>
      </div>
    </div>
  );
}
