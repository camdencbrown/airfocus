import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 15000,
    hookTimeout: 30000,
    sequence: {
      sequential: true, // run tests sequentially since they share DB state
    },
  },
});
