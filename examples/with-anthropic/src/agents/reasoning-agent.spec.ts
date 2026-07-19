import { describe, expect, it } from "vitest";
import { MODEL } from "../model";
import { analyzeTool, thinkTool } from "../tools";
import { reasoningAgent } from "./reasoning-agent";

describe("reasoningAgent", () => {
  it("is configured with the shared model", () => {
    expect(reasoningAgent.model).toBe(MODEL);
  });

  it("has the expected name", () => {
    expect(reasoningAgent.name).toBe("reasoning-agent");
  });

  it("has no purpose set (uses only instructions)", () => {
    expect(reasoningAgent.purpose).toBeUndefined();
  });

  it("instructs a structured think/analyze process", () => {
    expect(reasoningAgent.instructions).toContain("structured reasoning");
    expect(reasoningAgent.instructions).toContain("**Understanding:**");
    expect(reasoningAgent.instructions).toContain("**Planning:**");
    expect(reasoningAgent.instructions).toContain("**Analyzing:**");
    expect(reasoningAgent.instructions).toContain(
      "Do not expose the raw think/analyze steps unless the user asks to see your reasoning.",
    );
  });

  it("has the think and analyze tools configured, in order", () => {
    const tools = reasoningAgent.getTools();
    expect(tools.map((tool) => tool.name)).toEqual([thinkTool.name, analyzeTool.name]);
  });

  it("has no sub-agents", () => {
    expect(reasoningAgent.getSubAgents()).toHaveLength(0);
  });
});