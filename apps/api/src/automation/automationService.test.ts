import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { ApiConfig } from "../config";
import { migrateDatabase, openDatabase } from "../db/database";
import { insertBodyEntry, insertCharacter, insertConstitutionVersion, listRuns } from "../db/repositories";
import { RunService } from "../runs/runService";
import { AutomationScheduler, updateAutomationSettings } from "./automationService";

function testConfig(dir: string): ApiConfig {
  return {
    host: "127.0.0.1",
    port: 4317,
    dataDir: dir,
    databaseUrl: join(dir, "agency.sqlite"),
    version: "0.1.0",
    mockProviders: true,
    hermesBaseUrl: "",
    hermesApiKey: "",
    hermesImageGenerationPath: "",
    hermesImageAnalysisPath: "",
    comfyuiCloudBaseUrl: "https://cloud.comfy.org",
    comfyuiCloudApiKey: "",
    comfyuiCloudGenerationPath: "/api/prompt",
    openaiBaseUrl: "https://api.openai.com/v1",
    openaiApiKey: "",
    openaiImageModel: "gpt-image-1.5",
    openaiImageSize: "1024x1536",
    openaiImageQuality: "auto",
    openaiImageOutputFormat: "png",
    openaiImageModeration: "low",
    wavespeedBaseUrl: "https://api.wavespeed.ai/api/v3",
    wavespeedApiKey: "",
    wavespeedImageGenerationPath: "/wavespeed-ai/flux-dev",
    publicApiHost: "127.0.0.1"
  };
}

describe("automation scheduler", () => {
  it("creates supervised daily activity runs when enabled and due", async () => {
    const dir = mkdtempSync(join(tmpdir(), "vas-automation-"));
    const config = testConfig(dir);
    const db = openDatabase({ databaseUrl: config.databaseUrl });
    migrateDatabase(db);
    const runService = new RunService(db);
    const character = insertCharacter(db, { name: "Scheduler Loop", summary: "Scheduler test character.", status: "idea" });
    insertConstitutionVersion(db, {
      characterId: character.id,
      body: "Automation can prepare work but must stop at review gates.",
      changeReason: "Scheduler test.",
      markActive: true
    });
    insertBodyEntry(db, "character_appearance_profiles", {
      characterId: character.id,
      body: "Consistent studio look."
    });
    updateAutomationSettings(db, config, {
      enableDailyActivityRuns: true,
      dailyRunTime: "00:00",
      defaultCharacterIds: [character.id],
      defaultPlatforms: ["Instagram"],
      maxImagesPerRun: 1,
      autoSelectTopActivity: true,
      requireReviewBeforeDraft: true
    });

    const scheduler = new AutomationScheduler(db, config, runService);
    const result = await scheduler.tick(new Date("2026-06-29T12:00:00.000Z"));
    expect(result.triggered).toBe(true);
    const dailyRuns = listRuns(db).filter((run) => run.type === "daily_activity");
    expect(dailyRuns[0].status).toBe("needs_review");
    expect(dailyRuns[0].title).toContain("Automated Daily Activity");

    db.close();
    rmSync(dir, { recursive: true, force: true });
  });
});
