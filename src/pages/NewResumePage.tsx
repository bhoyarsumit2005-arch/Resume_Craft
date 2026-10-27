import { useState } from "react";
import { useSearchParams } from "react-router";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import ResumeEditor from "@/components/resume/ResumeEditor";
import { createEmptyResume, createSampleResume, type ResumeData, type TemplateId } from "@/lib/resume-types";

const TEMPLATE_IDS: TemplateId[] = ["modern", "classic", "minimal", "executive", "creative", "timeline"];

/**
 * Opens a blank (or sample) resume in the editor.
 * Nothing is written to the database here — the resume is created on the first
 * edit or an explicit Save, so abandoned drafts never clutter the dashboard.
 */
export default function NewResumePage() {
  const [params] = useSearchParams();
  const [initial] = useState<ResumeData>(() => {
    const data = params.get("sample") === "1" ? createSampleResume() : createEmptyResume({ title: "My Resume" });
    const template = params.get("template");
    if (template && (TEMPLATE_IDS as string[]).includes(template)) data.template = template as TemplateId;
    return data;
  });

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen">
        <ResumeEditor initial={initial} draft />
      </main>
    </ProtectedRoute>
  );
}
