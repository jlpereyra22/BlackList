// src/components/TablaDatos.jsx
import { useEffect, useMemo, useState } from "react";
import "../style/TablaDatos.css";

function toDateStr(v) {
  if (!v) return "—";
  if (typeof v === "object" && v?.seconds) {
    const d = new Date(v.seconds * 1000);
    return d.toISOString().split("T")[0];
  }
  if (v instanceof Date) return v.toISOString().split("T")[0];
  if (typeof v === "string") return v.trim();
  return "—";
}
const s = (v) => {
  const t = (v ?? "").toString().trim();
  return t.length ? t : "—";
};

export default function TablaDatos({
  rowsPrefetch = [],
  loading = false,
}) {
  const [rows, setRows] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [detalle, setDetalle] = useState(null); // fila seleccionada para el popup

  useEffect(() => {
    setRows(Array.isArray(rowsPrefetch) ? rowsPrefetch : []);
  }, [rowsPrefetch]);

  // detectar mobile para abrir popup sólo allí
  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia("(max-width: 640px)").matches);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const data = useMemo(() => rows, [rows]);

  const onRowClick = (r) => {
    if (isMobile) setDetalle(r);
  };

  return (
    <>
      <div className="tabla__wrap">
        <table className="tabla">
          <thead>
            <tr>
              <th>Persona</th>
              <th>Observaciones</th>
              {/* estas 3 se ocultan en mobile */}
              <th className="hide-mobile">Socios</th>
              <th className="hide-mobile">Oficina</th>
              <th className="hide-mobile">Fecha</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="empty">Cargando…</td>
              </tr>
            )}

            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">Sin resultados</td>
              </tr>
            )}

            {!loading && data.map((r) => (
              <tr
                key={r.id || `${r.persona}-${r.fecha}-${Math.random()}`}
                className={isMobile ? "row-tap" : ""}
                onClick={() => onRowClick(r)}
              >
                <td>{s(r.persona)}</td>
                <td>{s(r.observaciones)}</td>

                {/* ocultas en mobile (siguen visibles en desktop) */}
                <td className="hide-mobile">{s(r.socios)}</td>
                <td className="hide-mobile">{s(r.oficina)}</td>
                <td className="hide-mobile">{toDateStr(r.fecha)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Popup de detalle sólo si hay selección (mobile) */}
      {detalle && (
        <div className="tabla-modal__backdrop" onClick={() => setDetalle(null)}>
          <div className="tabla-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Detalle</h3>
            <div className="tabla-modal__grid">
              <span>Persona</span><strong>{s(detalle.persona)}</strong>
              <span>Observaciones</span><strong>{s(detalle.observaciones)}</strong>
              <span>Socios</span><strong>{s(detalle.socios)}</strong>
              <span>Oficina</span><strong>{s(detalle.oficina)}</strong>
              <span>Fecha</span><strong>{toDateStr(detalle.fecha)}</strong>
            </div>
            <button className="tabla-modal__btn" onClick={() => setDetalle(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </>
  );
}
