import { describe, expect, it } from "vitest";
import { MODEL } from "../model";
import { webSearchTool } from "../tools";
import { webSearchAgent } from "./web-search-agent";

describe("webSearchAgent", () => {
  it("is configured with the shared model", () => {
    expect(webSearchAgent.model).toBe(MODEL);
  });

  it("has the expected name", () => {
    expect(webSearchAgent.name).toBe("web-search-agent");
  });

  it("has no purpose set (uses only instructions)", () => {
    expect(webSearchAgent.purpose).toBeUndefined();
  });

  it("instructs a capability-list with example queries", () => {
    expect(webSearchAgent.instructions).toContain("web search agent");
    expect(webSearchAgent.instructions).toContain("web_search tool");
    expect(webSearchAgent.instructions).toContain("When to use tools:");
    expect(webSearchAgent.instructions).toContain("Example queries you can handle:");
  });

  it("has the web search tool configured", () => {
    const tools = webSearchAgent.getTools();
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe(webSearchTool.name);
  });

  it("has no sub-agents", () => {
    expect(webSearchAgent.getSubAgents()).toHaveLength(0);
  });
});