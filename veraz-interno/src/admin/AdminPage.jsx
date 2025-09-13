import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { create, update, remove, subscribeMine } from "../queries/Observados";
import AddEditForm from "./AddEditForm";
import MyRecordsTable from "./MyRecordsTable";

export default function AdminPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsub = subscribeMine(user.uid, (data) => {
      setRows(Array.isArray(data) ? data : []);
      setLoading(false);
    });
    return () => unsub && unsub();
  }, [user]);

  // alta
  async function handleCreate(values) {
    setError("");
    try {
      await create(values, { owner: user.uid });
    } catch (e) {
      setError(e?.message || "Error al crear");
    }
  }

  // edición
  async function handleUpdate(id, patch) {
    setError("");
    try {
      await update(id, patch);
    } catch (e) {
      setError(e?.message || "Error al actualizar");
    }
  }

  // borrado
  async function handleDelete(id) {
    setError("");
    try {
      await remove(id);
    } catch (e) {
      setError(e?.message || "Error al eliminar");
    }
  }

  return (
    <main className="admin__page">
      <section className="admin__header">
        <h2>Panel de administración</h2>
        <p>Solo ves y editás **tus** asientos.</p>
      </section>

      <section className="admin__form">
        <h3>Agregar asiento</h3>
        <AddEditForm onSubmit={handleCreate} submitLabel="Agregar" />
      </section>

      <section className="admin__table">
        <h3>Mis asientos</h3>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
        {loading ? (
          <p>cargando…</p>
        ) : (
          <MyRecordsTable rows={rows} onUpdate={handleUpdate} onDelete={handleDelete} />
        )}
      </section>
    </main>
  );
}
