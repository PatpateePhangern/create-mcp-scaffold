# {{name}}

An MCP server in Python, built on the official `mcp` package and its
`FastMCP` helper. It starts with one tool, one resource and one prompt so you
can see how each is registered. The tests run the server in-process, so you
don't need a client to check your work.

## Getting started

This project uses [uv](https://docs.astral.sh/uv/).

```sh
uv sync
uv run pytest
```

## Running the server

The server talks MCP over stdio. To try it in a browser UI, use the MCP
Inspector:

```sh
npx @modelcontextprotocol/inspector uv run {{name}}
```

To connect it to a desktop client, point the client at the command. For
example, in a `mcpServers` config:

```json
{
  "mcpServers": {
    "{{name}}": {
      "command": "uv",
      "args": ["--directory", "/absolute/path/to/{{name}}", "run", "{{name}}"]
    }
  }
}
```

## Where things live

- `src/{{pkg}}/server.py` defines the tools, resources and prompts.
- `src/{{pkg}}/__main__.py` is the entry point that starts the stdio server.
- `tests/harness.py` has a `connect()` helper that gives you a client wired to
  the server in-process.
- `tests/test_server.py` holds the tests.

## Adding a tool

Add a function with the `@mcp.tool()` decorator in `src/{{pkg}}/server.py`.
Type hints become the input schema, and the SDK validates arguments before your
function runs. Then add a test that calls it through `connect()`.
