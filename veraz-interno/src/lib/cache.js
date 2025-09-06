const NS = 'veraz_cache_v1';

export function readCache(key) {
  try {
    const raw = localStorage.getItem(`${NS}:${key}`);
    if (!raw) return null;
    return JSON.parse(raw) || null;
  } catch {
    return null;
  }
}

export function writeCache(key, value) {
  try {
    localStorage.setItem(`${NS}:${key}`, JSON.stringify(value));
  } catch {
    // ignorar errores de cuota
  }
}

export function isFresh(cacheObj) {
  if (!cacheObj) return false;
  const { fetchedAt, ttlMs } = cacheObj;
  if (!fetchedAt || !ttlMs) return false;
  return Date.now() - fetchedAt < ttlMs;
}
