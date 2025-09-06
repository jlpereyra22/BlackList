export default function Encabezado({ onMostrarTodo, onNovedades, ready = false }) {
  return (
    <header
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}
    >
      <h1 style={{ margin: 0, flex: 1 }}>Veraz Interno</h1>
      <button onClick={onMostrarTodo} disabled={!ready}>Mostrar todo</button>
      <button onClick={onNovedades} disabled={!ready}>Novedades (últimos 5)</button>
      {!ready && <span style={{ fontSize: 12, opacity: 0.7 }}>Sincronizando…</span>}
    </header>
  );
}
