import { useState } from "react";
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  skills: string[];
  onChange: (skills: string[]) => void;
}

const SUGGESTIONS = ["JavaScript", "React", "Node.js", "Express.js", "MongoDB", "Java", "Python", "SQL", "Git", "TypeScript", "HTML/CSS", "C++"];

export default function SkillsForm({ skills, onChange }: Props) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    const next = [...skills];
    for (const p of parts) if (!next.some((s) => s.toLowerCase() === p.toLowerCase())) next.push(p);
    onChange(next);
    setDraft("");
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= skills.length) return;
    const next = [...skills];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const remaining = SUGGESTIONS.filter((s) => !skills.some((k) => k.toLowerCase() === s.toLowerCase()));

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          className="input"
          placeholder="Type a skill and press Enter (e.g. React)"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            }
          }}
          aria-label="Add skill"
        />
        <button type="button" className="btn btn-primary" onClick={() => add(draft)} aria-label="Add skill">
          <Plus size={16} />
        </button>
      </div>

      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((s, i) => (
            <span key={s} className="chip">
              <button type="button" onClick={() => move(i, -1)} aria-label={`Move ${s} left`} disabled={i === 0} className="disabled:opacity-30">
                <ChevronLeft size={12} />
              </button>
              {s}
              <button type="button" onClick={() => move(i, 1)} aria-label={`Move ${s} right`} disabled={i === skills.length - 1} className="disabled:opacity-30">
                <ChevronRight size={12} />
              </button>
              <button type="button" onClick={() => onChange(skills.filter((x) => x !== s))} aria-label={`Remove ${s}`}>
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No skills yet. Add at least 5–8 relevant skills.</p>
      )}

      {remaining.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Quick add:</p>
          <div className="flex flex-wrap gap-1.5">
            {remaining.slice(0, 8).map((s) => (
              <button key={s} type="button" onClick={() => add(s)} className="text-xs px-2.5 py-1 rounded-full border border-dashed border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
