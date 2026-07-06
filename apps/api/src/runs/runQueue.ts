import type { AppDatabase } from "../db/database";
import { getNextQueuedRun } from "../db/repositories";
import { RunService } from "./runService";

export class RunQueue {
  constructor(
    private readonly db: AppDatabase,
    private readonly runService: RunService
  ) {}

  enqueueRun(runId: string) {
    const run = this.runService.updateRunStatus(runId, "queued");
    this.runService.appendRunEvent(runId, "context.loaded", "Run queued for local processing.", {
      queue: "in-process"
    });
    return run;
  }

  processNext() {
    const run = getNextQueuedRun(this.db);
    if (!run) {
      return null;
    }

    try {
      this.runService.updateRunStatus(run.id, "running");
      this.runService.appendRunEvent(run.id, "run.started", "Local queue started processing this run.", {
        queue: "in-process"
      });
      this.runService.attachRunArtifact(run.id, "queue_trace", "Queue processing trace", {
        processor: "local-in-process",
        runType: run.type,
        processedAt: new Date().toISOString()
      });
      this.runService.updateRunStatus(run.id, "needs_review");
      this.runService.appendRunEvent(run.id, "review.required", "Run reached the Phase 3 review gate.", {
        nextAction: "Human review or later phase processor"
      });

      return this.runService.recordRunDecision(
        run.id,
        "needs_human_review",
        "Phase 3 queue stops at a human-visible review gate."
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown run processing failure";
      this.runService.failRun(run.id, message);
      return null;
    }
  }
}
