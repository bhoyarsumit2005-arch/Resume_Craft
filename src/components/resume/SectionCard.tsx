import { useState, type ReactNode } from "react";
import { ChevronDown, Eye, EyeOff } from "lucide-react";

interface Props {
  title: string;
  icon: ReactNode;
  count?: number;
  defaultOpen?: boolean;
  hidden?: boolean;
  onToggleHidden?: () => void;
  children: ReactNode;
}

export default function SectionCard({ title, icon, count, defaultOpen = false, hidden, onToggleHidden, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`section-card ${hidden ? "opacity-70" : ""}`}>
      <div className="flex items-center">
        <button type="button" className="section-header flex-1" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <span className="h-8 w-8 rounded-lg grid place-items-center bg-indigo-50 text-indigo-600 shrink-0">{icon}</span>
          <span className="font-semibold text-sm flex-1">{title}</span>
          {typeof count === "number" && count > 0 && <span className="badge">{count}</span>}
          <ChevronDown size={18} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {onToggleHidden && (
          <button
            type="button"
            onClick={onToggleHidden}
            className={`btn btn-ghost btn-icon mr-2 ${hidden ? "text-red-500" : ""}`}
            title={hidden ? "Show section in resume" : "Hide section from resume"}
            aria-label={hidden ? `Show ${title}` : `Hide ${title}`}
          >
            {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {open && <div className="section-body space-y-4">{children}</div>}
    </div>
  );
}

export function EntryHeader({ title, onRemove }: { title: string; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-semibold text-gray-800 truncate">{title}</span>
      <button type="button" onClick={onRemove} className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline">
        Remove
      </button>
    </div>
  );
}
