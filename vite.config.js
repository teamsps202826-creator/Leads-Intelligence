import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The frontend is a separate app. In development it runs on :5173 and proxies
// /api and /health to the FastAPI backend on :8000, so the browser sees a
// single origin and there is no CORS to configure. In production the built
// bundle can be served by anything — nginx, S3, or FastAPI itself.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/health": { target: "http://127.0.0.1:8000", changeOrigin: true },
    },
  },
  build: { outDir: "dist", sourcemap: true },
});
