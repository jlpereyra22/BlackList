// src/App.jsx
import './style/Index.css';
import Buscador from './components/Buscador';
import TablaDatos from './components/TablaDatos';
import { useEffect, useMemo, useRef, useState } from 'react';
import { subscribeAll, create, update, remove } from './queries/Observados';
import { useAuth } from './auth/AuthProvider';

export default function App({ registerApi }) {
  const { user } = useAuth();
  const [busqueda, setBusqueda] = useState("");
  const [vista, setVista] = useState("welcome"); // welcome | all | news | search

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeAll((data) => {
      setRows(Array.isArray(data) ? data : []);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      (r.persona || "").toLowerCase().includes(q) ||
      (r.oficina || "").toLowerCase().includes(q) ||
      (r.socios || "").toLowerCase().includes(q) ||
      (r.observaciones || "").toLowerCase().includes(q)
    );
  }, [rows, busqueda]);

  async function handleCrear(formData) {
    try { await create(formData, { owner: user?.uid || null }); }
    catch (e) { console.error(e); setError(e?.message || "create_error"); }
  }
  async function handleEditar(id, patch) {
    try { await update(id, patch); }
    catch (e) { console.error(e); setError(e?.message || "update_error"); }
  }
  async function handleEliminar(id) {
    try { await remove(id); }
    catch (e) { console.error(e); setError(e?.message || "remove_error"); }
  }

  const onBuscar  = (valor) => { setBusqueda(valor); if (valor.trim()) setVista("search"); };
  const onLimpiar = () => { setBusqueda(""); setVista("welcome"); };

  const api = useMemo(() => ({
    mostrarTodo: () => setVista("all"),
    novedades:   () => setVista("news"),
  }), []);
  useEffect(() => { registerApi?.(api); }, [registerApi, api]);

  const debeMostrarTabla = vista !== "welcome";

  return (
    <>
      <Buscador valor={busqueda} onCambio={onBuscar} onLimpiar={onLimpiar} />

      {!debeMostrarTabla ? (
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <h1 style={{ fontSize: '3rem', margin: 0 }}>Bienvenidos</h1>
          {loading && <p style={{ opacity: 0.7 }}>Sincronizando datos…</p>}
          {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
        </div>
      ) : (
        <TablaDatos
          rowsPrefetch={filtered}
          busqueda={vista === "search" ? busqueda : ""}
          modo={vista === "news" ? "news" : "all"}
          onCrear={handleCrear}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
          loading={loading}
        />
      )}
    </>
  );
}
