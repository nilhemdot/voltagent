import { describe, expect, it } from "vitest";
import { MODEL } from "../model";
import { calculatorTool } from "../tools";
import { mathAgent } from "./math-agent";

describe("mathAgent", () => {
  it("is named 'math' with the role + JSON-output purpose", () => {
    expect(mathAgent.name).toBe("math");
    expect(mathAgent.purpose).toBe(
      "Solves math problems step by step and returns a structured JSON answer.",
    );
  });

  it("uses the shared MODEL", () => {
    expect(mathAgent.model).toBe(MODEL);
  });

  it("has a string instructions prompt describing the step-by-step JSON process", () => {
    expect(typeof mathAgent.instructions).toBe("string");
    expect(mathAgent.instructions).toContain("mathematical problem-solving agent");
    expect(mathAgent.instructions).toContain("calculator tool");
    expect(mathAgent.instructions).toContain('"answer"');
    expect(mathAgent.instructions).toContain('"confidence"');
    expect(mathAgent.instructions).toContain("Return only the JSON object, with no surrounding prose.");
  });

  it("is equipped with only the calculator tool", () => {
    const tools = mathAgent.getTools();
    expect(tools).toHaveLength(1);
    expect(tools[0]).toBe(calculatorTool);
    expect(tools.map((tool) => tool.name)).toEqual(["calculator"]);
  });

  it("has no sub-agents", () => {
    expect(mathAgent.getSubAgents()).toEqual([]);
  });
});