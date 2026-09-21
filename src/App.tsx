import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import DashboardPage from "@/pages/DashboardPage";
import TemplatesPage from "@/pages/TemplatesPage";
import ProfilePage from "@/pages/ProfilePage";
import DemoPage from "@/pages/DemoPage";
import NewResumePage from "@/pages/NewResumePage";
import EditResumePage from "@/pages/EditResumePage";
import PreviewResumePage from "@/pages/PreviewResumePage";
import NotFoundPage from "@/pages/NotFoundPage";

/** Restores scroll position on navigation and jumps to hash anchors (e.g. "/#features"). */
function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/resumes/new" element={<NewResumePage />} />
        <Route path="/resumes/:id/edit" element={<EditResumePage />} />
        <Route path="/resumes/:id/preview" element={<PreviewResumePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}