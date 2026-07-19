import { Agent } from "@voltagent/core";
import { MODEL } from "../model";

/**
 * Sub-agent supervisor pattern (github-repo-analyzer style): given a repo, the
 * analyzer delegates to named sub-agents and combines their results into a report.
 */

export const codeScannerAgent = new Agent({
  name: "code-scanner",
  purpose: "Maps a repository's structure, main languages, and entry points.",
  instructions:
    "Given a repository, describe its directory structure, primary languages, build tooling, and likely entry points.",
  model: MODEL,
});

export const readmeSummarizerAgent = new Agent({
  name: "readme-summarizer",
  purpose: "Summarizes a repository's README and getting-started steps.",
  instructions:
    "Summarize what the project does, who it is for, how to install it, and how to run it, based on its README.",
  model: MODEL,
});

export const repoAnalyzer = new Agent({
  name: "repo-analyzer",
  instructions: `You are a GitHub repository analyzer. When given a GitHub repository URL or owner/repo format, you will:
1. Delegate to code-scanner to map the repository's structure and languages.
2. Delegate to readme-summarizer to summarize the project's purpose and usage.
3. Combine both into a short report covering: what the project is, its tech stack, and how to get started.

Example input: facebook/react`,
  model: MODEL,
  subAgents: [codeScannerAgent, readmeSummarizerAgent],
});
