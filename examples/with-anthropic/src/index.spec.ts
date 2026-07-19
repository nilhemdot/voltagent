import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const agentMocks = vi.hoisted(() => ({
  routingSupervisor: { marker: "routingSupervisor" },
  generalAgent: { marker: "generalAgent" },
  geographyAgent: { marker: "geographyAgent" },
  historyAgent: { marker: "historyAgent" },
  scienceAgent: { marker: "scienceAgent" },
  publishingCoordinator: { marker: "publishingCoordinator" },
  reasoningAgent: { marker: "reasoningAgent" },
  repoAnalyzer: { marker: "repoAnalyzer" },
  codeScannerAgent: { marker: "codeScannerAgent" },
  readmeSummarizerAgent: { marker: "readmeSummarizerAgent" },
  mathAgent: { marker: "mathAgent" },
  webSearchAgent: { marker: "webSearchAgent" },
  editorAgent: { marker: "editorAgent" },
  recordProcessorAgent: { marker: "recordProcessorAgent" },
  supportAgent: { marker: "supportAgent" },
}));

const VoltAgentMock = vi.hoisted(() => vi.fn());
const VoltOpsClientMock = vi.hoisted(() =>
  vi.fn().mockImplementation((opts: unknown) => ({ __voltOps: true, opts })),
);
const createPinoLoggerMock = vi.hoisted(() => vi.fn().mockReturnValue({ __logger: true }));
const honoServerMock = vi.hoisted(() => vi.fn().mockReturnValue({ __server: true }));

vi.mock("./agents", () => agentMocks);
vi.mock("@voltagent/core", () => ({
  VoltAgent: VoltAgentMock,
  VoltOpsClient: VoltOpsClientMock,
}));
vi.mock("@voltagent/logger", () => ({ createPinoLogger: createPinoLoggerMock }));
vi.mock("@voltagent/server-hono", () => ({ honoServer: honoServerMock }));

const ORIGINAL_ENV = { ...process.env };

describe("src/index.ts wiring", () => {
  beforeEach(() => {
    vi.resetModules();
    VoltAgentMock.mockClear();
    VoltOpsClientMock.mockClear();
    createPinoLoggerMock.mockClear();
    honoServerMock.mockClear();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.VOLTAGENT_PUBLIC_KEY;
    delete process.env.VOLTAGENT_SECRET_KEY;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("creates the logger and hono server with the documented configuration", async () => {
    await import("./index");

    expect(createPinoLoggerMock).toHaveBeenCalledWith({ name: "with-anthropic", level: "info" });
    expect(honoServerMock).toHaveBeenCalledWith({ port: 3141 });
  });

  it("registers every agent under its documented key when no VoltOps credentials are set", async () => {
    await import("./index");

    expect(VoltAgentMock).toHaveBeenCalledTimes(1);
    const call = VoltAgentMock.mock.calls[0][0];

    expect(call.agents).toEqual({
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
    expect(call.logger).toEqual({ __logger: true });
    expect(call.server).toEqual({ __server: true });
  });

  it("does not construct or attach a VoltOpsClient when credentials are absent", async () => {
    await import("./index");

    expect(VoltOpsClientMock).not.toHaveBeenCalled();
    const call = VoltAgentMock.mock.calls[0][0];
    expect(call.voltOpsClient).toBeUndefined();
    expect("voltOpsClient" in call).toBe(false);
  });

  it("constructs and attaches a VoltOpsClient when both credentials are present", async () => {
    process.env.VOLTAGENT_PUBLIC_KEY = "pub-key";
    process.env.VOLTAGENT_SECRET_KEY = "secret-key";

    await import("./index");

    expect(VoltOpsClientMock).toHaveBeenCalledWith({
      publicKey: "pub-key",
      secretKey: "secret-key",
    });

    const call = VoltAgentMock.mock.calls[0][0];
    expect(call.voltOpsClient).toEqual({
      __voltOps: true,
      opts: { publicKey: "pub-key", secretKey: "secret-key" },
    });
  });

  it("does not attach a VoltOpsClient when only one credential is present", async () => {
    process.env.VOLTAGENT_PUBLIC_KEY = "pub-key";
    // VOLTAGENT_SECRET_KEY intentionally left unset.

    await import("./index");

    expect(VoltOpsClientMock).not.toHaveBeenCalled();
    const call = VoltAgentMock.mock.calls[0][0];
    expect("voltOpsClient" in call).toBe(false);
  });
});