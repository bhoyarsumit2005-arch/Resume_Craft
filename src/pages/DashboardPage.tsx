import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Plus, FileText, Clock, LayoutTemplate, Sparkles, RefreshCw } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ResumeCard from "@/components/dashboard/ResumeCard";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Button from "@/components/common/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { resumeService } from "@/services/resumeService";
import { templateName, timeAgo, type Resume } from "@/lib/resume-types";

function DashboardContent() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<{ id: string; kind: "duplicate" | "delete" | "download" } | null>(null);
  const [toDelete, setToDelete] = useState<Resume | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setResumes(await resumeService.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load resumes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const last = resumes[0];
    const templates = new Set(resumes.map((r) => r.template));
    return { total: resumes.length, lastUpdated: last ? timeAgo(last.updatedAt) : "—", templates: templates.size };
  }, [resumes]);

  const duplicate = async (r: Resume) => {
    setBusy({ id: r.id, kind: "duplicate" });
    try {
      const copy = await resumeService.duplicate(r.id);
      setResumes((rs) => [copy, ...rs]);
      toast.success("Resume duplicated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not duplicate resume.");
    } finally {
      setBusy(null);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setBusy({ id: toDelete.id, kind: "delete" });
    try {
      await resumeService.remove(toDelete.id);
      setResumes((rs) => rs.filter((x) => x.id !== toDelete.id));
      toast.success("Resume deleted.");
      setToDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete resume.");
    } finally {
      setBusy(null);
    }
  };

  const rename = async (r: Resume, title: string) => {
    const prev = resumes;
    setResumes((rs) => rs.map((x) => (x.id === r.id ? { ...x, title } : x)));
    try {
      const { id: _i, userId: _u, createdAt: _c, updatedAt: _up, ...data } = r;
      void _i; void _u; void _c; void _up;
      const saved = await resumeService.update(r.id, { ...data, title });
      setResumes((rs) => rs.map((x) => (x.id === r.id ? saved : x)));
      toast.success("Resume renamed.");
    } catch (err) {
      setResumes(prev);
      toast.error(err instanceof Error ? err.message : "Could not rename resume.");
    }
  };

  const createNew = async (sample: boolean) => {
    setCreating(true);
    navigate(sample ? "/resumes/new?sample=1" : "/resumes/new");
  };

  const firstName = user?.name.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, {firstName} 👋</h1>
          <p className="text-gray-500 mt-1">Create and manage your professional resumes.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => createNew(true)} disabled={creating} icon={<Sparkles size={16} className="text-indigo-600" />}>
            Try Demo Resume
          </Button>
          <Button onClick={() => createNew(false)} loading={creating} icon={<Plus size={16} />}>
            Create New Resume
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mt-8">
        {[
          { label: "Total Resumes", value: stats.total, icon: <FileText size={20} /> },
          { label: "Last Updated", value: stats.lastUpdated, icon: <Clock size={20} /> },
          { label: "Templates Used", value: stats.templates, icon: <LayoutTemplate size={20} /> },
        ].map((s) => (
          <div key={s.label} className="card p-5 flex items-center gap-4">
            <span className="h-11 w-11 rounded-xl grid place-items-center bg-indigo-50 text-indigo-600">{s.icon}</span>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">{s.label}</p>
              <p className="text-xl font-bold mt-0.5">{loading ? "…" : s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Resumes</h2>
          {!loading && resumes.length > 0 && <span className="text-sm text-gray-500">{resumes.length} resume{resumes.length > 1 ? "s" : ""}</span>}
        </div>

        {loading ? (
          <LoadingSpinner label="Loading your resumes..." />
        ) : error ? (
          <div className="card p-10 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <Button variant="secondary" className="mt-4" onClick={load} icon={<RefreshCw size={16} />}>
              Try again
            </Button>
          </div>
        ) : resumes.length === 0 ? (
          <div className="card p-10 sm:p-16 text-center fade-up">
            <div className="mx-auto h-20 w-20 rounded-2xl bg-indigo-50 text-indigo-600 grid place-items-center">
              <FileText size={36} />
            </div>
            <h3 className="mt-6 text-xl font-bold">Your professional journey starts here.</h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">You haven&apos;t created a resume yet. Create your first resume and make your skills stand out.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button size="lg" onClick={() => createNew(false)} icon={<Plus size={18} />}>
                Create Your First Resume
              </Button>
              <Button size="lg" variant="secondary" onClick={() => createNew(true)} icon={<Sparkles size={18} className="text-indigo-600" />}>
                Start from Sample
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {resumes.map((r) => (
              <ResumeCard
                key={r.id}
                resume={r}
                busy={busy?.id === r.id ? busy.kind : null}
                onDuplicate={duplicate}
                onDelete={setToDelete}
                onDownload={(x) => navigate(`/resumes/${x.id}/preview?download=1`)}
                onRename={rename}
              />
            ))}
            <Link to="/resumes/new" className="card card-hover border-dashed grid place-items-center min-h-[320px] text-gray-500 hover:text-indigo-600">
              <span className="flex flex-col items-center gap-2">
                <span className="h-12 w-12 rounded-full bg-gray-100 grid place-items-center"><Plus size={22} /></span>
                <span className="font-medium text-sm">Create New Resume</span>
              </span>
            </Link>
          </div>
        )}
      </section>

      <DeleteConfirmationModal open={!!toDelete} itemName={toDelete?.title} loading={busy?.kind === "delete"} onCancel={() => setToDelete(null)} onConfirm={confirmDelete} />
      <p className="sr-only">{toDelete ? templateName(toDelete.template) : ""}</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-[70vh]">
        <DashboardContent />
      </main>
      <Footer />
    </ProtectedRoute>
  );
}