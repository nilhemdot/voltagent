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
  it("has the expected name and description", () => {
    expect(writerTool.name).toBe("writer_tool");
    expect(writerTool.description).toBe(
      "Write a first-draft blog post on a given topic. Returns the draft text.",
    );
  });

  it("parses valid input with an optional tone", () => {
    const parsed = writerTool.parameters.parse({ topic: "AI agents", tone: "casual" });
    expect(parsed).toEqual({ topic: "AI agents", tone: "casual" });
  });

  it("allows omitting the optional tone", () => {
    const parsed = writerTool.parameters.parse({ topic: "AI agents" });
    expect(parsed).toEqual({ topic: "AI agents" });
  });

  it("rejects input missing the required topic", () => {
    expect(() => writerTool.parameters.parse({})).toThrow();
  });

  it("produces a draft that includes the topic and requested tone", async () => {
    const result = await writerTool.execute?.({ topic: "AI agents", tone: "casual" }, {} as any);
    expect(result).toEqual({
      draft: "# AI agents\n\nA casual first draft about AI agents. Replace this body with real content.",
    });
  });

  it("defaults the tone to 'neutral' when none is provided", async () => {
    const result = await writerTool.execute?.({ topic: "Databases" }, {} as any);
    expect(result).toEqual({
      draft: "# Databases\n\nA neutral first draft about Databases. Replace this body with real content.",
    });
  });
});

describe("editorTool", () => {
  it("has the expected name and description", () => {
    expect(editorTool.name).toBe("editor_tool");
    expect(editorTool.description).toBe("Polish and copy-edit a draft. Returns the edited text.");
  });

  it("trims surrounding whitespace from the content", async () => {
    const result = await editorTool.execute?.({ content: "  Hello world  " }, {} as any);
    expect(result).toEqual({ edited: "Hello world" });
  });

  it("collapses trailing whitespace before newlines", async () => {
    const result = await editorTool.execute?.({ content: "Line one   \nLine two" }, {} as any);
    expect(result).toEqual({ edited: "Line one\nLine two" });
  });

  it("rejects input missing the required content field", () => {
    expect(() => editorTool.parameters.parse({})).toThrow();
  });
});

describe("thinkTool", () => {
  it("has the expected name and description", () => {
    expect(thinkTool.name).toBe("think");
    expect(thinkTool.description).toBe(
      "Record an internal reasoning step while planning. Not shown to the user.",
    );
  });

  it("acknowledges the thought and echoes it back", async () => {
    const result = await thinkTool.execute?.({ thought: "Plan step 1" }, {} as any);
    expect(result).toEqual({ acknowledged: true, thought: "Plan step 1" });
  });

  it("rejects input missing the required thought field", () => {
    expect(() => thinkTool.parameters.parse({})).toThrow();
  });
});

describe("analyzeTool", () => {
  it("has the expected name and description", () => {
    expect(analyzeTool.name).toBe("analyze");
    expect(analyzeTool.description).toBe(
      "Analyze an intermediate result and decide whether the plan needs adjusting.",
    );
  });

  it("returns the provided analysis and nextStep", async () => {
    const result = await analyzeTool.execute?.(
      { analysis: "Looks good", nextStep: "finalize" },
      {} as any,
    );
    expect(result).toEqual({ analysis: "Looks good", nextStep: "finalize" });
  });

  it("defaults nextStep to 'continue' when omitted", async () => {
    const result = await analyzeTool.execute?.({ analysis: "Looks good" }, {} as any);
    expect(result).toEqual({ analysis: "Looks good", nextStep: "continue" });
  });
});

describe("calculatorTool", () => {
  it("has the expected name and description", () => {
    expect(calculatorTool.name).toBe("calculator");
    expect(calculatorTool.description).toBe(
      "Evaluate a basic arithmetic expression using +, -, *, /, and parentheses.",
    );
  });

  it("evaluates a valid arithmetic expression", async () => {
    const result = await calculatorTool.execute?.({ expression: "(2 + 3) * 4" }, {} as any);
    expect(result).toEqual({ expression: "(2 + 3) * 4", result: 20 });
  });

  it("evaluates division and decimals correctly", async () => {
    const result = await calculatorTool.execute?.({ expression: "10 / 4" }, {} as any);
    expect(result).toEqual({ expression: "10 / 4", result: 2.5 });
  });

  it("rejects expressions containing disallowed characters", async () => {
    const result = await calculatorTool.execute?.(
      { expression: "process.exit()" },
      {} as any,
    );
    expect(result).toEqual({
      error: "Only numbers and the operators + - * / ( ) are allowed.",
    });
  });

  it("rejects expressions with letters used to try to escape the sandbox", async () => {
    const result = await calculatorTool.execute?.({ expression: "alert(1)" }, {} as any);
    expect(result).toEqual({
      error: "Only numbers and the operators + - * / ( ) are allowed.",
    });
  });

  it("returns an error for syntactically invalid arithmetic", async () => {
    const result = await calculatorTool.execute?.({ expression: "(1 + )" }, {} as any);
    expect(result).toEqual({ error: "Invalid arithmetic expression." });
  });

  it("rejects input missing the required expression field", () => {
    expect(() => calculatorTool.parameters.parse({})).toThrow();
  });
});

describe("webSearchTool", () => {
  it("has the expected name and description", () => {
    expect(webSearchTool.name).toBe("web_search");
    expect(webSearchTool.description).toBe(
      "Search the web for up-to-date information. Returns a list of result snippets.",
    );
  });

  it("defaults maxResults to 3 when not provided", () => {
    const parsed = webSearchTool.parameters.parse({ query: "voltagent" });
    expect(parsed).toEqual({ query: "voltagent", maxResults: 3 });
  });

  it("rejects maxResults outside the 1-10 range", () => {
    expect(() => webSearchTool.parameters.parse({ query: "voltagent", maxResults: 0 })).toThrow();
    expect(() => webSearchTool.parameters.parse({ query: "voltagent", maxResults: 11 })).toThrow();
  });

  it("returns exactly maxResults mock snippets referencing the query", async () => {
    const result = await webSearchTool.execute?.(
      { query: "voltagent docs", maxResults: 2 },
      {} as any,
    );
    expect(result).toMatchObject({
      query: "voltagent docs",
      note: "Mock results — wire a real search API (Tavily, Exa, etc.) for production use.",
    });
    expect(result.results).toHaveLength(2);
    expect(result.results[0]).toEqual({
      title: 'Result 1 for "voltagent docs"',
      url: "https://example.com/search?q=voltagent%20docs&r=1",
      snippet: "Placeholder snippet 1 about voltagent docs.",
    });
    expect(result.results[1].title).toBe('Result 2 for "voltagent docs"');
  });

  it("returns an empty results array when maxResults is 0 explicitly passed to execute", async () => {
    const result = await webSearchTool.execute?.({ query: "edge case", maxResults: 0 }, {} as any);
    expect(result.results).toEqual([]);
  });
});