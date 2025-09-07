import { useEffect, useRef, useState } from "react";
import "../style/Buscador.css";

export default function Buscador({ valor, onCambio, onLimpiar }) {
  const [local, setLocal] = useState(valor ?? "");
  const timeoutRef = useRef(null);

  useEffect(() => setLocal(valor ?? ""), [valor]);

  // debounce robusto
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => onCambio(local), 300);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [local, onCambio]);

  const limpiar = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setLocal("");
    onCambio("");      // sin debounce
    onLimpiar?.();     // vuelve a 'welcome'
  };

  return (
    <section className="buscador">
      <input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder="Buscar persona, oficina, socio u observación…"
        aria-label="Buscar"
      />
      <button onClick={limpiar}>Limpiar</button>
    </section>
  );
}
