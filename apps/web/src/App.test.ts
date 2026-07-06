import { describe, expect, it } from "vitest";
import {
  apiBaseUrl,
  readAssetRouteState,
  readCalendarRouteState,
  readCharacterRouteState,
  readDraftRouteState,
  readFeedbackRouteState,
  workflowStageModel
} from "./App";

describe("web app config", () => {
  it("uses the local API by default", () => {
    expect(apiBaseUrl()).toBe("http://127.0.0.1:4317");
  });

  it("keeps the workflow stage model in operator-cycle order", () => {
    expect(workflowStageModel.map((stage) => [stage.id, stage.path])).toEqual([
      ["heartbeat", "/"],
      ["birth", "/characters"],
      ["production", "/assets"],
      ["review", "/drafts"],
      ["publishing", "/calendar"],
      ["feedback", "/feedback"]
    ]);
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
