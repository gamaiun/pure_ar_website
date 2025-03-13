import { build } from "vite";
import { copyFileSync } from "fs";

(async () => {
  try {
    await build({
      publicDir: "public",
    });
    // Manually copy default.glb to dist/Assets/
    copyFileSync("public/Assets/default.glb", "dist/Assets/default.glb");
    console.log("Build completed successfully, default.glb copied.");
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
})();
