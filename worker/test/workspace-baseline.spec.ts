import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "vitest";

const root = resolve(import.meta.dirname, "../..");

test("provides an attendee configuration template with public API variables", () => {
  const template = readFileSync(resolve(root, "app/.env.example"), "utf8");

  expect(template).toContain("EXPO_PUBLIC_API_BASE_URL=");
  expect(template).toContain("EXPO_PUBLIC_WORKSHOP_API_KEY=");
});

test("runs a non-destructive temporary teardown", () => {
  const output = execFileSync("npm", ["run", "teardown"], {
    cwd: root,
    encoding: "utf8",
  });

  expect(output).toContain("Teardown is not available yet");
  expect(output).not.toMatch(/wrangler.*delete/i);
});
