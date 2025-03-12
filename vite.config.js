// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  base: "/pure-ar/",
  build: {
    outDir: "../dist",
    assetsDir: "assets",
    emptyOutDir: true, // Automatically empty the outDir
  },
  server: {
    open: true,
  },
});
