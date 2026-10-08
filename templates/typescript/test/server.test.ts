import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
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
    assert.ok(tools.some((t) => t.name === "add"));
  });

  it("adds two numbers", async () => {
    const result = await conn.client.callTool({ name: "add", arguments: { a: 2, b: 3 } });
    assert.deepEqual(result.content, [{ type: "text", text: "5" }]);
  });

  it("rejects arguments that do not match the schema", async () => {
    const result = await conn.client.callTool({ name: "add", arguments: { a: "x", b: 1 } });
    assert.equal(result.isError, true);
  });

  it("serves the greeting resource", async () => {
    const result = await conn.client.readResource({ uri: "greeting://hello" });
    const [first] = result.contents as Array<{ uri: string; text?: string }>;
    assert.equal(first.uri, "greeting://hello");
    assert.equal(first.text, "hello");
  });

  it("renders the summarize prompt", async () => {
    const result = await conn.client.getPrompt({
      name: "summarize",
      arguments: { topic: "tides" },
    });
    assert.deepEqual(result.messages[0].content, { type: "text", text: "Summarize tides." });
  });
});
