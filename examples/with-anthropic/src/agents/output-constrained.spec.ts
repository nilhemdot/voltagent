import { describe, expect, it } from "vitest";
import { MODEL } from "../model";
import { editorAgent, recordProcessorAgent } from "./output-constrained";

describe("editorAgent", () => {
  it("is named 'editor-agent' with a copy-editing purpose", () => {
    expect(editorAgent.name).toBe("editor-agent");
    expect(editorAgent.purpose).toBe("Copy-edits text and returns only the edited content.");
  });

  it("uses the shared MODEL", () => {
    expect(editorAgent.model).toBe(MODEL);
  });

  it("instructs the model to return only the edited content", () => {
    expect(typeof editorAgent.instructions).toBe("string");
    expect(editorAgent.instructions).toContain("professional copy editor");
    expect(editorAgent.instructions).toContain("Return ONLY the edited content, no explanations.");
  });

  it("has no tools or sub-agents", () => {
    expect(editorAgent.getTools()).toEqual([]);
    expect(editorAgent.getSubAgents()).toEqual([]);
  });
});

describe("recordProcessorAgent", () => {
  it("is named 'record-processor' with a triage purpose", () => {
    expect(recordProcessorAgent.name).toBe("record-processor");
    expect(recordProcessorAgent.purpose).toBe(
      "Triages a new record into a summary, priority, and status.",
    );
  });

  it("uses the shared MODEL", () => {
    expect(recordProcessorAgent.model).toBe(MODEL);
  });

  it("constrains output to a fixed JSON schema of summary/priority/status", () => {
    expect(typeof recordProcessorAgent.instructions).toBe("string");
    expect(recordProcessorAgent.instructions).toContain('"summary": string');
    expect(recordProcessorAgent.instructions).toContain(
      '"priority": "High" | "Medium" | "Low"',
    );
    expect(recordProcessorAgent.instructions).toContain(
      '"status": "New" | "In Progress" | "Blocked" | "Done"',
    );
    expect(recordProcessorAgent.instructions).toContain("Return only the JSON object.");
  });

  it("has no tools or sub-agents", () => {
    expect(recordProcessorAgent.getTools()).toEqual([]);
    expect(recordProcessorAgent.getSubAgents()).toEqual([]);
  });
});