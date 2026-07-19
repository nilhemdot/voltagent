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

const { mathAgent } = await import("./math-agent");
const { calculatorTool } = await import("../tools");
const { MODEL } = await import("../model");

describe("mathAgent", () => {
  it("is named 'math' with a purpose describing structured JSON answers", () => {
    expect((mathAgent as any).name).toBe("math");
    expect((mathAgent as any).purpose).toMatch(/step by step/i);
    expect((mathAgent as any).purpose).toMatch(/structured JSON answer/i);
  });

  it("uses the shared MODEL constant", () => {
    expect((mathAgent as any).model).toBe(MODEL);
  });

  it("is wired with the calculator tool", () => {
    expect((mathAgent as any).tools).toEqual([calculatorTool]);
  });

  it("instructs the agent to return a JSON object with answer/steps/confidence", () => {
    const instructions = (mathAgent as any).instructions as string;
    expect(instructions).toContain('"answer"');
    expect(instructions).toContain('"steps"');
    expect(instructions).toContain('"confidence"');
    expect(instructions).toMatch(/calculator tool/i);
    expect(instructions).toMatch(/Return only the JSON object, with no surrounding prose\./);
  });
});