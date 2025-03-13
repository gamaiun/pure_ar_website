import { build } from "vite";
import { copyFileSync, existsSync } from "fs";
import { join } from "path";

(async () => {
  try {
    await build({
      publicDir: "public",
    });
    const srcPath = join(process.cwd(), "public/Assets/default.glb");
    const destPath = join(process.cwd(), "dist/Assets/default.glb");
    if (existsSync(srcPath)) {
      copyFileSync(srcPath, destPath);
      console.log("default.glb copied successfully.");
    } else {
      console.error("Source file not found:", srcPath);
      process.exit(1);
    }
    console.log("Build completed successfully.");
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
})();
