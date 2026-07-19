import { describe, expect, it, vi } from "vitest";

class MockAgent {
  constructor(options: Record<string, unknown>) {
    Object.assign(this, options);
  }
}

vi.mock("@voltagent/core", () => ({
  Agent: MockAgent,
  createTool: (options: unknown) => options,
}));

const { webSearchAgent } = await import("./web-search-agent");
const { webSearchTool } = await import("../tools");
const { MODEL } = await import("../model");

describe("webSearchAgent", () => {
  it("is named 'web-search-agent' and uses the shared MODEL", () => {
    expect((webSearchAgent as any).name).toBe("web-search-agent");
    expect((webSearchAgent as any).model).toBe(MODEL);
  });

  it("is wired with the web search tool", () => {
    expect((webSearchAgent as any).tools).toEqual([webSearchTool]);
  });

  it("lists its capabilities and example queries", () => {
    const instructions = (webSearchAgent as any).instructions as string;
    expect(instructions).toMatch(/web_search tool/);
    expect(instructions).toMatch(/When to use tools:/);
    expect(instructions).toMatch(/Example queries you can handle:/);
    expect(instructions).toContain("latest stable version of Node.js");
  });
});