import { Plus } from "lucide-react";
import Input, { Textarea } from "@/components/common/Input";
import { EntryHeader } from "./SectionCard";
import { uid, type Experience } from "@/lib/resume-types";

interface Props {
  items: Experience[];
  onChange: (items: Experience[]) => void;
}

export default function ExperienceForm({ items, onChange }: Props) {
  const update = (id: string, patch: Partial<Experience>) => onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const add = () =>
    onChange([...items, { id: uid(), jobTitle: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" }]);

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
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="btn btn-secondary btn-sm w-full border-dashed">
        <Plus size={14} /> Add Experience
      </button>
    </div>
  );
}
