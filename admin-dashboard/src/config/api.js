/**
 * In dev, Vite proxies `/api/*` → `http://localhost:5000/*` (see vite.config.js)
 * so the browser stays same-origin and avoids CORS issues.
 *
 * Override with VITE_API_BASE (no trailing slash), e.g. https://api.example.com
 */
export const API_BASE = (
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") ??
  (import.meta.env.DEV ? "/api" : "http://localhost:5000")
);
