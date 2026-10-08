# {{name}}

An MCP server in TypeScript, built on the official `@modelcontextprotocol/sdk`.
It starts with one tool, one resource and one prompt so you can see how each is
registered. The tests run the server in-process, so you don't need a client to
check your work.

## Requirements

- Node.js 22 or newer
- npm (it comes with Node)

## Getting started

```sh
npm install     # installs the SDK, zod and TypeScript
npm test        # compiles, then runs the tests with node:test
npm run build   # compiles to dist/
npm start       # runs the server on stdio
```

`npm test` runs `tsc` first, so a type error fails the tests before they run.

## Running the server

The server talks MCP over stdio, so it only makes sense when a client starts it.
To try it interactively, use the MCP Inspector, which opens a web UI:

```sh
npm run build
npx @modelcontextprotocol/inspector node dist/src/index.js
```

To connect it to a desktop client, point the client at the built file. For
example, in a `mcpServers` config:

```json
{
  "mcpServers": {
    "{{name}}": {
      "command": "node",
      "args": ["/absolute/path/to/{{name}}/dist/src/index.js"]
    }
  }
}
```

Run `npm run build` first. The client needs the compiled file, not the source.

## Where things live

- `src/server.ts` defines the server. `createServer()` registers the tools,
  resources and prompts.
- `src/index.ts` is the entry point. It connects the server to stdio.
- `test/harness.ts` has a `connect()` helper. It returns a client wired to a
  server over an in-memory transport.
- `test/server.test.ts` holds the tests.
- `dist/` is build output and is not committed.

## Adding a tool

1. Add a `registerTool` call in `src/server.ts`. The input schema is written
   with zod, and the SDK checks incoming arguments against it before your
   handler runs.
2. Add a test in `test/server.test.ts` that calls the tool through `connect()`.
3. Run `npm test`.

## Publishing

`npm pack --dry-run` lists what would be published. Only `dist/src` ships, so
the tests stay out of the package. Set a real name and version in
`package.json` before running `npm publish`.
