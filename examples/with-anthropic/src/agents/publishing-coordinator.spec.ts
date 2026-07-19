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

const { publishingCoordinator } = await import("./publishing-coordinator");
const { writerTool, editorTool } = await import("../tools");
const { MODEL } = await import("../model");

describe("publishingCoordinator", () => {
  it("is named 'publishing-coordinator' and uses the shared MODEL", () => {
    expect((publishingCoordinator as any).name).toBe("publishing-coordinator");
    expect((publishingCoordinator as any).model).toBe(MODEL);
  });

  it("orchestrates the writer tool before the editor tool, in that order", () => {
    expect((publishingCoordinator as any).tools).toEqual([writerTool, editorTool]);
  });

  it("describes the fixed two-step workflow", () => {
    const instructions = (publishingCoordinator as any).instructions as string;
    const writerIndex = instructions.indexOf("writer_tool");
    const editorIndex = instructions.indexOf("editor_tool");

    expect(writerIndex).toBeGreaterThan(-1);
    expect(editorIndex).toBeGreaterThan(-1);
    expect(writerIndex).toBeLessThan(editorIndex);
    expect(instructions).toMatch(/Always use both tools in sequence\./);
  });
});