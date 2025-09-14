// src/RootApp.jsx
import { useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";

import LoginPage from "./pages/LoginPage";
import Encabezado from "./components/Encabezado";
import Pie from "./components/Pie";
import App from "./App";
import Protected from "./routes/Protected";
import AdminPage from "./admin/AdminPage";

export default function RootApp() {
  const { user, initializing } = useAuth();
  const appApiRef = useRef({ mostrarTodo: () => {}, novedades: () => {} });

  if (initializing) return <p>Cargando sesión...</p>;

  return (
    <BrowserRouter>
      {/* Usamos tu shell global .app + .contenido para que el footer quede al fondo */}
      <div className="app">
        {user && (
          <Encabezado
            ready={true}
            onMostrarTodo={() => appApiRef.current.mostrarTodo()}
            onNovedades={() => appApiRef.current.novedades()}
          />
        )}

        <main className="contenido">
          <Routes>
            <Route
              path="/login"
              element={user ? <Navigate to="/" replace /> : <LoginPage />}
            />

            <Route
              path="/"
              element={<App registerApi={(api) => Object.assign(appApiRef.current, api)} />}
            />

            <Route element={<Protected />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Pie />
      </div>
    </BrowserRouter>
  );
}
