import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: "./vitest.setup.js",
    fileParallelism: false // This is necessary for the MongoDB tests to work, as all of them use the mongoose library, which is not compatible with file parallelism.
  },
  resolve: {
    alias: {
      "#": resolve(__dirname, "./src"),
      "#utils": resolve(__dirname, "./src/utils"),
      "#db": resolve(__dirname, "./src/db"),
      "#routes": resolve(__dirname, "./src/routes"),
      "#middleware": resolve(__dirname, "./src/middleware")
    }
  }
});
