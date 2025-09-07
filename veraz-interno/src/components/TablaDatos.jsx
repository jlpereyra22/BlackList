import { useEffect, useMemo, useRef, useState } from "react";
import { obtenerObservados } from "../queries/Observados";
import RenderTabla from "./RenderTabla";
import "../style/TablaDatos.css";

function formatearFechaDDMMYYYY(ts, fallback = "—") {
  if (!Number.isFinite(ts)) return fallback;
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

/** Canoniza texto: sin tildes, sin espacios ni signos, minúsculas. */
function canonTxt(v) {
  if (v == null) return "";
  return String(v)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\s\W_]+/g, "");
}

const CABECERAS = [
  { key: "persona",       label: "Persona",       sortable: true  },
  { key: "observaciones", label: "Observaciones", sortable: false },
  { key: "socios",        label: "Socios",        sortable: false },
  { key: "oficina",       label: "Oficina",       sortable: true  },
  { key: "fecha",         label: "Fecha",         sortable: true  },
];

export default function TablaDatos({ busqueda, modo = "all", rowsPrefetch = null }) {
  const source = Array.isArray(rowsPrefetch) ? "local" : "remote";
  const isNews = modo === "news";

  const [page, setPage] = useState(1);
  const pageSize = isNews ? 5 : 10;

  const [sortKey, setSortKey] = useState("fecha");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => { setPage(1); }, [busqueda, isNews, sortKey, sortDir]);

  // ------- REMOTO -------
  const [filasRemote, setFilasRemote] = useState([]);
  const [totalRemote, setTotalRemote] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  useEffect(() => {
    if (source === "local") return;

    let cancelado = false;
    (async () => {
      try {
        setCargando(true);
        setError("");

        if (abortRef.current) abortRef.current.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;

        const sortApi = `${sortKey}_${sortDir}`;
        const resp = await obtenerObservados({
          page: isNews ? 1 : page,
          pageSize,
          sort: isNews ? "fecha_desc" : sortApi,
          q: busqueda?.trim() ?? "",
          signal: ctrl.signal,
        });

        if (cancelado) return;
        if (resp?.ok) {
          setFilasRemote(resp.items || []);
          setTotalRemote(resp.total || 0);
        } else {
          setFilasRemote([]);
          setTotalRemote(0);
          setError(resp?.error || "error");
        }
      } catch {
        if (!cancelado) {
          setFilasRemote([]);
          setTotalRemote(0);
          setError("network");
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();

    return () => {
      cancelado = true;
      if (abortRef.current) abortRef.current.abort();
    };
  }, [page, pageSize, sortKey, sortDir, busqueda, isNews, source]);

  const totalPagesRemote = Math.max(1, Math.ceil(totalRemote / pageSize));
  useEffect(() => {
    if (source !== "remote" || isNews) return;
    setPage((p) => Math.min(Math.max(1, p), totalPagesRemote));
  }, [totalPagesRemote, pageSize, source, isNews]);

  // ------- LOCAL -------
  const datasetLocal = useMemo(() => {
    if (source !== "local") return [];
    let base = rowsPrefetch;

    if (isNews) {
      return [...base].sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, 5);
    }

    const qCanon = canonTxt(busqueda || "");
    if (qCanon) {
      base = base.filter((r) => {
        const persona = canonTxt(r.persona);
        const obs     = canonTxt(r.observaciones);
        const oficina = canonTxt(r.oficina);
        const socios  = canonTxt(Array.isArray(r.socios) ? r.socios.join(", ") : "");
        return (
          persona.includes(qCanon) ||
          obs.includes(qCanon)     ||
          oficina.includes(qCanon) ||
          socios.includes(qCanon)
        );
      });
    }

    const factor = sortDir === "asc" ? 1 : -1;
    return [...base].sort((a, b) => {
      if (sortKey === "fecha") {
        const A = Number.isFinite(a.ts) ? a.ts : -Infinity;
        const B = Number.isFinite(b.ts) ? b.ts : -Infinity;
        return (A - B) * factor;
      }
      const A = canonTxt(a[sortKey]);
      const B = canonTxt(b[sortKey]);
      return A.localeCompare(B) * factor;
    });
  }, [rowsPrefetch, source, isNews, busqueda, sortKey, sortDir]);

  const totalLocal = datasetLocal.length;
  const totalPagesLocal = Math.max(1, Math.ceil(totalLocal / pageSize));

  useEffect(() => {
    if (source !== "local" || isNews) return;
    setPage((p) => Math.min(Math.max(1, p), totalPagesLocal));
  }, [totalPagesLocal, source, isNews]);

  const filasLocal = isNews
    ? datasetLocal
    : datasetLocal.slice((page - 1) * pageSize, page * pageSize);

  // ------- DERIVADOS -------
  if (source === "remote" && cargando)
    return <p className="estado">Cargando…</p>;
  if (source === "remote" && error)
    return <p className="estado">Error: {error}</p>;

  const filasRender = source === "local" ? filasLocal : filasRemote;
  const totalRows   = source === "local" ? totalLocal : totalRemote;
  const totalPages  = source === "local" ? totalPagesLocal : totalPagesRemote;

  if (!filasRender.length) return <p className="estado">No hay datos cargados.</p>;

  const canPrev = !isNews && page > 1;
  const canNext = !isNews && page < totalPages;

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const onClickHeader = (k) => {
    if (isNews) return;
    if (!CABECERAS.find((c) => c.key === k)?.sortable) return;
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
    setPage(1);
  };

  const getRowKey = (r, i) =>
    r.id ??
    `${r.persona ?? ""}|${r.oficina ?? ""}|${Number.isFinite(r.ts) ? r.ts : ""}|${i}`;

  const getCell = (r, key) => {
    switch (key) {
      case "socios":
        return Array.isArray(r.socios) ? r.socios.join(", ") : "—";
      case "fecha":
        return Number.isFinite(r.ts) ? formatearFechaDDMMYYYY(r.ts) : "—";
      default:
        return r[key] || "—";
    }
  };

  return (
    <div className="tabla-wrap">
      <RenderTabla
        headers={CABECERAS}
        rows={filasRender}
        onHeaderClick={onClickHeader}
        isNews={isNews}
        getRowKey={getRowKey}
        getCell={getCell}
      />

      {!isNews && (
        <div className="paginacion">
          <button className="btn" onClick={goPrev} disabled={!canPrev}>◀ Anterior</button>
          <span className="info">Página {page} de {totalPages} (total {totalRows})</span>
          <button className="btn" onClick={goNext} disabled={!canNext}>Siguiente ▶</button>
        </div>
      )}
    </div>
  );
}
