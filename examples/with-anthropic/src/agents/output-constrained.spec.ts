import { describe, expect, it, vi } from "vitest";

class MockAgent {
  constructor(options: Record<string, unknown>) {
    Object.assign(this, options);
  }
}

vi.mock("@voltagent/core", () => ({
  Agent: MockAgent,
}));

const { editorAgent, recordProcessorAgent } = await import("./output-constrained");
const { MODEL } = await import("../model");

describe("editorAgent", () => {
  it("is named 'editor-agent' and uses the shared MODEL", () => {
    expect((editorAgent as any).name).toBe("editor-agent");
    expect((editorAgent as any).model).toBe(MODEL);
  });

  it("has no tools configured", () => {
    expect((editorAgent as any).tools).toBeUndefined();
  });

  it("constrains output to only the edited content", () => {
    const instructions = (editorAgent as any).instructions as string;
    expect(instructions).toMatch(/professional copy editor/i);
    expect(instructions).toMatch(/Return ONLY the edited content, no explanations\./);
  });
});

describe("recordProcessorAgent", () => {
  it("is named 'record-processor' and uses the shared MODEL", () => {
    expect((recordProcessorAgent as any).name).toBe("record-processor");
    expect((recordProcessorAgent as any).model).toBe(MODEL);
  });

  it("requires a JSON object with summary, priority, and status fields", () => {
    const instructions = (recordProcessorAgent as any).instructions as string;
    expect(instructions).toContain('"summary": string');
    expect(instructions).toContain('"High" | "Medium" | "Low"');
    expect(instructions).toContain('"New" | "In Progress" | "Blocked" | "Done"');
    expect(instructions).toMatch(/Return only the JSON object\./);
  });
});