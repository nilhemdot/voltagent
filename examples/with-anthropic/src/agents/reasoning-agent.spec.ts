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

const { reasoningAgent } = await import("./reasoning-agent");
const { thinkTool, analyzeTool } = await import("../tools");
const { MODEL } = await import("../model");

describe("reasoningAgent", () => {
  it("is named 'reasoning-agent' and uses the shared MODEL", () => {
    expect((reasoningAgent as any).name).toBe("reasoning-agent");
    expect((reasoningAgent as any).model).toBe(MODEL);
  });

  it("is wired with the think and analyze tools, in that order", () => {
    expect((reasoningAgent as any).tools).toEqual([thinkTool, analyzeTool]);
  });

  it("describes the understand/plan/analyze reasoning process", () => {
    const instructions = (reasoningAgent as any).instructions as string;
    expect(instructions).toMatch(/\*\*Understanding:\*\*/);
    expect(instructions).toMatch(/\*\*Planning:\*\*/);
    expect(instructions).toMatch(/\*\*Analyzing:\*\*/);
    expect(instructions).toMatch(/think tool/);
    expect(instructions).toMatch(/analyze tool/);
    expect(instructions).toMatch(/Do not expose the raw think\/analyze steps/);
  });
});