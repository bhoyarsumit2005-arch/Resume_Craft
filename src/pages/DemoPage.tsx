import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, ExternalLink, Eye, FileText, Sparkles, X, Lock } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import ResumePreview from "@/components/resume/ResumePreview";
import PDFButton from "@/components/resume/PDFButton";
import { createSampleResume, SAMPLE_RESUME_PDF } from "@/lib/resume-types";

const sampleResume = createSampleResume();

export default function DemoPage() {
  const [bannerVisible, setBannerVisible] = useState(true);
  const [view, setView] = useState<"preview" | "pdf">("preview");

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Interactive CTA banner */}
        {bannerVisible && (
          <div className="no-print bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white text-center py-3 px-4 relative animate-[slideDown_0.3s_ease]">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <Lock size={14} />
                This is a preview
              </span>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm px-4 py-1.5 rounded-full transition-all hover:scale-105 shadow-sm"
              >
                Create a free account <ArrowRight size={14} />
              </Link>
              <span className="text-sm font-medium">to build your own resume</span>
            </div>
            <button
              onClick={() => setBannerVisible(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              aria-label="Dismiss banner"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
          <div className="no-print text-center mb-8">
            <span className="badge mb-3 inline-flex items-center gap-1.5">
              <Sparkles size={12} /> Demo Resume · Sumit Bhoyar
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold mt-2">A real resume, recreated with ResumeCraft</h1>
            <p className="mt-2 text-gray-500 max-w-lg mx-auto">
              Explore the live preview below, or open the original PDF — then build your own with the same templates.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/register" className="btn btn-primary btn-lg">
                Start Building <ArrowRight size={18} />
              </Link>
              <a
                href={SAMPLE_RESUME_PDF}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-lg"
              >
                <ExternalLink size={18} /> View Original PDF
              </a>
              <Link to="/templates" className="btn btn-secondary btn-lg">
                Browse Templates
              </Link>
            </div>
          </div>

          {/* Full-size live resume preview / original PDF */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="inline-flex items-center rounded-full border border-gray-200 bg-white p-1 shadow-sm" role="tablist" aria-label="Resume view">
              <button
                type="button"
                role="tab"
                aria-selected={view === "preview"}
                onClick={() => setView("preview")}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  view === "preview" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Eye size={14} /> Live Preview
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={view === "pdf"}
                onClick={() => setView("pdf")}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  view === "pdf" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FileText size={14} /> Original PDF
              </button>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {view === "preview" ? "Live preview" : "Sumit-Bhoyar-Resume.pdf"}
            </span>
            <PDFButton
              filename="Sumit_Bhoyar_Resume"
              resume={sampleResume}
              size="sm"
              variant="secondary"
              showPrint={false}
            />
          </div>
          {view === "preview" ? (
            <ResumePreview resume={sampleResume} withExportCopy={false} links={false} />
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <iframe
                src={`${SAMPLE_RESUME_PDF}#view=FitH`}
                title="Sumit Bhoyar resume PDF preview"
                className="h-[80vh] min-h-[520px] w-full"
              />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
