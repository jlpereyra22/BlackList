// NO toco tu App.jsx. Acá decido si mostrar Login o tu App.
import { useAuth } from "./auth/AuthProvider";
import LoginPage from "./pages/LoginPage";
import App from "./App.jsx"; // tu app actual

export default function RootApp() {
  const { user, initializing, signOut } = useAuth();

  if (initializing) return <p>Cargando sesión...</p>;
  if (!user) return <LoginPage />;

  // Usuario logueado: muestro tu App tal cual
  return (
    <>
      {/* si querés, sacá este header */}
      <header style={{ display: "flex", gap: 12, alignItems: "center", padding: 8 }}>
        <span>Hola, {user.email}</span>
        <button onClick={signOut}>Salir</button>
      </header>
      <App />
    </>
  );
}
