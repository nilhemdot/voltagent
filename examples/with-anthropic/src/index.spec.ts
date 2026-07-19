import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// `vi.mock` factories are hoisted above imports, so any values they need to
// share with the test body must be created through `vi.hoisted`.
const agentMocks = vi.hoisted(() => ({
  routingSupervisor: { name: "routingSupervisor" },
  generalAgent: { name: "generalAgent" },
  geographyAgent: { name: "geographyAgent" },
  historyAgent: { name: "historyAgent" },
  scienceAgent: { name: "scienceAgent" },
  publishingCoordinator: { name: "publishingCoordinator" },
  reasoningAgent: { name: "reasoningAgent" },
  repoAnalyzer: { name: "repoAnalyzer" },
  codeScannerAgent: { name: "codeScannerAgent" },
  readmeSummarizerAgent: { name: "readmeSummarizerAgent" },
  mathAgent: { name: "mathAgent" },
  webSearchAgent: { name: "webSearchAgent" },
  editorAgent: { name: "editorAgent" },
  recordProcessorAgent: { name: "recordProcessorAgent" },
  supportAgent: { name: "supportAgent" },
}));

const coreMocks = vi.hoisted(() => ({
  VoltAgent: vi.fn(),
  VoltOpsClient: vi.fn().mockImplementation((opts: unknown) => ({
    __marker: "voltOpsClientInstance",
    opts,
  })),
}));

const loggerMocks = vi.hoisted(() => ({
  createPinoLogger: vi.fn(() => ({ __marker: "loggerInstance" })),
}));

const serverMocks = vi.hoisted(() => ({
  honoServer: vi.fn((opts: unknown) => ({ __marker: "serverInstance", opts })),
}));

vi.mock("./agents", () => agentMocks);
vi.mock("@voltagent/core", () => coreMocks);
vi.mock("@voltagent/logger", () => loggerMocks);
vi.mock("@voltagent/server-hono", () => serverMocks);

const ORIGINAL_ENV = { ...process.env };

describe("with-anthropic bootstrap (src/index.ts)", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.VOLTAGENT_PUBLIC_KEY;
    delete process.env.VOLTAGENT_SECRET_KEY;
    coreMocks.VoltAgent.mockClear();
    coreMocks.VoltOpsClient.mockClear();
    loggerMocks.createPinoLogger.mockClear();
    serverMocks.honoServer.mockClear();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("creates a Pino logger scoped to this example", async () => {
    await import("./index");

    expect(loggerMocks.createPinoLogger).toHaveBeenCalledWith({
      name: "with-anthropic",
      level: "info",
    });
  });

  it("starts the Hono server on port 3141", async () => {
    await import("./index");

    expect(serverMocks.honoServer).toHaveBeenCalledWith({ port: 3141 });
  });

  it("registers every agent under its documented key", async () => {
    await import("./index");

    expect(coreMocks.VoltAgent).toHaveBeenCalledTimes(1);
    const options = coreMocks.VoltAgent.mock.calls[0][0];

    expect(options.agents).toEqual({
      routingSupervisor: agentMocks.routingSupervisor,
      general: agentMocks.generalAgent,
      geography: agentMocks.geographyAgent,
      history: agentMocks.historyAgent,
      science: agentMocks.scienceAgent,
      publishingCoordinator: agentMocks.publishingCoordinator,
      reasoningAgent: agentMocks.reasoningAgent,
      repoAnalyzer: agentMocks.repoAnalyzer,
      codeScanner: agentMocks.codeScannerAgent,
      readmeSummarizer: agentMocks.readmeSummarizerAgent,
      math: agentMocks.mathAgent,
      webSearchAgent: agentMocks.webSearchAgent,
      editorAgent: agentMocks.editorAgent,
      recordProcessor: agentMocks.recordProcessorAgent,
      supportAgent: agentMocks.supportAgent,
    });
  });

  it("does not configure a VoltOpsClient when credentials are absent", async () => {
    await import("./index");

    expect(coreMocks.VoltOpsClient).not.toHaveBeenCalled();
    const options = coreMocks.VoltAgent.mock.calls[0][0];
    expect(options).not.toHaveProperty("voltOpsClient");
  });

  it("configures a VoltOpsClient with the public/secret keys when both are present", async () => {
    process.env.VOLTAGENT_PUBLIC_KEY = "pk_test_123";
    process.env.VOLTAGENT_SECRET_KEY = "sk_test_456";

    await import("./index");

    expect(coreMocks.VoltOpsClient).toHaveBeenCalledWith({
      publicKey: "pk_test_123",
      secretKey: "sk_test_456",
    });

    const options = coreMocks.VoltAgent.mock.calls[0][0];
    expect(options.voltOpsClient).toEqual({
      __marker: "voltOpsClientInstance",
      opts: { publicKey: "pk_test_123", secretKey: "sk_test_456" },
    });
  });

  it.each([
    ["only the public key", { VOLTAGENT_PUBLIC_KEY: "pk_test_123" }],
    ["only the secret key", { VOLTAGENT_SECRET_KEY: "sk_test_456" }],
  ])("does not configure a VoltOpsClient when %s is present", async (_label, envVars) => {
    Object.assign(process.env, envVars);

    await import("./index");

    expect(coreMocks.VoltOpsClient).not.toHaveBeenCalled();
    const options = coreMocks.VoltAgent.mock.calls[0][0];
    expect(options).not.toHaveProperty("voltOpsClient");
  });
});