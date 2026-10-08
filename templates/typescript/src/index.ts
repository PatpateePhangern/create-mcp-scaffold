#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

// Stdio servers use stdout for JSON-RPC, so any logging must go to stderr.
const server = createServer();
await server.connect(new StdioServerTransport());
