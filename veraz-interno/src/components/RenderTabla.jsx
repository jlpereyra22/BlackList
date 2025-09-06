import React from "react";

/**
 * RenderTabla
 * - Renderiza SOLO la tabla (thead/tbody) y delega la lógica al padre.
 * - Props:
 *   - headers: [{ key, label, sortable }]
 *   - rows: array de filas ya filtradas/paginadas
 *   - onHeaderClick: (key) => void  (para ordenar)
 *   - isNews: boolean (para desactivar sort visual si hace falta)
 *   - getRowKey: (row, index) => string
 *   - getCell: (row, key) => ReactNode  (cómo renderizar cada celda por columna)
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
    <table
      border="1"
      cellPadding="6"
      cellSpacing="0"
      style={{ width: "100%" }}
    >
      <thead>
        <tr>
          {headers.map((c) => (
            <th
              key={c.key}
              onClick={() => (c.sortable && !isNews ? onHeaderClick?.(c.key) : null)}
              style={{ cursor: c.sortable && !isNews ? "pointer" : "default" }}
              title={c.sortable && !isNews ? "Ordenar" : ""}
            >
              {c.label}
              {c.sortable ? " ⮁" : ""}
            </th>
          ))}
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
