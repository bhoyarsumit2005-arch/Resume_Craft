import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { LogOut, Save, User as UserIcon, Mail, Calendar } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { authService } from "@/services/authService";
import { formatDate } from "@/lib/resume-types";

function ProfileContent() {
  const { user, setUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? "");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => setName(user?.name ?? ""), [user]);

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return toast.error("Name must be at least 2 characters.");
    setSavingName(true);
    try {
      const u = await authService.updateProfile({ name: name.trim() });
      setUser(u);
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update profile.");
    } finally {
      setSavingName(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("You have been logged out.");
    navigate("/");
  };

  const initials = (user?.name ?? "U").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-6">
      <div className="card p-6 flex flex-wrap items-center gap-5">
        <div className="h-16 w-16 rounded-full grid place-items-center text-white text-xl font-bold" style={{ background: "var(--color-primary)" }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{user?.name}</h1>
          <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5"><Mail size={14} /> {user?.email}</p>
          {user && <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-1"><Calendar size={12} /> Member since {formatDate(user.createdAt)}</p>}
        </div>
        <Button variant="secondary" onClick={handleLogout} icon={<LogOut size={16} />}>
          Logout
        </Button>
      </div>

      <form onSubmit={saveName} className="card p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><UserIcon size={18} className="text-indigo-600" /> Account details</h2>
        <Input label="Full Name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Email" name="email-ro" value={user?.email ?? ""} readOnly disabled hint="Email cannot be changed." />
        <div className="flex justify-end">
          <Button type="submit" loading={savingName} icon={<Save size={16} />} disabled={name.trim() === user?.name}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-[70vh]">
        <ProfileContent />
      </main>
      <Footer />
    </ProtectedRoute>
  );
}