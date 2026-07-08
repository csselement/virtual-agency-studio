export const runTypes = [
  "character_birth",
  "daily_activity",
  "prompt_generation",
  "image_generation",
  "image_analysis",
  "draft_packaging",
  "feedback_reflection",
  "canon_evolution"
] as const;

export type RunType = (typeof runTypes)[number];

export const runStatuses = [
  "queued",
  "running",
  "waiting_for_provider",
  "needs_review",
  "completed",
  "failed",
  "cancelled"
] as const;

export type RunStatus = (typeof runStatuses)[number];

export const runEventTypes = [
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
  "routing.profile_reference_warning",
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
] as const;

export type RunEventType = (typeof runEventTypes)[number];

export function isRunType(value: string): value is RunType {
  return runTypes.includes(value as RunType);
}

export function isRunStatus(value: string): value is RunStatus {
  return runStatuses.includes(value as RunStatus);
}

export function isRunEventType(value: string): value is RunEventType {
  return runEventTypes.includes(value as RunEventType);
}
