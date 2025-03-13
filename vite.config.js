import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  base: "/pure-ar/",
  build: {
    outDir: "../dist",
    assetsDir: "assets",
    emptyOutDir: true,
  },
  server: {
    open: true,
  },
});
