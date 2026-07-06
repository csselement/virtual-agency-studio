import type { AppDatabase } from "../db/database";
import {
  getRun,
  insertRun,
  insertRunArtifact,
  insertRunDecision,
  insertRunEvent,
  updateRunStatus as persistRunStatus
} from "../db/repositories";
import type { RunEventType, RunStatus, RunType } from "./types";

export interface CreateRunInput {
  characterId?: string | null;
  type: RunType;
  title: string;
  autoEnqueue?: boolean;
}

export class RunService {
  constructor(private readonly db: AppDatabase) {}

  createRun(input: CreateRunInput) {
    const run = insertRun(this.db, {
      characterId: input.characterId ?? null,
      type: input.type,
      status: "queued",
      title: input.title
    });

    this.appendRunEvent(run.id, "run.created", `${input.title} created.`, {
      type: input.type,
      characterId: input.characterId ?? null,
      queued: input.autoEnqueue ?? true
    });

    return run;
  }

  appendRunEvent(runId: string, type: RunEventType, message: string, payload: unknown = {}) {
    this.requireRun(runId);
    return insertRunEvent(this.db, { runId, type, message, payload });
  }

  updateRunStatus(runId: string, status: RunStatus) {
    this.requireRun(runId);
    return persistRunStatus(this.db, runId, status, null);
  }

  attachRunArtifact(runId: string, kind: string, label: string, artifact: unknown) {
    this.requireRun(runId);
    return insertRunArtifact(this.db, { runId, kind, label, artifact });
  }

  recordRunDecision(runId: string, decision: string, rationale?: string | null) {
    this.requireRun(runId);
    return insertRunDecision(this.db, { runId, decision, rationale });
  }

  failRun(runId: string, error: string) {
    this.requireRun(runId);
    const run = persistRunStatus(this.db, runId, "failed", error);
    this.appendRunEvent(runId, "run.failed", error, { error });
    return run;
  }

  completeRun(runId: string, message = "Run completed.") {
    this.requireRun(runId);
    const run = persistRunStatus(this.db, runId, "completed", null);
    this.appendRunEvent(runId, "run.completed", message);
    return run;
  }

  cancelRun(runId: string, rationale = "Cancelled by human operator.") {
    const run = this.requireRun(runId);
    if (run.status === "completed" || run.status === "failed" || run.status === "cancelled") {
      throw new Error(`Cannot cancel run in ${run.status} status`);
    }

    const cancelled = persistRunStatus(this.db, runId, "cancelled", null);
    this.recordRunDecision(runId, "cancelled", rationale);
    this.appendRunEvent(runId, "human.rejected", rationale, { decision: "cancelled" });
    return cancelled;
  }

  private requireRun(runId: string) {
    const run = getRun(this.db, runId);
    if (!run) {
      throw new Error(`Run not found: ${runId}`);
    }
    return run;
  }
}
