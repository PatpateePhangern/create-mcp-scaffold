from contextlib import asynccontextmanager

from mcp.shared.memory import create_connected_server_and_client_session

from {{pkg}}.server import mcp


@asynccontextmanager
async def connect():
    # Connects a client to the server in-process, so tests go through the real
    # MCP protocol without spawning a process. Uses the low-level server object.
    # This is a context manager rather than a pytest fixture because the anyio
    # task group must be entered and exited in the same task.
    async with create_connected_server_and_client_session(mcp._mcp_server) as session:
        yield session
