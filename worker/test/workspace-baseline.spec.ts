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

test("stops teardown before destructive commands without the exact confirmation", () => {
  const output = execFileSync("npm", ["run", "teardown"], {
    cwd: root,
    encoding: "utf8",
    input: "no\n",
  });

  expect(output).toContain("Worker to delete: bricklist-workshop");
  expect(output).toContain("D1 database to delete: bricklist-workshop");
  expect(output).toContain("Type DELETE_BRICKLIST_WORKSHOP to continue:");
  expect(output).toContain("Teardown cancelled. No resources were deleted.");
});
