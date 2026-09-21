import { Link } from "react-router";
import { FileQuestion } from "lucide-react";

export default function ResumeNotFound({ message }: { message?: string }) {
  return (
    <div className="card max-w-md mx-auto mt-16 p-10 text-center">
      <div className="mx-auto h-16 w-16 rounded-2xl bg-gray-100 text-gray-500 grid place-items-center">
        <FileQuestion size={30} />
      </div>
      <h2 className="mt-4 text-xl font-bold">Resume not found</h2>
      <p className="mt-2 text-gray-500 text-sm">{message ?? "This resume doesn't exist or you don't have access to it."}</p>
      <Link to="/dashboard" className="btn btn-primary mt-6">
        Back to dashboard
      </Link>
    </div>
  );
}
