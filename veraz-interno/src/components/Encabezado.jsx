import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import "../style/Encabezado.css";

export default function Encabezado({ onMostrarTodo, onNovedades, ready = false }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const { user, signOut } = useAuth();

  // Cierra dropdown si clic fuera
  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const callAndClose = (fn) => () => { fn?.(); setOpen(false); };

  return (
    <header className="encabezado">
      <h1>
        <Link to="/" className="encabezado__logo">Veraz Interno</Link>
      </h1>

      {/* Acciones + usuario (desktop) */}
      <div className="enc-right desktop-only">
        <div className="enc-actions">
          <button onClick={onMostrarTodo} disabled={!ready}>Mostrar todo</button>
          <button onClick={onNovedades}   disabled={!ready}>Novedades (últimos 5)</button>
          <button
            onClick={() => navigate("/admin")}
            disabled={!user}
            title={!user ? "Inicia sesión para administrar" : "Ir al panel de administración"}
          >
            Administrar
          </button>
        </div>

        <div className="usergroup">
          {user?.email && (
            <span className="userchip" title={user.email}>
              {user.email}
            </span>
          )}
          <button className="btn btn--danger" onClick={signOut}>Salir</button>
        </div>
      </div>

      {/* Menú hamburguesa (mobile) */}
      <div className="enc-menu mobile-only" ref={menuRef}>
        <button
          className="icon-btn"
          aria-haspopup="true"
          aria-expanded={open}
          aria-label="Abrir menú"
          onClick={() => setOpen(v => !v)}
          disabled={!ready && !user}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6"  x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {open && (
          <div className="dropdown" role="menu">
            <button role="menuitem" onClick={callAndClose(onMostrarTodo)}>Mostrar todo</button>
            <button role="menuitem" onClick={callAndClose(onNovedades)}>Novedades (últimos 5)</button>
            <button
              role="menuitem"
              onClick={callAndClose(() => navigate("/admin"))}
              disabled={!user}
              title={!user ? "Inicia sesión para administrar" : "Ir al panel de administración"}
            >
              Administrar
            </button>
            <hr className="dropdown__sep" />
            <button role="menuitem" className="dropdown__danger" onClick={() => { setOpen(false); signOut(); }}>
              Salir
            </button>
          </div>
        )}
      </div>

      {!ready && <span className="sync">Sincronizando…</span>}
    </header>
  );
}
