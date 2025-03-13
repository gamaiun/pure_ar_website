import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  base: "/",
  publicDir: "public", // Explicitly set public directory
  build: {
    outDir: "../dist",
    assetsDir: "assets",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: "src/index.html",
      },
    },
  },
  server: {
    open: true,
  },
});
