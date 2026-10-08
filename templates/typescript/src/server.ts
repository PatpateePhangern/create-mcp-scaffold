import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function createServer(): McpServer {
  const server = new McpServer({ name: "{{name}}", version: "0.1.0" });

  // A tool: the model calls it with arguments that match the zod schema.
  server.registerTool(
    "add",
    {
      description: "Add two numbers and return the sum.",
      inputSchema: { a: z.number(), b: z.number() },
    },
    async ({ a, b }) => ({
      content: [{ type: "text", text: String(a + b) }],
    }),
  );

  // A resource: read-only data the client fetches by URI.
  server.registerResource(
    "greeting",
    "greeting://hello",
    { description: "A greeting", mimeType: "text/plain" },
    async (uri) => ({ contents: [{ uri: uri.href, text: "hello" }] }),
  );

  // A prompt: a reusable message template.
  server.registerPrompt(
    "summarize",
    {
      description: "Ask for a summary of a topic.",
      argsSchema: { topic: z.string() },
    },
    ({ topic }) => ({
      messages: [
        { role: "user", content: { type: "text", text: `Summarize ${topic}.` } },
      ],
    }),
  );

  return server;
}
