import { describe, expect, it } from "vitest";
import { apiBaseUrl } from "./App";

describe("web app config", () => {
  it("uses the local API by default", () => {
    expect(apiBaseUrl()).toBe("http://127.0.0.1:4317");
  });
});
