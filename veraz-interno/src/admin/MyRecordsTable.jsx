import { useState } from "react";
import AddEditForm from "./AddEditForm";

export default function MyRecordsTable({ rows, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);

  if (!rows?.length) return <div className="empty">No tenés asientos creados.</div>;

  return (
    <>
      {/* ===== Desktop / tablet: tabla ===== */}
      <div style={{ overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Persona</th>
              <th>Oficina</th>
              <th>Socios</th>
              <th>Fecha</th>
              <th>Observaciones</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isEditing = editingId === row.id;

              if (isEditing) {
                return (
                  <tr key={row.id}>
                    <td colSpan={6}>
                      <AddEditForm
                        initial={{
                          persona: row.persona ?? "",
                          oficina: row.oficina ?? "",
                          socios: row.socios ?? "",
                          observaciones: row.observaciones ?? "",
                          fecha: row.fecha ?? "",
                        }}
                        submitLabel="Actualizar"
                        onCancel={() => setEditingId(null)}
                        onSubmit={async (patch) => {
                          await onUpdate(row.id, patch);
                          setEditingId(null);
                        }}
                      />
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={row.id}>
                  <td data-label="Persona">{row.persona}</td>
                  <td data-label="Oficina">{row.oficina}</td>
                  <td data-label="Socios">{row.socios}</td>
                  <td data-label="Fecha">{row.fecha}</td>
                  <td data-label="Observaciones">{row.observaciones}</td>
                  <td data-label="Acciones" className="cell-actions">
                    <button className="btn btn--sm" onClick={() => setEditingId(row.id)}>Editar</button>
                    <button className="btn btn--sm btn--danger" onClick={() => onDelete(row.id)}>Borrar</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ===== Mobile: acordeón ===== */}
      <div className="acc-list">
        {rows.map((row) => {
          const isEditing = editingId === row.id;

          return (
            <details className="acc" key={`acc-${row.id}`}>
              <summary>
                <span>Persona — {row.persona || "(sin nombre)"}</span>
                <span className="acc__chev">›</span>
              </summary>

              <div className="acc__body">
                {isEditing ? (
                  <AddEditForm
                    initial={{
                      persona: row.persona ?? "",
                      oficina: row.oficina ?? "",
                      socios: row.socios ?? "",
                      observaciones: row.observaciones ?? "",
                      fecha: row.fecha ?? "",
                    }}
                    submitLabel="Actualizar"
                    onCancel={() => setEditingId(null)}
                    onSubmit={async (patch) => {
                      await onUpdate(row.id, patch);
                      setEditingId(null);
                    }}
                  />
                ) : (
                  <>
                    <div className="acc__grid">
                      <div className="acc__item">
                        <b>Oficina</b>
                        <div>{row.oficina || "-"}</div>
                      </div>
                      <div className="acc__item">
                        <b>Socios</b>
                        <div>{row.socios || "-"}</div>
                      </div>
                      <div className="acc__item">
                        <b>Fecha</b>
                        <div>{row.fecha || "-"}</div>
                      </div>
                      <div className="acc__item">
                        <b>Observaciones</b>
                        <div>{row.observaciones || "-"}</div>
                      </div>
                    </div>

                    <div className="acc__actions">
                      <button className="btn btn--sm" onClick={() => setEditingId(row.id)}>Editar</button>
                      <button className="btn btn--sm btn--danger" onClick={() => onDelete(row.id)}>Borrar</button>
                    </div>
                  </>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </>
  );
}
