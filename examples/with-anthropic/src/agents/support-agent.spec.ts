import type { PromptHelper } from "@voltagent/core";
import { describe, expect, it, vi } from "vitest";
import { MODEL } from "../model";
import { supportAgent } from "./support-agent";

describe("supportAgent", () => {
  it("is configured with the shared model", () => {
    expect(supportAgent.model).toBe(MODEL);
  });

  it("has the expected name", () => {
    expect(supportAgent.name).toBe("support-agent");
  });

  it("has no tools or sub-agents", () => {
    expect(supportAgent.getTools()).toHaveLength(0);
    expect(supportAgent.getSubAgents()).toHaveLength(0);
  });

  it("uses a dynamic (function) instructions value rather than a static string", () => {
    expect(typeof supportAgent.instructions).toBe("function");
  });

  it("falls back to a graceful default when no VoltOps prompt helper and no local prompt file are available", async () => {
    const instructions = supportAgent.instructions as (options: {
      prompts: PromptHelper | undefined;
    }) => Promise<unknown>;

    const result = await instructions({ prompts: undefined });

    expect(result).toBe(
      'You are a helpful assistant (prompt "customer-support-agent" could not be loaded).',
    );
  });

  it("resolves via the VoltOps prompt helper with the expected reference when available", async () => {
    const getPrompt = vi.fn().mockResolvedValue("resolved managed prompt");
    const instructions = supportAgent.instructions as (options: {
      prompts: PromptHelper;
    }) => Promise<unknown>;

    const result = await instructions({ prompts: { getPrompt } as unknown as PromptHelper });

    expect(getPrompt).toHaveBeenCalledWith({
      promptName: "customer-support-agent",
      label: "production",
      variables: {
        companyName: "VoltAgent",
        tone: "warm and professional",
        subscriptionTier: "Pro",
      },
    });
    expect(result).toBe("resolved managed prompt");
  });
});