import { defineConfig } from "tsup";

export default defineConfig({
  entry: { "vkrana-me": "src/vkrana-me.ts" },
  format: ["esm"],
  target: "node18",
  clean: true,
  minify: false,
});
