# create-mcp-scaffold

Generates a small, working MCP server so you can start on the interesting part
straight away. Pick TypeScript or Python. Each project comes with:

- one tool, one resource and one prompt, registered the way the SDK expects
- tests that run the server in-process over the real protocol
- a GitHub Actions workflow that runs the tests on push and pull request
- a README that explains where to add things

## Usage

```sh
npx create-mcp-scaffold my-server              # TypeScript
npx create-mcp-scaffold my-server --lang python  # Python
```

Project names use lowercase letters, digits and hyphens, and must start with a
letter. The command won't write into a directory that already has files in it.

Then, for TypeScript:

```sh
cd my-server
npm install
npm test
```

Or for Python (needs [uv](https://docs.astral.sh/uv/)):

```sh
cd my-server
uv sync
uv run pytest
```

## Requirements

- Generator: Node.js 20 or newer
- TypeScript output: Node.js 22 or newer
- Python output: Python 3.10 or newer, and uv

## Developing this tool

```sh
npm test          # tests for the generator itself
npm run test:e2e  # generates both templates, installs them and runs their tests
```

The templates are in `templates/`. Files whose names start with `dot-` are
written out as dotfiles (`dot-gitignore` becomes `.gitignore`), because npm
strips `.gitignore` from published packages. Placeholders look like
`{{name}}` and `{{pkg}}`.

## License

MIT
