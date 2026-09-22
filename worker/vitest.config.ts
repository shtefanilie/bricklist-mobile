import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    include: ["test/api.spec.ts"],
    poolOptions: {
      workers: {
        main: "./src/index.ts",
        miniflare: {
          compatibilityDate: "2025-12-10",
          d1Databases: ["DB"],
          bindings: {
            WORKSHOP_API_KEY_SHA256:
              "d98b4b7a52b307ab41cbd82199b885fc2776483dbf9dc1b694b41ff8387435ed",
          },
        },
      },
    },
  },
});
