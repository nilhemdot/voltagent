import { describe, expect, it } from "vitest";
import * as agentsBarrel from "./index";
import { editorAgent, recordProcessorAgent } from "./output-constrained";
import { mathAgent } from "./math-agent";
import { publishingCoordinator } from "./publishing-coordinator";
import { reasoningAgent } from "./reasoning-agent";
import { codeScannerAgent, readmeSummarizerAgent, repoAnalyzer } from "./repo-analyzer";
import { routingSupervisor } from "./routing-supervisor";
import { generalAgent, geographyAgent, historyAgent, scienceAgent } from "./specialists";
import { supportAgent } from "./support-agent";
import { webSearchAgent } from "./web-search-agent";

describe("agents barrel export", () => {
  it("re-exports every agent defined across the individual agent modules", () => {
    expect(agentsBarrel.routingSupervisor).toBe(routingSupervisor);
    expect(agentsBarrel.publishingCoordinator).toBe(publishingCoordinator);
    expect(agentsBarrel.reasoningAgent).toBe(reasoningAgent);
    expect(agentsBarrel.repoAnalyzer).toBe(repoAnalyzer);
    expect(agentsBarrel.codeScannerAgent).toBe(codeScannerAgent);
    expect(agentsBarrel.readmeSummarizerAgent).toBe(readmeSummarizerAgent);
    expect(agentsBarrel.mathAgent).toBe(mathAgent);
    expect(agentsBarrel.webSearchAgent).toBe(webSearchAgent);
    expect(agentsBarrel.editorAgent).toBe(editorAgent);
    expect(agentsBarrel.recordProcessorAgent).toBe(recordProcessorAgent);
    expect(agentsBarrel.generalAgent).toBe(generalAgent);
    expect(agentsBarrel.geographyAgent).toBe(geographyAgent);
    expect(agentsBarrel.historyAgent).toBe(historyAgent);
    expect(agentsBarrel.scienceAgent).toBe(scienceAgent);
    expect(agentsBarrel.supportAgent).toBe(supportAgent);
  });

  it("exports exactly the fifteen documented agents and nothing else", () => {
    expect(Object.keys(agentsBarrel).sort()).toEqual(
      [
        "codeScannerAgent",
        "editorAgent",
        "generalAgent",
        "geographyAgent",
        "historyAgent",
        "mathAgent",
        "publishingCoordinator",
        "readmeSummarizerAgent",
        "reasoningAgent",
        "recordProcessorAgent",
        "repoAnalyzer",
        "routingSupervisor",
        "scienceAgent",
        "supportAgent",
        "webSearchAgent",
      ].sort(),
    );
  });
});