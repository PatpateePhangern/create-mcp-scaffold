from .server import mcp


def main() -> None:
    # Stdio is the default transport. Stdout carries JSON-RPC, so log to stderr.
    mcp.run()


if __name__ == "__main__":
    main()
