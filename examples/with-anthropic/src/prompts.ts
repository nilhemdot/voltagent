import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { PromptContent, PromptHelper } from "@voltagent/core";

/**
 * Resolves agent instructions from VoltOps-managed prompts, falling back to the
 * local drafted prompt files under `.voltagent/prompts/` when VoltOps is not
 * configured (no VOLTAGENT_PUBLIC_KEY / VOLTAGENT_SECRET_KEY).
 *
 * The local `.md` files are the same artifacts `volt prompts push` uploads, so
 * they stay the single source of truth in both modes.
 */

const PROMPTS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", ".voltagent", "prompts");

type PromptVariables = Record<string, string>;

const substitute = (template: string, variables: PromptVariables): string =>
  template.replace(/\{\{([^}]+)\}\}/g, (_match, key) => variables[key.trim()] ?? "");

/** Minimal frontmatter split for our controlled `volt prompts` markdown format. */
const parseLocalFile = (raw: string): { type: "text" | "chat"; body: string } => {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  const frontmatter = match ? match[1] : "";
  const body = (match ? match[2] : raw).trim();
  const type = /^type:\s*chat\b/m.test(frontmatter) ? "chat" : "text";
  return { type, body };
};

/** Render a local drafted prompt into instruction content with variables applied. */
const renderLocalPrompt = (promptName: string, variables: PromptVariables): string | PromptContent => {
  try {
    const { type, body } = parseLocalFile(readFileSync(join(PROMPTS_DIR, `${promptName}.md`), "utf8"));

    if (type === "chat") {
      const messages = (JSON.parse(body) as Array<{ role: string; content: string }>).map((message) => ({
        ...message,
        content: substitute(message.content, variables),
      }));
      return { type: "chat", messages } as PromptContent;
    }

    return substitute(body, variables);
  } catch {
    // Last-resort default so an agent still boots if a prompt file is missing.
    return `You are a helpful assistant (prompt "${promptName}" could not be loaded).`;
  }
};

export const resolvePrompt = async (
  prompts: PromptHelper | undefined,
  promptName: string,
  variables: PromptVariables = {},
): Promise<string | PromptContent> => {
  try {
    if (prompts && typeof prompts.getPrompt === "function") {
      // VoltOps-managed path: fetch the `production`-labelled version.
      return await prompts.getPrompt({ promptName, label: "production", variables });
    }
  } catch {
    // VoltOps unreachable / unauthenticated — fall back to the local draft.
  }
  return renderLocalPrompt(promptName, variables);
};
