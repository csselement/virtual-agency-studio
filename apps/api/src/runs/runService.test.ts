import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { migrateDatabase, openDatabase, type AppDatabase } from "../db/database";
import { listRunArtifacts, listRunDecisions, listRunEvents } from "../db/repositories";
import { RunQueue } from "./runQueue";
import { RunService } from "./runService";

describe("run service and queue", () => {
  let dir: string;
  let db: AppDatabase;
  let service: RunService;
  let queue: RunQueue;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "vas-runs-"));
    db = openDatabase({ databaseUrl: join(dir, "agency.sqlite") });
    migrateDatabase(db);
    service = new RunService(db);
    queue = new RunQueue(db, service);
  });

  afterEach(() => {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("creates runs and writes creation events", () => {
    const run = service.createRun({
      type: "daily_activity",
      title: "Daily Activity Run"
    });

    const events = listRunEvents(db, run.id);
    expect(run.status).toBe("queued");
    expect(events[0].type).toBe("run.created");
  });

  it("processes one queued run to a review gate", () => {
    const run = service.createRun({
      type: "prompt_generation",
      title: "Prompt Generation Run"
    });

    const decision = queue.processNext();
    const events = listRunEvents(db, run.id);
    const artifacts = listRunArtifacts(db, run.id);
    const decisions = listRunDecisions(db, run.id);

    expect(decision?.decision).toBe("needs_human_review");
    expect(events.map((event) => event.type)).toEqual([
      "run.created",
      "run.started",
      "review.required"
    ]);
    expect(artifacts[0].kind).toBe("queue_trace");
    expect(decisions).toHaveLength(1);
  });

  it("cancels active queued runs with a human decision", () => {
    const run = service.createRun({
      type: "image_generation",
      title: "Image Generation Run"
    });

    const cancelled = service.cancelRun(run.id, "Not ready for image generation.");
    const events = listRunEvents(db, run.id);
    const decisions = listRunDecisions(db, run.id);

    expect(cancelled.status).toBe("cancelled");
    expect(events.map((event) => event.type)).toContain("human.rejected");
    expect(decisions[0].decision).toBe("cancelled");
  });
});
