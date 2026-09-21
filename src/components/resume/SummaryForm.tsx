import { Sparkles } from "lucide-react";
import { Textarea } from "@/components/common/Input";
import { improveSummary } from "@/utils/summary";
import { useToast } from "@/context/ToastContext";

interface Props {
  value: string;
  onChange: (v: string) => void;
  context: { title?: string; skills: string[]; projects: number };
}

export default function SummaryForm({ value, onChange, context }: Props) {
  const toast = useToast();
  const len = value.length;
  const status = len === 0 ? "Aim for 300–500 characters." : len < 200 ? "A bit short — add your key strengths." : len > 600 ? "Consider trimming to keep it concise." : "Great length!";

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
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            onChange(improveSummary(value, context));
            toast.success("Summary improved using smart suggestions.");
          }}
        >
          <Sparkles size={14} className="text-indigo-600" /> Improve Summary
        </button>
      </div>
    </div>
  );
}
