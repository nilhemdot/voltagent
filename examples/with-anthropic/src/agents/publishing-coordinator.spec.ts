import { describe, expect, it } from "vitest";
import { MODEL } from "../model";
import { editorTool, writerTool } from "../tools";
import { publishingCoordinator } from "./publishing-coordinator";

describe("publishingCoordinator", () => {
  it("is named 'publishing-coordinator'", () => {
    expect(publishingCoordinator.name).toBe("publishing-coordinator");
  });

  it("uses the shared MODEL", () => {
    expect(publishingCoordinator.model).toBe(MODEL);
  });

  it("describes the fixed writer -> editor workflow", () => {
    expect(typeof publishingCoordinator.instructions).toBe("string");
    expect(publishingCoordinator.instructions).toContain("publishing coordinator");
    expect(publishingCoordinator.instructions).toContain("Call the writer_tool");
    expect(publishingCoordinator.instructions).toContain("Call the editor_tool");
    expect(publishingCoordinator.instructions).toContain("Always use both tools in sequence.");
  });

  it("is wired to the writer and editor tools in call order", () => {
    const tools = publishingCoordinator.getTools();
    expect(tools).toHaveLength(2);
    expect(tools[0]).toBe(writerTool);
    expect(tools[1]).toBe(editorTool);
    expect(tools.map((tool) => tool.name)).toEqual(["writer_tool", "editor_tool"]);
  });

  it("has no sub-agents (it orchestrates tools, not agents)", () => {
    expect(publishingCoordinator.getSubAgents()).toEqual([]);
  });
});