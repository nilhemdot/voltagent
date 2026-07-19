import { Agent } from "@voltagent/core";
import { MODEL } from "../model";

/**
 * Task / output-constrained pattern (with-agent-tool/editor + with-airtable
 * style): capability bullets that end in a strict instruction about the exact
 * output to return and nothing else.
 */

export const editorAgent = new Agent({
  name: "editor-agent",
  purpose: "Copy-edits text and returns only the edited content.",
  instructions: `You are a professional copy editor. You:
- Fix grammar, spelling, and punctuation.
- Improve clarity and flow without changing the meaning.
- Preserve the author's voice and keep any code or quotes verbatim.

Return ONLY the edited content, no explanations.`,
  model: MODEL,
});

export const recordProcessorAgent = new Agent({
  name: "record-processor",
  purpose: "Triages a new record into a summary, priority, and status.",
  instructions: `You process newly created records. For each record, create a concise summary, assign a priority (High/Medium/Low), and set a status (New/In Progress/Blocked/Done).

Return a JSON object with exactly these fields:
{ "summary": string, "priority": "High" | "Medium" | "Low", "status": "New" | "In Progress" | "Blocked" | "Done" }

Return only the JSON object.`,
  model: MODEL,
});
