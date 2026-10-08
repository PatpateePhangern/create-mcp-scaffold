# {{name}}

An MCP server in Python, built on the official `mcp` package and its
`FastMCP` helper. It starts with one tool, one resource and one prompt so you
can see how each is registered. The tests run the server in-process, so you
don't need a client to check your work.

## Requirements

- Python 3.10 or newer
- [uv](https://docs.astral.sh/uv/), which creates the virtual environment and
  installs dependencies

## Getting started

```sh
uv sync          # creates .venv and installs mcp and pytest
uv run pytest    # runs the tests
uv run {{name}}  # runs the server on stdio
```

## Running the server

The server talks MCP over stdio, so it only makes sense when a client starts it.
To try it interactively, use the MCP Inspector, which opens a web UI:

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
- `tests/harness.py` has a `connect()` helper. It gives you a client wired to
  the server in-process.
- `tests/test_server.py` holds the tests.

## Adding a tool

1. Add a function with the `@mcp.tool()` decorator in `src/{{pkg}}/server.py`.
   Type hints become the input schema, and the SDK validates arguments before
   your function runs.
2. Add a test in `tests/test_server.py` that calls the tool through `connect()`.
3. Run `uv run pytest`.

## Publishing

Change `name`, `version` and `description` in `pyproject.toml`, then run
`uv build` to create the wheel and sdist in `dist/`. Upload them with
`uv publish`, which needs a PyPI token.
