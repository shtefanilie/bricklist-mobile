import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

console.log("Worker to delete: bricklist-workshop");
console.log("D1 database to delete: bricklist-workshop");
process.stdout.write("Type DELETE_BRICKLIST_WORKSHOP to continue:");

const confirmation = readFileSync(0, "utf8").replace(/\r?\n$/, "");
if (confirmation !== "DELETE_BRICKLIST_WORKSHOP") {
  console.log("\nTeardown cancelled. No resources were deleted.");
  process.exit(0);
}

for (const args of [
  ["wrangler", "delete", "--name", "bricklist-workshop"],
  ["wrangler", "d1", "delete", "bricklist-workshop"],
]) {
  const result = spawnSync("npx", args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
