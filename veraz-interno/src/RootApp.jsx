// src/RootApp.jsx
import { useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";

import LoginPage from "./pages/LoginPage";
import Encabezado from "./components/Encabezado";
import Pie from "./components/Pie";
import App from "./App";
import Protected from "./routes/Protected";
import AdminPage from "./admin/AdminPage";

function Shell({ appApiRef }) {
  // Este layout se muestra solo para usuarios logueados (debajo de <Protected/>)
  return (
    <div className="app">
      <Encabezado
        ready={true}
        onMostrarTodo={() => appApiRef.current.mostrarTodo()}
        onNovedades={() => appApiRef.current.novedades()}
      />
      <main className="contenido">
        <Outlet />
      </main>
      <Pie />
    </div>
  );
}

export default function RootApp() {
  const { user, initializing } = useAuth();
  const appApiRef = useRef({ mostrarTodo: () => {}, novedades: () => {} });

  if (initializing) return <p>Cargando sesión...</p>;

  return (
    <BrowserRouter>
      <Routes>
        {/* Login: si ya está logueado, redirige a "/" */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />

        {/* Zona protegida: requiere sesión */}
        <Route element={<Protected />}>
          <Route element={<Shell appApiRef={appApiRef} />}>
            <Route
              path="/"
              element={<App registerApi={(api) => Object.assign(appApiRef.current, api)} />}
            />
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
