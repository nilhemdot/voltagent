import { describe, expect, it } from "vitest";
import { MODEL } from "./model";

describe("MODEL", () => {
  it("is the shared Anthropic model identifier", () => {
    expect(MODEL).toBe("anthropic/claude-opus-4-1");
  });

  it("is a non-empty string", () => {
    expect(typeof MODEL).toBe("string");
    expect(MODEL.length).toBeGreaterThan(0);
  });

  it("follows the 'provider/model' convention expected by the model registry", () => {
    const [provider, ...rest] = MODEL.split("/");
    expect(provider).toBe("anthropic");
    expect(rest.join("/")).toBe("claude-opus-4-1");
  });
});