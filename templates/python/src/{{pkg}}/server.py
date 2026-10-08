from mcp.server.fastmcp import FastMCP

mcp = FastMCP("{{name}}")


# A tool: the model calls it with arguments that match the type hints.
@mcp.tool()
def add(a: int, b: int) -> int:
    """Add two numbers and return the sum."""
    return a + b


# A resource: read-only data the client fetches by URI.
@mcp.resource("greeting://hello", mime_type="text/plain")
def hello() -> str:
    """A greeting."""
    return "hello"


# A prompt: a reusable message template.
@mcp.prompt()
def summarize(topic: str) -> str:
    """Ask for a summary of a topic."""
    return f"Summarize {topic}."
