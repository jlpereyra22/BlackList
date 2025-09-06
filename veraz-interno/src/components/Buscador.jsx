import { useEffect, useRef, useState } from "react";

export default function Buscador({ valor, onCambio, onLimpiar }) {
  const [local, setLocal] = useState(valor ?? "");
  const timeoutRef = useRef(null);

  // Sincroniza cambios externos (ej. limpiar desde App)
  useEffect(() => setLocal(valor ?? ""), [valor]);

  // Debounce controlado con ref (evita carreras al limpiar)
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onCambio(local);
    }, 300);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [local, onCambio]);

  const limpiar = () => {
    // Cancela cualquier disparo pendiente con el valor viejo
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setLocal("");
    onCambio("");      // dispara inmediato sin debounce
    onLimpiar?.();     // vuelve a 'welcome'
  };

  return (
    <section style={{ margin: "12px 0", display: "flex", gap: 8 }}>
      <input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder="Buscar persona, oficina, socio u observación…"
        style={{ flex: 1, padding: 8 }}
      />
      <button onClick={limpiar}>Limpiar</button>
    </section>
  );
}
