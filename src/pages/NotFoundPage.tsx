import { Link } from "react-router";
import { FileQuestion, Home, LayoutDashboard } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

export default function NotFoundPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[80vh] grid place-items-center px-6">
        <div className="text-center fade-up">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-indigo-50 text-indigo-600 grid place-items-center">
            <FileQuestion size={40} />
          </div>
          <p className="mt-6 text-sm font-semibold text-indigo-600 tracking-widest">404</p>
          <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
          <p className="mt-2 text-gray-500 max-w-sm mx-auto">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
          <div className="mt-6 flex justify-center gap-2">
            <Link to="/" className="btn btn-secondary"><Home size={16} /> Home</Link>
            <Link to="/dashboard" className="btn btn-primary"><LayoutDashboard size={16} /> Dashboard</Link>
          </div>
        </div>
      </main>
    </>
  );
}