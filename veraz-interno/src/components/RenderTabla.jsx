import React from "react";
import "../style/TablaDatos.css";

/**
 * RenderTabla
 * - Renderiza SOLO la tabla (thead/tbody) y delega la lógica al padre.
 * - Props:
 *   - headers: [{ key, label, sortable }]
 *   - rows: array de filas ya filtradas/paginadas
 *   - onHeaderClick: (key) => void
 *   - isNews: boolean (para desactivar sort visual si hace falta)
 *   - getRowKey: (row, index) => string
 *   - getCell: (row, key) => ReactNode
 */
export default function RenderTabla({
  headers,
  rows,
  onHeaderClick,
  isNews = false,
  getRowKey,
  getCell,
}) {
  return (
    <table className="tabla">
      <thead>
        <tr>
          {headers.map((c) => {
            const canSort = c.sortable && !isNews;
            return (
              <th
                key={c.key}
                className={canSort ? "sortable" : undefined}
                onClick={() => (canSort ? onHeaderClick?.(c.key) : null)}
                title={canSort ? "Ordenar" : ""}
              >
                {c.label}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={getRowKey ? getRowKey(r, i) : i}>
            {headers.map((h) => (
              <td key={h.key}>
                {getCell ? getCell(r, h.key) : (r?.[h.key] ?? "—")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
