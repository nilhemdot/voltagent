import { Agent } from "@voltagent/core";
import { MODEL } from "../model";

/**
 * Concise single-liner pattern (with-subagents style): a short `purpose` the
 * supervisor uses for delegation, plus a one-line `instructions` string.
 * These act as the routing-supervisor's team of domain specialists.
 */

export const generalAgent = new Agent({
  name: "general",
  purpose: "Answers general-knowledge questions that don't fit a specialist.",
  instructions: "Answer general-knowledge questions clearly and concisely.",
  model: MODEL,
});

export const geographyAgent = new Agent({
  name: "geography",
  purpose: "Answers questions about places, capitals, borders, and physical geography.",
  instructions: "Answer geography questions about places, capitals, borders, and physical features.",
  model: MODEL,
});

export const historyAgent = new Agent({
  name: "history",
  purpose: "Answers questions about historical events, figures, and timelines.",
  instructions: "Answer history questions about events, figures, and timelines.",
  model: MODEL,
});

export const scienceAgent = new Agent({
  name: "science",
  purpose: "Answers questions about physics, chemistry, biology, and earth science.",
  instructions: "Answer science questions across physics, chemistry, biology, and earth science.",
  model: MODEL,
});
