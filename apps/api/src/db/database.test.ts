import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { migrateDatabase, openDatabase } from "./database";
import { listCharacters, listRunEvents, listRuns, seedDemoData } from "./repositories";

describe("database initialization", () => {
  it("migrates and seeds demo data", () => {
    const dir = mkdtempSync(join(tmpdir(), "vas-db-"));
    const db = openDatabase({ databaseUrl: join(dir, "agency.sqlite") });

    migrateDatabase(db);
    const seedResult = seedDemoData(db);

    const characters = listCharacters(db);
    const runs = listRuns(db);
    const events = listRunEvents(db, runs[0].id);

    expect(seedResult.skipped).toBe(false);
    expect(characters).toHaveLength(1);
    expect(characters[0].name).toBe("Mira Vale");
    expect(runs).toHaveLength(1);
    expect(events.map((event) => event.type)).toContain("run.completed");

    db.close();
    rmSync(dir, { recursive: true, force: true });
  });
});
