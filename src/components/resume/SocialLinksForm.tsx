import { Plus, Trash2 } from "lucide-react";
import { isValidUrl, uid, type SocialLink } from "@/lib/resume-types";

interface Props {
  items: SocialLink[];
  onChange: (items: SocialLink[]) => void;
}

export default function SocialLinksForm({ items, onChange }: Props) {
  const update = (id: string, patch: Partial<SocialLink>) => onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const add = () => onChange([...items, { id: uid(), label: "", url: "" }]);

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">LinkedIn, GitHub and Portfolio are set in Personal Information. Add extra links here (LeetCode, Medium, Behance...).</p>
      {items.map((s) => (
        <div key={s.id} className="flex gap-2 items-start">
          <input className="input w-36" placeholder="Label" value={s.label} onChange={(e) => update(s.id, { label: e.target.value })} aria-label="Link label" />
          <div className="flex-1">
            <input className={`input ${s.url && !isValidUrl(s.url) ? "has-error" : ""}`} placeholder="https://..." value={s.url} onChange={(e) => update(s.id, { url: e.target.value })} aria-label="Link URL" />
            {s.url && !isValidUrl(s.url) && <p className="field-error">Enter a valid URL</p>}
          </div>
          <button type="button" onClick={() => remove(s.id)} className="btn btn-ghost btn-icon text-red-500" aria-label="Remove link">
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="btn btn-secondary btn-sm w-full border-dashed">
        <Plus size={14} /> Add Link
      </button>
    </div>
  );
}
