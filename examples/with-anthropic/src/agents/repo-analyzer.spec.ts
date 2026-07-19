import { describe, expect, it, vi } from "vitest";

class MockAgent {
  constructor(options: Record<string, unknown>) {
    Object.assign(this, options);
  }
}

vi.mock("@voltagent/core", () => ({
  Agent: MockAgent,
}));

const { codeScannerAgent, readmeSummarizerAgent, repoAnalyzer } = await import("./repo-analyzer");
const { MODEL } = await import("../model");

describe("codeScannerAgent", () => {
  it("is named 'code-scanner' and uses the shared MODEL", () => {
    expect((codeScannerAgent as any).name).toBe("code-scanner");
    expect((codeScannerAgent as any).model).toBe(MODEL);
  });

  it("describes mapping structure, languages, and entry points", () => {
    expect((codeScannerAgent as any).purpose).toMatch(/structure, main languages, and entry points/i);
    expect((codeScannerAgent as any).instructions).toMatch(/directory structure, primary languages/i);
  });
});

describe("readmeSummarizerAgent", () => {
  it("is named 'readme-summarizer' and uses the shared MODEL", () => {
    expect((readmeSummarizerAgent as any).name).toBe("readme-summarizer");
    expect((readmeSummarizerAgent as any).model).toBe(MODEL);
  });

  it("describes summarizing the README and getting-started steps", () => {
    expect((readmeSummarizerAgent as any).purpose).toMatch(/README and getting-started steps/i);
    expect((readmeSummarizerAgent as any).instructions).toMatch(/how to install it, and how to run it/i);
  });
});

describe("repoAnalyzer", () => {
  it("is named 'repo-analyzer' and uses the shared MODEL", () => {
    expect((repoAnalyzer as any).name).toBe("repo-analyzer");
    expect((repoAnalyzer as any).model).toBe(MODEL);
  });

  it("delegates to the code-scanner and readme-summarizer sub-agents, in that order", () => {
    expect((repoAnalyzer as any).subAgents).toEqual([codeScannerAgent, readmeSummarizerAgent]);
  });

  it("describes the delegate-then-combine workflow", () => {
    const instructions = (repoAnalyzer as any).instructions as string;
    const scannerIndex = instructions.indexOf("code-scanner");
    const summarizerIndex = instructions.indexOf("readme-summarizer");

    expect(scannerIndex).toBeGreaterThan(-1);
    expect(summarizerIndex).toBeGreaterThan(-1);
    expect(scannerIndex).toBeLessThan(summarizerIndex);
    expect(instructions).toContain("facebook/react");
  });

  it("has no directly-attached tools (it only delegates)", () => {
    expect((repoAnalyzer as any).tools).toBeUndefined();
  });
});