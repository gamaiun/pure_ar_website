// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  base: "/pure-ar-experience/", // Adjust based on your Vercel deployment path
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  server: {
    open: true,
  },
});
