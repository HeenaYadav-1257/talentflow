// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    jsx: "automatic",
  },
  // CRITICAL FIX: Add 'react-window' to force Vite to correctly resolve its sub-path exports.
  optimizeDeps: {
    include: ['pdf-parse', 'mammoth', 'react-window'], // ✅ ADDED 'react-window'
  },
  server: {
    // Proxy API calls to prevent CORS issues in dev
    // proxy: {
    //   '/jobs': {
    //     target: 'http://localhost:5173', // Vite dev server
    //     changeOrigin: true,
    //     // MirageJS will intercept these requests
    //     configure: (proxy, options) => {
    //       proxy.on('proxyReq', (proxyReq, req, res) => {
    //         console.log('Proxying request:', req.method, req.url);
    //       });
    //     }
    //   },
    //   '/candidates': {
    //     target: 'http://localhost:5173',
    //     changeOrigin: true,
    //   },
    //   '/assessments': {
    //     target: 'http://localhost:5173',
    //     changeOrigin: true,
    //   }
    //}
  }
});