import { describe, expect, it } from "vitest";
import { MODEL } from "../model";
import { calculatorTool } from "../tools";
import { mathAgent } from "./math-agent";

describe("mathAgent", () => {
  it("is configured with the shared model", () => {
    expect(mathAgent.model).toBe(MODEL);
  });

  it("has the expected name and purpose", () => {
    expect(mathAgent.name).toBe("math");
    expect(mathAgent.purpose).toContain("JSON");
  });

  it("instructs a step-by-step JSON-only response", () => {
    expect(mathAgent.instructions).toContain("step by step");
    expect(mathAgent.instructions).toContain('"answer"');
    expect(mathAgent.instructions).toContain('"steps"');
    expect(mathAgent.instructions).toContain('"confidence"');
    expect(mathAgent.instructions).toContain("Return only the JSON object");
  });

  it("has the calculator tool configured", () => {
    const tools = mathAgent.getTools();
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe(calculatorTool.name);
  });

  it("has no sub-agents", () => {
    expect(mathAgent.getSubAgents()).toHaveLength(0);
  });
});