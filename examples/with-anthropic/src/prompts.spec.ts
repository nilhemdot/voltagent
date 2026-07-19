import type { PromptHelper } from "@voltagent/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { readFileSync } = vi.hoisted(() => ({ readFileSync: vi.fn() }));

vi.mock("node:fs", () => ({ readFileSync }));

// Imported after the mock is registered so `prompts.ts` picks up the mocked `readFileSync`.
import { resolvePrompt } from "./prompts";

describe("resolvePrompt", () => {
  beforeEach(() => {
    readFileSync.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("VoltOps-managed path", () => {
    it("calls prompts.getPrompt with the production label and forwards variables", async () => {
      const getPrompt = vi.fn().mockResolvedValue("Managed prompt content");
      const prompts = { getPrompt } as unknown as PromptHelper;

      const result = await resolvePrompt(prompts, "customer-support-agent", {
        companyName: "VoltAgent",
      });

      expect(getPrompt).toHaveBeenCalledWith({
        promptName: "customer-support-agent",
        label: "production",
        variables: { companyName: "VoltAgent" },
      });
      expect(result).toBe("Managed prompt content");
      expect(readFileSync).not.toHaveBeenCalled();
    });

    it("returns PromptContent objects unchanged when VoltOps returns chat content", async () => {
      const chatContent = { type: "chat" as const, messages: [{ role: "system", content: "hi" }] };
      const prompts = { getPrompt: vi.fn().mockResolvedValue(chatContent) } as unknown as PromptHelper;

      const result = await resolvePrompt(prompts, "some-prompt");

      expect(result).toEqual(chatContent);
    });

    it("falls back to the local draft when getPrompt rejects (VoltOps unreachable)", async () => {
      const prompts = {
        getPrompt: vi.fn().mockRejectedValue(new Error("network error")),
      } as unknown as PromptHelper;
      readFileSync.mockReturnValue("Hello {{companyName}}, this is a local draft.");

      const result = await resolvePrompt(prompts, "customer-support-agent", {
        companyName: "VoltAgent",
      });

      expect(result).toBe("Hello VoltAgent, this is a local draft.");
    });

    it("ignores a prompts object whose getPrompt is not a function", async () => {
      readFileSync.mockReturnValue("Local fallback text.");
      const prompts = { getPrompt: "not-a-function" } as unknown as PromptHelper;

      const result = await resolvePrompt(prompts, "customer-support-agent");

      expect(result).toBe("Local fallback text.");
    });
  });

  describe("local draft fallback (no VoltOps prompts helper)", () => {
    it("substitutes variables into a plain-text local prompt", async () => {
      readFileSync.mockReturnValue(
        "---\ntype: text\n---\nWelcome to {{companyName}}! Tone: {{tone}}.",
      );

      const result = await resolvePrompt(undefined, "customer-support-agent", {
        companyName: "VoltAgent",
        tone: "warm",
      });

      expect(result).toBe("Welcome to VoltAgent! Tone: warm.");
    });

    it("treats a file with no frontmatter as a plain text prompt", async () => {
      readFileSync.mockReturnValue("Just a plain prompt body with {{tone}} tone.");

      const result = await resolvePrompt(undefined, "some-prompt", { tone: "casual" });

      expect(result).toBe("Just a plain prompt body with casual tone.");
    });

    it("substitutes with empty string for variables that are not provided", async () => {
      readFileSync.mockReturnValue("Hello {{name}}!");

      const result = await resolvePrompt(undefined, "some-prompt");

      expect(result).toBe("Hello !");
    });

    it("parses chat-type frontmatter into a PromptContent with substituted messages", async () => {
      readFileSync.mockReturnValue(
        [
          "---",
          "type: chat",
          "---",
          JSON.stringify([
            { role: "system", content: "You work for {{companyName}}." },
            { role: "user", content: "Hi, my tier is {{subscriptionTier}}." },
          ]),
        ].join("\n"),
      );

      const result = await resolvePrompt(undefined, "customer-support-agent", {
        companyName: "VoltAgent",
        subscriptionTier: "Pro",
      });

      expect(result).toEqual({
        type: "chat",
        messages: [
          { role: "system", content: "You work for VoltAgent." },
          { role: "user", content: "Hi, my tier is Pro." },
        ],
      });
    });

    it("returns a generic fallback string when the local prompt file cannot be read", async () => {
      readFileSync.mockImplementation(() => {
        throw new Error("ENOENT: no such file or directory");
      });

      const result = await resolvePrompt(undefined, "missing-prompt");

      expect(result).toBe('You are a helpful assistant (prompt "missing-prompt" could not be loaded).');
    });

    it("falls back to the default message when the chat body is invalid JSON", async () => {
      readFileSync.mockReturnValue("---\ntype: chat\n---\nnot valid json");

      const result = await resolvePrompt(undefined, "broken-chat-prompt");

      expect(result).toBe(
        'You are a helpful assistant (prompt "broken-chat-prompt" could not be loaded).',
      );
    });

    it("defaults variables to an empty object when none are supplied", async () => {
      readFileSync.mockReturnValue("No placeholders here.");

      const result = await resolvePrompt(undefined, "static-prompt");

      expect(result).toBe("No placeholders here.");
    });
  });
});