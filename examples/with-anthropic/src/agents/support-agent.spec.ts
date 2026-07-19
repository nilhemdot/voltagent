import { describe, expect, it, vi } from "vitest";
import type { PromptHelper } from "@voltagent/core";

class MockAgent {
  constructor(options: Record<string, unknown>) {
    Object.assign(this, options);
  }
}

const resolvePromptMock = vi.fn(async () => "resolved-prompt-content");

vi.mock("@voltagent/core", () => ({
  Agent: MockAgent,
}));

vi.mock("../prompts", () => ({
  resolvePrompt: resolvePromptMock,
}));

const { supportAgent } = await import("./support-agent");
const { MODEL } = await import("../model");

describe("supportAgent", () => {
  it("is named 'support-agent' and uses the shared MODEL", () => {
    expect((supportAgent as any).name).toBe("support-agent");
    expect((supportAgent as any).model).toBe(MODEL);
  });

  it("resolves its instructions dynamically via resolvePrompt", async () => {
    const instructions = (supportAgent as any).instructions as (
      options: { prompts: PromptHelper },
    ) => Promise<string>;
    expect(typeof instructions).toBe("function");

    const fakePrompts = { getPrompt: vi.fn() } as unknown as PromptHelper;
    const result = await instructions({ prompts: fakePrompts });

    expect(resolvePromptMock).toHaveBeenCalledWith(fakePrompts, "customer-support-agent", {
      companyName: "VoltAgent",
      tone: "warm and professional",
      subscriptionTier: "Pro",
    });
    expect(result).toBe("resolved-prompt-content");
  });

  it("passes through whatever resolvePrompt returns, including non-string PromptContent", async () => {
    resolvePromptMock.mockResolvedValueOnce({ type: "text", text: "structured content" } as any);
    const instructions = (supportAgent as any).instructions as (
      options: { prompts: PromptHelper },
    ) => Promise<unknown>;

    const result = await instructions({ prompts: undefined as unknown as PromptHelper });

    expect(result).toEqual({ type: "text", text: "structured content" });
  });
});