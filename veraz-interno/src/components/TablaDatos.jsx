// src/components/TablaDatos.jsx
import { useEffect, useMemo, useState } from "react";

function toDateStr(v) {
  if (!v) return "—";
  // Firestore Timestamp { seconds }
  if (typeof v === "object" && v?.seconds) {
    const d = new Date(v.seconds * 1000);
    return d.toISOString().split("T")[0];
  }
  // Date
  if (v instanceof Date) return v.toISOString().split("T")[0];
  // String aceptada
  if (typeof v === "string") {
    const s = v.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    return s; // deja lo que venga
  }
  return "—";
}

function s(v) {
  const t = (v ?? "").toString().trim();
  return t.length ? t : "—";
}

export default function TablaDatos({
  rowsPrefetch = [],
  busqueda = "",
  modo = "all",          // "all" | "news"
  onCrear,
  onEditar,
  onEliminar,
  loading = false,
}) {
  const [rows, setRows] = useState([]);

  // ✅ Mantener sincronizado con la prop
  useEffect(() => {
    setRows(Array.isArray(rowsPrefetch) ? rowsPrefetch : []);
  }, [rowsPrefetch]);

  const data = useMemo(() => rows, [rows]);

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="table">
        <thead>
          <tr>
            <th>Persona</th>
            <th>Observaciones</th>
            <th>Socios</th>
            <th>Oficina</th>
            <th>Fecha</th>
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
          {!loading && data.map(r => (
            <tr key={r.id || `${r.persona}-${r.fecha}-${Math.random()}`}>
              <td data-label="Persona">{s(r.persona)}</td>
              <td data-label="Observaciones">{s(r.observaciones)}</td>
              <td data-label="Socios">{s(r.socios)}</td>
              <td data-label="Oficina">{s(r.oficina)}</td>
              <td data-label="Fecha">{toDateStr(r.fecha)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
