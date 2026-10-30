import { useEffect, useRef, useState } from "react";
import { RenderTemplate } from "./ResumePreview";
import type { ResumeData } from "@/lib/resume-types";

const PAPER_WIDTH = 794;

/** Small, non-interactive rendering of the resume – used for cards and template pickers. */
export default function ResumeThumbnail({ resume, width = 220, className = "" }: { resume: ResumeData; width?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [boxWidth, setBoxWidth] = useState(width);

  // Fluid: never wider than the parent, so the same thumbnail works from
  // 320px phones up to the hero and template grids.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setBoxWidth(el.clientWidth || width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  const scale = boxWidth / PAPER_WIDTH;
  const height = boxWidth * 1.3;
  return (
    <div
      ref={ref}
      className={`overflow-hidden bg-white relative ${className}`}
      style={{ width, maxWidth: "100%", height }}
      aria-hidden="true"
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: PAPER_WIDTH, pointerEvents: "none" }}>
        <RenderTemplate resume={resume} links={false} />
      </div>
    </div>
  );
}
