export const API_BASE = (
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") ??
  (import.meta.env.DEV ? "/api" : "http://localhost:5000")
);
