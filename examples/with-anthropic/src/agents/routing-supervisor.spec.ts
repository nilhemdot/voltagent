import { describe, expect, it } from "vitest";
import { MODEL } from "../model";
import { mathAgent } from "./math-agent";
import { generalAgent, geographyAgent, historyAgent, scienceAgent } from "./specialists";
import { routingSupervisor } from "./routing-supervisor";

describe("routingSupervisor", () => {
  it("is named 'routing-supervisor'", () => {
    expect(routingSupervisor.name).toBe("routing-supervisor");
  });

  it("uses the shared MODEL", () => {
    expect(routingSupervisor.model).toBe(MODEL);
  });

  it("lists every specialist and instructs delegation via delegate_task", () => {
    expect(typeof routingSupervisor.instructions).toBe("string");
    expect(routingSupervisor.instructions).toContain("general: general-knowledge questions");
    expect(routingSupervisor.instructions).toContain(
      "math: mathematical problems and calculations",
    );
    expect(routingSupervisor.instructions).toContain(
      "geography: places, capitals, maps, and physical geography",
    );
    expect(routingSupervisor.instructions).toContain(
      "history: historical events, figures, and timelines",
    );
    expect(routingSupervisor.instructions).toContain(
      "science: physics, chemistry, biology, and earth science",
    );
    expect(routingSupervisor.instructions).toContain("delegate_task tool");
    expect(routingSupervisor.instructions).toContain("Do not answer specialist questions yourself.");
  });

  it("has all five specialists registered as sub-agents in the documented order", () => {
    const subAgents = routingSupervisor.getSubAgents();
    expect(subAgents).toEqual([generalAgent, mathAgent, geographyAgent, historyAgent, scienceAgent]);
  });

  it("has no statically-configured tools of its own", () => {
    expect(routingSupervisor.getTools()).toEqual([]);
  });
});