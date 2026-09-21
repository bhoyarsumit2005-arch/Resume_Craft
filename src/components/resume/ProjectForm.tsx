import { useState } from "react";
import { Plus, X } from "lucide-react";
import Input, { Textarea } from "@/components/common/Input";
import { EntryHeader } from "./SectionCard";
import { isValidUrl, uid, type Project } from "@/lib/resume-types";

interface Props {
  items: Project[];
  onChange: (items: Project[]) => void;
}

function TechInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const commit = () => {
    const parts = draft.split(",").map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    onChange(Array.from(new Set([...value, ...parts])));
    setDraft("");
  };
  return (
    <div>
      <label className="label">Technologies</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((t) => (
          <span key={t} className="chip" style={{ fontSize: 12 }}>
            {t}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Remove ${t}`}>
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="input"
          placeholder="React, Node.js, MongoDB (press Enter)"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            }
          }}
          onBlur={commit}
          aria-label="Add technology"
        />
        <button type="button" className="btn btn-secondary" onClick={commit} aria-label="Add technology">
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

export default function ProjectForm({ items, onChange }: Props) {
  const update = (id: string, patch: Partial<Project>) => onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const add = () => onChange([...items, { id: uid(), name: "", description: "", technologies: [], githubUrl: "", liveUrl: "" }]);
  const urlErr = (v: string) => (v && !isValidUrl(v) ? "Enter a valid URL" : undefined);

  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="text-sm text-gray-500">Showcase your best work — add a project.</p>}
      {items.map((p, idx) => (
        <div key={p.id} className="entry-card">
          <EntryHeader title={p.name || `Project ${idx + 1}`} onRemove={() => remove(p.id)} />
          <div className="grid gap-3">
            <Input label="Project Name" required placeholder="Lost & Found Web Application" value={p.name} onChange={(e) => update(p.id, { name: e.target.value })} id={`pn-${p.id}`} />
            <Textarea label="Description" rows={3} placeholder="What does it do? What problem does it solve? What was your role?" value={p.description} onChange={(e) => update(p.id, { description: e.target.value })} id={`pd-${p.id}`} />
            <TechInput value={p.technologies} onChange={(technologies) => update(p.id, { technologies })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="GitHub URL" placeholder="github.com/you/project" value={p.githubUrl} error={urlErr(p.githubUrl)} onChange={(e) => update(p.id, { githubUrl: e.target.value })} id={`pg-${p.id}`} />
              <Input label="Live Demo URL" placeholder="project.vercel.app" value={p.liveUrl} error={urlErr(p.liveUrl)} onChange={(e) => update(p.id, { liveUrl: e.target.value })} id={`pl-${p.id}`} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="btn btn-secondary btn-sm w-full border-dashed">
        <Plus size={14} /> Add Project
      </button>
    </div>
  );
}
