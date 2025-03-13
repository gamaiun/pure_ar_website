import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  base: "/", // Use root path to match Vercel deployment (purearwebsite)
  build: {
    outDir: "../dist",
    assetsDir: "assets",
    emptyOutDir: true,
  },
  server: {
    open: true,
  },
});
