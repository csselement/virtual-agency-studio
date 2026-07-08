import { describe, expect, it } from "vitest";
import {
  apiBaseUrl,
  readAssetRouteState,
  readCalendarRouteState,
  readCharacterRouteState,
  readDraftRouteState,
  readFeedbackRouteState,
  supportNavPaths,
  workModeModel,
  workflowStageModel
} from "./App";

describe("web app config", () => {
  it("uses the local API by default", () => {
    expect(apiBaseUrl()).toBe("http://127.0.0.1:4317");
  });

  it("keeps the work mode model in operator-loop order", () => {
    expect(workModeModel.map((mode) => [mode.id, mode.path])).toEqual([
      ["command", "/"],
      ["create", "/create"],
      ["runs", "/runs"],
      ["review", "/review"],
      ["calendar", "/calendar"],
      ["library", "/library"],
      ["insights", "/insights"],
      ["settings", "/settings"],
      ["help", "/help"]
    ]);
  });

  it("keeps workflow stages mapped to user-facing work modes", () => {
    expect(workflowStageModel.map((stage) => [stage.id, stage.path])).toEqual([
      ["heartbeat", "/"],
      ["birth", "/create"],
      ["production", "/library"],
      ["review", "/review"],
      ["publishing", "/calendar"],
      ["feedback", "/insights"]
    ]);
  });

  it("keeps help outside the core workflow stage model", () => {
    expect(workflowStageModel.map((stage) => stage.path)).not.toContain("/help");
    expect(supportNavPaths).toContain("/help");
  });

  it("reads workflow continuity query params", () => {
    expect(readCharacterRouteState("?selected=char_123")).toEqual({ selected: "char_123" });
    expect(readAssetRouteState("?characterId=char_123&status=candidate&platformFit=Instagram")).toEqual({
      characterId: "char_123",
      status: "candidate",
      platformFit: "Instagram"
    });
    expect(readDraftRouteState("?status=needs_review")).toEqual({ status: "needs_review" });
    expect(readCalendarRouteState("?bucket=needs_feedback")).toEqual({ bucket: "needs_feedback" });
    expect(readFeedbackRouteState("?eventId=publish_event_123")).toEqual({ eventId: "publish_event_123" });
  });
});
