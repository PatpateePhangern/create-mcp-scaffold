# create-mcp-scaffold

Generates a small MCP server that works out of the box, so you can start on the
part that's specific to your project. Pick TypeScript or Python. Each generated
project includes:

- one tool, one resource and one prompt, registered the way the SDK expects
- tests that run the server in-process over the real protocol
- a GitHub Actions workflow that runs the tests on push and pull request
- a README that explains where to add things

## Requirements

- To run the generator: Node.js 20 or newer
- For TypeScript projects: Node.js 22 or newer
- For Python projects: Python 3.10 or newer and [uv](https://docs.astral.sh/uv/)

## Quick start

TypeScript (the default):

```sh
npx create-mcp-scaffold my-server
cd my-server
npm install
npm test
```

Python:

```sh
npx create-mcp-scaffold my-server --lang python
cd my-server
uv sync
uv run pytest
```

`--lang` accepts `typescript` or `python`, and also the short forms `ts` and `py`.

## Walkthrough: build and try your own server

1. Create the project with the commands above.
2. Run the tests to confirm the starter server works. You should see 5 passing
   tests.
3. Open `src/server.ts` (TypeScript) or `src/<package>/server.py` (Python).
   The starter `add` tool shows the pattern. Copy it to add your own tool, and
   give it a clear description. Clients show that description to the model.
4. Add a test for the new tool in `test/server.test.ts` or `tests/test_server.py`.
   Run the tests again.
5. Try the server with the MCP Inspector, which opens a web UI where you can
   list tools and call them:

   ```sh
   # TypeScript
   npm run build
   npx @modelcontextprotocol/inspector node dist/src/index.js

   # Python
   npx @modelcontextprotocol/inspector uv run my-server
   ```

6. To use the server from a desktop client, add it to that client's
   `mcpServers` config. The generated README has a working example for each
   language.
7. Push the project to GitHub. The CI workflow runs the tests on each push.

## Naming

Project names use lowercase letters, digits and hyphens, and must start with a
letter. The generator won't write into a directory that already contains files.

## Developing this tool

```sh
npm test          # tests for the generator, including a symlinked-bin check
npm run test:e2e  # generates both templates, installs them and runs their tests
```

The templates are in `templates/`. Files whose names start with `dot-` are
written out as dotfiles (`dot-gitignore` becomes `.gitignore`), because npm
strips `.gitignore` from published packages. Placeholders look like `{{name}}`
and `{{pkg}}`.

## License

MIT
