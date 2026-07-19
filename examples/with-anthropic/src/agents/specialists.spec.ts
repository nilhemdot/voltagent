import { describe, expect, it } from "vitest";
import { MODEL } from "../model";
import { generalAgent, geographyAgent, historyAgent, scienceAgent } from "./specialists";

describe("specialist agents", () => {
  const specialists = [
    {
      agent: generalAgent,
      name: "general",
      purposeContains: "general-knowledge",
      instructionsContain: "general-knowledge",
    },
    {
      agent: geographyAgent,
      name: "geography",
      purposeContains: "capitals",
      instructionsContain: "capitals",
    },
    {
      agent: historyAgent,
      name: "history",
      purposeContains: "historical events",
      instructionsContain: "timelines",
    },
    {
      agent: scienceAgent,
      name: "science",
      purposeContains: "physics",
      instructionsContain: "physics",
    },
  ];

  it.each(specialists)(
    "$name is configured with the shared model, name, purpose, and single-line instructions",
    ({ agent, name, purposeContains, instructionsContain }) => {
      expect(agent.model).toBe(MODEL);
      expect(agent.name).toBe(name);
      expect(agent.purpose).toContain(purposeContains);
      expect(agent.instructions).toContain(instructionsContain);
      expect(typeof agent.instructions).toBe("string");
      expect((agent.instructions as string).includes("\n")).toBe(false);
    },
  );

  it("has no tools or sub-agents configured on any specialist", () => {
    for (const { agent } of specialists) {
      expect(agent.getTools()).toHaveLength(0);
      expect(agent.getSubAgents()).toHaveLength(0);
    }
  });

  it("gives each specialist a distinct name", () => {
    const names = specialists.map(({ agent }) => agent.name);
    expect(new Set(names).size).toBe(names.length);
  });
});