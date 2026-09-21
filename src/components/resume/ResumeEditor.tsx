import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Check, CloudOff, Eye, Pencil, Save, Loader2, Info } from "lucide-react";
import ResumeForm from "./ResumeForm";
import ResumePreview from "./ResumePreview";
import PDFButton from "./PDFButton";
import Button from "@/components/common/Button";
import { useToast } from "@/context/ToastContext";
import { resumeService } from "@/services/resumeService";
import { templateName, type ResumeData } from "@/lib/resume-types";

type SaveState = "saved" | "saving" | "dirty" | "error";

interface Props {
  resumeId?: string; // undefined => demo mode (localStorage only)
  initial: ResumeData;
  initialUpdatedAt?: string;
}

const DEMO_KEY = "rc_demo_resume";

export default function ResumeEditor({ resumeId, initial, initialUpdatedAt }: Props) {
  const toast = useToast();
  const isDemo = resumeId === undefined;
  const [resume, setResume] = useState<ResumeData>(initial);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [lastSaved, setLastSaved] = useState<Date | null>(initialUpdatedAt ? new Date(initialUpdatedAt) : null);
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");
  const [editingTitle, setEditingTitle] = useState(false);
  const latest = useRef(resume);
  latest.current = resume;
  const timer = useRef<number | null>(null);
  const savingRef = useRef(false);
  const pendingRef = useRef(false);
  const persistRef = useRef<(silent?: boolean) => Promise<void>>(async () => {});

  const persist = useCallback(
    async (silent = true) => {
      const data = latest.current;
      if (isDemo) {
        window.localStorage.setItem(DEMO_KEY, JSON.stringify(data));
        setSaveState("saved");
        setLastSaved(new Date());
        if (!silent) toast.success("Demo resume saved in this browser.");
        return;
      }
      if (savingRef.current) {
        pendingRef.current = true;
        return;
      }
      savingRef.current = true;
      setSaveState("saving");
      try {
        const saved = await resumeService.update(resumeId!, data);
        setLastSaved(new Date(saved.updatedAt));
        const changedMeanwhile = latest.current !== data;
        setSaveState(changedMeanwhile ? "dirty" : "saved");
        if (!silent) toast.success("Resume saved.");
        savingRef.current = false;
        if (pendingRef.current || changedMeanwhile) {
          pendingRef.current = false;
          void persistRef.current(true);
        }
      } catch (err) {
        savingRef.current = false;
        setSaveState("error");
        toast.error(err instanceof Error ? err.message : "Could not save resume.");
      }
    },
    [isDemo, resumeId, toast]
  );

  persistRef.current = persist;

  const update = useCallback(
    (patch: Partial<ResumeData>) => {
      setResume((r) => ({ ...r, ...patch }));
      setSaveState("dirty");
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => persist(true), 1500);
    },
    [persist]
  );

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (saveState === "dirty" || saveState === "saving") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [saveState]);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const saveNow = () => {
    if (timer.current) window.clearTimeout(timer.current);
    persist(false);
  };

  const status = {
    saved: { icon: <Check size={14} />, text: lastSaved ? `Saved ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Saved", cls: "text-emerald-600" },
    saving: { icon: <Loader2 size={14} className="animate-spin" />, text: "Saving...", cls: "text-gray-500" },
    dirty: { icon: <Pencil size={14} />, text: "Unsaved changes", cls: "text-amber-600" },
    error: { icon: <CloudOff size={14} />, text: "Save failed — retry", cls: "text-red-600" },
  }[saveState];

  const fileName = resume.personalInfo.fullName ? `${resume.personalInfo.fullName}_Resume` : resume.title;

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-6">
      {/* Toolbar */}
      <div className="no-print flex flex-wrap items-center gap-3 mb-5">
        <Link to={isDemo ? "/" : "/dashboard"} className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} /> {isDemo ? "Home" : "Dashboard"}
        </Link>

        <div className="flex items-center gap-2 min-w-0 flex-1">
          {editingTitle ? (
            <input
              autoFocus
              className="input max-w-xs"
              value={resume.title}
              onChange={(e) => update({ title: e.target.value })}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
              aria-label="Resume title"
              maxLength={160}
            />
          ) : (
            <button type="button" onClick={() => setEditingTitle(true)} className="group flex items-center gap-2 min-w-0 text-left" title="Rename resume">
              <h1 className="text-lg font-bold truncate">{resume.title || "Untitled Resume"}</h1>
              <Pencil size={14} className="text-gray-400 group-hover:text-indigo-600 shrink-0" />
            </button>
          )}
          <span className="badge hidden sm:inline-flex">{templateName(resume.template)}</span>
        </div>

        <span className={`hidden md:inline-flex items-center gap-1.5 text-xs font-medium ${status.cls}`} aria-live="polite">
          {status.icon} {status.text}
        </span>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="secondary" size="sm" onClick={saveNow} loading={saveState === "saving"} icon={<Save size={15} />}>
            Save
          </Button>
          <PDFButton filename={fileName} size="sm" showPrint />
        </div>
      </div>

      {isDemo && (
        <div className="no-print mb-4 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          <Info size={16} className="mt-0.5 shrink-0" />
          <p>
            <strong>Demo mode</strong> — changes are stored only in this browser.{" "}
            <Link to="/register" className="underline font-semibold">
              Create a free account
            </Link>{" "}
            to save resumes to your dashboard.
          </p>
        </div>
      )}

      {/* Mobile tabs */}
      <div className="no-print lg:hidden mb-4 grid grid-cols-2 rounded-lg border overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
        <button className={`py-2 text-sm font-semibold flex items-center justify-center gap-1.5 ${mobileTab === "form" ? "bg-indigo-600 text-white" : "bg-white text-gray-600"}`} onClick={() => setMobileTab("form")}>
          <Pencil size={14} /> Edit
        </button>
        <button className={`py-2 text-sm font-semibold flex items-center justify-center gap-1.5 ${mobileTab === "preview" ? "bg-indigo-600 text-white" : "bg-white text-gray-600"}`} onClick={() => setMobileTab("preview")}>
          <Eye size={14} /> Preview
        </button>
      </div>
      <p className={`no-print md:hidden mb-3 text-xs font-medium inline-flex items-center gap-1.5 ${status.cls}`}>
        {status.icon} {status.text}
      </p>

      <div className="editor-layout">
        <div className={`no-print ${mobileTab === "form" ? "" : "hidden lg:block"}`}>
          <ResumeForm resume={resume} onChange={update} onTemplateChange={(t) => toast.info(`Template changed to ${templateName(t)}.`)} />
        </div>
        <div className={`${mobileTab === "preview" ? "" : "hidden lg:block"} editor-preview-sticky`}>
          <ResumePreview resume={resume} />
        </div>
      </div>
    </div>
  );
}

export { DEMO_KEY };
