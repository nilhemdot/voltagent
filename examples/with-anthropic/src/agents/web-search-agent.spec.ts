import { describe, expect, it } from "vitest";
import { MODEL } from "../model";
import { webSearchTool } from "../tools";
import { webSearchAgent } from "./web-search-agent";

describe("webSearchAgent", () => {
  it("is named 'web-search-agent'", () => {
    expect(webSearchAgent.name).toBe("web-search-agent");
  });

  it("uses the shared MODEL", () => {
    expect(webSearchAgent.model).toBe(MODEL);
  });

  it("describes its capabilities and when to reach for the search tool", () => {
    expect(typeof webSearchAgent.instructions).toBe("string");
    expect(webSearchAgent.instructions).toContain("web search agent powered by a web search API");
    expect(webSearchAgent.instructions).toContain("When to use tools:");
    expect(webSearchAgent.instructions).toContain("Example queries you can handle:");
  });

  it("is equipped with only the web_search tool", () => {
    const tools = webSearchAgent.getTools();
    expect(tools).toHaveLength(1);
    expect(tools[0]).toBe(webSearchTool);
    expect(tools.map((tool) => tool.name)).toEqual(["web_search"]);
  });

  it("has no sub-agents", () => {
    expect(webSearchAgent.getSubAgents()).toEqual([]);
  });
});