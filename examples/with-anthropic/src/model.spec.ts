import { describe, expect, it } from "vitest";
import { MODEL } from "./model";

describe("MODEL", () => {
  it("is the shared Anthropic model id used by every agent in this example", () => {
    expect(MODEL).toBe("anthropic/claude-opus-4-1");
  });

  it("is a non-empty string in 'provider/model-id' format", () => {
    expect(typeof MODEL).toBe("string");
    expect(MODEL.split("/")).toHaveLength(2);
    const [provider, modelId] = MODEL.split("/");
    expect(provider).toBe("anthropic");
    expect(modelId.length).toBeGreaterThan(0);
  });
});