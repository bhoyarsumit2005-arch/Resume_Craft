import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { ArrowLeft, Pencil } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ResumePreview from "@/components/resume/ResumePreview";
import ResumeNotFound from "@/components/resume/ResumeNotFound";
import PDFButton from "@/components/resume/PDFButton";
import { useResume } from "@/hooks/useResume";
import { useToast } from "@/context/ToastContext";
import { exportResumePdf, safeFilename } from "@/utils/pdf";
import { EXPORT_ROOT_ID } from "@/components/resume/ResumePreview";
import { templateName } from "@/lib/resume-types";

function PreviewContent({ id }: { id: string }) {
  const { resume, loading, error } = useResume(id);
  const [params] = useSearchParams();
  const toast = useToast();
  const autoDone = useRef(false);
  const [autoDownloading, setAutoDownloading] = useState(params.get("download") === "1");

  // Support "Download" from the dashboard: render, then auto-export once.
  useEffect(() => {
    if (!resume || autoDone.current || params.get("download") !== "1") return;
    autoDone.current = true;
    const name = resume.personalInfo.fullName ? `${resume.personalInfo.fullName}_Resume` : resume.title;
    const t = window.setTimeout(async () => {
      try {
        await exportResumePdf(safeFilename(name), EXPORT_ROOT_ID);
        toast.success("PDF downloaded successfully.");
      } catch {
        toast.error("Could not generate PDF automatically. Use the Download button.");
      } finally {
        setAutoDownloading(false);
      }
    }, 600);
    return () => window.clearTimeout(t);
  }, [resume, params, toast]);

  if (loading) return <LoadingSpinner label="Loading preview..." />;
  if (error || !resume) return <ResumeNotFound message={error?.status === 404 ? undefined : error?.message} />;

  const fileName = resume.personalInfo.fullName ? `${resume.personalInfo.fullName}_Resume` : resume.title;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
      <div className="no-print flex flex-wrap items-center gap-3 mb-5">
        <Link to="/dashboard" className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate">{resume.title}</h1>
          <p className="text-xs text-gray-500">{templateName(resume.template)} template</p>
        </div>
        {autoDownloading && <span className="text-xs text-gray-500 inline-flex items-center gap-1"><span className="spinner" /> Preparing PDF...</span>}
        <Link to={`/resumes/${resume.id}/edit`} className="btn btn-secondary btn-sm">
          <Pencil size={15} /> Edit
        </Link>
        <PDFButton filename={fileName} size="sm" />
      </div>
      <ResumePreview resume={resume} />
    </div>
  );
}

export default function PreviewResumePage() {
  const { id = "" } = useParams();
  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen">
        <PreviewContent id={id} />
      </main>
    </ProtectedRoute>
  );
}