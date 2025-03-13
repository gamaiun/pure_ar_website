import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  base: "/", // Change to root path
  build: {
    outDir: "../dist",
    assetsDir: "assets",
    emptyOutDir: true,
  },
  server: {
    open: true,
  },
});
