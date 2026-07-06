import { describe, expect, it } from "vitest";
import { apiHealthSchema, characterStatusSchema, runEventTypeSchema, runStatusSchema, runTypeSchema } from "./index";

describe("shared schemas", () => {
  it("validates API health payloads", () => {
    expect(
      apiHealthSchema.parse({
        ok: true,
        service: "virtual-agency-api",
        version: "0.1.0",
        timestamp: "2026-06-28T00:00:00.000Z",
        dataDir: "./data"
      }).ok
    ).toBe(true);
  });

  it("defines initial run and character states", () => {
    expect(runStatusSchema.parse("queued")).toBe("queued");
    expect(characterStatusSchema.parse("draft_ready")).toBe("draft_ready");
    expect(runTypeSchema.parse("daily_activity")).toBe("daily_activity");
    expect(runEventTypeSchema.parse("run.created")).toBe("run.created");
  });
});
