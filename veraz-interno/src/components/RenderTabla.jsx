import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import "../style/TablaDatos.css";

function formatearFechaDDMMYYYY(ts, fallback = "—") {
  if (!Number.isFinite(ts)) return fallback;
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

export default function RenderTabla({
  headers,
  rows,
  onHeaderClick,
  getRowKey,
  getCell,
}) {
  // Detecta mobile para habilitar fila clickeable y reducir columnas
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 640px)").matches
      : false
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const handler = (e) => setIsMobile(e.matches);
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, []);

  const [active, setActive] = useState(null);

  // En mobile, solo mostramos Persona y Observaciones (por key si existe; fallback 0 y 1)
  const visibleHeaderIdxs = useMemo(() => {
    if (!isMobile) return headers.map((_, i) => i);
    const personaIdx = headers.findIndex((h) => h.key === "persona");
    const obsIdx = headers.findIndex((h) => h.key === "observaciones");
    const i0 = personaIdx >= 0 ? personaIdx : 0;
    const i1 = obsIdx >= 0 ? obsIdx : 1;
    return [i0, i1].sort((a, b) => a - b);
  }, [isMobile, headers]);

  const onRowClick = (row) => {
    if (!isMobile) return; // solo en mobile abre modal
    setActive(row);
  };

  return (
    <>
      <table className="tabla">
        <thead>
          <tr>
            {headers.map((h, idx) => {
              const hiddenMobile = isMobile && !visibleHeaderIdxs.includes(idx);
              const cls = [
                h.sortable ? "sortable" : "",
                hiddenMobile ? "hide-mobile" : "",
              ]
                .join(" ")
                .trim();
              return (
                <th
                  key={h.key ?? idx}
                  onClick={() => h.sortable && onHeaderClick?.(h.key)}
                  className={cls}
                  scope="col"
                >
                  {h.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const key = getRowKey ? getRowKey(r, i) : i;
            return (
              <tr
                key={key}
                className={isMobile ? "row-mobile" : ""}
                onClick={() => onRowClick(r)}
              >
                {headers.map((h, idx) => {
                  const hiddenMobile = isMobile && !visibleHeaderIdxs.includes(idx);
                  return (
                    <td
                      key={h.key ?? idx}
                      className={hiddenMobile ? "hide-mobile" : ""}
                    >
                      {getCell ? getCell(r, h.key) : String(r[h.key] ?? "—")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal detalle fila */}
      <Modal open={!!active} onClose={() => setActive(null)} title="Detalle del registro">
        {active && (
          <div className="detalle-grid">
            <div>
              <span>Persona:</span> <b>{active.persona || "—"}</b>
            </div>
            <div>
              <span>Observaciones:</span> {active.observaciones || "—"}
            </div>
            <div>
              <span>Socios:</span>{" "}
              {Array.isArray(active.socios)
                ? active.socios.join(", ")
                : active.socios || "—"}
            </div>
            <div>
              <span>Oficina:</span> {active.oficina || "—"}
            </div>
            <div>
              <span>Fecha:</span> {formatearFechaDDMMYYYY(active.ts)}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
