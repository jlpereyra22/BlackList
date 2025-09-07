// src/RootApp.jsx
import { useRef } from "react";
import { useAuth } from "./auth/AuthProvider";
import LoginPage from "./pages/LoginPage";
import Encabezado from "./components/Encabezado";
import App from "./App";

export default function RootApp() {
  const { user, initializing } = useAuth();

  // Puente: acá se registran los handlers reales que vive en App
  const appApiRef = useRef({ mostrarTodo: () => {}, novedades: () => {} });

  if (initializing) return <p>Cargando sesión...</p>;
  if (!user) return <LoginPage />;

  return (
    <>
      <Encabezado
        ready={true}
        onMostrarTodo={() => appApiRef.current.mostrarTodo()}
        onNovedades={() => appApiRef.current.novedades()}
      />
      <App registerApi={(api) => Object.assign(appApiRef.current, api)} />
    </>
  );
}
