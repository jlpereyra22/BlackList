// src/RootApp.jsx
import { useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";

import LoginPage from "./pages/LoginPage";
import Encabezado from "./components/Encabezado";
import App from "./App";
import Protected from "./routes/Protected";
import AdminPage from "./admin/AdminPage";

export default function RootApp() {
  const { user, initializing } = useAuth();
  const appApiRef = useRef({ mostrarTodo: () => {}, novedades: () => {} });

  if (initializing) return <p>Cargando sesión...</p>;

  return (
    <BrowserRouter>
      {/* Header fijo en todas las vistas (si querés mostrarlo sólo logueado, lo movemos adentro) */}
      {user && (
        <Encabezado
          ready={true}
          onMostrarTodo={() => appApiRef.current.mostrarTodo()}
          onNovedades={() => appApiRef.current.novedades()}
        />
      )}

      <Routes>
        {/* Login público */}
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />

        {/* Público principal (requiere login para ver datos? hoy tu App ya chequea user internamente) */}
        <Route path="/" element={<App registerApi={(api) => Object.assign(appApiRef.current, api)} />} />

        {/* /admin protegido */}
        <Route element={<Protected />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
