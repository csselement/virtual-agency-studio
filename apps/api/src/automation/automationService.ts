import type { ApiConfig } from "../config";
import type { AppDatabase } from "../db/database";
import {
  getAsset,
  getCharacterDetail,
  getPromptRecipe,
  getRun,
  getSetting,
  insertActivityCandidate,
  insertContentBrief,
  insertPromptRecipe,
  listActivityCandidates,
  listAssets,
  listCharacters,
  listRunEvents,
  setSetting,
  updateActivityCandidateStatus,
  type ActivityCandidate,
  type AssetSummary,
  type RunSummary
} from "../db/repositories";
import { analyzeImageAsset, generateImageFromPromptRecipe, reviewAsset } from "../assets/creativeLoop";
import { createDraftPackageRun } from "../drafts/draftPackaging";
import { getProviderSettings } from "../providers/providerSettings";
import { RunService } from "../runs/runService";

export interface AutomationSettings {
  enableDailyActivityRuns: boolean;
  dailyRunTime: string;
  defaultCharacterIds: string[];
  defaultPlatforms: string[];
  defaultImageProvider: string;
  defaultAnalysisProvider: string;
  maxImagesPerRun: number;
  requireReviewBeforeDraft: boolean;
  autoSelectTopActivity: boolean;
}

export interface AutomationStatus {
  settings: AutomationSettings;
  schedulerEnabled: boolean;
  nextRunAt: string | null;
  lastSchedulerCheckAt: string | null;
  lastTriggeredAt: string | null;
  currentlyRunning: RunSummary | null;
  runsNeedingReview: RunSummary[];
}

const settingsKey = "automationSettings";
const lastRunDateKey = "automationDailyLastRunDate";
const lastSchedulerCheckKey = "automationLastSchedulerCheckAt";
const lastTriggeredKey = "automationLastTriggeredAt";

const defaultSettings: AutomationSettings = {
  enableDailyActivityRuns: false,
  dailyRunTime: "09:00",
  defaultCharacterIds: [],
  defaultPlatforms: ["Instagram"],
  defaultImageProvider: "mock",
  defaultAnalysisProvider: "mock",
  maxImagesPerRun: 1,
  requireReviewBeforeDraft: true,
  autoSelectTopActivity: false
};

function clampImages(value: unknown) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return defaultSettings.maxImagesPerRun;
  return Math.max(1, Math.min(4, Math.round(numberValue)));
}

function parseStringList(value: unknown, fallback: string[]) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return fallback;
}

function normalizeDailyRunTime(value: unknown) {
  if (typeof value === "string" && /^\d{2}:\d{2}$/.test(value)) return value;
  return defaultSettings.dailyRunTime;
}

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function minutesFromTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function nextRunAt(settings: AutomationSettings, now = new Date()) {
  if (!settings.enableDailyActivityRuns || settings.defaultCharacterIds.length === 0) return null;
  const [hours, minutes] = settings.dailyRunTime.split(":").map(Number);
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next.toISOString();
}

export function getAutomationSettings(db: AppDatabase, config: ApiConfig): AutomationSettings {
  const raw = getSetting(db, settingsKey);
  const parsed = raw ? (JSON.parse(raw) as Partial<AutomationSettings>) : {};
  const providerSettings = getProviderSettings(db, config);
  return {
    enableDailyActivityRuns: Boolean(parsed.enableDailyActivityRuns ?? defaultSettings.enableDailyActivityRuns),
    dailyRunTime: normalizeDailyRunTime(parsed.dailyRunTime),
    defaultCharacterIds: parseStringList(parsed.defaultCharacterIds, defaultSettings.defaultCharacterIds),
    defaultPlatforms: parseStringList(parsed.defaultPlatforms, defaultSettings.defaultPlatforms),
    defaultImageProvider: String(parsed.defaultImageProvider ?? providerSettings.defaultImageGenerationProvider ?? defaultSettings.defaultImageProvider),
    defaultAnalysisProvider: String(parsed.defaultAnalysisProvider ?? providerSettings.defaultAnalysisProvider ?? defaultSettings.defaultAnalysisProvider),
    maxImagesPerRun: clampImages(parsed.maxImagesPerRun),
    requireReviewBeforeDraft: Boolean(parsed.requireReviewBeforeDraft ?? defaultSettings.requireReviewBeforeDraft),
    autoSelectTopActivity: Boolean(parsed.autoSelectTopActivity ?? defaultSettings.autoSelectTopActivity)
  };
}

export function updateAutomationSettings(db: AppDatabase, config: ApiConfig, input: Partial<AutomationSettings>) {
  const current = getAutomationSettings(db, config);
  const next: AutomationSettings = {
    ...current,
    ...input,
    dailyRunTime: normalizeDailyRunTime(input.dailyRunTime ?? current.dailyRunTime),
    defaultCharacterIds: parseStringList(input.defaultCharacterIds, current.defaultCharacterIds),
    defaultPlatforms: parseStringList(input.defaultPlatforms, current.defaultPlatforms),
    maxImagesPerRun: clampImages(input.maxImagesPerRun ?? current.maxImagesPerRun)
  };
  setSetting(db, settingsKey, JSON.stringify(next));
  return next;
}

function rankedActivities(candidates: ActivityCandidate[]) {
  return [...candidates].sort((a, b) => {
    const aScore = a.identity_fit_score + a.campaign_fit_score + a.freshness_score;
    const bScore = b.identity_fit_score + b.campaign_fit_score + b.freshness_score;
    return bScore - aScore;
  });
}

function appendStep(runService: RunService, runId: string, step: number, total: number, message: string, payload: Record<string, unknown> = {}) {
  runService.appendRunEvent(runId, "automation.step", message, { step, total, ...payload });
}

function insertActivityCandidatesForRun(db: AppDatabase, runService: RunService, runId: string, characterId: string) {
  const templates = [
    ["Morning studio reset", "Preparing the studio before a shoot", "studio loft", "workday", "soft window light"],
    ["Leaving the office", "Stepping out after reviewing proofs", "downtown sidewalk", "transition", "motion blur and tote bag"],
    ["Coffee with a collaborator", "Meeting a creative partner to compare references", "quiet cafe", "social", "tabletop details"],
    ["Packing for LA", "Choosing travel pieces and prompt references", "bedroom floor", "travel", "open suitcase"],
    ["Gallery errand", "Collecting visual notes from a small exhibition", "local gallery", "research", "framed negative space"]
  ] as const;
  return templates.map((template, index) => {
    const [title, description, locationFiction, activityType, visualMotif] = template;
    const candidate = insertActivityCandidate(db, {
      characterId,
      runId,
      title,
      description,
      locationFiction,
      activityType,
      visualMotif,
      platformFit: index % 2 === 0 ? "Instagram, Threads" : "TikTok, Instagram",
      identityFitScore: 0.82 + index * 0.02,
      campaignFitScore: 0.7 + index * 0.03,
      freshnessScore: 0.75 + index * 0.025
    });
    runService.appendRunEvent(runId, "activity.proposed", `Proposed activity: ${title}.`, {
      candidateId: candidate.id,
      scores: {
        identityFit: candidate.identity_fit_score,
        campaignFit: candidate.campaign_fit_score,
        freshness: candidate.freshness_score
      }
    });
    return candidate;
  });
}

function composePromptForAutomation(
  db: AppDatabase,
  runService: RunService,
  runId: string,
  characterId: string,
  candidate: ActivityCandidate,
  settings: AutomationSettings
) {
  const character = getCharacterDetail(db, characterId);
  if (!character) throw new Error(`Character not found: ${characterId}`);
  const platform = settings.defaultPlatforms[0] ?? "Instagram";
  const brief = insertContentBrief(db, {
    characterId,
    runId,
    activityCandidateId: candidate.id,
    goal: `Create a platform-ready post from ${candidate.title}.`,
    platformTargets: settings.defaultPlatforms.join(", "),
    contentPillar: candidate.activity_type ?? "daily_activity",
    visualDirection: candidate.visual_motif ?? "identity-consistent editorial scene",
    captionAngle: `A concise process-aware caption for ${candidate.title}.`,
    disclosureFlags: "synthetic media disclosure",
    desiredOutputs: `${settings.maxImagesPerRun} image candidate(s), social caption variants`,
    body: { source: "automation", candidateId: candidate.id }
  });
  runService.appendRunEvent(runId, "brief.created", "Automation created a content brief from the selected activity.", {
    briefId: brief.id,
    candidateId: candidate.id
  });

  const constitution = character.constitutions.find((item) => item.is_active === 1) ?? character.constitutions[0];
  const appearance = character.appearanceProfiles[0];
  const persona = character.platformPersonas.find((item) => item.platform.toLowerCase() === platform.toLowerCase());
  const blocks = {
    characterCore: `${character.name}: ${character.summary ?? "Synthetic creator in Virtual Agency Studio."}`,
    constitution: constitution?.body ?? "No active constitution.",
    appearance: appearance?.body ?? "No appearance bible.",
    scene: `${candidate.title}: ${candidate.body}. Location fiction: ${candidate.location_fiction ?? "unspecified"}. Visual motif: ${candidate.visual_motif ?? "unspecified"}.`,
    platform: persona?.body ?? `${platform} platform persona.`,
    campaign: brief.goal,
    negativePrompt: "identity drift, inconsistent face, undisclosed real-world claims, automatic publishing, low-quality hands, extra limbs"
  };
  const finalPrompt = [
    `CHARACTER CORE\n${blocks.characterCore}`,
    `CONSTITUTION\n${blocks.constitution}`,
    `APPEARANCE BIBLE\n${blocks.appearance}`,
    `SCENE\n${blocks.scene}`,
    `PLATFORM\n${blocks.platform}`,
    `CAMPAIGN\n${blocks.campaign}`
  ].join("\n\n");
  const recipe = insertPromptRecipe(db, {
    characterId,
    runId,
    contentBriefId: brief.id,
    constitutionVersionId: constitution?.id ?? null,
    appearanceProfileId: appearance?.id ?? null,
    finalPrompt,
    negativePrompt: blocks.negativePrompt,
    recipe: {
      blocks,
      lineage: { constitutionVersionId: constitution?.id, appearanceProfileId: appearance?.id, contentBriefId: brief.id, activityCandidateId: candidate.id },
      generationSettings: { provider: settings.defaultImageProvider, aspectRatio: "4:5" }
    }
  });
  runService.appendRunEvent(runId, "prompt.generated", "Automation composed a prompt recipe from identity context and activity brief.", {
    promptRecipeId: recipe.id,
    constitutionVersionId: constitution?.id ?? null,
    appearanceProfileId: appearance?.id ?? null
  });
  return { brief, recipe };
}

function passingAsset(assets: AssetSummary[]) {
  return assets.find((asset) => {
    const analysis = asset.latestAnalysis;
    if (!analysis) return false;
    return analysis.identity_score >= 75 && analysis.quality_score >= 70 && analysis.recommended_action !== "revise_prompt";
  });
}

export async function runDailyActivityAutomation(
  db: AppDatabase,
  config: ApiConfig,
  runService: RunService,
  input: { characterId: string; source?: "manual" | "scheduler"; overrideSettings?: Partial<AutomationSettings> }
) {
  const settings = { ...getAutomationSettings(db, config), ...input.overrideSettings };
  const character = getCharacterDetail(db, input.characterId);
  if (!character) throw new Error(`Character not found: ${input.characterId}`);
  const totalSteps = 7;
  const run = runService.createRun({ characterId: input.characterId, type: "daily_activity", title: `${character.name} Automated Daily Activity` });
  runService.updateRunStatus(run.id, "running");
  runService.appendRunEvent(run.id, "run.started", "Supervised Daily Activity automation started.", {
    source: input.source ?? "manual",
    noAutomaticPublishing: true,
    noAutomaticIdentityMutation: true
  });
  appendStep(runService, run.id, 1, totalSteps, "Loaded automation settings and character context.", {
    settings: {
      defaultPlatforms: settings.defaultPlatforms,
      defaultImageProvider: settings.defaultImageProvider,
      defaultAnalysisProvider: settings.defaultAnalysisProvider,
      maxImagesPerRun: settings.maxImagesPerRun,
      requireReviewBeforeDraft: settings.requireReviewBeforeDraft,
      autoSelectTopActivity: settings.autoSelectTopActivity
    },
    constitution: character.constitutions[0]?.id ?? null,
    canon: character.canon.length,
    memory: character.memory.length
  });
  runService.appendRunEvent(run.id, "context.loaded", "Loaded character identity context for automation.", {
    constitution: character.constitutions[0]?.id ?? null,
    appearance: character.appearanceProfiles[0]?.id ?? null
  });

  appendStep(runService, run.id, 2, totalSteps, "Generated activity candidates.");
  const candidates = insertActivityCandidatesForRun(db, runService, run.id, input.characterId);
  runService.attachRunArtifact(run.id, "activity_candidates", "Automation Activity Candidates", { candidates });

  const topCandidate = rankedActivities(candidates)[0];
  if (!topCandidate) throw new Error("Automation did not produce activity candidates.");
  if (!settings.autoSelectTopActivity) {
    runService.appendRunEvent(run.id, "review.required", "Activity candidates require human selection before automation continues.", {
      gate: "activity_selection",
      nextAction: "Select a candidate or rerun with auto-select enabled."
    });
    return {
      run: runService.updateRunStatus(run.id, "needs_review"),
      candidates,
      selectedCandidate: null,
      promptRecipe: null,
      assets: [],
      analyses: [],
      draft: null
    };
  }

  const selectedCandidate = updateActivityCandidateStatus(db, topCandidate.id, "selected");
  runService.appendRunEvent(run.id, "activity.selected", `Automation selected top activity: ${selectedCandidate.title}.`, {
    candidateId: selectedCandidate.id
  });
  runService.appendRunEvent(run.id, "automation.decision", "Auto-selected the highest-scoring activity candidate because the setting is enabled.", {
    candidateId: selectedCandidate.id,
    rationale: "Highest combined identity, campaign, and freshness score."
  });

  appendStep(runService, run.id, 3, totalSteps, "Created content brief and prompt recipe.");
  const { brief, recipe } = composePromptForAutomation(db, runService, run.id, input.characterId, selectedCandidate, settings);
  runService.attachRunArtifact(run.id, "automation_prompt", "Automation Prompt Recipe", { briefId: brief.id, promptRecipeId: recipe.id });

  appendStep(runService, run.id, 4, totalSteps, "Generating image candidates.", { providerWaitStatus: "starting" });
  const generatedAssets: AssetSummary[] = [];
  for (let index = 0; index < settings.maxImagesPerRun; index += 1) {
    runService.appendRunEvent(run.id, "provider.requested", `Automation requested image ${index + 1} of ${settings.maxImagesPerRun}.`, {
      promptRecipeId: recipe.id,
      provider: settings.defaultImageProvider,
      providerWaitStatus: "waiting"
    });
    const result = await generateImageFromPromptRecipe(db, config, runService, recipe.id, `\n\nAUTOMATION VARIANT ${index + 1}`);
    if ("asset" in result && result.asset) {
      generatedAssets.push(result.asset);
      runService.appendRunEvent(run.id, "image.generated", "Automation image candidate stored.", {
        assetId: result.asset.id,
        childRunId: result.run.id,
        index: index + 1
      });
    } else {
      runService.appendRunEvent(run.id, "automation.warning", "Image generation failed during automation.", {
        childRunId: result.run.id,
        error: "error" in result ? result.error : "Unknown generation failure."
      });
    }
  }
  if (generatedAssets.length === 0) {
    runService.appendRunEvent(run.id, "review.required", "No image candidates were generated; human review required.", { gate: "image_generation" });
    return { run: runService.updateRunStatus(run.id, "needs_review"), candidates, selectedCandidate, promptRecipe: recipe, assets: [], analyses: [], draft: null };
  }

  appendStep(runService, run.id, 5, totalSteps, "Analyzing image candidates.", { providerWaitStatus: "starting" });
  const analyzedAssets: AssetSummary[] = [];
  const analyses = [];
  for (const asset of generatedAssets) {
    runService.appendRunEvent(run.id, "provider.requested", "Automation requested image analysis.", {
      assetId: asset.id,
      provider: settings.defaultAnalysisProvider,
      providerWaitStatus: "waiting"
    });
    const result = await analyzeImageAsset(db, config, runService, asset.id);
    if ("analysis" in result && result.analysis) {
      analyzedAssets.push(result.asset);
      analyses.push(result.analysis);
      runService.appendRunEvent(run.id, "image.analyzed", "Automation analysis completed for image candidate.", {
        assetId: asset.id,
        childRunId: result.run.id,
        identityScore: result.analysis.identity_score,
        qualityScore: result.analysis.quality_score,
        recommendedAction: result.analysis.recommended_action
      });
    } else {
      runService.appendRunEvent(run.id, "automation.warning", "Image analysis failed during automation.", {
        assetId: asset.id,
        childRunId: result.run.id,
        error: "error" in result ? result.error : "Unknown analysis failure."
      });
    }
  }

  appendStep(runService, run.id, 6, totalSteps, "Evaluating review gate and draft packaging safety.");
  const passing = passingAsset(analyzedAssets);
  if (!passing) {
    runService.appendRunEvent(run.id, "review.required", "No analyzed image passed the automated draft threshold.", {
      gate: "asset_review",
      threshold: { identityScore: 75, qualityScore: 70 }
    });
    return { run: runService.updateRunStatus(run.id, "needs_review"), candidates, selectedCandidate, promptRecipe: recipe, assets: analyzedAssets, analyses, draft: null };
  }
  if (settings.requireReviewBeforeDraft) {
    runService.appendRunEvent(run.id, "review.required", "Passing asset found, but settings require human review before draft packaging.", {
      gate: "draft_packaging",
      assetId: passing.id
    });
    return { run: runService.updateRunStatus(run.id, "needs_review"), candidates, selectedCandidate, promptRecipe: recipe, assets: analyzedAssets, analyses, draft: null };
  }

  reviewAsset(db, runService, passing.id, "approved_post_asset", "Automation approved passing asset for draft packaging under configured settings.");
  const draftResult = createDraftPackageRun(db, config, runService, passing.id);
  runService.appendRunEvent(run.id, "draft.created", "Automation created a draft package from the passing asset.", {
    assetId: passing.id,
    draftId: draftResult.draft.id,
    childRunId: draftResult.run.id
  });
  appendStep(runService, run.id, 7, totalSteps, "Daily automation finished at human draft review gate.", {
    draftId: draftResult.draft.id,
    noAutomaticPublishing: true
  });
  runService.appendRunEvent(run.id, "review.required", "Draft package is ready for human review. Publishing remains manual.", { draftId: draftResult.draft.id });
  return { run: runService.updateRunStatus(run.id, "needs_review"), candidates, selectedCandidate, promptRecipe: recipe, assets: analyzedAssets, analyses, draft: draftResult.draft };
}

export interface CandidateImageSuffixInput {
  count?: number;
  promptSuffixes?: string[];
}

export async function generateImageCandidatesForPrompt(
  db: AppDatabase,
  config: ApiConfig,
  runService: RunService,
  promptRecipeId: string,
  options: CandidateImageSuffixInput = {}
) {
  const recipe = getPromptRecipe(db, promptRecipeId);
  if (!recipe) throw new Error(`Prompt recipe not found: ${promptRecipeId}`);
  const settings = getAutomationSettings(db, config);
  const count = clampImages(options.count ?? settings.maxImagesPerRun);
  const customSuffixes = Array.isArray(options.promptSuffixes)
    ? options.promptSuffixes.map((value) => value?.trim()).filter(Boolean).slice(0, 4)
    : [];
  const suffixes =
    customSuffixes.length > 0
      ? customSuffixes.slice(0, count)
      : Array.from({ length: count }, (_, index) => `\n\nMANUAL AUTOMATION VARIANT ${index + 1}`);
  const results = [];
  for (const suffix of suffixes) {
    results.push(await generateImageFromPromptRecipe(db, config, runService, promptRecipeId, suffix));
  }
  return { promptRecipeId, results };
}

export async function analyzeLatestCandidatesForCharacter(db: AppDatabase, config: ApiConfig, runService: RunService, characterId: string) {
  if (!getCharacterDetail(db, characterId)) throw new Error(`Character not found: ${characterId}`);
  const candidates = listAssets(db, { characterId }).filter((asset) => ["raw_generation", "candidate"].includes(asset.status)).slice(0, 4);
  const results = [];
  for (const asset of candidates) {
    results.push(await analyzeImageAsset(db, config, runService, asset.id));
  }
  return { characterId, analyzed: results };
}

export function packageApprovedAsset(db: AppDatabase, config: ApiConfig, runService: RunService, assetId: string) {
  const asset = getAsset(db, assetId);
  if (!asset) throw new Error(`Asset not found: ${assetId}`);
  if (asset.status === "candidate") {
    reviewAsset(db, runService, assetId, "approved_post_asset", "Manual automation packaging approved this candidate asset.");
  }
  return createDraftPackageRun(db, config, runService, assetId);
}

export function getAutomationStatus(db: AppDatabase, config: ApiConfig): AutomationStatus {
  const settings = getAutomationSettings(db, config);
  const runs = db
    .prepare("select id, character_id, type, status, title, error, created_at, updated_at from runs order by created_at desc limit 50")
    .all() as unknown as RunSummary[];
  return {
    settings,
    schedulerEnabled: settings.enableDailyActivityRuns,
    nextRunAt: nextRunAt(settings),
    lastSchedulerCheckAt: getSetting(db, lastSchedulerCheckKey) ?? null,
    lastTriggeredAt: getSetting(db, lastTriggeredKey) ?? null,
    currentlyRunning: runs.find((run) => run?.type === "daily_activity" && run.status === "running") ?? null,
    runsNeedingReview: runs.filter((run) => run?.status === "needs_review").slice(0, 8)
  };
}

export class AutomationScheduler {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly db: AppDatabase,
    private readonly config: ApiConfig,
    private readonly runService: RunService
  ) {}

  start() {
    if (this.timer) return;
    const settings = getAutomationSettings(this.db, this.config);
    if (!settings.enableDailyActivityRuns) return;
    this.timer = setInterval(() => {
      void this.tick();
    }, 60_000);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  restart() {
    this.stop();
    this.start();
  }

  async tick(now = new Date()) {
    const settings = getAutomationSettings(this.db, this.config);
    setSetting(this.db, lastSchedulerCheckKey, now.toISOString());
    if (!settings.enableDailyActivityRuns || settings.defaultCharacterIds.length === 0) {
      return { triggered: false, reason: "disabled_or_no_characters" };
    }
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    if (currentMinutes < minutesFromTime(settings.dailyRunTime)) {
      return { triggered: false, reason: "before_run_time" };
    }
    const lastRunDate = getSetting(this.db, lastRunDateKey);
    const currentDate = todayKey(now);
    if (lastRunDate === currentDate) {
      return { triggered: false, reason: "already_triggered_today" };
    }
    setSetting(this.db, lastRunDateKey, currentDate);
    setSetting(this.db, lastTriggeredKey, now.toISOString());
    const results = [];
    for (const characterId of settings.defaultCharacterIds) {
      const result = await runDailyActivityAutomation(this.db, this.config, this.runService, {
        characterId,
        source: "scheduler"
      });
      this.runService.appendRunEvent(result.run.id, "scheduler.triggered", "Local scheduler triggered this Daily Activity Run.", {
        scheduledTime: settings.dailyRunTime
      });
      results.push(result);
    }
    return { triggered: true, results };
  }
}
