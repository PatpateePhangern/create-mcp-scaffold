// Generates each template into a temp directory, installs its dependencies and
// runs its own test suite. Needs node, npm and (for python) uv on PATH.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { scaffold } from "../bin/create-mcp-scaffold.mjs";

function run(cmd, args, cwd) {
  const result = spawnSync(cmd, args, { cwd, encoding: "utf8", stdio: "pipe", timeout: 600_000 });
  if (result.status !== 0) {
    assert.fail(`${cmd} ${args.join(" ")} failed in ${cwd}\n${result.stdout}\n${result.stderr}`);
  }
  return result.stdout;
}

const root = () => mkdtempSync(join(tmpdir(), "cms-e2e-"));

test("typescript template: install, typecheck, test and build", { timeout: 600_000 }, () => {
  const target = join(root(), "e2e-ts");
  scaffold({ name: "e2e-ts", lang: "typescript", targetDir: target });
  run("npm", ["install", "--no-audit", "--no-fund"], target);
  run("npm", ["run", "typecheck"], target);
  run("npm", ["test"], target);
  run("npm", ["run", "build"], target);
});

test("python template: sync, test and start the server", { timeout: 600_000 }, () => {
  const target = join(root(), "e2e-py");
  scaffold({ name: "e2e-py", lang: "python", targetDir: target });
  run("uv", ["sync"], target);
  run("uv", ["run", "pytest", "-q"], target);
});
