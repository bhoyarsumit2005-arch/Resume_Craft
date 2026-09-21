import { Plus } from "lucide-react";
import Input from "@/components/common/Input";
import { EntryHeader } from "./SectionCard";
import { isValidUrl, uid, type Certification } from "@/lib/resume-types";

interface Props {
  items: Certification[];
  onChange: (items: Certification[]) => void;
}

export default function CertificationForm({ items, onChange }: Props) {
  const update = (id: string, patch: Partial<Certification>) => onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const add = () => onChange([...items, { id: uid(), name: "", organization: "", date: "", credentialUrl: "" }]);

  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="text-sm text-gray-500">Add online courses, certifications, or workshops.</p>}
      {items.map((c, idx) => (
        <div key={c.id} className="entry-card">
          <EntryHeader title={c.name || `Certification ${idx + 1}`} onRemove={() => remove(c.id)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Certificate Name" required placeholder="Full Stack Web Development" value={c.name} onChange={(e) => update(c.id, { name: e.target.value })} id={`cn-${c.id}`} />
            <Input label="Issuing Organization" placeholder="Coursera / Google / Udemy" value={c.organization} onChange={(e) => update(c.id, { organization: e.target.value })} id={`co-${c.id}`} />
            <Input label="Date" placeholder="Mar 2025" value={c.date} onChange={(e) => update(c.id, { date: e.target.value })} id={`cd-${c.id}`} />
            <Input label="Credential URL" placeholder="coursera.org/verify/..." value={c.credentialUrl} error={c.credentialUrl && !isValidUrl(c.credentialUrl) ? "Enter a valid URL" : undefined} onChange={(e) => update(c.id, { credentialUrl: e.target.value })} id={`cu-${c.id}`} />
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="btn btn-secondary btn-sm w-full border-dashed">
        <Plus size={14} /> Add Certification
      </button>
    </div>
  );
}
