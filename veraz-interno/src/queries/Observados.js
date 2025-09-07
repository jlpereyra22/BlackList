// src/queries/observados.js
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL 


// helpers para cache y normalización
import { readCache, writeCache, isFresh } from '../lib/cache';
import { normalizarConjunto } from '../lib/normalizar';

function construirURL({ page = 1, pageSize = 10, sort = "fecha_desc", q = "" } = {}) {
  const url = new URL(BASE_URL);
  url.searchParams.set("route", "list");
  url.searchParams.set("page", String(page));
  url.searchParams.set("pageSize", String(pageSize));
  url.searchParams.set("sort", sort);
  if (q) url.searchParams.set("q", q);
  return url.toString();
}

export async function obtenerObservados({ page = 1, pageSize = 10, sort = "fecha_desc", q = "" } = {}) {
  if (!BASE_URL) return { ok: false, error: "config", items: [], total: 0, page, pageSize };
  try {
    const res = await fetch(construirURL({ page, pageSize, sort, q }));
    const json = await res.json();
    return json;
  } catch {
    return { ok: false, error: "network", items: [], total: 0, page, pageSize };
  }
}

// ==== NUEVO: traer TODO en background y cachear (SWR casero) ====

const CACHE_KEY_ALL = 'observados_all';

export async function fetchAllObservadosPaginado({ pageSize = 1000 } = {}) {
  // Itera páginas del Apps Script (usa tus mismos params)
  let page = 1;
  let total = Infinity;
  const acc = [];

  while ((page - 1) * pageSize < total) {
    const resp = await obtenerObservados({ page, pageSize, sort: 'fecha_desc', q: '' });
    if (!resp?.ok) {
      return { ok: false, error: resp?.error || 'fetch_all_failed' };
    }
    const items = resp.items || [];
    total = resp.total ?? items.length;
    acc.push(...items);
    if (!items.length) break;
    page += 1;
  }
  return { ok: true, items: acc, total: acc.length };
}

export async function getAllWithCache({ ttlMs = 5 * 60 * 1000 } = {}) {
  const cached = readCache(CACHE_KEY_ALL);
  if (isFresh(cached)) {
    return { fromCache: true, data: cached.data, fetchedAt: cached.fetchedAt };
  }

  const resp = await fetchAllObservadosPaginado({ pageSize: 1000 });
  if (!resp.ok) {
    if (cached?.data?.length) {
      return { fromCache: true, data: cached.data, fetchedAt: cached.fetchedAt, stale: true };
    }
    return { error: resp.error || 'no_data' };
  }

  const normalizado = normalizarConjunto(resp.items);
  writeCache(CACHE_KEY_ALL, { data: normalizado, fetchedAt: Date.now(), ttlMs });
  return { fromCache: false, data: normalizado, fetchedAt: Date.now() };
}
