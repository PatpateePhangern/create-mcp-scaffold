import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { connect } from "./harness.js";

type Connection = Awaited<ReturnType<typeof connect>>;

describe("{{name}} server", () => {
  let conn: Connection;

  beforeEach(async () => {
    conn = await connect();
  });

  afterEach(async () => {
    await conn.close();
  });

  it("lists the add tool", async () => {
    const { tools } = await conn.client.listTools();
    expect(tools.map((t) => t.name)).toContain("add");
  });

  it("adds two numbers", async () => {
    const result = await conn.client.callTool({ name: "add", arguments: { a: 2, b: 3 } });
    expect(result.content).toEqual([{ type: "text", text: "5" }]);
  });

  it("rejects arguments that do not match the schema", async () => {
    const result = await conn.client.callTool({ name: "add", arguments: { a: "x", b: 1 } });
    expect(result.isError).toBe(true);
  });

  it("serves the greeting resource", async () => {
    const result = await conn.client.readResource({ uri: "greeting://hello" });
    expect(result.contents[0]).toMatchObject({ text: "hello" });
  });

  it("renders the summarize prompt", async () => {
    const result = await conn.client.getPrompt({
      name: "summarize",
      arguments: { topic: "tides" },
    });
    expect(result.messages[0].content).toEqual({ type: "text", text: "Summarize tides." });
  });
});
