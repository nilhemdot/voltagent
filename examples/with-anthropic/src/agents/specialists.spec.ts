import { describe, expect, it, vi } from "vitest";

class MockAgent {
  constructor(options: Record<string, unknown>) {
    Object.assign(this, options);
  }
}

vi.mock("@voltagent/core", () => ({
  Agent: MockAgent,
}));

const { generalAgent, geographyAgent, historyAgent, scienceAgent } = await import("./specialists");
const { MODEL } = await import("../model");

describe.each([
  { agent: () => generalAgent, name: "general", purposeMatch: /general-knowledge/i, instructionsMatch: /general-knowledge/i },
  {
    agent: () => geographyAgent,
    name: "geography",
    purposeMatch: /places, capitals, borders/i,
    instructionsMatch: /capitals, borders/i,
  },
  {
    agent: () => historyAgent,
    name: "history",
    purposeMatch: /historical events, figures/i,
    instructionsMatch: /events, figures, and timelines/i,
  },
  {
    agent: () => scienceAgent,
    name: "science",
    purposeMatch: /physics, chemistry, biology/i,
    instructionsMatch: /physics, chemistry, biology/i,
  },
])("$name specialist", ({ agent, name, purposeMatch, instructionsMatch }) => {
  it(`is named '${name}' and uses the shared MODEL`, () => {
    const instance = agent() as any;
    expect(instance.name).toBe(name);
    expect(instance.model).toBe(MODEL);
  });

  it("has a purpose describing its domain", () => {
    expect((agent() as any).purpose).toMatch(purposeMatch);
  });

  it("has one-line instructions describing its domain", () => {
    const instructions = (agent() as any).instructions as string;
    expect(instructions).toMatch(instructionsMatch);
    expect(instructions.split("\n")).toHaveLength(1);
  });

  it("has no tools configured", () => {
    expect((agent() as any).tools).toBeUndefined();
  });
});