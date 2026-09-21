import { Plus } from "lucide-react";
import Input, { Textarea } from "@/components/common/Input";
import { EntryHeader } from "./SectionCard";
import { uid, type Education } from "@/lib/resume-types";

interface Props {
  items: Education[];
  onChange: (items: Education[]) => void;
}

export default function EducationForm({ items, onChange }: Props) {
  const update = (id: string, patch: Partial<Education>) => onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const add = () =>
    onChange([...items, { id: uid(), degree: "", institution: "", location: "", startYear: "", endYear: "", grade: "", description: "" }]);

  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="text-sm text-gray-500">No education added yet.</p>}
      {items.map((e, idx) => (
        <div key={e.id} className="entry-card">
          <EntryHeader title={e.degree || e.institution || `Education ${idx + 1}`} onRemove={() => remove(e.id)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Degree" required placeholder="B.Tech in Computer Science" value={e.degree} onChange={(ev) => update(e.id, { degree: ev.target.value })} id={`deg-${e.id}`} />
            <Input label="Institution" required placeholder="ABC College of Engineering" value={e.institution} onChange={(ev) => update(e.id, { institution: ev.target.value })} id={`inst-${e.id}`} />
            <Input label="Location" placeholder="Nagpur, India" value={e.location} onChange={(ev) => update(e.id, { location: ev.target.value })} id={`loc-${e.id}`} />
            <Input label="CGPA / Percentage" placeholder="CGPA 8.5 / 10" value={e.grade} onChange={(ev) => update(e.id, { grade: ev.target.value })} id={`grade-${e.id}`} />
            <Input label="Start Year" placeholder="2022" value={e.startYear} onChange={(ev) => update(e.id, { startYear: ev.target.value })} id={`sy-${e.id}`} />
            <Input label="End Year" placeholder="2026 or Present" value={e.endYear} onChange={(ev) => update(e.id, { endYear: ev.target.value })} id={`ey-${e.id}`} />
            <Textarea label="Description" rows={2} placeholder="Relevant coursework, honours, activities..." value={e.description} onChange={(ev) => update(e.id, { description: ev.target.value })} id={`desc-${e.id}`} className="sm:col-span-2" />
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="btn btn-secondary btn-sm w-full border-dashed">
        <Plus size={14} /> Add Education
      </button>
    </div>
  );
}
