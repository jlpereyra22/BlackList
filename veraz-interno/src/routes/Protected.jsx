// src/routes/Protected.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Protected({ redirectTo = "/login" }) {
  const { user, initializing } = useAuth();
  const loc = useLocation();

  // Mientras Firebase recupera sesión, no navegamos (evita parpadeo)
  if (initializing) return null; // o un spinner

  // Sin sesión → al login (guardamos from por si querés volver luego)
  if (!user) return <Navigate to={redirectTo} replace state={{ from: loc }} />;

  // Con sesión → renderiza lo que esté dentro
  return <Outlet />;
}
