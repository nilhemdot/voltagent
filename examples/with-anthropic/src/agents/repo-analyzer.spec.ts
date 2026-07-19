import { describe, expect, it } from "vitest";
import { MODEL } from "../model";
import { codeScannerAgent, readmeSummarizerAgent, repoAnalyzer } from "./repo-analyzer";

describe("codeScannerAgent", () => {
  it("is configured with the shared model", () => {
    expect(codeScannerAgent.model).toBe(MODEL);
  });

  it("has the expected name and purpose", () => {
    expect(codeScannerAgent.name).toBe("code-scanner");
    expect(codeScannerAgent.purpose).toContain("structure");
  });

  it("has descriptive instructions and no tools or sub-agents", () => {
    expect(codeScannerAgent.instructions).toContain("directory structure");
    expect(codeScannerAgent.getTools()).toHaveLength(0);
    expect(codeScannerAgent.getSubAgents()).toHaveLength(0);
  });
});

describe("readmeSummarizerAgent", () => {
  it("is configured with the shared model", () => {
    expect(readmeSummarizerAgent.model).toBe(MODEL);
  });

  it("has the expected name and purpose", () => {
    expect(readmeSummarizerAgent.name).toBe("readme-summarizer");
    expect(readmeSummarizerAgent.purpose).toContain("README");
  });

  it("has descriptive instructions and no tools or sub-agents", () => {
    expect(readmeSummarizerAgent.instructions).toContain("install it");
    expect(readmeSummarizerAgent.getTools()).toHaveLength(0);
    expect(readmeSummarizerAgent.getSubAgents()).toHaveLength(0);
  });
});

describe("repoAnalyzer", () => {
  it("is configured with the shared model", () => {
    expect(repoAnalyzer.model).toBe(MODEL);
  });

  it("has the expected name", () => {
    expect(repoAnalyzer.name).toBe("repo-analyzer");
  });

  it("instructs delegation to the code-scanner and readme-summarizer sub-agents", () => {
    expect(repoAnalyzer.instructions).toContain("GitHub repository analyzer");
    expect(repoAnalyzer.instructions).toContain("code-scanner");
    expect(repoAnalyzer.instructions).toContain("readme-summarizer");
    expect(repoAnalyzer.instructions).toContain("facebook/react");
  });

  it("delegates to code-scanner and readme-summarizer as sub-agents", () => {
    const subAgents = repoAnalyzer.getSubAgents();
    expect(subAgents).toHaveLength(2);
    expect(subAgents).toContain(codeScannerAgent);
    expect(subAgents).toContain(readmeSummarizerAgent);
  });

  it("declares no static tools (delegation is handled via sub-agents)", () => {
    // No static tools are configured; the delegate_task tool is synthesized
    // by the SubAgentManager at generation time, not at construction time.
    expect(repoAnalyzer.getTools()).toHaveLength(0);
  });
});