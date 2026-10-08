# {{name}}

An MCP server in TypeScript, built on the official `@modelcontextprotocol/sdk`.
It starts with one tool, one resource and one prompt so you can see how each is
registered. The tests run the server in-process, so you don't need a client to
check your work.

## Getting started

```sh
npm install
npm test
npm run build
```

## Running the server

The server talks MCP over stdio. To poke at it in a browser UI, use the
MCP Inspector:

```sh
npx @modelcontextprotocol/inspector node dist/index.js
```

To connect it to a desktop client, point the client at the built file. For
example, in a `mcpServers` config:

```json
{
  "mcpServers": {
    "{{name}}": {
      "command": "node",
      "args": ["/absolute/path/to/{{name}}/dist/index.js"]
    }
  }
}
```

## Where things live

- `src/server.ts` defines the server: `createServer()` registers the tools,
  resources and prompts.
- `src/index.ts` is the entry point that connects the server to stdio.
- `test/harness.ts` has a `connect()` helper that gives you a client wired to
  a server over an in-memory transport.
- `test/server.test.ts` holds the tests.

## Adding a tool

Add a `registerTool` call in `src/server.ts`. The input schema is written with
zod, and the SDK checks incoming arguments against it before your handler runs.
Then add a test that calls the tool through `connect()`.
