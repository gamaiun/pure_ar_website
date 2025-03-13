import { build } from "vite";

(async () => {
  try {
    await build({
      publicDir: "public",
    });
    console.log("Build completed successfully.");
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
})();
