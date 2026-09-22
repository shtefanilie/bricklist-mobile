import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/import-rebrickable.spec.ts", "test/workspace-baseline.spec.ts"],
  },
});
