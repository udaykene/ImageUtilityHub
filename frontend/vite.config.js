import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // This exposes the project to your local network
    port: 5173, // Optional: keeps it on your preferred port
    proxy: {
      "/api": {
        target: "http://0.0.0.0:5000", // Using 0.0.0.0 ensures it catches the backend on the local network
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
