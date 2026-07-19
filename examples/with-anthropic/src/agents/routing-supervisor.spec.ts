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

const { routingSupervisor } = await import("./routing-supervisor");
const { mathAgent } = await import("./math-agent");
const { generalAgent, geographyAgent, historyAgent, scienceAgent } = await import("./specialists");
const { MODEL } = await import("../model");

describe("routingSupervisor", () => {
  it("is named 'routing-supervisor' and uses the shared MODEL", () => {
    expect((routingSupervisor as any).name).toBe("routing-supervisor");
    expect((routingSupervisor as any).model).toBe(MODEL);
  });

  it("registers its full specialist team as sub-agents, in the documented order", () => {
    expect((routingSupervisor as any).subAgents).toEqual([
      generalAgent,
      mathAgent,
      geographyAgent,
      historyAgent,
      scienceAgent,
    ]);
  });

  it("lists every specialist agent by name in its instructions", () => {
    const instructions = (routingSupervisor as any).instructions as string;
    for (const specialist of ["general", "math", "geography", "history", "science"]) {
      expect(instructions).toMatch(new RegExp(`- ${specialist}:`));
    }
  });

  it("instructs the supervisor to delegate rather than answer directly", () => {
    const instructions = (routingSupervisor as any).instructions as string;
    expect(instructions).toMatch(/delegate_task tool/);
    expect(instructions).toMatch(/Do not answer specialist questions yourself\./);
  });

  it("has no directly-attached tools (routing is done via sub-agent delegation)", () => {
    expect((routingSupervisor as any).tools).toBeUndefined();
  });
});