import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await signIn(email.trim(), pass);
    } catch (err) {
      setError(err?.code ?? err?.message ?? "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "64px auto" }}>
      <h2>Ingresar</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email}
                 onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label style={{ display: "block", marginTop: 8 }}>
          Contraseña
          <input type="password" value={pass}
                 onChange={(e) => setPass(e.target.value)} required />
        </label>
        {error && <p style={{ color: "tomato" }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ marginTop: 12 }}>
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
