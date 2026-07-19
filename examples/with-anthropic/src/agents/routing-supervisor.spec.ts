import { describe, expect, it } from "vitest";
import { MODEL } from "../model";
import { mathAgent } from "./math-agent";
import { routingSupervisor } from "./routing-supervisor";
import { generalAgent, geographyAgent, historyAgent, scienceAgent } from "./specialists";

describe("routingSupervisor", () => {
  it("is configured with the shared model", () => {
    expect(routingSupervisor.model).toBe(MODEL);
  });

  it("has the expected name", () => {
    expect(routingSupervisor.name).toBe("routing-supervisor");
  });

  it("instructs routing to a single most appropriate specialist", () => {
    expect(routingSupervisor.instructions).toContain("supervisor agent");
    expect(routingSupervisor.instructions).toContain("delegate_task");
    expect(routingSupervisor.instructions).toContain("- general:");
    expect(routingSupervisor.instructions).toContain("- math:");
    expect(routingSupervisor.instructions).toContain("- geography:");
    expect(routingSupervisor.instructions).toContain("- history:");
    expect(routingSupervisor.instructions).toContain("- science:");
    expect(routingSupervisor.instructions).toContain("Do not answer specialist questions yourself.");
  });

  it("has the full specialist team configured as sub-agents, in order", () => {
    const subAgents = routingSupervisor.getSubAgents();
    expect(subAgents).toEqual([generalAgent, mathAgent, geographyAgent, historyAgent, scienceAgent]);
  });

  it("declares no static tools (delegate_task is synthesized at generation time)", () => {
    expect(routingSupervisor.getTools()).toHaveLength(0);
  });
});