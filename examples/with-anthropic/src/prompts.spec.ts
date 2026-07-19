import { readFileSync } from "node:fs";
import type { PromptHelper } from "@voltagent/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolvePrompt } from "./prompts";

vi.mock("node:fs", () => ({
  readFileSync: vi.fn(),
}));

const mockedReadFileSync = readFileSync as unknown as ReturnType<typeof vi.fn>;

describe("resolvePrompt", () => {
  beforeEach(() => {
    mockedReadFileSync.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("VoltOps-managed path", () => {
    it("returns the prompt content from prompts.getPrompt without touching the filesystem", async () => {
      const getPrompt = vi.fn().mockResolvedValue("Managed prompt content");
      const prompts = { getPrompt } as unknown as PromptHelper;

      const result = await resolvePrompt(prompts, "customer-support-agent", {
        companyName: "Acme",
      });

      expect(result).toBe("Managed prompt content");
      expect(getPrompt).toHaveBeenCalledWith({
        promptName: "customer-support-agent",
        label: "production",
        variables: { companyName: "Acme" },
      });
      expect(mockedReadFileSync).not.toHaveBeenCalled();
    });

    it("falls back to the local prompt when prompts.getPrompt throws", async () => {
      const getPrompt = vi.fn().mockRejectedValue(new Error("VoltOps unreachable"));
      const prompts = { getPrompt } as unknown as PromptHelper;
      mockedReadFileSync.mockReturnValue("Local fallback body");

      const result = await resolvePrompt(prompts, "customer-support-agent");

      expect(getPrompt).toHaveBeenCalled();
      expect(result).toBe("Local fallback body");
    });

    it("falls back to the local prompt when getPrompt is not a function", async () => {
      const prompts = {} as unknown as PromptHelper;
      mockedReadFileSync.mockReturnValue("Local fallback body");

      const result = await resolvePrompt(prompts, "customer-support-agent");

      expect(result).toBe("Local fallback body");
    });
  });

  describe("local drafted prompt fallback", () => {
    it("falls back to the local prompt when no PromptHelper is provided", async () => {
      mockedReadFileSync.mockReturnValue("Plain instructions with no frontmatter.");

      const result = await resolvePrompt(undefined, "customer-support-agent");

      expect(result).toBe("Plain instructions with no frontmatter.");
    });

    it("reads the file from the .voltagent/prompts directory using the prompt name", async () => {
      mockedReadFileSync.mockReturnValue("Some content");

      await resolvePrompt(undefined, "my-prompt");

      expect(mockedReadFileSync).toHaveBeenCalledTimes(1);
      const [calledPath, encoding] = mockedReadFileSync.mock.calls[0];
      expect(calledPath).toMatch(/\.voltagent[/\\]prompts[/\\]my-prompt\.md$/);
      expect(encoding).toBe("utf8");
    });

    it("substitutes {{variables}} in a plain-text prompt", async () => {
      mockedReadFileSync.mockReturnValue(
        "Hello {{companyName}}, please respond in a {{tone}} tone.",
      );

      const result = await resolvePrompt(undefined, "customer-support-agent", {
        companyName: "VoltAgent",
        tone: "warm and professional",
      });

      expect(result).toBe("Hello VoltAgent, please respond in a warm and professional tone.");
    });

    it("replaces unknown variables with an empty string", async () => {
      mockedReadFileSync.mockReturnValue("Tier: {{subscriptionTier}}.");

      const result = await resolvePrompt(undefined, "customer-support-agent", {});

      expect(result).toBe("Tier: .");
    });

    it("parses YAML-style frontmatter and returns only the body for a text prompt", async () => {
      mockedReadFileSync.mockReturnValue(
        ["---", "type: text", "---", "Hi {{companyName}}!"].join("\n"),
      );

      const result = await resolvePrompt(undefined, "customer-support-agent", {
        companyName: "Acme",
      });

      expect(result).toBe("Hi Acme!");
    });

    it("parses a chat-type frontmatter prompt into a PromptContent object", async () => {
      const chatBody = JSON.stringify([
        { role: "system", content: "You work for {{companyName}}." },
        { role: "user", content: "Hello!" },
      ]);
      mockedReadFileSync.mockReturnValue(["---", "type: chat", "---", chatBody].join("\n"));

      const result = await resolvePrompt(undefined, "customer-support-agent", {
        companyName: "Acme",
      });

      expect(result).toEqual({
        type: "chat",
        messages: [
          { role: "system", content: "You work for Acme." },
          { role: "user", content: "Hello!" },
        ],
      });
    });

    it("treats the prompt as text when the frontmatter type is missing", async () => {
      mockedReadFileSync.mockReturnValue(["---", "description: some metadata", "---", "Plain body"].join("\n"));

      const result = await resolvePrompt(undefined, "customer-support-agent");

      expect(result).toBe("Plain body");
    });

    it("returns a graceful default when the prompt file cannot be read", async () => {
      mockedReadFileSync.mockImplementation(() => {
        throw new Error("ENOENT: no such file or directory");
      });

      const result = await resolvePrompt(undefined, "missing-prompt");

      expect(result).toBe(
        'You are a helpful assistant (prompt "missing-prompt" could not be loaded).',
      );
    });

    it("returns the graceful default when the chat body is malformed JSON", async () => {
      mockedReadFileSync.mockReturnValue(["---", "type: chat", "---", "not valid json"].join("\n"));

      const result = await resolvePrompt(undefined, "broken-chat-prompt");

      expect(result).toBe(
        'You are a helpful assistant (prompt "broken-chat-prompt" could not be loaded).',
      );
    });
  });
});