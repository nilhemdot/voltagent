import { describe, expect, it } from "vitest";
import { MODEL } from "../model";
import { editorTool, writerTool } from "../tools";
import { publishingCoordinator } from "./publishing-coordinator";

describe("publishingCoordinator", () => {
  it("is configured with the shared model", () => {
    expect(publishingCoordinator.model).toBe(MODEL);
  });

  it("has the expected name", () => {
    expect(publishingCoordinator.name).toBe("publishing-coordinator");
  });

  it("instructs a fixed writer-then-editor workflow", () => {
    expect(publishingCoordinator.instructions).toContain("publishing coordinator");
    expect(publishingCoordinator.instructions).toContain("writer_tool");
    expect(publishingCoordinator.instructions).toContain("editor_tool");
    expect(publishingCoordinator.instructions).toContain("Always use both tools in sequence.");
  });

  it("has both the writer and editor tools configured, in order", () => {
    const tools = publishingCoordinator.getTools();
    expect(tools.map((tool) => tool.name)).toEqual([writerTool.name, editorTool.name]);
  });

  it("has no sub-agents", () => {
    expect(publishingCoordinator.getSubAgents()).toHaveLength(0);
  });
});