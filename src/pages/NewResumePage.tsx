import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Button from "@/components/common/Button";
import { resumeService } from "@/services/resumeService";
import { createEmptyResume, createSampleResume } from "@/lib/resume-types";
import { useToast } from "@/context/ToastContext";

/** Creates a new resume (blank or sample) and redirects straight into the editor. */
export default function NewResumePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const sample = params.get("sample") === "1";
    const template = params.get("template");
    const data = sample ? createSampleResume() : createEmptyResume({ title: "My Resume" });
    if (template === "modern" || template === "classic" || template === "minimal" || template === "executive" || template === "creative")
      data.template = template;
    resumeService
      .create(data)
      .then((r) => {
        toast.success(sample ? "Sample resume created — customise it!" : "New resume created.");
        navigate(`/resumes/${r.id}/edit`, { replace: true });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not create resume"));
  }, [params, navigate, toast]);

  if (error)
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="card max-w-md mx-auto mt-16 p-8 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <Button className="mt-4" variant="secondary" onClick={() => navigate("/dashboard")}>
            Back to dashboard
          </Button>
        </div>
      </ProtectedRoute>
    );
  return (
    <ProtectedRoute>
      <Navbar />
      <LoadingSpinner label="Setting up your new resume..." />
    </ProtectedRoute>
  );
}