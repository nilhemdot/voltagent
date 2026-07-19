import { describe, expect, it, vi } from "vitest";

// `tools.ts` only relies on `createTool` from @voltagent/core to wrap its
// definitions. We mock it as an identity passthrough so these tests exercise
// the actual `execute`/`parameters` logic added in this PR without depending
// on (pre-existing) internals of the @voltagent/core Tool class.
vi.mock("@voltagent/core", () => ({
  createTool: (options: unknown) => options,
}));

const { writerTool, editorTool, thinkTool, analyzeTool, calculatorTool, webSearchTool } = await import(
  "./tools"
);

describe("writerTool", () => {
  it("has the expected name and description", () => {
    expect(writerTool.name).toBe("writer_tool");
    expect(writerTool.description).toMatch(/first-draft blog post/i);
  });

  it("produces a draft that includes the topic and requested tone", async () => {
    const result = await writerTool.execute({ topic: "AI agents", tone: "casual" });
    expect(result.draft).toContain("# AI agents");
    expect(result.draft).toContain("casual first draft about AI agents");
  });

  it("defaults to a 'neutral' tone when none is provided", async () => {
    const result = await writerTool.execute({ topic: "AI agents" });
    expect(result.draft).toContain("neutral first draft about AI agents");
  });
});

describe("editorTool", () => {
  it("has the expected name and description", () => {
    expect(editorTool.name).toBe("editor_tool");
    expect(editorTool.description).toMatch(/polish and copy-edit/i);
  });

  it("trims surrounding whitespace and collapses trailing spaces before newlines", async () => {
    const result = await editorTool.execute({ content: "Hello   \nWorld  " });
    expect(result.edited).toBe("Hello\nWorld");
  });

  it("leaves already-clean content untouched", async () => {
    const result = await editorTool.execute({ content: "Already clean." });
    expect(result.edited).toBe("Already clean.");
  });
});

describe("thinkTool", () => {
  it("has the expected name and description", () => {
    expect(thinkTool.name).toBe("think");
    expect(thinkTool.description).toMatch(/internal reasoning step/i);
  });

  it("acknowledges the recorded thought", async () => {
    const result = await thinkTool.execute({ thought: "consider edge cases" });
    expect(result).toEqual({ acknowledged: true, thought: "consider edge cases" });
  });
});

describe("analyzeTool", () => {
  it("has the expected name and description", () => {
    expect(analyzeTool.name).toBe("analyze");
    expect(analyzeTool.description).toMatch(/analyze an intermediate result/i);
  });

  it("defaults nextStep to 'continue' when omitted", async () => {
    const result = await analyzeTool.execute({ analysis: "result looks correct" });
    expect(result).toEqual({ analysis: "result looks correct", nextStep: "continue" });
  });

  it("preserves an explicit nextStep", async () => {
    const result = await analyzeTool.execute({ analysis: "needs another pass", nextStep: "re-plan" });
    expect(result).toEqual({ analysis: "needs another pass", nextStep: "re-plan" });
  });
});

describe("calculatorTool", () => {
  it("has the expected name and description", () => {
    expect(calculatorTool.name).toBe("calculator");
    expect(calculatorTool.description).toMatch(/basic arithmetic expression/i);
  });

  it("evaluates a simple expression", async () => {
    const result = await calculatorTool.execute({ expression: "2+2" });
    expect(result).toEqual({ expression: "2+2", result: 4 });
  });

  it("evaluates an expression with parentheses and operator precedence", async () => {
    const result = await calculatorTool.execute({ expression: "(2 + 3) * 4" });
    expect(result).toEqual({ expression: "(2 + 3) * 4", result: 20 });
  });

  it("rejects expressions containing disallowed characters", async () => {
    const result = await calculatorTool.execute({ expression: "DROP TABLE users" });
    expect(result).toEqual({ error: "Only numbers and the operators + - * / ( ) are allowed." });
  });

  it("rejects expressions attempting arbitrary code access", async () => {
    const result = await calculatorTool.execute({ expression: "process.exit()" });
    expect(result).toEqual({ error: "Only numbers and the operators + - * / ( ) are allowed." });
  });

  it("returns an error for syntactically invalid arithmetic", async () => {
    const result = await calculatorTool.execute({ expression: "((1+2" });
    expect(result).toEqual({ error: "Invalid arithmetic expression." });
  });

  it("does not throw on division by zero, matching native JS semantics", async () => {
    const result = await calculatorTool.execute({ expression: "1/0" });
    expect(result).toEqual({ expression: "1/0", result: Number.POSITIVE_INFINITY });
  });
});

describe("webSearchTool", () => {
  it("has the expected name and description", () => {
    expect(webSearchTool.name).toBe("web_search");
    expect(webSearchTool.description).toMatch(/search the web/i);
  });

  it("returns the requested number of mock results with the query echoed back", async () => {
    const result = await webSearchTool.execute({ query: "voltagent", maxResults: 2 });
    expect(result.query).toBe("voltagent");
    expect(result.results).toHaveLength(2);
    expect(result.results[0]).toEqual({
      title: `Result 1 for "voltagent"`,
      url: "https://example.com/search?q=voltagent&r=1",
      snippet: "Placeholder snippet 1 about voltagent.",
    });
    expect(result.note).toMatch(/mock results/i);
  });

  it("URL-encodes special characters in the query", async () => {
    const result = await webSearchTool.execute({ query: "a b&c", maxResults: 1 });
    expect(result.results[0].url).toContain(encodeURIComponent("a b&c"));
  });

  it("defaults maxResults to 3 via its parameters schema when omitted", () => {
    const parsedParams = webSearchTool.parameters.parse({ query: "voltagent" });
    expect(parsedParams.maxResults).toBe(3);
  });

  it("rejects maxResults outside of the 1-10 range at the schema level", () => {
    expect(() => webSearchTool.parameters.parse({ query: "voltagent", maxResults: 11 })).toThrow();
    expect(() => webSearchTool.parameters.parse({ query: "voltagent", maxResults: 0 })).toThrow();
  });
});