/** Generates an A4, multi-page PDF from the hidden full-size resume DOM node. */

const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;

interface Block {
  top: number;
  bottom: number;
}

function collectBlocks(root: HTMLElement): Block[] {
  const rootTop = root.getBoundingClientRect().top;
  const nodes = root.querySelectorAll<HTMLElement>(".avoid-break, section, h2, li, p");
  const blocks: Block[] = [];
  nodes.forEach((n) => {
    const r = n.getBoundingClientRect();
    if (r.height > 0) blocks.push({ top: r.top - rootTop, bottom: r.bottom - rootTop });
  });
  return blocks;
}

/** Splits the paper into page ranges, moving breaks up to avoid cutting through blocks. */
function computePages(totalHeight: number, pageHeight: number, blocks: Block[]): [number, number][] {
  const pages: [number, number][] = [];
  let y = 0;
  let guard = 0;
  while (y < totalHeight - 4 && guard++ < 50) {
    let end = y + pageHeight;
    if (end >= totalHeight) {
      end = totalHeight;
    } else {
      const straddling = blocks.filter((b) => b.top < end && b.bottom > end && b.bottom - b.top < pageHeight * 0.9);
      if (straddling.length) {
        // choose the outermost straddling block that still leaves the page reasonably full
        const candidates = straddling.map((b) => b.top).filter((t) => t > y + pageHeight * 0.45);
        if (candidates.length) end = Math.min(...candidates) - 2;
      }
    }
    pages.push([y, end]);
    y = end;
  }
  return pages;
}

export async function exportResumePdf(filename: string, rootId: string): Promise<void> {
  const root = document.getElementById(rootId);
  const paper = root?.querySelector<HTMLElement>(".resume-paper");
  if (!root || !paper) throw new Error("Resume preview is not ready yet.");

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas-pro"), import("jspdf")]);

  const width = paper.offsetWidth;
  const totalHeight = paper.scrollHeight;
  const pageHeight = width * (A4_HEIGHT_PT / A4_WIDTH_PT);
  const blocks = collectBlocks(paper);
  const scale = 2;

  const canvas = await html2canvas(paper, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
    x: 0,
    y: 0,
    scrollX: 0,
    scrollY: 0,
    width,
    height: totalHeight,
    windowWidth: Math.max(1280, window.innerWidth),
    onclone: (_doc, el) => {
      const wrapper = el.closest<HTMLElement>(".print-root");
      if (wrapper) {
        wrapper.style.left = "0";
        wrapper.style.top = "0";
        wrapper.style.position = "absolute";
      }
    },
  });

  const pages = computePages(totalHeight, pageHeight, blocks);
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4", compress: true });

  pages.forEach(([start, end], index) => {
    const sliceHeight = end - start;
    if (sliceHeight < 8) return; // skip near-empty trailing page
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = Math.round(pageHeight * scale);
    const ctx = pageCanvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    ctx.drawImage(
      canvas,
      0,
      Math.round(start * scale),
      canvas.width,
      Math.round(sliceHeight * scale),
      0,
      0,
      canvas.width,
      Math.round(sliceHeight * scale)
    );
    const img = pageCanvas.toDataURL("image/jpeg", 0.95);
    if (index > 0) pdf.addPage();
    pdf.addImage(img, "JPEG", 0, 0, A4_WIDTH_PT, A4_HEIGHT_PT, undefined, "FAST");
  });

  pdf.save(filename);
}

export function safeFilename(name: string): string {
  const base = name.trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "_") || "Resume";
  return `${base}.pdf`;
}
