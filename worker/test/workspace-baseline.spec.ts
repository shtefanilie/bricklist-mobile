import { execFileSync } from "node:child_process";
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { expect, test } from "vitest";

const root = resolve(import.meta.dirname, "../..");

test("provides an attendee configuration template with public API variables", () => {
  const template = readFileSync(resolve(root, "app/.env.example"), "utf8");

  expect(template).toContain("EXPO_PUBLIC_API_BASE_URL=");
  expect(template).toContain("EXPO_PUBLIC_WORKSHOP_API_KEY=");
});

test.each([" DELETE_BRICKLIST_WORKSHOP\n", "DELETE_BRICKLIST_WORKSHOP \n"])(
  "rejects whitespace-padded teardown confirmation %j",
  (input) => {
    const bin = mkdtempSync(join(tmpdir(), "bricklist-teardown-"));
    const invoked = join(bin, "invoked");
    const npx = join(bin, "npx");
    writeFileSync(npx, `#!/bin/sh\nprintf '%s\\n' "$*" >> "${invoked}"\n`);
    chmodSync(npx, 0o755);

    const output = execFileSync("npm", ["run", "teardown"], {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}` },
      input,
    });

    expect(output).toContain("Worker to delete: bricklist-workshop");
    expect(output).toContain("D1 database to delete: bricklist-workshop");
    expect(output).toContain("Type DELETE_BRICKLIST_WORKSHOP to continue:");
    expect(output).toContain("Teardown cancelled. No resources were deleted.");
    expect(() => readFileSync(invoked, "utf8")).toThrow();

    rmSync(bin, { force: true, recursive: true });
  },
);

test("accepts the exact confirmation followed by one terminal newline", () => {
  const bin = mkdtempSync(join(tmpdir(), "bricklist-teardown-"));
  const invoked = join(bin, "invoked");
  const npx = join(bin, "npx");
  writeFileSync(npx, `#!/bin/sh\nprintf '%s\\n' "$*" >> "${invoked}"\n`);
  chmodSync(npx, 0o755);

  const output = execFileSync("npm", ["run", "teardown"], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, PATH: `${bin}:${process.env.PATH}` },
    input: "DELETE_BRICKLIST_WORKSHOP\n",
  });

  expect(output).not.toContain("Teardown cancelled");
  expect(readFileSync(invoked, "utf8")).toBe(
    "wrangler delete --name bricklist-workshop\nwrangler d1 delete bricklist-workshop\n",
  );

  rmSync(bin, { force: true, recursive: true });
});
