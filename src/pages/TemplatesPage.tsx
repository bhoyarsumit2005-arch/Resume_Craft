import { Link, useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TemplateCard from "@/components/resume/TemplateCard";
import { useAuth } from "@/context/AuthContext";
import { TEMPLATES, type TemplateId } from "@/lib/resume-types";

export default function TemplatesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const pickTemplate = (id: TemplateId) => {
    navigate(user ? `/resumes/new?sample=1&template=${id}` : `/register?template=${id}`);
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-12 min-h-[70vh]">
        <div className="text-center max-w-2xl mx-auto">
          <span className="badge">Templates</span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold">Professional templates for every career stage</h1>
          <p className="mt-3 text-gray-500">All templates share the same data — switch between them anytime without losing a single word.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 mt-12">
          {TEMPLATES.map((t) => (
            <div key={t.id} className="flex flex-col gap-3">
              <TemplateCard id={t.id} name={t.name} description={t.description} tags={t.tags} width={260} />
              <button onClick={() => pickTemplate(t.id)} className="btn btn-primary w-full">
                Use {t.name} template <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 card p-8 text-center">
          <h2 className="text-xl font-bold">Not sure which one to pick?</h2>
          <p className="text-gray-500 mt-2">Start with Modern — you can switch templates with one click inside the editor.</p>
          <Link to={user ? "/resumes/new" : "/register"} className="btn btn-dark mt-5">
            {user ? "Create a Resume" : "Get Started Free"}
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}