import { useEffect, useRef, useState } from "react";
import "../style/Encabezado.css";

export default function Encabezado({ onMostrarTodo, onNovedades, ready = false }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

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
      <h1>Veraz Interno</h1>

      {/* Acciones desktop (sin cambios) */}
      <div className="enc-actions desktop-only">
        <button onClick={onMostrarTodo} disabled={!ready}>Mostrar todo</button>
        <button onClick={onNovedades}   disabled={!ready}>Novedades (últimos 5)</button>
      </div>

      {/* Menú hamburguesa mobile */}
      <div className="enc-menu mobile-only" ref={menuRef}>
        <button
          className="icon-btn"
          aria-haspopup="true"
          aria-expanded={open}
          aria-label="Abrir menú"
          onClick={() => setOpen((v) => !v)}
          disabled={!ready}
        >
          {/* ícono simple */}
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
          </div>
        )}
      </div>

      {!ready && <span className="sync">Sincronizando…</span>}
    </header>
  );
}
