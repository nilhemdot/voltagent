import type { PromptHelper } from "@voltagent/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MODEL } from "../model";

const { resolvePrompt } = vi.hoisted(() => ({ resolvePrompt: vi.fn() }));

vi.mock("../prompts", () => ({ resolvePrompt }));

// Imported after the mock is registered so `support-agent.ts` picks up the mocked resolvePrompt.
import { supportAgent } from "./support-agent";

describe("supportAgent", () => {
  beforeEach(() => {
    resolvePrompt.mockReset();
  });

  it("is named 'support-agent'", () => {
    expect(supportAgent.name).toBe("support-agent");
  });

  it("uses the shared MODEL", () => {
    expect(supportAgent.model).toBe(MODEL);
  });

  it("has no static tools or sub-agents", () => {
    expect(supportAgent.getTools()).toEqual([]);
    expect(supportAgent.getSubAgents()).toEqual([]);
  });

  it("stores instructions as a dynamic function rather than a static string", () => {
    expect(typeof supportAgent.instructions).toBe("function");
  });

  it("resolves its instructions via resolvePrompt with the expected prompt name and variables", async () => {
    resolvePrompt.mockResolvedValue("Resolved support instructions");

    const prompts = { getPrompt: vi.fn() } as unknown as PromptHelper;
    const instructionsFn = supportAgent.instructions as (options: {
      prompts: PromptHelper;
    }) => Promise<string>;

    const result = await instructionsFn({ prompts } as any);

    expect(resolvePrompt).toHaveBeenCalledWith(prompts, "customer-support-agent", {
      companyName: "VoltAgent",
      tone: "warm and professional",
      subscriptionTier: "Pro",
    });
    expect(result).toBe("Resolved support instructions");
  });

  it("propagates a rejection from resolvePrompt instead of swallowing it", async () => {
    resolvePrompt.mockRejectedValue(new Error("boom"));

    const instructionsFn = supportAgent.instructions as (options: {
      prompts: PromptHelper;
    }) => Promise<string>;

    await expect(instructionsFn({ prompts: { getPrompt: vi.fn() } } as any)).rejects.toThrow("boom");
  });
});