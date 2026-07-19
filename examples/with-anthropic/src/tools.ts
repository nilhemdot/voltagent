import { createTool } from "@voltagent/core";
import { z } from "zod";

/** Blog writer used by the publishing-coordinator (tool-orchestration pattern). */
export const writerTool = createTool({
  name: "writer_tool",
  description: "Write a first-draft blog post on a given topic. Returns the draft text.",
  parameters: z.object({
    topic: z.string().describe("The blog topic to write about"),
    tone: z.string().optional().describe("Desired tone, e.g. 'casual', 'technical'"),
  }),
  execute: async ({ topic, tone }) => ({
    draft: `# ${topic}\n\nA ${tone ?? "neutral"} first draft about ${topic}. Replace this body with real content.`,
  }),
});

/** Copy editor used by the publishing-coordinator. */
export const editorTool = createTool({
  name: "editor_tool",
  description: "Polish and copy-edit a draft. Returns the edited text.",
  parameters: z.object({
    content: z.string().describe("The draft content to edit"),
  }),
  execute: async ({ content }) => ({ edited: content.trim().replace(/\s+\n/g, "\n") }),
});

/** Internal scratchpad for the structured-reasoning pattern. */
export const thinkTool = createTool({
  name: "think",
  description: "Record an internal reasoning step while planning. Not shown to the user.",
  parameters: z.object({
    thought: z.string().describe("Your current reasoning or plan"),
  }),
  execute: async ({ thought }) => ({ acknowledged: true, thought }),
});

/** Mid-task checkpoint for the structured-reasoning pattern. */
export const analyzeTool = createTool({
  name: "analyze",
  description: "Analyze an intermediate result and decide whether the plan needs adjusting.",
  parameters: z.object({
    analysis: z.string().describe("What the latest result tells you"),
    nextStep: z.string().optional().describe("The next action to take"),
  }),
  execute: async ({ analysis, nextStep }) => ({ analysis, nextStep: nextStep ?? "continue" }),
});

/** Arithmetic evaluator for the math agent (role + JSON-output pattern). */
export const calculatorTool = createTool({
  name: "calculator",
  description: "Evaluate a basic arithmetic expression using +, -, *, /, and parentheses.",
  parameters: z.object({
    expression: z.string().describe("An arithmetic expression, e.g. '(2 + 3) * 4'"),
  }),
  execute: async ({ expression }) => {
    if (!/^[0-9+\-*/(). ]+$/.test(expression)) {
      return { error: "Only numbers and the operators + - * / ( ) are allowed." };
    }
    try {
      // Input is restricted to arithmetic characters above, so this is a safe eval.
      const result = Function(`"use strict"; return (${expression});`)();
      return { expression, result };
    } catch {
      return { error: "Invalid arithmetic expression." };
    }
  },
});

/** Mock web search for the capability-list tool agent. Swap for Tavily/Exa in production. */
export const webSearchTool = createTool({
  name: "web_search",
  description: "Search the web for up-to-date information. Returns a list of result snippets.",
  parameters: z.object({
    query: z.string().describe("The search query"),
    maxResults: z.number().int().min(1).max(10).default(3).describe("How many results to return"),
  }),
  execute: async ({ query, maxResults }) => ({
    query,
    results: Array.from({ length: maxResults }, (_, i) => ({
      title: `Result ${i + 1} for "${query}"`,
      url: `https://example.com/search?q=${encodeURIComponent(query)}&r=${i + 1}`,
      snippet: `Placeholder snippet ${i + 1} about ${query}.`,
    })),
    note: "Mock results — wire a real search API (Tavily, Exa, etc.) for production use.",
  }),
});
