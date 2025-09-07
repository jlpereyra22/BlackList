import './style/Index.css';
// import Encabezado from './components/Encabezado'; // ❌ quitar
import Buscador from './components/Buscador';
import TablaDatos from './components/TablaDatos';
import Pie from './components/Pie';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getAllWithCache } from './queries/Observados';
import { readCache } from './lib/cache';

export default function App({ registerApi }) {
  const [busqueda, setBusqueda] = useState("");
  const [vista, setVista] = useState("welcome"); // welcome | all | news | search

  // Hidratación instantánea desde cache
  const [prefetched, setPrefetched] = useState(() => {
    const cached = readCache('observados_all');
    return Array.isArray(cached?.data) ? cached.data : null;
  });
  const [loadingPrefetch, setLoadingPrefetch] = useState(false);
  const [errorPrefetch, setErrorPrefetch] = useState("");
  const didPrefetch = useRef(false);

  useEffect(() => {
    if (didPrefetch.current) return;
    didPrefetch.current = true;

    let alive = true;
    (async () => {
      try {
        setLoadingPrefetch(true);
        setErrorPrefetch("");
        const res = await getAllWithCache({ ttlMs: 5 * 60 * 1000 });
        if (!alive) return;
        if (res?.error) setErrorPrefetch(res.error);
        else if (Array.isArray(res?.data)) setPrefetched(res.data);
      } catch (e) {
        if (alive) setErrorPrefetch(e?.message || "prefetch_error");
      } finally {
        if (alive) setLoadingPrefetch(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  const onBuscar = (valor) => {
    setBusqueda(valor);
    if (valor.trim()) setVista("search");
  };
  const onLimpiar = () => { setBusqueda(""); setVista("welcome"); };

  // === Handlers que dispara el Encabezado (via RootApp) ===
  function handleMostrarTodo() { setVista("all"); }
  function handleNovedades()   { setVista("news"); }

  // Registramos la "API" hacia RootApp una sola vez
  const api = useMemo(() => ({
    mostrarTodo: handleMostrarTodo,
    novedades: handleNovedades,
  }), []);
  useEffect(() => { registerApi?.(api); }, [registerApi, api]);

  const debeMostrarTabla = vista !== "welcome";
  console.log("[ENV RAW]", import.meta.env);

  return (
    <div className="app">
      {/* Encabezado lo pinta RootApp: NO renderizarlo aquí */}

      <main className="contenido">
        <Buscador valor={busqueda} onCambio={onBuscar} onLimpiar={onLimpiar} />

        {!debeMostrarTabla ? (
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <h1 style={{ fontSize: '3rem', margin: 0 }}>Bienvenidos</h1>
            {loadingPrefetch && <p style={{ opacity: 0.7 }}>Sincronizando datos…</p>}
            {errorPrefetch && <p style={{ color: 'crimson' }}>Trabajando con caché / {errorPrefetch}</p>}
          </div>
        ) : (
          <TablaDatos
            rowsPrefetch={Array.isArray(prefetched) ? prefetched : null}
            busqueda={vista === "search" ? busqueda : ""}
            modo={vista === "news" ? "news" : "all"}
          />
        )}
      </main>

      <Pie />
    </div>
  );
}
