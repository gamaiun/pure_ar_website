// import { defineConfig } from "vite";

// export default defineConfig({
//   root: "src",
//   base: "/",
//   publicDir: "public", // Explicitly set public directory
//   build: {
//     outDir: "../dist",
//     assetsDir: "assets",
//     emptyOutDir: true,
//     rollupOptions: {
//       input: {
//         main: "src/index.html",
//       },
//     },
//   },
//   server: {
//     open: true,
//   },
// });

import { defineConfig } from "vite";
import cesium from "vite-plugin-cesium"; // Add this plugin

export default defineConfig({
  root: "src",
  base: "/",
  publicDir: "../public",
  plugins: [cesium()], // Add Cesium plugin
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
