import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
import {
  LANGUAGES,
  outputPath,
  render,
  resolveLanguage,
  scaffold,
  templatesDir,
  validateName,
} from "../bin/create-mcp-scaffold.mjs";

function tempDir() {
  return mkdtempSync(join(tmpdir(), "cms-test-"));
}

function allFiles(dir, prefix = "") {
  return readdirSync(dir).flatMap((entry) => {
    const rel = prefix ? `${prefix}/${entry}` : entry;
    return statSync(join(dir, entry)).isDirectory() ? allFiles(join(dir, entry), rel) : [rel];
  });
}

test("validateName accepts simple names", () => {
  for (const name of ["weather", "my-server", "server2"]) assert.doesNotThrow(() => validateName(name));
});

test("validateName rejects bad names", () => {
  for (const name of ["", "1server", "My_Server", "has space", "../escape", "UPPER"]) {
    assert.throws(() => validateName(name), /Invalid project name/, name);
  }
});

test("resolveLanguage maps aliases and rejects unknown values", () => {
  assert.equal(resolveLanguage("ts"), "typescript");
  assert.equal(resolveLanguage("TypeScript"), "typescript");
  assert.equal(resolveLanguage("py"), "python");
  assert.throws(() => resolveLanguage("rust"), /Unknown language/);
});

test("render replaces placeholders and throws on unknown ones", () => {
  assert.equal(render("name={{name}} pkg={{pkg}}", { name: "a", pkg: "b" }), "name=a pkg=b");
  assert.throws(() => render("{{nope}}", { name: "a" }), /Unknown template placeholder/);
});

test("outputPath turns dot- segments into dotfiles and renders placeholders", () => {
  assert.equal(outputPath("dot-gitignore", {}), ".gitignore");
  assert.equal(outputPath("dot-github/workflows/ci.yml", {}), ".github/workflows/ci.yml");
  assert.equal(outputPath("src/{{pkg}}/server.py", { pkg: "weather" }), "src/weather/server.py");
});

for (const lang of LANGUAGES) {
  test(`scaffold writes a complete ${lang} project with no leftover placeholders`, () => {
    const target = join(tempDir(), "weather-server");
    const { written } = scaffold({ name: "weather-server", lang, targetDir: target });

    assert.ok(written.length > 0);
    assert.deepEqual(allFiles(target).sort(), [...written].sort());
    for (const rel of allFiles(target)) {
      const content = readFileSync(join(target, rel), "utf8");
      assert.doesNotMatch(content, /\{\{\w+\}\}/, `placeholder left in ${rel}`);
    }
    assert.ok(allFiles(target).includes(".github/workflows/ci.yml"));
    assert.ok(allFiles(target).includes(".gitignore"));
    rmSync(target, { recursive: true, force: true });
  });
}

test("typescript scaffold uses the project name in package.json", () => {
  const target = join(tempDir(), "weather-server");
  scaffold({ name: "weather-server", lang: "typescript", targetDir: target });
  const pkg = JSON.parse(readFileSync(join(target, "package.json"), "utf8"));
  assert.equal(pkg.name, "weather-server");
  assert.equal(pkg.bin["weather-server"], "dist/src/index.js");
});

test("python scaffold derives the package directory from the name", () => {
  const target = join(tempDir(), "weather-server");
  scaffold({ name: "weather-server", lang: "python", targetDir: target });
  assert.ok(existsSync(join(target, "src", "weather_server", "server.py")));
  const toml = readFileSync(join(target, "pyproject.toml"), "utf8");
  assert.match(toml, /weather-server = "weather_server\.__main__:main"/);
});

test("scaffold refuses a non-empty target directory and leaves it untouched", () => {
  const dir = tempDir();
  const target = join(dir, "existing");
  mkdirSync(target);
  writeFileSync(join(target, "keep.txt"), "mine");
  assert.throws(() => scaffold({ name: "existing", lang: "typescript", targetDir: target }), /not empty/);
  assert.deepEqual(readdirSync(target), ["keep.txt"]);
});

test("every template file is listed in the package", () => {
  assert.ok(existsSync(templatesDir));
  for (const lang of LANGUAGES) {
    assert.ok(existsSync(join(templatesDir, lang, "README.md")), `${lang} README missing`);
  }
});

test("the bin runs when invoked through a symlink, as npm does", () => {
  const dir = tempDir();
  const link = join(dir, "create-mcp-scaffold");
  symlinkSync(join(here, "..", "bin", "create-mcp-scaffold.mjs"), link);
  const result = spawnSync(process.execPath, [link, "linked-app"], { cwd: dir, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(existsSync(join(dir, "linked-app", "package.json")));
});
