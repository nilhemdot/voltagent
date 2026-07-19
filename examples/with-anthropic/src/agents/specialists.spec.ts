import { describe, expect, it } from "vitest";
import { MODEL } from "../model";
import { generalAgent, geographyAgent, historyAgent, scienceAgent } from "./specialists";

describe("specialist agents", () => {
  const cases = [
    {
      name: "general",
      agent: generalAgent,
      purpose: "Answers general-knowledge questions that don't fit a specialist.",
      instructions: "Answer general-knowledge questions clearly and concisely.",
    },
    {
      name: "geography",
      agent: geographyAgent,
      purpose: "Answers questions about places, capitals, borders, and physical geography.",
      instructions: "Answer geography questions about places, capitals, borders, and physical features.",
    },
    {
      name: "history",
      agent: historyAgent,
      purpose: "Answers questions about historical events, figures, and timelines.",
      instructions: "Answer history questions about events, figures, and timelines.",
    },
    {
      name: "science",
      agent: scienceAgent,
      purpose: "Answers questions about physics, chemistry, biology, and earth science.",
      instructions: "Answer science questions across physics, chemistry, biology, and earth science.",
    },
  ];

  it.each(cases.map(({ name, agent, purpose, instructions }) => [name, agent, purpose, instructions]))(
    "%s has the expected name, purpose, instructions, and model",
    (name, agent, purpose, instructions) => {
      expect(agent.name).toBe(name);
      expect(agent.purpose).toBe(purpose);
      expect(agent.instructions).toBe(instructions);
      expect(agent.model).toBe(MODEL);
    },
  );

  it.each(cases.map(({ name, agent }) => [name, agent]))(
    "%s has no tools and no sub-agents (it's a routing leaf, not a supervisor)",
    (_name, agent) => {
      expect(agent.getTools()).toEqual([]);
      expect(agent.getSubAgents()).toEqual([]);
    },
  );

  it("has a unique name per specialist so the supervisor can route unambiguously", () => {
    const names = cases.map(({ agent }) => agent.name);
    expect(new Set(names).size).toBe(names.length);
  });
});