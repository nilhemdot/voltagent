import { describe, expect, it } from "vitest";
import { MODEL } from "../model";
import { editorAgent, recordProcessorAgent } from "./output-constrained";

describe("editorAgent", () => {
  it("is configured with the shared model", () => {
    expect(editorAgent.model).toBe(MODEL);
  });

  it("has the expected name and purpose", () => {
    expect(editorAgent.name).toBe("editor-agent");
    expect(editorAgent.purpose).toContain("Copy-edits");
  });

  it("instructs returning only edited content with no explanations", () => {
    expect(editorAgent.instructions).toContain("professional copy editor");
    expect(editorAgent.instructions).toContain("Return ONLY the edited content, no explanations.");
  });

  it("has no tools or sub-agents", () => {
    expect(editorAgent.getTools()).toHaveLength(0);
    expect(editorAgent.getSubAgents()).toHaveLength(0);
  });
});

describe("recordProcessorAgent", () => {
  it("is configured with the shared model", () => {
    expect(recordProcessorAgent.model).toBe(MODEL);
  });

  it("has the expected name and purpose", () => {
    expect(recordProcessorAgent.name).toBe("record-processor");
    expect(recordProcessorAgent.purpose).toContain("Triages");
  });

  it("instructs a fixed JSON schema with summary, priority, and status", () => {
    expect(recordProcessorAgent.instructions).toContain('"summary"');
    expect(recordProcessorAgent.instructions).toContain('"priority"');
    expect(recordProcessorAgent.instructions).toContain('"status"');
    expect(recordProcessorAgent.instructions).toContain("High\" | \"Medium\" | \"Low\"");
    expect(recordProcessorAgent.instructions).toContain("Return only the JSON object.");
  });

  it("has no tools or sub-agents", () => {
    expect(recordProcessorAgent.getTools()).toHaveLength(0);
    expect(recordProcessorAgent.getSubAgents()).toHaveLength(0);
  });
});