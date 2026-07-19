// Barrel export for every agent, grouped by the instruction pattern it demonstrates.
export { routingSupervisor } from "./routing-supervisor"; // 1. Supervisor / routing
export { publishingCoordinator } from "./publishing-coordinator"; // 2. Tool-orchestration workflow
export { reasoningAgent } from "./reasoning-agent"; // 3. Structured reasoning / tool-using
export { repoAnalyzer, codeScannerAgent, readmeSummarizerAgent } from "./repo-analyzer"; // 4. Sub-agent supervisor
export { mathAgent } from "./math-agent"; // 5. Role + JSON output
export { webSearchAgent } from "./web-search-agent"; // 6. Capability-list / tool agent
export { editorAgent, recordProcessorAgent } from "./output-constrained"; // 7. Task / output-constrained
export { generalAgent, geographyAgent, historyAgent, scienceAgent } from "./specialists"; // 8. Concise single-liners
export { supportAgent } from "./support-agent"; // 9. Dynamic (VoltOps) instruction
