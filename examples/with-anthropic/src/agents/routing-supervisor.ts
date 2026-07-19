import { Agent } from "@voltagent/core";
import { MODEL } from "../model";
import { mathAgent } from "./math-agent";
import { generalAgent, geographyAgent, historyAgent, scienceAgent } from "./specialists";

/**
 * Supervisor / routing pattern (with-viteval/supervisor.ts style): route each
 * user query to the single most appropriate specialist via delegate_task.
 */
export const routingSupervisor = new Agent({
  name: "routing-supervisor",
  instructions: `You are a supervisor agent that has a team of specialized agents. Route the user query to the appropriate specialized agent.

Available agents:
- general: general-knowledge questions
- math: mathematical problems and calculations
- geography: places, capitals, maps, and physical geography
- history: historical events, figures, and timelines
- science: physics, chemistry, biology, and earth science

Steps:
1. Analyze the user query and decide which agent should handle it.
2. Delegate to that single agent using the delegate_task tool.
3. If the query spans multiple domains, delegate each part to the right agent.
4. Return the specialist's answer to the user. Do not answer specialist questions yourself.`,
  model: MODEL,
  subAgents: [generalAgent, mathAgent, geographyAgent, historyAgent, scienceAgent],
});
