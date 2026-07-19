import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Distinct sentinel objects so we can assert on identity/wiring without
// depending on the real (pre-existing) Agent implementation.
const mockAgents = {
  routingSupervisor: { __id: "routing-supervisor" },
  generalAgent: { __id: "general" },
  geographyAgent: { __id: "geography" },
  historyAgent: { __id: "history" },
  scienceAgent: { __id: "science" },
  publishingCoordinator: { __id: "publishing-coordinator" },
  reasoningAgent: { __id: "reasoning-agent" },
  repoAnalyzer: { __id: "repo-analyzer" },
  codeScannerAgent: { __id: "code-scanner" },
  readmeSummarizerAgent: { __id: "readme-summarizer" },
  mathAgent: { __id: "math" },
  webSearchAgent: { __id: "web-search-agent" },
  editorAgent: { __id: "editor-agent" },
  recordProcessorAgent: { __id: "record-processor" },
  supportAgent: { __id: "support-agent" },
};

let voltAgentCalls: any[] = [];
let voltOpsClientCalls: any[] = [];
let honoServerCalls: any[] = [];
let createPinoLoggerCalls: any[] = [];

const loggerSentinel = { __logger: true };
const serverSentinel = { __server: true };

vi.mock("./agents", () => mockAgents);

vi.mock("@voltagent/core", () => ({
  VoltAgent: class {
    constructor(options: unknown) {
      voltAgentCalls.push(options);
    }
  },
  VoltOpsClient: class {
    publicKey?: string;
    secretKey?: string;
    constructor(options: { publicKey?: string; secretKey?: string }) {
      voltOpsClientCalls.push(options);
      this.publicKey = options.publicKey;
      this.secretKey = options.secretKey;
    }
  },
}));

vi.mock("@voltagent/logger", () => ({
  createPinoLogger: (options: unknown) => {
    createPinoLoggerCalls.push(options);
    return loggerSentinel;
  },
}));

vi.mock("@voltagent/server-hono", () => ({
  honoServer: (options: unknown) => {
    honoServerCalls.push(options);
    return serverSentinel;
  },
}));

describe("with-anthropic entrypoint", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    voltAgentCalls = [];
    voltOpsClientCalls = [];
    honoServerCalls = [];
    createPinoLoggerCalls = [];
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.VOLTAGENT_PUBLIC_KEY;
    delete process.env.VOLTAGENT_SECRET_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("registers every agent under its documented key", async () => {
    await import("./index");

    expect(voltAgentCalls).toHaveLength(1);
    const options = voltAgentCalls[0];

    expect(options.agents).toEqual({
      routingSupervisor: mockAgents.routingSupervisor,
      general: mockAgents.generalAgent,
      geography: mockAgents.geographyAgent,
      history: mockAgents.historyAgent,
      science: mockAgents.scienceAgent,
      publishingCoordinator: mockAgents.publishingCoordinator,
      reasoningAgent: mockAgents.reasoningAgent,
      repoAnalyzer: mockAgents.repoAnalyzer,
      codeScanner: mockAgents.codeScannerAgent,
      readmeSummarizer: mockAgents.readmeSummarizerAgent,
      math: mockAgents.mathAgent,
      webSearchAgent: mockAgents.webSearchAgent,
      editorAgent: mockAgents.editorAgent,
      recordProcessor: mockAgents.recordProcessorAgent,
      supportAgent: mockAgents.supportAgent,
    });
  });

  it("configures the pino logger and hono server", async () => {
    await import("./index");

    const options = voltAgentCalls[0];
    expect(createPinoLoggerCalls).toEqual([{ name: "with-anthropic", level: "info" }]);
    expect(honoServerCalls).toEqual([{ port: 3141 }]);
    expect(options.logger).toBe(loggerSentinel);
    expect(options.server).toBe(serverSentinel);
  });

  it("does not attach a VoltOpsClient when credentials are absent", async () => {
    await import("./index");

    expect(voltOpsClientCalls).toHaveLength(0);
    expect(voltAgentCalls[0].voltOpsClient).toBeUndefined();
  });

  it("does not attach a VoltOpsClient when only one credential is present", async () => {
    process.env.VOLTAGENT_PUBLIC_KEY = "pk_test_only";

    await import("./index");

    expect(voltOpsClientCalls).toHaveLength(0);
    expect(voltAgentCalls[0].voltOpsClient).toBeUndefined();
  });

  it("attaches a VoltOpsClient built from env credentials when both are present", async () => {
    process.env.VOLTAGENT_PUBLIC_KEY = "pk_test";
    process.env.VOLTAGENT_SECRET_KEY = "sk_test";

    await import("./index");

    expect(voltOpsClientCalls).toEqual([{ publicKey: "pk_test", secretKey: "sk_test" }]);
    const options = voltAgentCalls[0];
    expect(options.voltOpsClient).toBeDefined();
    expect(options.voltOpsClient.publicKey).toBe("pk_test");
    expect(options.voltOpsClient.secretKey).toBe("sk_test");
  });
});