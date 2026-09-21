import { RenderTemplate } from "./ResumePreview";
import type { ResumeData } from "@/lib/resume-types";

const PAPER_WIDTH = 794;

/** Small, non-interactive rendering of the resume – used for cards and template pickers. */
export default function ResumeThumbnail({ resume, width = 220, className = "" }: { resume: ResumeData; width?: number; className?: string }) {
  const scale = width / PAPER_WIDTH;
  const height = width * 1.3;
  return (
    <div className={`overflow-hidden bg-white relative ${className}`} style={{ width, height }} aria-hidden="true">
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: PAPER_WIDTH, pointerEvents: "none" }}>
        <RenderTemplate resume={resume} links={false} />
      </div>
    </div>
  );
}
