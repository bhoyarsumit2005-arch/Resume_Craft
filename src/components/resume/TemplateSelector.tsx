import { Check } from "lucide-react";
import TemplateCard from "./TemplateCard";
import { ACCENT_COLORS, FONT_SIZES, OPTIONAL_SECTIONS, TEMPLATES, type AccentColor, type FontSize, type ResumeData, type SectionKey, type TemplateId } from "@/lib/resume-types";

interface Props {
  resume: ResumeData;
  onTemplate: (t: TemplateId) => void;
  onAccent: (c: AccentColor) => void;
  onFontSize: (f: FontSize) => void;
  onToggleSection: (k: SectionKey) => void;
}

export default function TemplateSelector({ resume, onTemplate, onAccent, onFontSize, onToggleSection }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <p className="label">Template</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {TEMPLATES.map((t) => (
            <TemplateCard key={t.id} id={t.id} name={t.name} selected={resume.template === t.id} onSelect={onTemplate} resume={resume} width={120} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="label">Accent Color</p>
          <div className="flex gap-2">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onAccent(c.id)}
                title={c.label}
                aria-label={`${c.label} accent`}
                aria-pressed={resume.accentColor === c.id}
                className="h-8 w-8 rounded-full grid place-items-center text-white transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-indigo-500"
                style={{ background: c.hex, boxShadow: resume.accentColor === c.id ? `0 0 0 2px #fff, 0 0 0 4px ${c.hex}` : undefined }}
              >
                {resume.accentColor === c.id && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="label">Font Size</p>
          <div className="inline-flex rounded-lg border overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
            {FONT_SIZES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onFontSize(f.id)}
                aria-pressed={resume.fontSize === f.id}
                className={`px-4 py-1.5 text-sm font-semibold transition-colors ${resume.fontSize === f.id ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="label">Visible Sections</p>
        <p className="field-hint mb-2 mt-0">Empty sections are hidden automatically. Toggle to hide a filled section without deleting its data.</p>
        <div className="flex flex-wrap gap-1.5">
          {OPTIONAL_SECTIONS.map((s) => {
            const hidden = resume.hiddenSections.includes(s.key);
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => onToggleSection(s.key)}
                aria-pressed={!hidden}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${hidden ? "bg-gray-100 text-gray-400 line-through border-gray-200" : "bg-indigo-50 text-indigo-700 border-indigo-200"}`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
