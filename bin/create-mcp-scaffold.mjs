#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const here = dirname(fileURLToPath(import.meta.url));
export const templatesDir = join(here, "..", "templates");

export const LANGUAGES = ["typescript", "python"];
const ALIASES = { ts: "typescript", typescript: "typescript", py: "python", python: "python" };
const NAME_RE = /^[a-z][a-z0-9-]*$/;

export function resolveLanguage(value) {
  const lang = ALIASES[String(value).toLowerCase()];
  if (!lang) throw new Error(`Unknown language "${value}". Use typescript (ts) or python (py).`);
  return lang;
}

export function validateName(name) {
  if (!NAME_RE.test(name)) {
    throw new Error(
      `Invalid project name "${name}". Use lowercase letters, digits and hyphens, starting with a letter.`,
    );
  }
}

// Replaces {{key}} placeholders. Unknown keys throw so a typo in a template fails loudly.
export function render(text, vars) {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (!(key in vars)) throw new Error(`Unknown template placeholder ${match}`);
    return vars[key];
  });
}

// Path segments starting with "dot-" become dotfiles, because npm strips .gitignore from packages.
export function outputPath(relPath, vars) {
  return render(relPath, vars)
    .split("/")
    .map((part) => (part.startsWith("dot-") ? "." + part.slice(4) : part))
    .join("/");
}

function listFiles(dir, prefix = "") {
  const out = [];
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry);
    const rel = prefix ? `${prefix}/${entry}` : entry;
    if (statSync(full).isDirectory()) out.push(...listFiles(full, rel));
    else out.push(rel);
  }
  return out;
}

export function scaffold({ name, lang, targetDir }) {
  validateName(name);
  if (!LANGUAGES.includes(lang)) throw new Error(`Unknown language "${lang}".`);
  if (existsSync(targetDir) && readdirSync(targetDir).length > 0) {
    throw new Error(`Target directory "${targetDir}" already exists and is not empty.`);
  }

  const vars = { name, pkg: name.replaceAll("-", "_") };
  const src = join(templatesDir, lang);
  const written = [];

  for (const rel of listFiles(src)) {
    const dest = join(targetDir, outputPath(rel, vars));
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, render(readFileSync(join(src, rel), "utf8"), vars));
    written.push(outputPath(rel, vars));
  }
  return { vars, written };
}

const USAGE = `Usage: create-mcp-scaffold <project-name> [--lang typescript|python]

Creates a runnable MCP server with one tool, one resource, one prompt,
an in-process test harness and a CI workflow.

Options:
  --lang, -l   typescript (default, alias: ts) or python (alias: py)
  --help, -h   show this message
`;

function main(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      lang: { type: "string", short: "l", default: "typescript" },
      help: { type: "boolean", short: "h", default: false },
    },
  });

  if (values.help || positionals.length === 0) {
    process.stdout.write(USAGE);
    return values.help ? 0 : 1;
  }
  if (positionals.length > 1) {
    process.stderr.write(`Expected one project name, got ${positionals.length}.\n${USAGE}`);
    return 1;
  }

  const name = positionals[0];
  const lang = resolveLanguage(values.lang);
  const targetDir = join(process.cwd(), name);
  const { written } = scaffold({ name, lang, targetDir });

  const steps =
    lang === "typescript"
      ? ["npm install", "npm test", "npm start   # serves MCP over stdio"]
      : ["uv sync", "uv run pytest", `uv run ${name}   # serves MCP over stdio`];

  process.stdout.write(`Created ${name} (${lang}) with ${written.length} files.\n\n`);
  process.stdout.write(`Next:\n  cd ${name}\n${steps.map((s) => `  ${s}`).join("\n")}\n`);
  return 0;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (err) {
    process.stderr.write(`create-mcp-scaffold: ${err.message}\n`);
    process.exitCode = 1;
  }
}
