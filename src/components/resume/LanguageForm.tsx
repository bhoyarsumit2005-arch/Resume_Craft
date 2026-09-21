import { Plus, Trash2 } from "lucide-react";
import { uid, type Language } from "@/lib/resume-types";

interface Props {
  items: Language[];
  onChange: (items: Language[]) => void;
}

const LEVELS = ["Native", "Fluent", "Professional", "Intermediate", "Basic"];

export default function LanguageForm({ items, onChange }: Props) {
  const update = (id: string, patch: Partial<Language>) => onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const add = () => onChange([...items, { id: uid(), name: "", proficiency: "Professional" }]);

  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="text-sm text-gray-500">E.g. English — Professional, Hindi — Fluent.</p>}
      {items.map((l) => (
        <div key={l.id} className="flex gap-2 items-center">
          <input className="input" placeholder="Language" value={l.name} onChange={(e) => update(l.id, { name: e.target.value })} aria-label="Language" />
          <select className="select w-40" value={l.proficiency} onChange={(e) => update(l.id, { proficiency: e.target.value })} aria-label="Proficiency">
            {LEVELS.map((lv) => (
              <option key={lv} value={lv}>
                {lv}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => remove(l.id)} className="btn btn-ghost btn-icon text-red-500" aria-label="Remove language">
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="btn btn-secondary btn-sm w-full border-dashed">
        <Plus size={14} /> Add Language
      </button>
    </div>
  );
}
