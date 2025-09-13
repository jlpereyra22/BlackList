import { useState } from "react";
import AddEditForm from "./AddEditForm";

export default function MyRecordsTable({ rows, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);

  if (!rows?.length) return <p>No tenés asientos creados.</p>;

  return (
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
              <td>{row.persona}</td>
              <td>{row.oficina}</td>
              <td>{row.socios}</td>
              <td>{row.fecha}</td>
              <td>{row.observaciones}</td>
              <td style={{ whiteSpace: "nowrap" }}>
                <button onClick={() => setEditingId(row.id)}>Editar</button>
                <button onClick={() => onDelete(row.id)} className="btn--danger">Borrar</button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
