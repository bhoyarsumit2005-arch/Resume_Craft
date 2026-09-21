import { useState } from "react";
import { Link } from "react-router";
import { Pencil, Eye, Copy, Download, Trash2, MoreVertical, Clock, Calendar, Loader2 } from "lucide-react";
import ResumeThumbnail from "@/components/resume/ResumeThumbnail";
import { formatDate, templateName, timeAgo, type Resume } from "@/lib/resume-types";

interface Props {
  resume: Resume;
  busy?: "duplicate" | "delete" | "download" | null;
  onDuplicate: (r: Resume) => void;
  onDelete: (r: Resume) => void;
  onDownload: (r: Resume) => void;
  onRename: (r: Resume, title: string) => void;
}

export default function ResumeCard({ resume, busy, onDuplicate, onDelete, onDownload, onRename }: Props) {
  const [menu, setMenu] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(resume.title);

  const commitRename = () => {
    setRenaming(false);
    const t = title.trim();
    if (t && t !== resume.title) onRename(resume, t);
    else setTitle(resume.title);
  };

  return (
    <article className="card card-hover overflow-hidden flex flex-col fade-up">
      <Link to={`/resumes/${resume.id}/edit`} className="block bg-gray-100 border-b relative group" style={{ borderColor: "var(--color-border)" }} aria-label={`Edit ${resume.title}`}>
        <div className="mx-auto w-full flex justify-center pt-4 px-4 overflow-hidden" style={{ height: 210 }}>
          <div className="shadow-md rounded-t-sm overflow-hidden">
            <ResumeThumbnail resume={resume} width={200} />
          </div>
        </div>
        <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/10 transition-colors grid place-items-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity btn btn-primary btn-sm">
            <Pencil size={14} /> Open Editor
          </span>
        </div>
      </Link>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {renaming ? (
              <input
                autoFocus
                className="input py-1 text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename();
                  if (e.key === "Escape") {
                    setTitle(resume.title);
                    setRenaming(false);
                  }
                }}
                aria-label="Resume title"
              />
            ) : (
              <button type="button" onDoubleClick={() => setRenaming(true)} onClick={() => setRenaming(true)} className="text-left w-full" title="Click to rename">
                <h3 className="font-semibold truncate hover:text-indigo-600 transition-colors">{resume.title}</h3>
              </button>
            )}
            <span className="badge mt-1">{templateName(resume.template)}</span>
          </div>
          <div className="relative">
            <button className="btn btn-ghost btn-icon" onClick={() => setMenu((m) => !m)} aria-label="More actions" aria-expanded={menu}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : <MoreVertical size={16} />}
            </button>
            {menu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} aria-hidden />
                <div className="absolute right-0 top-9 z-20 w-44 card p-1 shadow-lg" role="menu">
                  <Link to={`/resumes/${resume.id}/edit`} className="menu-item" role="menuitem"><Pencil size={14} /> Edit</Link>
                  <Link to={`/resumes/${resume.id}/preview`} className="menu-item" role="menuitem"><Eye size={14} /> Preview</Link>
                  <button className="menu-item" role="menuitem" onClick={() => { setMenu(false); setRenaming(true); }}><Pencil size={14} /> Rename</button>
                  <button className="menu-item" role="menuitem" onClick={() => { setMenu(false); onDuplicate(resume); }}><Copy size={14} /> Duplicate</button>
                  <button className="menu-item" role="menuitem" onClick={() => { setMenu(false); onDownload(resume); }}><Download size={14} /> Download PDF</button>
                  <button className="menu-item text-red-600" role="menuitem" onClick={() => { setMenu(false); onDelete(resume); }}><Trash2 size={14} /> Delete</button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p className="flex items-center gap-1.5"><Clock size={12} /> Updated {timeAgo(resume.updatedAt)}</p>
          <p className="flex items-center gap-1.5"><Calendar size={12} /> Created {formatDate(resume.createdAt)}</p>
        </div>

        <div className="mt-auto grid grid-cols-5 gap-1 pt-2 border-t" style={{ borderColor: "var(--color-border)" }}>
          <Link to={`/resumes/${resume.id}/edit`} className="action" title="Edit"><Pencil size={15} /><span>Edit</span></Link>
          <Link to={`/resumes/${resume.id}/preview`} className="action" title="Preview"><Eye size={15} /><span>Preview</span></Link>
          <button className="action" title="Duplicate" onClick={() => onDuplicate(resume)} disabled={!!busy}><Copy size={15} /><span>Copy</span></button>
          <button className="action" title="Download PDF" onClick={() => onDownload(resume)} disabled={!!busy}><Download size={15} /><span>PDF</span></button>
          <button className="action text-red-600 hover:bg-red-50" title="Delete" onClick={() => onDelete(resume)} disabled={!!busy}><Trash2 size={15} /><span>Delete</span></button>
        </div>
      </div>
    </article>
  );
}
