// src/lib/config.js
const getNumber = (v, def) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : def;
  };
  
  export const CONFIG = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL?.trim(),
    API_TOKEN: import.meta.env.VITE_API_TOKEN?.trim(),
    TIMEOUT_MS: getNumber(import.meta.env.VITE_API_TIMEOUT_MS, 12000),
    DEFAULT_PAGE_SIZE: 25,
  };
  
  if (!CONFIG.BASE_URL) {
    // Dejalo en consola para detectar mal config en dev
    // (no tiramos exception para no romper HMR)
    // eslint-disable-next-line no-console
    console.warn("[config] VITE_API_BASE_URL no está definido");
  }
  