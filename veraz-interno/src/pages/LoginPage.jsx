import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import "../style/LoginPage.css"; // <- estilos del componente

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); 
    setLoading(true);
    try {
      await signIn(email.trim(), pass);
    } catch (err) {
      setError(err?.code ?? err?.message ?? "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login__page">
      <section className="login__card" role="region" aria-labelledby="loginTitle">
        <h2 id="loginTitle" className="login__title">Ingresar</h2>

        <form className="login__form" onSubmit={handleSubmit} noValidate>
          <label className="login__label">
            <span>Correo electrónico</span>
            <input
              className="login__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="tu@email.com"
            />
          </label>

          <label className="login__label">
            <span>Contraseña</span>
            <input
              className="login__input"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>

          {error && <p className="login__error">{error}</p>}

          <button
            className="login__btn"
            type="submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
