import { describe, expect, it } from "vitest";
import { MODEL } from "../model";
import { codeScannerAgent, readmeSummarizerAgent, repoAnalyzer } from "./repo-analyzer";

describe("codeScannerAgent", () => {
  it("is named 'code-scanner' with a structure-mapping purpose", () => {
    expect(codeScannerAgent.name).toBe("code-scanner");
    expect(codeScannerAgent.purpose).toBe(
      "Maps a repository's structure, main languages, and entry points.",
    );
  });

  it("uses the shared MODEL and has no tools", () => {
    expect(codeScannerAgent.model).toBe(MODEL);
    expect(codeScannerAgent.getTools()).toEqual([]);
  });

  it("has a one-line instructions string", () => {
    expect(codeScannerAgent.instructions).toBe(
      "Given a repository, describe its directory structure, primary languages, build tooling, and likely entry points.",
    );
  });
});

describe("readmeSummarizerAgent", () => {
  it("is named 'readme-summarizer' with a README-summarizing purpose", () => {
    expect(readmeSummarizerAgent.name).toBe("readme-summarizer");
    expect(readmeSummarizerAgent.purpose).toBe(
      "Summarizes a repository's README and getting-started steps.",
    );
  });

  it("uses the shared MODEL and has no tools", () => {
    expect(readmeSummarizerAgent.model).toBe(MODEL);
    expect(readmeSummarizerAgent.getTools()).toEqual([]);
  });

  it("has a one-line instructions string", () => {
    expect(readmeSummarizerAgent.instructions).toBe(
      "Summarize what the project does, who it is for, how to install it, and how to run it, based on its README.",
    );
  });
});

describe("repoAnalyzer", () => {
  it("is named 'repo-analyzer'", () => {
    expect(repoAnalyzer.name).toBe("repo-analyzer");
  });

  it("uses the shared MODEL", () => {
    expect(repoAnalyzer.model).toBe(MODEL);
  });

  it("describes delegating to code-scanner and readme-summarizer", () => {
    expect(typeof repoAnalyzer.instructions).toBe("string");
    expect(repoAnalyzer.instructions).toContain("GitHub repository analyzer");
    expect(repoAnalyzer.instructions).toContain("Delegate to code-scanner");
    expect(repoAnalyzer.instructions).toContain("Delegate to readme-summarizer");
    expect(repoAnalyzer.instructions).toContain("Example input: facebook/react");
  });

  it("delegates to the code-scanner and readme-summarizer sub-agents in order", () => {
    const subAgents = repoAnalyzer.getSubAgents();
    expect(subAgents).toHaveLength(2);
    expect(subAgents).toEqual([codeScannerAgent, readmeSummarizerAgent]);
  });

  it("has no statically-configured tools of its own", () => {
    expect(repoAnalyzer.getTools()).toEqual([]);
  });
});