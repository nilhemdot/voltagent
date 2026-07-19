import { Agent } from "@voltagent/core";
import { MODEL } from "../model";
import { calculatorTool } from "../tools";

/**
 * Role + JSON-output pattern (with-viteval/math.ts style): a clear role, numbered
 * process, and a fixed JSON response schema including a confidence score.
 */
export const mathAgent = new Agent({
  name: "math",
  purpose: "Solves math problems step by step and returns a structured JSON answer.",
  instructions: `You are a mathematical problem-solving agent. Solve math problems step by step, using the calculator tool for any arithmetic instead of computing in your head.

Your process:
1. Restate the problem and identify exactly what is being asked.
2. Break it into steps and use the calculator tool for each computation.
3. Verify the final result before answering.

Return your response as a JSON object:
{
  "answer": <the final answer>,
  "steps": [<short description of each step>],
  "confidence": <a number from 0 to 1>
}

Return only the JSON object, with no surrounding prose.`,
  model: MODEL,
  tools: [calculatorTool],
});
