import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "/src"),
    },
  },
  server: {
    proxy: {
      "/api/": {
        target: "http://localhost:8080/",
      },
    },
  },
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "build",
  },
});
