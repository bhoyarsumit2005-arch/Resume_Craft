import { useState } from "react";
import { Loader2, Plus, Sparkles, X } from "lucide-react";
import Input, { Textarea } from "@/components/common/Input";
import { EntryHeader } from "./SectionCard";
import { uid, type Experience } from "@/lib/resume-types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { aiService } from "@/services/aiService";

interface Props {
  items: Experience[];
  onChange: (items: Experience[]) => void;
  skills?: string[];
}

export default function ExperienceForm({ items, onChange, skills = [] }: Props) {
  const toast = useToast();
  const { user } = useAuth();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [suggestFor, setSuggestFor] = useState<string | null>(null);
  const [bullets, setBullets] = useState<string[]>([]);

  const update = (id: string, patch: Partial<Experience>) => onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const remove = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
    if (suggestFor === id) {
      setSuggestFor(null);
      setBullets([]);
    }
  };
  const add = () =>
    onChange([...items, { id: uid(), jobTitle: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" }]);

  const suggest = async (id: string) => {
    if (!user) {
      toast.info("AI bullet suggestions need an account — log in to use them.");
      return;
    }
    const entry = items.find((i) => i.id === id);
    if (!entry) return;
    setBusyId(id);
    setSuggestFor(null);
    setBullets([]);
    try {
      const res = await aiService.bullets({
        kind: "experience",
        jobTitle: entry.jobTitle,
        company: entry.company,
        description: entry.description,
        skills,
      });
      if (!res.bullets.length) {
        toast.info("The AI didn't return any usable bullets this time. Try adding a bit more detail.");
        return;
      }
      setSuggestFor(id);
      setBullets(res.bullets);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not suggest bullets.");
    } finally {
      setBusyId(null);
    }
  };

  const append = (id: string, lines: string[]) => {
    const entry = items.find((i) => i.id === id);
    if (!entry || !lines.length) return;
    const base = entry.description.trim();
    update(id, { description: base ? `${base}\n${lines.join("\n")}` : lines.join("\n") });
  };

  const dismiss = () => {
    setSuggestFor(null);
    setBullets([]);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="text-sm text-gray-500">No experience added yet. Internships count too!</p>}
      {items.map((e, idx) => (
        <div key={e.id} className="entry-card">
          <EntryHeader title={e.jobTitle || e.company || `Experience ${idx + 1}`} onRemove={() => remove(e.id)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Job Title" required placeholder="Full Stack Developer Intern" value={e.jobTitle} onChange={(ev) => update(e.id, { jobTitle: ev.target.value })} id={`jt-${e.id}`} />
            <Input label="Company" required placeholder="TechNova Solutions" value={e.company} onChange={(ev) => update(e.id, { company: ev.target.value })} id={`co-${e.id}`} />
            <Input label="Location" placeholder="Remote / Pune" value={e.location} onChange={(ev) => update(e.id, { location: ev.target.value })} id={`el-${e.id}`} className="sm:col-span-2" />
            <Input label="Start Date" placeholder="Jun 2025" value={e.startDate} onChange={(ev) => update(e.id, { startDate: ev.target.value })} id={`sd-${e.id}`} />
            <Input label="End Date" placeholder="Aug 2025" value={e.endDate} disabled={e.current} onChange={(ev) => update(e.id, { endDate: ev.target.value })} id={`ed-${e.id}`} />
            <label className="flex items-center gap-2 text-sm sm:col-span-2 cursor-pointer">
              <input type="checkbox" className="checkbox" checked={e.current} onChange={(ev) => update(e.id, { current: ev.target.checked, endDate: ev.target.checked ? "" : e.endDate })} />
              I currently work here
            </label>
            <Textarea
              label="Description"
              rows={4}
              placeholder={"One achievement per line, e.g.\nBuilt REST APIs with Node.js serving 10k requests/day\nImproved page load time by 35%"}
              hint="Each new line becomes a bullet point."
              value={e.description}
              onChange={(ev) => update(e.id, { description: ev.target.value })}
              id={`edesc-${e.id}`}
              className="sm:col-span-2"
            />
            <div className="sm:col-span-2 flex justify-end">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => suggest(e.id)} disabled={busyId !== null}>
                {busyId === e.id ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-indigo-600" />} Suggest bullets
              </button>
            </div>
            {suggestFor === e.id && bullets.length > 0 && (
              <div className="sm:col-span-2 rounded-lg border border-indigo-200 bg-indigo-50/60 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-indigo-700">AI suggestions — click to add</p>
                  <button type="button" className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1" onClick={dismiss}>
                    <X size={12} /> Dismiss
                  </button>
                </div>
                <ul className="space-y-1.5">
                  {bullets.map((b, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        className="w-full text-left text-sm text-gray-700 hover:text-indigo-700 hover:bg-white rounded px-2 py-1 border border-transparent hover:border-indigo-200 transition-colors"
                        onClick={() => append(e.id, [b])}
                      >
                        {b}
                      </button>
                    </li>
                  ))}
                </ul>
                <button type="button" className="btn btn-secondary btn-sm mt-2 w-full" onClick={() => append(e.id, bullets)}>
                  <Plus size={14} /> Add all bullets
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="btn btn-secondary btn-sm w-full border-dashed">
        <Plus size={14} /> Add Experience
      </button>
    </div>
  );
}
