import { Plus } from "lucide-react";
import Input from "@/components/common/Input";
import { EntryHeader } from "./SectionCard";
import { uid, type Achievement } from "@/lib/resume-types";

interface Props {
  items: Achievement[];
  onChange: (items: Achievement[]) => void;
}

export default function AchievementForm({ items, onChange }: Props) {
  const update = (id: string, patch: Partial<Achievement>) => onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const add = () => onChange([...items, { id: uid(), title: "", description: "" }]);

  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="text-sm text-gray-500">Hackathons, coding contests, academic awards, leadership roles...</p>}
      {items.map((a, idx) => (
        <div key={a.id} className="entry-card">
          <EntryHeader title={a.title || `Achievement ${idx + 1}`} onRemove={() => remove(a.id)} />
          <div className="grid gap-3">
            <Input label="Achievement" required placeholder="Winner – Smart India Hackathon 2024" value={a.title} onChange={(e) => update(a.id, { title: e.target.value })} id={`at-${a.id}`} />
            <Input label="Details" placeholder="Led a team of 6 to build a civic-issue reporting app" value={a.description} onChange={(e) => update(a.id, { description: e.target.value })} id={`ad-${a.id}`} />
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="btn btn-secondary btn-sm w-full border-dashed">
        <Plus size={14} /> Add Achievement
      </button>
    </div>
  );
}
