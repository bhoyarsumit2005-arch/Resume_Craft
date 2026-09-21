import { Check } from "lucide-react";
import ResumeThumbnail from "./ResumeThumbnail";
import { createSampleResume, type ResumeData, type TemplateId } from "@/lib/resume-types";

interface Props {
  id: TemplateId;
  name: string;
  description?: string;
  tags?: string[];
  selected?: boolean;
  onSelect?: (id: TemplateId) => void;
  resume?: ResumeData;
  width?: number;
}

let sampleCache: ResumeData | null = null;
export function sampleResume(): ResumeData {
  if (!sampleCache) sampleCache = createSampleResume();
  return sampleCache;
}

export default function TemplateCard({ id, name, description, tags, selected, onSelect, resume, width = 200 }: Props) {
  const data: ResumeData = { ...(resume ?? sampleResume()), template: id };
  const Comp = onSelect ? "button" : "div";
  return (
    <Comp
      type={onSelect ? "button" : undefined}
      onClick={onSelect ? () => onSelect(id) : undefined}
      className={`card card-hover text-left p-3 flex flex-col gap-3 w-full ${selected ? "ring-2 ring-indigo-500 border-indigo-500" : ""}`}
      aria-pressed={onSelect ? selected : undefined}
    >
      <div className="relative rounded-lg overflow-hidden border mx-auto" style={{ borderColor: "var(--color-border)", width }}>
        <ResumeThumbnail resume={data} width={width} />
        {selected && (
          <span className="absolute top-2 right-2 h-6 w-6 rounded-full bg-indigo-600 text-white grid place-items-center shadow">
            <Check size={14} />
          </span>
        )}
      </div>
      <div>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">{name}</span>
          {selected && <span className="badge">Selected</span>}
        </div>
        {description && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((t) => (
              <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Comp>
  );
}
