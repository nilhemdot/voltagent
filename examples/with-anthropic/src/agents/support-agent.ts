import { Agent } from "@voltagent/core";
import { MODEL } from "../model";
import { resolvePrompt } from "../prompts";

/**
 * Dynamic (VoltOps) instruction pattern (with-dynamic-prompts style): the
 * instructions are resolved at runtime from a managed prompt. resolvePrompt uses
 * VoltOps `prompts.getPrompt` when credentials are set, and otherwise falls back
 * to the local drafted `customer-support-agent` prompt file.
 */
export const supportAgent = new Agent({
  name: "support-agent",
  instructions: async ({ prompts }) =>
    resolvePrompt(prompts, "customer-support-agent", {
      companyName: "VoltAgent",
      tone: "warm and professional",
      subscriptionTier: "Pro",
    }),
  model: MODEL,
});
