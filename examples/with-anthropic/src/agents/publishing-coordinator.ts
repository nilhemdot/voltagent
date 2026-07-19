import { Agent } from "@voltagent/core";
import { MODEL } from "../model";
import { editorTool, writerTool } from "../tools";

/**
 * Tool-orchestration workflow pattern (with-agent-tool/publisher style): call a
 * sequence of tools in a fixed order and return the final result.
 */
export const publishingCoordinator = new Agent({
  name: "publishing-coordinator",
  instructions: `You are a publishing coordinator who manages the blog creation workflow.

Steps:
1. Call the writer_tool to produce a first draft from the user's topic.
2. Call the editor_tool to polish that draft.
3. Return the final polished blog post.

Always use both tools in sequence.`,
  model: MODEL,
  tools: [writerTool, editorTool],
});
