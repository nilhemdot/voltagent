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

const barrel = await import("./index");
const { routingSupervisor } = await import("./routing-supervisor");
const { publishingCoordinator } = await import("./publishing-coordinator");
const { reasoningAgent } = await import("./reasoning-agent");
const { repoAnalyzer, codeScannerAgent, readmeSummarizerAgent } = await import("./repo-analyzer");
const { mathAgent } = await import("./math-agent");
const { webSearchAgent } = await import("./web-search-agent");
const { editorAgent, recordProcessorAgent } = await import("./output-constrained");
const { generalAgent, geographyAgent, historyAgent, scienceAgent } = await import("./specialists");
const { supportAgent } = await import("./support-agent");

describe("agents barrel export", () => {
  it("re-exports every agent under its expected name", () => {
    expect(barrel.routingSupervisor).toBe(routingSupervisor);
    expect(barrel.publishingCoordinator).toBe(publishingCoordinator);
    expect(barrel.reasoningAgent).toBe(reasoningAgent);
    expect(barrel.repoAnalyzer).toBe(repoAnalyzer);
    expect(barrel.codeScannerAgent).toBe(codeScannerAgent);
    expect(barrel.readmeSummarizerAgent).toBe(readmeSummarizerAgent);
    expect(barrel.mathAgent).toBe(mathAgent);
    expect(barrel.webSearchAgent).toBe(webSearchAgent);
    expect(barrel.editorAgent).toBe(editorAgent);
    expect(barrel.recordProcessorAgent).toBe(recordProcessorAgent);
    expect(barrel.generalAgent).toBe(generalAgent);
    expect(barrel.geographyAgent).toBe(geographyAgent);
    expect(barrel.historyAgent).toBe(historyAgent);
    expect(barrel.scienceAgent).toBe(scienceAgent);
    expect(barrel.supportAgent).toBe(supportAgent);
  });

  it("does not export anything unexpected", () => {
    expect(Object.keys(barrel).sort()).toEqual(
      [
        "routingSupervisor",
        "publishingCoordinator",
        "reasoningAgent",
        "repoAnalyzer",
        "codeScannerAgent",
        "readmeSummarizerAgent",
        "mathAgent",
        "webSearchAgent",
        "editorAgent",
        "recordProcessorAgent",
        "generalAgent",
        "geographyAgent",
        "historyAgent",
        "scienceAgent",
        "supportAgent",
      ].sort(),
    );
  });
});