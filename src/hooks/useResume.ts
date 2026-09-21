import { useEffect, useState } from "react";
import { resumeService } from "@/services/resumeService";
import { ApiRequestError } from "@/services/api";
import type { Resume } from "@/lib/resume-types";

/** Loads one resume owned by the current user; exposes 404 vs. other errors. */
export function useResume(id: string) {
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    resumeService
      .get(id)
      .then((r) => !cancelled && setResume(r))
      .catch((err) => {
        if (cancelled) return;
        setError({ status: err instanceof ApiRequestError ? err.status : 500, message: err instanceof Error ? err.message : "Failed to load resume" });
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { resume, loading, error };
}
