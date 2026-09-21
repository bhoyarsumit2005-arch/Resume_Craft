import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Sparkles, X, Lock } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import ResumePreview from "@/components/resume/ResumePreview";
import { createSampleResume } from "@/lib/resume-types";

const sampleResume = createSampleResume();

export default function DemoPage() {
  const [bannerVisible, setBannerVisible] = useState(true);

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
              <Sparkles size={12} /> Sample Resume
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold mt-2">See what you can build with ResumeCraft</h1>
            <p className="mt-2 text-gray-500 max-w-lg mx-auto">
              Professional templates, live preview, and one-click PDF export — all for free.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/register" className="btn btn-primary btn-lg">
                Start Building <ArrowRight size={18} />
              </Link>
              <Link to="/templates" className="btn btn-secondary btn-lg">
                Browse Templates
              </Link>
            </div>
          </div>

          {/* Full-size resume preview */}
          <ResumePreview resume={sampleResume} withExportCopy={false} links={false} />
        </div>
      </main>
    </>
  );
}
