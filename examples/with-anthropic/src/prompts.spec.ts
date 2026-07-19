import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PromptHelper } from "@voltagent/core";

const readFileSyncMock = vi.fn<(...args: unknown[]) => string>();

vi.mock("node:fs", () => ({
  readFileSync: readFileSyncMock,
}));

const { resolvePrompt } = await import("./prompts");

describe("resolvePrompt", () => {
  beforeEach(() => {
    readFileSyncMock.mockReset();
  });

  describe("VoltOps-managed path", () => {
    it("fetches the 'production' labelled prompt with the given variables", async () => {
      const getPrompt = vi.fn().mockResolvedValue({ type: "text", text: "Hello from VoltOps" });
      const prompts = { getPrompt } as unknown as PromptHelper;

      const result = await resolvePrompt(prompts, "customer-support-agent", { companyName: "Acme" });

      expect(getPrompt).toHaveBeenCalledWith({
        promptName: "customer-support-agent",
        label: "production",
        variables: { companyName: "Acme" },
      });
      expect(result).toEqual({ type: "text", text: "Hello from VoltOps" });
      expect(readFileSyncMock).not.toHaveBeenCalled();
    });

    it("falls back to the local prompt file when getPrompt rejects", async () => {
      const getPrompt = vi.fn().mockRejectedValue(new Error("network error"));
      const prompts = { getPrompt } as unknown as PromptHelper;
      readFileSyncMock.mockReturnValue("Local fallback body");

      const result = await resolvePrompt(prompts, "customer-support-agent");

      expect(result).toBe("Local fallback body");
      expect(readFileSyncMock).toHaveBeenCalled();
    });
  });

  describe("local drafted-prompt fallback", () => {
    it("falls back to the local file when no prompt helper is provided", async () => {
      readFileSyncMock.mockReturnValue("Hello {{name}}, welcome to {{companyName}}.");

      const result = await resolvePrompt(undefined, "greeting", {
        name: "Ada",
        companyName: "Acme",
      });

      expect(result).toBe("Hello Ada, welcome to Acme.");
    });

    it("falls back to the local file when prompts.getPrompt is not a function", async () => {
      readFileSyncMock.mockReturnValue("Plain text body {{x}}");

      const result = await resolvePrompt({} as unknown as PromptHelper, "p", { x: "1" });

      expect(result).toBe("Plain text body 1");
    });

    it("defaults to an empty variables object when none is supplied", async () => {
      readFileSyncMock.mockReturnValue("Hi {{missing}}!");

      const result = await resolvePrompt(undefined, "p");

      expect(result).toBe("Hi !");
    });

    it("parses '---\\ntype: text\\n---' frontmatter and trims the body", async () => {
      readFileSyncMock.mockReturnValue("---\ntype: text\n---\n  Hello {{name}}.  ");

      const result = await resolvePrompt(undefined, "text-prompt", { name: "Bob" });

      expect(result).toBe("Hello Bob.");
    });

    it("treats content without frontmatter as a plain text prompt", async () => {
      readFileSyncMock.mockReturnValue("  Just a plain prompt with {{var}}.  ");

      const result = await resolvePrompt(undefined, "no-frontmatter", { var: "value" });

      expect(result).toBe("Just a plain prompt with value.");
    });

    it("parses '---\\ntype: chat\\n---' frontmatter and substitutes variables per message", async () => {
      readFileSyncMock.mockReturnValue(
        `---\ntype: chat\n---\n${JSON.stringify([
          { role: "system", content: "You are {{persona}}." },
          { role: "user", content: "Hello, {{name}}!" },
        ])}`,
      );

      const result = await resolvePrompt(undefined, "chat-prompt", {
        persona: "a helpful assistant",
        name: "Bob",
      });

      expect(result).toEqual({
        type: "chat",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Hello, Bob!" },
        ],
      });
    });

    it("returns a generic fallback string when the local prompt file cannot be read", async () => {
      readFileSyncMock.mockImplementation(() => {
        throw new Error("ENOENT: no such file or directory");
      });

      const result = await resolvePrompt(undefined, "missing-prompt");

      expect(result).toBe('You are a helpful assistant (prompt "missing-prompt" could not be loaded).');
    });

    it("returns the generic fallback when a chat prompt body is invalid JSON", async () => {
      readFileSyncMock.mockReturnValue("---\ntype: chat\n---\nnot valid json");

      const result = await resolvePrompt(undefined, "broken-chat");

      expect(result).toBe('You are a helpful assistant (prompt "broken-chat" could not be loaded).');
    });
  });
});