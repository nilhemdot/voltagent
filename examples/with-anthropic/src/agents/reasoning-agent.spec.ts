import { describe, expect, it } from "vitest";
import { MODEL } from "../model";
import { analyzeTool, thinkTool } from "../tools";
import { reasoningAgent } from "./reasoning-agent";

describe("reasoningAgent", () => {
  it("is named 'reasoning-agent'", () => {
    expect(reasoningAgent.name).toBe("reasoning-agent");
  });

  it("uses the shared MODEL", () => {
    expect(reasoningAgent.model).toBe(MODEL);
  });

  it("describes the understand/plan/analyze reasoning process", () => {
    expect(typeof reasoningAgent.instructions).toBe("string");
    expect(reasoningAgent.instructions).toContain("structured reasoning");
    expect(reasoningAgent.instructions).toContain("**Understanding:**");
    expect(reasoningAgent.instructions).toContain("**Planning:**");
    expect(reasoningAgent.instructions).toContain("**Analyzing:**");
    expect(reasoningAgent.instructions).toContain(
      "Do not expose the raw think/analyze steps unless the user asks to see your reasoning.",
    );
  });

  it("is wired to the think and analyze tools", () => {
    const tools = reasoningAgent.getTools();
    expect(tools).toHaveLength(2);
    expect(tools[0]).toBe(thinkTool);
    expect(tools[1]).toBe(analyzeTool);
    expect(tools.map((tool) => tool.name)).toEqual(["think", "analyze"]);
  });

  it("has no sub-agents", () => {
    expect(reasoningAgent.getSubAgents()).toEqual([]);
  });
});