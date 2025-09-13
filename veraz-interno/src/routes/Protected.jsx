import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Protected() {
  const { user, initializing } = useAuth();
  if (initializing) return null; // o spinner
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
