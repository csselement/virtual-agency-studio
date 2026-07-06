import { z } from "zod";

export const apiHealthSchema = z.object({
  ok: z.boolean(),
  service: z.literal("virtual-agency-api"),
  version: z.string(),
  timestamp: z.string(),
  dataDir: z.string()
});

export type ApiHealth = z.infer<typeof apiHealthSchema>;

export const runStatusSchema = z.enum([
  "queued",
  "running",
  "waiting_for_provider",
  "needs_review",
  "completed",
  "failed",
  "cancelled"
]);

export type RunStatus = z.infer<typeof runStatusSchema>;

export const runTypeSchema = z.enum([
  "character_birth",
  "daily_activity",
  "prompt_generation",
  "image_generation",
  "image_analysis",
  "draft_packaging",
  "feedback_reflection",
  "canon_evolution"
]);

export type RunType = z.infer<typeof runTypeSchema>;

export const runEventTypeSchema = z.enum([
  "run.created",
  "run.started",
  "scheduler.checked",
  "scheduler.triggered",
  "automation.step",
  "automation.decision",
  "automation.warning",
  "context.loaded",
  "activity.proposed",
  "activity.selected",
  "brief.created",
  "prompt.generated",
  "routing.classified",
  "routing.override_applied",
  "routing.blocked",
  "provider.requested",
  "provider.fallback",
  "provider.completed",
  "provider.failed",
  "image.generated",
  "image.analyzed",
  "draft.created",
  "review.required",
  "human.approved",
  "human.rejected",
  "export.created",
  "feedback.logged",
  "reflection.generated",
  "memory.proposed",
  "canon_update.proposed",
  "constitution_patch.proposed",
  "run.completed",
  "run.failed"
]);

export type RunEventType = z.infer<typeof runEventTypeSchema>;

export const characterStatusSchema = z.enum([
  "idea",
  "briefed",
  "generating",
  "analyzing",
  "draft_ready",
  "needs_review",
  "approved",
  "exported",
  "published",
  "feedback_logged",
  "reflection_complete"
]);

export type CharacterStatus = z.infer<typeof characterStatusSchema>;
