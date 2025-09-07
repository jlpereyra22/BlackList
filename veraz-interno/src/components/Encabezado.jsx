import "../style/Encabezado.css";

export default function Encabezado({ onMostrarTodo, onNovedades, ready = false }) {
  return (
    <header className="encabezado">
      <h1>Veraz Interno</h1>

      <button onClick={onMostrarTodo} disabled={!ready}>
        Mostrar todo
      </button>

      <button onClick={onNovedades} disabled={!ready}>
        Novedades (últimos 5)
      </button>

      {!ready && <span className="sync">Sincronizando…</span>}
    </header>
  );
}
