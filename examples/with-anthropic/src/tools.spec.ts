import { describe, expect, it } from "vitest";
import {
  analyzeTool,
  calculatorTool,
  editorTool,
  thinkTool,
  webSearchTool,
  writerTool,
} from "./tools";

describe("writerTool", () => {
  it("has the expected metadata", () => {
    expect(writerTool.name).toBe("writer_tool");
    expect(writerTool.description).toContain("first-draft blog post");
  });

  it("produces a draft that includes the topic and requested tone", async () => {
    const result = await writerTool.execute({ topic: "AI Agents", tone: "casual" });
    expect(result).toEqual({
      draft: expect.stringContaining("AI Agents"),
    });
    expect(result.draft).toContain("casual");
    expect(result.draft.startsWith("# AI Agents")).toBe(true);
  });

  it("defaults the tone to 'neutral' when not provided", async () => {
    const result = await writerTool.execute({ topic: "Testing" });
    expect(result.draft).toContain("A neutral first draft about Testing");
  });
});

describe("editorTool", () => {
  it("has the expected metadata", () => {
    expect(editorTool.name).toBe("editor_tool");
  });

  it("trims leading and trailing whitespace", async () => {
    const result = await editorTool.execute({ content: "   hello world   " });
    expect(result).toEqual({ edited: "hello world" });
  });

  it("collapses trailing whitespace before newlines", async () => {
    const result = await editorTool.execute({ content: "line one   \nline two" });
    expect(result.edited).toBe("line one\nline two");
  });

  it("returns an empty string when given only whitespace", async () => {
    const result = await editorTool.execute({ content: "   \n   " });
    expect(result.edited).toBe("");
  });
});

describe("thinkTool", () => {
  it("has the expected metadata", () => {
    expect(thinkTool.name).toBe("think");
  });

  it("acknowledges and echoes back the thought", async () => {
    const result = await thinkTool.execute({ thought: "Let's break this into steps." });
    expect(result).toEqual({ acknowledged: true, thought: "Let's break this into steps." });
  });
});

describe("analyzeTool", () => {
  it("has the expected metadata", () => {
    expect(analyzeTool.name).toBe("analyze");
  });

  it("defaults nextStep to 'continue' when omitted", async () => {
    const result = await analyzeTool.execute({ analysis: "Result looks correct." });
    expect(result).toEqual({ analysis: "Result looks correct.", nextStep: "continue" });
  });

  it("passes through an explicit nextStep", async () => {
    const result = await analyzeTool.execute({
      analysis: "Result is off by one.",
      nextStep: "retry the previous step",
    });
    expect(result).toEqual({
      analysis: "Result is off by one.",
      nextStep: "retry the previous step",
    });
  });
});

describe("calculatorTool", () => {
  it("has the expected metadata", () => {
    expect(calculatorTool.name).toBe("calculator");
  });

  it("evaluates a simple arithmetic expression", async () => {
    const result = await calculatorTool.execute({ expression: "2 + 3" });
    expect(result).toEqual({ expression: "2 + 3", result: 5 });
  });

  it("respects operator precedence and parentheses", async () => {
    const result = await calculatorTool.execute({ expression: "(2 + 3) * 4" });
    expect(result).toEqual({ expression: "(2 + 3) * 4", result: 20 });
  });

  it("supports decimals and division", async () => {
    const result = await calculatorTool.execute({ expression: "7 / 2" });
    expect(result).toEqual({ expression: "7 / 2", result: 3.5 });
  });

  it("rejects expressions containing disallowed characters", async () => {
    const result = await calculatorTool.execute({ expression: "console.log(1)" });
    expect(result).toEqual({
      error: "Only numbers and the operators + - * / ( ) are allowed.",
    });
  });

  it("rejects expressions that attempt to reference identifiers", async () => {
    const result = await calculatorTool.execute({ expression: "process.exit()" });
    expect(result).toEqual({
      error: "Only numbers and the operators + - * / ( ) are allowed.",
    });
  });

  it("returns an error for syntactically invalid arithmetic", async () => {
    const result = await calculatorTool.execute({ expression: "()" });
    expect(result).toEqual({ error: "Invalid arithmetic expression." });
  });

  it("returns an error for a dangling operator", async () => {
    const result = await calculatorTool.execute({ expression: "2 +" });
    expect(result).toEqual({ error: "Invalid arithmetic expression." });
  });
});

describe("webSearchTool", () => {
  it("has the expected metadata", () => {
    expect(webSearchTool.name).toBe("web_search");
  });

  it("returns the requested number of mock results", async () => {
    const result = await webSearchTool.execute({ query: "VoltAgent", maxResults: 2 });
    expect(result.query).toBe("VoltAgent");
    expect(result.results).toHaveLength(2);
    expect(result.results[0]).toEqual({
      title: 'Result 1 for "VoltAgent"',
      url: "https://example.com/search?q=VoltAgent&r=1",
      snippet: "Placeholder snippet 1 about VoltAgent.",
    });
    expect(result.note).toContain("Mock results");
  });

  it("returns an empty result list when maxResults is 0", async () => {
    const result = await webSearchTool.execute({ query: "anything", maxResults: 0 });
    expect(result.results).toEqual([]);
  });

  it("URL-encodes special characters in the query", async () => {
    const result = await webSearchTool.execute({ query: "C++ & TypeScript", maxResults: 1 });
    expect(result.results[0].url).toBe(
      `https://example.com/search?q=${encodeURIComponent("C++ & TypeScript")}&r=1`,
    );
  });
});