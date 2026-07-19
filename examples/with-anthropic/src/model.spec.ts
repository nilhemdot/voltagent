import { describe, expect, it } from "vitest";
import { MODEL } from "./model";

describe("MODEL", () => {
  it("is the shared Anthropic model identifier used by every agent in this example", () => {
    expect(MODEL).toBe("anthropic/claude-opus-4-1");
  });

  it("is formatted as '<provider>/<model-name>'", () => {
    expect(MODEL).toMatch(/^anthropic\/[\w-]+$/);
  });
});