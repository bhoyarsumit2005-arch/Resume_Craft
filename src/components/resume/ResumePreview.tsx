import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { accentHex, fontSizePx, type ResumeData } from "@/lib/resume-types";
import ModernTemplate from "@/templates/ModernTemplate";
import ClassicTemplate from "@/templates/ClassicTemplate";
import MinimalTemplate from "@/templates/MinimalTemplate";
import ExecutiveTemplate from "@/templates/ExecutiveTemplate";
import CreativeTemplate from "@/templates/CreativeTemplate";

const PAPER_WIDTH = 794; // 210mm at 96dpi
export const EXPORT_ROOT_ID = "resume-export-root";

export function RenderTemplate({ resume, links = true }: { resume: ResumeData; links?: boolean }) {
  const props = { resume, accent: accentHex(resume.accentColor), fontSize: fontSizePx(resume.fontSize), links };
  switch (resume.template) {
    case "classic":
      return <ClassicTemplate {...props} />;
    case "minimal":
      return <MinimalTemplate {...props} />;
    case "executive":
      return <ExecutiveTemplate {...props} />;
    case "creative":
      return <CreativeTemplate {...props} />;
    default:
      return <ModernTemplate {...props} />;
  }
}

/** Full-size, off-screen copy of the resume used for PDF export and printing. */
function PrintableResume({ resume }: { resume: ResumeData }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    <div className="print-root" aria-hidden="true">
      <div id={EXPORT_ROOT_ID}>
        <RenderTemplate resume={resume} />
      </div>
    </div>,
    document.body
  );
}

interface Props {
  resume: ResumeData;
  /** Render the hidden export copy (only one per page should do this). */
  withExportCopy?: boolean;
  /** Whether to render clickable links (set false for demo/preview-only). */
  links?: boolean;
  toolbar?: ReactNode;
  className?: string;
}

export default function ResumePreview({ resume, withExportCopy = true, links = true, toolbar, className = "" }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(1123);

  useEffect(() => {
    const wrap = wrapRef.current;
    const paper = paperRef.current;
    if (!wrap || !paper) return;
    const update = () => {
      const available = wrap.clientWidth - 40; // padding
      const s = Math.min(1, available / PAPER_WIDTH);
      setScale(s);
      setHeight(paper.scrollHeight * s);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    ro.observe(paper);
    return () => ro.disconnect();
  }, [resume]);

  return (
    <div className={className}>
      {toolbar}
      <div ref={wrapRef} className="resume-paper-wrap no-print">
        <div style={{ height, width: PAPER_WIDTH * scale, margin: "0 auto", position: "relative" }}>
          <div ref={paperRef} style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: PAPER_WIDTH, position: "absolute", top: 0, left: 0 }}>
            <RenderTemplate resume={resume} links={links} />
          </div>
        </div>
      </div>
      {withExportCopy && <PrintableResume resume={resume} />}
    </div>
  );
}
