import { useEffect, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate(`/login?next=${encodeURIComponent(pathname)}`, { replace: true });
    }
  }, [loading, user, navigate, pathname]);

  if (loading || !user) return <LoadingSpinner label="Checking your session..." />;
  return <>{children}</>;
}