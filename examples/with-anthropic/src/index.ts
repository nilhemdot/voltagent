import { VoltAgent, VoltOpsClient } from "@voltagent/core";
import { createPinoLogger } from "@voltagent/logger";
import { honoServer } from "@voltagent/server-hono";
import {
  codeScannerAgent,
  editorAgent,
  generalAgent,
  geographyAgent,
  historyAgent,
  mathAgent,
  publishingCoordinator,
  readmeSummarizerAgent,
  reasoningAgent,
  recordProcessorAgent,
  repoAnalyzer,
  routingSupervisor,
  scienceAgent,
  supportAgent,
  webSearchAgent,
} from "./agents";

const logger = createPinoLogger({
  name: "with-anthropic",
  level: "info",
});

// VoltOps is attached only when credentials are present. Without it, the
// dynamic support-agent falls back to its local drafted prompt file.
const voltOpsClient =
  process.env.VOLTAGENT_PUBLIC_KEY && process.env.VOLTAGENT_SECRET_KEY
    ? new VoltOpsClient({
        publicKey: process.env.VOLTAGENT_PUBLIC_KEY,
        secretKey: process.env.VOLTAGENT_SECRET_KEY,
      })
    : undefined;

new VoltAgent({
  agents: {
    // 1. Supervisor / routing (+ its specialist team)
    routingSupervisor,
    general: generalAgent,
    geography: geographyAgent,
    history: historyAgent,
    science: scienceAgent,
    // 2. Tool-orchestration workflow
    publishingCoordinator,
    // 3. Structured reasoning / tool-using
    reasoningAgent,
    // 4. Sub-agent supervisor (+ its sub-agents)
    repoAnalyzer,
    codeScanner: codeScannerAgent,
    readmeSummarizer: readmeSummarizerAgent,
    // 5. Role + JSON output
    math: mathAgent,
    // 6. Capability-list / tool agent
    webSearchAgent,
    // 7. Task / output-constrained
    editorAgent,
    recordProcessor: recordProcessorAgent,
    // 9. Dynamic (VoltOps) instruction
    supportAgent,
  },
  logger,
  server: honoServer({ port: 3141 }),
  ...(voltOpsClient ? { voltOpsClient } : {}),
});
