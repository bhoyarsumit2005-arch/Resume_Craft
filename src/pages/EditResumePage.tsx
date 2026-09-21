import { useParams } from "react-router";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ResumeEditor from "@/components/resume/ResumeEditor";
import ResumeNotFound from "@/components/resume/ResumeNotFound";
import { useResume } from "@/hooks/useResume";

function EditContent({ id }: { id: string }) {
  const { resume, loading, error } = useResume(id);
  if (loading) return <LoadingSpinner label="Loading resume..." />;
  if (error || !resume) return <ResumeNotFound message={error?.status === 404 ? undefined : error?.message} />;
  const { id: rid, userId: _u, createdAt: _c, updatedAt, ...data } = resume;
  void _u; void _c;
  return <ResumeEditor resumeId={rid} initial={data} initialUpdatedAt={updatedAt} />;
}

export default function EditResumePage() {
  const { id = "" } = useParams();
  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen">
        <EditContent id={id} />
      </main>
    </ProtectedRoute>
  );
}