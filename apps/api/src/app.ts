import cors from "@fastify/cors";
import Fastify from "fastify";
import { Buffer } from "node:buffer";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ComfyUICloudImageGenerationProvider } from "@virtual-agency/providers";
import { analyzeImageAsset, generateImageFromPromptRecipe, regenerateAssetFromFixes, reviewAsset } from "./assets/creativeLoop";
import {
  analyzeLatestCandidatesForCharacter,
  AutomationScheduler,
  generateImageCandidatesForPrompt,
  getAutomationSettings,
  getAutomationStatus,
  packageApprovedAsset,
  runDailyActivityAutomation,
  updateAutomationSettings
} from "./automation/automationService";
import { startCharacterBirthRun } from "./characters/characterBirth";
import type { ApiConfig } from "./config";
import { migrateDatabase, openDatabase } from "./db/database";
import {
  getCharacterDetail,
  getRun,
  activateComfyWorkflowForTier,
  getComfyWorkflow,
  insertBodyEntry,
  insertCanonEntry,
  insertCharacter,
  insertConstitutionVersion,
  insertMemoryEntry,
  insertProviderJob,
  insertReferenceImage,
  getAsset,
  getDraft,
  listActivityCandidates,
  listAssetAnalyses,
  listAssets,
  listCharacters,
  listComfyWorkflows,
  listCharacterFeedback,
  listCharacterIdentityProposals,
  listCharacterReflections,
  listContentBriefs,
  listPromptRecipes,
  listRunArtifacts,
  listRunDecisions,
  listRunEvents,
  listRuns,
  listProviderJobsForRun,
  listDrafts,
  listPublishingEvents,
  markActiveConstitution,
  updateCanonStatus,
  updateCharacter,
  updatePlatformVariant,
  updateProviderJob,
  updateReferenceImageStatus,
  upsertComfyWorkflow,
  getSetting,
  upsertPlatformPersona
} from "./db/repositories";
import { createDraftPackageRun, exportDraftPackage, markDraftPublished, reviewDraft } from "./drafts/draftPackaging";
import { composePromptRecipe, createContentBriefFromInput, generateActivityRun, selectActivityCandidate } from "./prompts/promptStudio";
import { getProviderSettings, testImageAnalysisProvider, testImageGenerationProvider, updateProviderSettings } from "./providers/providerSettings";
import {
  contentTiers,
  normalizeComfyWorkflowInput,
  validateComfyWorkflowDefinition,
  workflowSummaryToInput,
  type ActivatableContentTier
} from "./providers/comfyWorkflows";
import type { ProviderOverride } from "./providers/providerRouter";
import { logSocialFeedback, reviewIdentityProposal, runFeedbackReflection } from "./reflections/feedbackReflection";
import { RunQueue } from "./runs/runQueue";
import { RunService } from "./runs/runService";
import { isRunType } from "./runs/types";
import { ensureStorage, saveAssetFile } from "./storage";

export function buildApp(config: ApiConfig) {
  ensureStorage(config);
  const db = openDatabase({ databaseUrl: config.databaseUrl });
  migrateDatabase(db);
  const runService = new RunService(db);
  const runQueue = new RunQueue(db, runService);
  const automationScheduler = new AutomationScheduler(db, config, runService);
  automationScheduler.start();

  const app = Fastify({
    logger: true
  });

  app.addHook("onClose", async () => {
    automationScheduler.stop();
    db.close();
  });

  app.register(cors, {
    methods: ["GET", "HEAD", "POST", "PATCH", "OPTIONS"],
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      try {
        const url = new URL(origin);
        const isLocalHost = url.hostname === "127.0.0.1" || url.hostname === "localhost";
        const isOrangePi = url.hostname === "orangepi.local";
        const isLanAddress = url.hostname.startsWith("192.168.") || url.hostname.startsWith("10.") || url.hostname.startsWith("172.");
        callback(null, url.port === "5173" && (isLocalHost || isOrangePi || isLanAddress));
      } catch {
        callback(null, false);
      }
    }
  });

  app.get("/health", async () => ({
    ok: true,
    service: "virtual-agency-api",
    version: config.version,
    timestamp: new Date().toISOString(),
    dataDir: config.dataDir
  }));

  app.get("/api/version", async () => ({
    name: "Virtual Agency Studio",
    version: config.version
  }));

  app.get("/api/workflow/summary", async () => {
    const characters = listCharacters(db);
    const runs = listRuns(db);
    const assets = listAssets(db);
    const drafts = listDrafts(db);
    const publishingEvents = listPublishingEvents(db);
    const feedback = characters.flatMap((character) => listCharacterFeedback(db, character.id));
    const reflections = characters.flatMap((character) => listCharacterReflections(db, character.id));
    const pendingIdentityProposals = characters.flatMap((character) =>
      listCharacterIdentityProposals(db, character.id).filter((proposal) => proposal.status === "proposed")
    );

    const birthRuns = runs.filter((run) => run.type === "character_birth");
    const activeRuns = runs.filter((run) => ["queued", "running", "waiting_for_provider"].includes(run.status));
    const reviewRuns = runs.filter((run) => run.status === "needs_review");
    const productionAssets = assets.filter((asset) => ["raw_generation", "candidate"].includes(asset.status));
    const candidateProductionAssets = productionAssets.filter((asset) => asset.status === "candidate");
    const rawProductionAssets = productionAssets.filter((asset) => asset.status === "raw_generation");
    const approvedAssets = assets.filter((asset) => asset.status === "approved_post_asset" || asset.status === "approved_reference");
    const reviewDrafts = drafts.filter((draft) => draft.status === "needs_review");
    const publishReadyDrafts = drafts.filter((draft) => draft.status === "approved" || draft.status === "exported");
    const publishedEvents = publishingEvents.filter((event) => event.status === "published" || Boolean(event.published_at));
    const feedbackEventIds = new Set(feedback.map((item) => item.publishing_event_id).filter(Boolean));
    const reflectedFeedbackIds = new Set(reflections.map((item) => item.social_feedback_id).filter(Boolean));
    const feedbackAwaitingReflection = feedback.filter((item) => !reflectedFeedbackIds.has(item.id));
    const eventsNeedingFeedback = publishingEvents.filter(
      (event) => (event.status === "needs_feedback" || event.status === "published" || Boolean(event.published_at)) && !feedbackEventIds.has(event.id)
    );
    const statusFor = (hasAttention: boolean, hasReady: boolean, complete: boolean) => {
      if (hasAttention) return "attention";
      if (hasReady) return "ready";
      if (complete) return "complete";
      return "blocked";
    };

    return {
      stages: [
        {
          id: "heartbeat",
          label: "Heartbeat",
          path: "/",
          status: activeRuns.length || reviewRuns.length ? "attention" : "ready",
          count: activeRuns.length + reviewRuns.length,
          detail: activeRuns.length
            ? `${activeRuns.length} active automation run${activeRuns.length === 1 ? "" : "s"}`
            : reviewRuns.length
              ? `${reviewRuns.length} run review gate${reviewRuns.length === 1 ? "" : "s"}`
              : "Studio ready for the next operator action",
          primaryActionLabel: reviewRuns.length ? "Open review gates" : "Open workflow",
          primaryActionPath: reviewRuns.length ? "/runs?status=needs_review" : "/characters"
        },
        {
          id: "birth",
          label: "Birth",
          path: "/characters",
          status: statusFor(birthRuns.some((run) => run.status === "needs_review"), characters.length === 0, characters.length > 0),
          count: characters.length,
          detail: birthRuns.some((run) => run.status === "needs_review")
            ? "Birth Run output needs operator review"
            : characters.length
            ? `${characters.length} character profile${characters.length === 1 ? "" : "s"} in the roster`
            : "Create the first character profile and start a Birth Run",
          primaryActionLabel: birthRuns.some((run) => run.status === "needs_review") ? "Review Birth Run" : characters.length ? "Open cast" : "Create character",
          primaryActionPath: birthRuns.some((run) => run.status === "needs_review") ? "/runs?status=needs_review" : "/characters"
        },
        {
          id: "production",
          label: "Production",
          path: "/assets",
          status: statusFor(productionAssets.length > 0, characters.length > 0 && approvedAssets.length === 0, approvedAssets.length > 0),
          count: productionAssets.length + approvedAssets.length,
          detail: productionAssets.length
            ? `${productionAssets.length} asset${productionAssets.length === 1 ? "" : "s"} need analysis or approval`
            : approvedAssets.length
              ? `${approvedAssets.length} approved asset${approvedAssets.length === 1 ? "" : "s"} ready for drafts`
              : characters.length
                ? "Generate or import assets for the active cast"
                : "Birth a character before production",
          primaryActionLabel: productionAssets.length ? "Review assets" : "Open archive",
          primaryActionPath: candidateProductionAssets.length
            ? "/assets?status=candidate"
            : rawProductionAssets.length
              ? "/assets?status=raw_generation"
              : "/assets"
        },
        {
          id: "review",
          label: "Review",
          path: "/drafts",
          status: statusFor(reviewDrafts.length + reviewRuns.length + pendingIdentityProposals.length > 0, approvedAssets.length > 0, drafts.some((draft) => ["approved", "exported", "published"].includes(draft.status))),
          count: reviewDrafts.length + reviewRuns.length + pendingIdentityProposals.length,
          detail:
            reviewDrafts.length || reviewRuns.length || pendingIdentityProposals.length
              ? `${reviewDrafts.length} drafts, ${reviewRuns.length} runs, ${pendingIdentityProposals.length} identity proposals`
              : drafts.length
                ? "Draft review gates are clear"
                : "Approve an asset, then create a reviewable draft",
          primaryActionLabel: reviewDrafts.length ? "Review drafts" : reviewRuns.length ? "Review runs" : "Open Review Desk",
          primaryActionPath: reviewDrafts.length ? "/drafts?status=needs_review" : reviewRuns.length ? "/runs?status=needs_review" : "/drafts"
        },
        {
          id: "publishing",
          label: "Publishing",
          path: "/calendar",
          status: statusFor(publishReadyDrafts.length > 0, drafts.length > 0, publishedEvents.length > 0),
          count: publishReadyDrafts.length + publishedEvents.length,
          detail: publishReadyDrafts.length
            ? `${publishReadyDrafts.length} approved/exported draft${publishReadyDrafts.length === 1 ? "" : "s"} need manual publishing`
            : publishedEvents.length
              ? `${publishedEvents.length} live ledger event${publishedEvents.length === 1 ? "" : "s"}`
              : "Approve and export a draft before publishing",
          primaryActionLabel: publishReadyDrafts.length ? "Open ledger" : "Open calendar",
          primaryActionPath: publishReadyDrafts.length ? "/calendar?bucket=draft_ready" : "/calendar"
        },
        {
          id: "feedback",
          label: "Feedback",
          path: "/feedback",
          status: eventsNeedingFeedback.length
            ? "attention"
            : feedbackAwaitingReflection.length
              ? "attention"
            : reflections.length > 0
              ? "complete"
              : publishedEvents.length
                ? "ready"
                : "blocked",
          count: eventsNeedingFeedback.length + feedbackAwaitingReflection.length,
          detail: eventsNeedingFeedback.length
            ? `${eventsNeedingFeedback.length} published event${eventsNeedingFeedback.length === 1 ? "" : "s"} need response logging`
            : feedbackAwaitingReflection.length
              ? `${feedbackAwaitingReflection.length} feedback log${feedbackAwaitingReflection.length === 1 ? "" : "s"} ready for reflection`
            : reflections.length > 0
              ? "Reflection has fed identity proposals"
              : "Publish a draft before feedback",
          primaryActionLabel: eventsNeedingFeedback.length ? "Log feedback" : feedbackAwaitingReflection.length ? "Run reflection" : publishedEvents.length || reflections.length ? "Open feedback" : "Open publishing",
          primaryActionPath: eventsNeedingFeedback[0] ? `/feedback?eventId=${eventsNeedingFeedback[0].id}` : publishedEvents.length || reflections.length || feedbackAwaitingReflection.length ? "/feedback" : "/calendar"
        }
      ]
    };
  });

  app.get("/api/characters", async () => ({
    characters: listCharacters(db)
  }));

  app.post<{ Body: { name?: string; summary?: string | null; status?: string } }>("/api/characters", async (request, reply) => {
    const name = request.body?.name?.trim();
    if (!name) {
      return reply.code(400).send({ error: "Character name is required" });
    }
    const character = insertCharacter(db, {
      name,
      summary: request.body.summary ?? null,
      status: request.body.status ?? "idea"
    });
    return reply.code(201).send({ character: getCharacterDetail(db, character.id) });
  });

  app.get<{ Params: { id: string } }>("/api/characters/:id", async (request, reply) => {
    const character = getCharacterDetail(db, request.params.id);
    if (!character) {
      return reply.code(404).send({ error: "Character not found" });
    }
    return { character };
  });

  app.patch<{ Params: { id: string }; Body: { name?: string; summary?: string | null; status?: string } }>(
    "/api/characters/:id",
    async (request, reply) => {
      try {
        updateCharacter(db, request.params.id, request.body ?? {});
        return { character: getCharacterDetail(db, request.params.id) };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to update character";
        return reply.code(404).send({ error: message });
      }
    }
  );

  app.post<{ Params: { id: string }; Body: { body?: string; changeReason?: string; markActive?: boolean } }>(
    "/api/characters/:id/constitutions",
    async (request, reply) => {
      if (!getCharacterDetail(db, request.params.id)) {
        return reply.code(404).send({ error: "Character not found" });
      }
      if (!request.body?.body?.trim() || !request.body?.changeReason?.trim()) {
        return reply.code(400).send({ error: "Constitution body and change reason are required" });
      }
      const constitution = insertConstitutionVersion(db, {
        characterId: request.params.id,
        body: request.body.body,
        changeReason: request.body.changeReason,
        markActive: request.body.markActive ?? true
      });
      return reply.code(201).send({ constitution, character: getCharacterDetail(db, request.params.id) });
    }
  );

  app.post<{ Params: { id: string; constitutionId: string } }>("/api/characters/:id/constitutions/:constitutionId/activate", async (request, reply) => {
    if (!getCharacterDetail(db, request.params.id)) {
      return reply.code(404).send({ error: "Character not found" });
    }
    const constitutions = markActiveConstitution(db, request.params.id, request.params.constitutionId);
    return { constitutions, character: getCharacterDetail(db, request.params.id) };
  });

  app.post<{ Params: { id: string }; Body: { title?: string; body?: string; status?: string; sourceRunId?: string | null } }>(
    "/api/characters/:id/canon",
    async (request, reply) => {
      if (!getCharacterDetail(db, request.params.id)) {
        return reply.code(404).send({ error: "Character not found" });
      }
      if (!request.body?.title?.trim() || !request.body?.body?.trim()) {
        return reply.code(400).send({ error: "Canon title and body are required" });
      }
      const canon = insertCanonEntry(db, {
        characterId: request.params.id,
        title: request.body.title,
        body: request.body.body,
        status: request.body.status ?? "proposed",
        sourceRunId: request.body.sourceRunId ?? null
      });
      return reply.code(201).send({ canon, character: getCharacterDetail(db, request.params.id) });
    }
  );

  app.post<{ Params: { id: string; canonId: string }; Body: { status?: string } }>("/api/characters/:id/canon/:canonId/status", async (request, reply) => {
    const status = request.body?.status;
    if (!status || !["approved", "proposed", "rejected"].includes(status)) {
      return reply.code(400).send({ error: "Canon status must be approved, proposed, or rejected" });
    }
    const canon = updateCanonStatus(db, request.params.id, request.params.canonId, status);
    return { canon, character: getCharacterDetail(db, request.params.id) };
  });

  app.post<{
    Params: { id: string };
    Body: { body?: string; source?: string | null; sourceRunId?: string | null; sourceType?: string; confidence?: number; importance?: number };
  }>("/api/characters/:id/memory", async (request, reply) => {
    if (!getCharacterDetail(db, request.params.id)) {
      return reply.code(404).send({ error: "Character not found" });
    }
    if (!request.body?.body?.trim()) {
      return reply.code(400).send({ error: "Memory body is required" });
    }
    const memory = insertMemoryEntry(db, {
      characterId: request.params.id,
      body: request.body.body,
      source: request.body.source ?? null,
      sourceRunId: request.body.sourceRunId ?? null,
      sourceType: request.body.sourceType ?? "manual",
      confidence: request.body.confidence,
      importance: request.body.importance
    });
    return reply.code(201).send({ memory, character: getCharacterDetail(db, request.params.id) });
  });

  app.post<{ Params: { id: string }; Body: { body?: string } }>("/api/characters/:id/appearance", async (request, reply) => {
    if (!getCharacterDetail(db, request.params.id)) {
      return reply.code(404).send({ error: "Character not found" });
    }
    if (!request.body?.body?.trim()) {
      return reply.code(400).send({ error: "Appearance body is required" });
    }
    const appearance = insertBodyEntry(db, "character_appearance_profiles", { characterId: request.params.id, body: request.body.body });
    return reply.code(201).send({ appearance, character: getCharacterDetail(db, request.params.id) });
  });

  app.post<{ Params: { id: string }; Body: { body?: string } }>("/api/characters/:id/voice", async (request, reply) => {
    if (!getCharacterDetail(db, request.params.id)) {
      return reply.code(404).send({ error: "Character not found" });
    }
    if (!request.body?.body?.trim()) {
      return reply.code(400).send({ error: "Voice body is required" });
    }
    const voice = insertBodyEntry(db, "character_voice_guides", { characterId: request.params.id, body: request.body.body });
    return reply.code(201).send({ voice, character: getCharacterDetail(db, request.params.id) });
  });

  app.post<{ Params: { id: string }; Body: { platform?: string; body?: string } }>("/api/characters/:id/personas", async (request, reply) => {
    if (!getCharacterDetail(db, request.params.id)) {
      return reply.code(404).send({ error: "Character not found" });
    }
    if (!request.body?.platform?.trim() || !request.body?.body?.trim()) {
      return reply.code(400).send({ error: "Platform and body are required" });
    }
    const persona = upsertPlatformPersona(db, {
      characterId: request.params.id,
      platform: request.body.platform,
      body: request.body.body
    });
    return reply.code(201).send({ persona, character: getCharacterDetail(db, request.params.id) });
  });

  app.post<{
    Params: { id: string };
    Body: { originalName?: string; mimeType?: string; base64?: string; status?: string };
  }>("/api/characters/:id/reference-images", async (request, reply) => {
    if (!getCharacterDetail(db, request.params.id)) {
      return reply.code(404).send({ error: "Character not found" });
    }
    if (!request.body?.originalName || !request.body?.mimeType || !request.body?.base64) {
      return reply.code(400).send({ error: "Reference image originalName, mimeType, and base64 are required" });
    }
    const stored = saveAssetFile(config, {
      buffer: Buffer.from(request.body.base64, "base64"),
      originalName: request.body.originalName,
      mimeType: request.body.mimeType
    });
    const referenceImage = insertReferenceImage(db, {
      characterId: request.params.id,
      filePath: stored.relativePath,
      originalName: stored.originalName,
      mimeType: stored.mimeType,
      sizeBytes: stored.sizeBytes,
      status: request.body.status ?? "experimental"
    });
    return reply.code(201).send({ referenceImage, character: getCharacterDetail(db, request.params.id) });
  });

  app.get<{ Params: { id: string; imageId: string } }>("/api/characters/:id/reference-images/:imageId/file", async (request, reply) => {
    const character = getCharacterDetail(db, request.params.id);
    const referenceImage = character?.referenceImages.find((image) => image.id === request.params.imageId);
    if (!referenceImage?.file_path) {
      return reply.code(404).send({ error: "Reference image not found" });
    }
    const absolutePath = join(config.dataDir, referenceImage.file_path);
    if (!existsSync(absolutePath)) {
      return reply.code(404).send({ error: "Reference image missing from local storage" });
    }
    reply.header("content-type", referenceImage.mime_type ?? "application/octet-stream");
    return reply.send(readFileSync(absolutePath));
  });

  app.post<{ Params: { id: string; imageId: string }; Body: { status?: string } }>(
    "/api/characters/:id/reference-images/:imageId/status",
    async (request, reply) => {
      const status = request.body?.status;
      if (!status || !["approved", "rejected", "experimental"].includes(status)) {
        return reply.code(400).send({ error: "Reference status must be approved, rejected, or experimental" });
      }
      const referenceImages = updateReferenceImageStatus(db, request.params.id, request.params.imageId, status);
      return { referenceImages, character: getCharacterDetail(db, request.params.id) };
    }
  );

  app.post<{ Params: { id: string } }>("/api/characters/:id/birth-run", async (request, reply) => {
    try {
      const run = startCharacterBirthRun(db, runService, request.params.id);
      return reply.code(201).send({
        run: getRun(db, run.id),
        events: listRunEvents(db, run.id),
        artifacts: listRunArtifacts(db, run.id),
        decisions: listRunDecisions(db, run.id)
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to start Character Birth Run";
      return reply.code(message.startsWith("Character not found") ? 404 : 400).send({ error: message });
    }
  });

  app.post<{ Params: { id: string } }>("/api/characters/:id/activity-runs", async (request, reply) => {
    try {
      const result = generateActivityRun(db, runService, request.params.id);
      return reply.code(201).send(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to generate activity candidates";
      return reply.code(message.startsWith("Character not found") ? 404 : 400).send({ error: message });
    }
  });

  app.get<{ Querystring: { characterId?: string } }>("/api/activity-candidates", async (request) => ({
    candidates: listActivityCandidates(db, request.query.characterId)
  }));

  app.post<{ Params: { id: string }; Body: { status?: "selected" | "rejected" } }>("/api/activity-candidates/:id/select", async (request, reply) => {
    const status = request.body?.status ?? "selected";
    if (!["selected", "rejected"].includes(status)) {
      return reply.code(400).send({ error: "Activity status must be selected or rejected" });
    }
    try {
      return { candidate: selectActivityCandidate(db, runService, request.params.id, status) };
    } catch {
      return reply.code(404).send({ error: "Activity candidate not found" });
    }
  });

  app.get<{ Querystring: { characterId?: string } }>("/api/content-briefs", async (request) => ({
    briefs: listContentBriefs(db, request.query.characterId)
  }));

  app.post<{
    Body: {
      characterId?: string;
      activityCandidateId?: string | null;
      goal?: string;
      platformTargets?: string;
      contentPillar?: string;
      visualDirection?: string;
      captionAngle?: string;
      disclosureFlags?: string;
      desiredOutputs?: string;
    };
  }>("/api/content-briefs", async (request, reply) => {
    if (!request.body?.characterId || !request.body?.goal || !request.body?.platformTargets || !request.body?.contentPillar) {
      return reply.code(400).send({ error: "characterId, goal, platformTargets, and contentPillar are required" });
    }
    try {
      const brief = createContentBriefFromInput(db, runService, {
        characterId: request.body.characterId,
        activityCandidateId: request.body.activityCandidateId ?? null,
        goal: request.body.goal,
        platformTargets: request.body.platformTargets,
        contentPillar: request.body.contentPillar,
        visualDirection: request.body.visualDirection,
        captionAngle: request.body.captionAngle,
        disclosureFlags: request.body.disclosureFlags,
        desiredOutputs: request.body.desiredOutputs
      });
      return reply.code(201).send({ brief });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create content brief";
      return reply.code(400).send({ error: message });
    }
  });

  app.get<{ Querystring: { characterId?: string } }>("/api/prompt-recipes", async (request) => ({
    recipes: listPromptRecipes(db, request.query.characterId)
  }));

  app.post<{
    Body: { characterId?: string; contentBriefId?: string | null; platform?: string; scene?: string; generationSettings?: unknown };
  }>("/api/prompt-recipes/compose", async (request, reply) => {
    if (!request.body?.characterId || !request.body?.platform || !request.body?.scene) {
      return reply.code(400).send({ error: "characterId, platform, and scene are required" });
    }
    try {
      const recipe = composePromptRecipe(db, runService, {
        characterId: request.body.characterId,
        contentBriefId: request.body.contentBriefId ?? null,
        platform: request.body.platform,
        scene: request.body.scene,
        generationSettings: request.body.generationSettings
      });
      return reply.code(201).send({ recipe });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to compose prompt recipe";
      return reply.code(400).send({ error: message });
    }
  });

  app.post<{
    Params: { id: string };
    Body: { providerOverride?: string | null; overrideReason?: string | null; contentTierOverride?: string | null };
  }>("/api/prompt-recipes/:id/generate-image", async (request, reply) => {
    try {
      const result = await generateImageFromPromptRecipe(db, config, runService, request.params.id, "", {
        providerOverride: request.body?.providerOverride === "auto" ? undefined : (request.body?.providerOverride as ProviderOverride | undefined),
        overrideReason: request.body?.overrideReason,
        contentTierOverride: request.body?.contentTierOverride
      });
      if ("error" in result) {
        return reply.code(result.run.status === "needs_review" ? 202 : 502).send(result);
      }
      return reply.code(201).send(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to generate image";
      return reply.code(message.startsWith("Prompt recipe not found") ? 404 : 400).send({ error: message });
    }
  });

  app.get<{ Querystring: { characterId?: string; runId?: string; status?: string; platformFit?: string } }>("/api/assets", async (request) => ({
    assets: listAssets(db, {
      characterId: request.query.characterId,
      runId: request.query.runId,
      status: request.query.status,
      platformFit: request.query.platformFit
    })
  }));

  app.get<{ Params: { id: string } }>("/api/assets/:id", async (request, reply) => {
    const asset = getAsset(db, request.params.id);
    if (!asset) {
      return reply.code(404).send({ error: "Asset not found" });
    }
    return { asset, analyses: listAssetAnalyses(db, request.params.id) };
  });

  app.get<{ Params: { id: string } }>("/api/assets/:id/file", async (request, reply) => {
    const asset = getAsset(db, request.params.id);
    if (!asset?.file_path) {
      return reply.code(404).send({ error: "Asset file not found" });
    }
    const absolutePath = join(config.dataDir, asset.file_path);
    if (!existsSync(absolutePath)) {
      return reply.code(404).send({ error: "Asset file missing from local storage" });
    }
    reply.header("content-type", asset.mime_type ?? "application/octet-stream");
    return reply.send(readFileSync(absolutePath));
  });

  app.post<{ Params: { id: string } }>("/api/assets/:id/analyze", async (request, reply) => {
    try {
      const result = await analyzeImageAsset(db, config, runService, request.params.id);
      if ("error" in result) {
        return reply.code(502).send(result);
      }
      return reply.code(201).send(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to analyze image";
      return reply.code(message.startsWith("Asset not found") ? 404 : 400).send({ error: message });
    }
  });

  app.post<{ Params: { id: string }; Body: { status?: string; reason?: string } }>("/api/assets/:id/review", async (request, reply) => {
    if (!request.body?.status) {
      return reply.code(400).send({ error: "Asset status is required" });
    }
    try {
      return reviewAsset(db, runService, request.params.id, request.body.status, request.body.reason);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to review asset";
      return reply.code(message.startsWith("Asset not found") ? 404 : 400).send({ error: message });
    }
  });

  app.post<{ Params: { id: string } }>("/api/assets/:id/regenerate", async (request, reply) => {
    try {
      const result = await regenerateAssetFromFixes(db, config, runService, request.params.id);
      if ("error" in result) {
        return reply.code(502).send(result);
      }
      return reply.code(201).send(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to regenerate asset";
      return reply.code(message.startsWith("Asset not found") ? 404 : 400).send({ error: message });
    }
  });

  app.post<{ Params: { id: string } }>("/api/assets/:id/create-draft", async (request, reply) => {
    try {
      return reply.code(201).send(createDraftPackageRun(db, config, runService, request.params.id));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create draft";
      return reply.code(message.startsWith("Asset not found") ? 404 : 400).send({ error: message });
    }
  });

  app.get<{ Querystring: { status?: string; characterId?: string } }>("/api/drafts", async (request) => ({
    drafts: listDrafts(db, { status: request.query.status, characterId: request.query.characterId })
  }));

  app.get<{ Params: { id: string } }>("/api/drafts/:id", async (request, reply) => {
    const draft = getDraft(db, request.params.id);
    if (!draft) return reply.code(404).send({ error: "Draft not found" });
    return { draft };
  });

  app.patch<{ Params: { id: string }; Body: { status?: string; reason?: string } }>("/api/drafts/:id", async (request, reply) => {
    if (!request.body?.status) return reply.code(400).send({ error: "Draft status is required" });
    try {
      return { draft: reviewDraft(db, runService, request.params.id, request.body.status, request.body.reason) };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to review draft";
      return reply.code(message.startsWith("Draft not found") ? 404 : 400).send({ error: message });
    }
  });

  app.patch<{
    Params: { variantId: string };
    Body: {
      post_format?: string | null;
      caption?: string;
      hashtags?: string | null;
      alt_text?: string | null;
      disclosure_text?: string | null;
      ai_generated_flag?: number;
      paid_partnership_flag?: number;
      brand_content_flag?: number;
      notes?: string | null;
      status?: string;
    };
  }>("/api/platform-variants/:variantId", async (request, reply) => {
    try {
      return { variant: updatePlatformVariant(db, request.params.variantId, request.body ?? {}) };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update variant";
      return reply.code(message.startsWith("Platform variant not found") ? 404 : 400).send({ error: message });
    }
  });

  app.post<{ Params: { id: string } }>("/api/drafts/:id/export", async (request, reply) => {
    try {
      return reply.code(201).send(exportDraftPackage(db, config, runService, request.params.id));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to export draft";
      return reply.code(message.startsWith("Draft not found") ? 404 : 400).send({ error: message });
    }
  });

  app.post<{ Params: { id: string }; Body: { platform?: string; liveUrl?: string | null; publishedAt?: string | null; notes?: string | null; status?: string } }>(
    "/api/drafts/:id/publish",
    async (request, reply) => {
      if (!request.body?.platform) return reply.code(400).send({ error: "Publishing platform is required" });
      try {
        return markDraftPublished(db, request.params.id, {
          platform: request.body.platform,
          liveUrl: request.body.liveUrl,
          publishedAt: request.body.publishedAt,
          notes: request.body.notes,
          status: request.body.status
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to update publishing ledger";
        return reply.code(message.startsWith("Draft not found") ? 404 : 400).send({ error: message });
      }
    }
  );

  app.get("/api/publishing-events", async () => ({
    events: listPublishingEvents(db)
  }));

  app.post<{
    Params: { id: string };
    Body: {
      impressions?: number;
      reach?: number;
      likes?: number;
      comments?: number;
      shares?: number;
      saves?: number;
      profileVisits?: number;
      followsGained?: number;
      qualitativeNotes?: string | null;
      topComments?: string | null;
      operatorJudgment?: string | null;
    };
  }>("/api/publishing-events/:id/feedback", async (request, reply) => {
    try {
      return reply.code(201).send(logSocialFeedback(db, runService, request.params.id, request.body ?? {}));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to log feedback";
      return reply.code(message.startsWith("Publishing event not found") ? 404 : 400).send({ error: message });
    }
  });

  app.get<{ Params: { id: string } }>("/api/characters/:id/feedback", async (request) => ({
    feedback: listCharacterFeedback(db, request.params.id),
    reflections: listCharacterReflections(db, request.params.id),
    proposals: listCharacterIdentityProposals(db, request.params.id)
  }));

  app.post<{ Params: { feedbackId: string } }>("/api/feedback/:feedbackId/reflection-run", async (request, reply) => {
    try {
      return reply.code(201).send(runFeedbackReflection(db, runService, request.params.feedbackId));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to run feedback reflection";
      return reply.code(message.startsWith("Feedback not found") ? 404 : 400).send({ error: message });
    }
  });

  app.post<{ Params: { proposalId: string }; Body: { status?: "approved" | "rejected"; constitutionChangeReason?: string | null } }>(
    "/api/identity-proposals/:proposalId/review",
    async (request, reply) => {
      if (!request.body?.status || !["approved", "rejected"].includes(request.body.status)) {
        return reply.code(400).send({ error: "Proposal status must be approved or rejected" });
      }
      try {
        const result = reviewIdentityProposal(db, runService, request.params.proposalId, {
          status: request.body.status,
          constitutionChangeReason: request.body.constitutionChangeReason
        });
        return { ...result, character: getCharacterDetail(db, result.proposal.character_id) };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to review identity proposal";
        return reply.code(message.startsWith("Identity proposal not found") ? 404 : 400).send({ error: message });
      }
    }
  );

  app.get("/api/runs", async () => ({
    runs: listRuns(db)
  }));

  app.get<{ Params: { id: string } }>("/api/runs/:id", async (request, reply) => {
    const run = getRun(db, request.params.id);
    if (!run) {
      return reply.code(404).send({ error: "Run not found" });
    }

    return {
      run,
      events: listRunEvents(db, request.params.id),
      artifacts: listRunArtifacts(db, request.params.id),
      decisions: listRunDecisions(db, request.params.id),
      providerJobs: listProviderJobsForRun(db, request.params.id)
    };
  });

  function saveComfyWorkflowFromBody(body: Record<string, unknown>, workflowId?: string) {
    const existing = workflowId ? getComfyWorkflow(db, workflowId) : undefined;
    if (workflowId && !existing) {
      throw new Error(`Comfy workflow not found: ${workflowId}`);
    }
    const normalized = normalizeComfyWorkflowInput({
      id: workflowId ?? body.id,
      name: body.name ?? existing?.name ?? "",
      workflow: body.workflow ?? existing?.workflow ?? {},
      positivePromptNode: body.positivePromptNode ?? existing?.positive_prompt_node ?? "",
      positivePromptInput: body.positivePromptInput ?? existing?.positive_prompt_input ?? "",
      negativePromptNode: body.negativePromptNode ?? existing?.negative_prompt_node ?? "",
      negativePromptInput: body.negativePromptInput ?? existing?.negative_prompt_input ?? "",
      seedNode: body.seedNode ?? existing?.seed_node ?? "",
      seedInput: body.seedInput ?? existing?.seed_input ?? "",
      outputNodeIds: body.outputNodeIds ?? existing?.output_node_ids ?? [],
      defaultForTiers: body.defaultForTiers ?? existing?.default_for_tiers ?? [],
      status: body.status ?? existing?.status ?? "draft"
    });
    const validation = validateComfyWorkflowDefinition(normalized);
    const workflow = upsertComfyWorkflow(db, {
      ...normalized,
      id: workflowId ?? normalized.id,
      outputNodeIds: validation.valid ? validation.outputNodeIds : normalized.outputNodeIds,
      status: validation.valid ? normalized.status ?? "draft" : "invalid",
      validationError: validation.error
    });
    return { workflow, validation };
  }

  app.get("/api/settings/providers", async () => ({
    settings: getProviderSettings(db, config)
  }));

  app.patch<{ Body: Record<string, unknown> }>("/api/settings/providers", async (request) => {
    updateProviderSettings(db, request.body ?? {});
    return { settings: getProviderSettings(db, config) };
  });

  app.post<{ Body: Record<string, unknown> }>("/api/settings/providers", async (request) => {
    updateProviderSettings(db, request.body ?? {});
    return { settings: getProviderSettings(db, config) };
  });

  app.post<{ Body: { capability?: "image_generation" | "image_analysis" } }>("/api/settings/providers/test", async (request) => {
    const capability = request.body?.capability ?? "image_generation";
    if (capability === "image_analysis") {
      return testImageAnalysisProvider(db, config, runService);
    }
    return testImageGenerationProvider(db, config, runService);
  });

  app.get("/api/settings/comfy-workflows", async () => ({
    workflows: listComfyWorkflows(db),
    contentTiers
  }));

  app.post<{ Body: Record<string, unknown> }>("/api/settings/comfy-workflows", async (request, reply) => {
    try {
      const result = saveComfyWorkflowFromBody(request.body ?? {});
      return reply.code(201).send(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save Comfy workflow";
      return reply.code(400).send({ error: message });
    }
  });

  app.patch<{ Params: { workflowId: string }; Body: Record<string, unknown> }>("/api/settings/comfy-workflows/:workflowId", async (request, reply) => {
    try {
      return saveComfyWorkflowFromBody(request.body ?? {}, request.params.workflowId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update Comfy workflow";
      return reply.code(message.startsWith("Comfy workflow not found") ? 404 : 400).send({ error: message });
    }
  });

  app.post<{ Params: { workflowId: string } }>("/api/settings/comfy-workflows/:workflowId/validate", async (request, reply) => {
    const workflow = getComfyWorkflow(db, request.params.workflowId);
    if (!workflow) return reply.code(404).send({ error: "Comfy workflow not found" });
    const validation = validateComfyWorkflowDefinition(workflowSummaryToInput(workflow));
    const updated = upsertComfyWorkflow(db, {
      ...workflowSummaryToInput(workflow),
      outputNodeIds: validation.valid ? validation.outputNodeIds : workflow.output_node_ids,
      status: validation.valid && workflow.status === "invalid" ? "draft" : workflow.status,
      validationError: validation.error
    });
    return { workflow: updated, validation };
  });

  app.post<{ Params: { workflowId: string }; Body: { tier?: string } }>("/api/settings/comfy-workflows/:workflowId/activate", async (request, reply) => {
    const tier = request.body?.tier;
    if (!tier || !contentTiers.includes(tier as ActivatableContentTier)) {
      return reply.code(400).send({ error: "tier must be sfw_standard, sfw_sensitive, or mature_adult" });
    }
    const workflow = getComfyWorkflow(db, request.params.workflowId);
    if (!workflow) return reply.code(404).send({ error: "Comfy workflow not found" });
    const validation = validateComfyWorkflowDefinition(workflowSummaryToInput(workflow));
    if (!validation.valid) {
      upsertComfyWorkflow(db, { ...workflowSummaryToInput(workflow), status: "invalid", validationError: validation.error });
      return reply.code(400).send({ error: validation.error, validation });
    }
    const ready = upsertComfyWorkflow(db, {
      ...workflowSummaryToInput(workflow),
      outputNodeIds: validation.outputNodeIds,
      status: "active",
      validationError: null
    });
    return { workflow: activateComfyWorkflowForTier(db, ready.id, tier) };
  });

  app.post<{ Params: { workflowId: string }; Body: { prompt?: string; negativePrompt?: string } }>("/api/settings/comfy-workflows/:workflowId/test", async (request, reply) => {
    const workflow = getComfyWorkflow(db, request.params.workflowId);
    if (!workflow) return reply.code(404).send({ error: "Comfy workflow not found" });
    const validation = validateComfyWorkflowDefinition(workflowSummaryToInput(workflow));
    if (!validation.valid) return reply.code(400).send({ error: validation.error, validation });
    const settings = getProviderSettings(db, config);
    const provider = new ComfyUICloudImageGenerationProvider({
      baseUrl: settings.comfyuiCloudBaseUrl,
      apiKey: getSetting(db, "comfyuiCloudApiKey") ?? config.comfyuiCloudApiKey,
      generationPath: settings.comfyuiCloudGenerationPath,
      workflowPayload: workflow.workflow,
      workflowMappings: {
        positivePromptNode: workflow.positive_prompt_node ?? undefined,
        positivePromptInput: workflow.positive_prompt_input ?? undefined,
        negativePromptNode: workflow.negative_prompt_node ?? undefined,
        negativePromptInput: workflow.negative_prompt_input ?? undefined,
        seedNode: workflow.seed_node ?? undefined,
        seedInput: workflow.seed_input ?? undefined,
        outputNodeIds: workflow.output_node_ids
      }
    });
    const run = runService.createRun({ type: "image_generation", title: `Comfy Workflow Test: ${workflow.name}` });
    runService.updateRunStatus(run.id, "running");
    runService.appendRunEvent(run.id, "provider.requested", `Testing Comfy workflow ${workflow.name}.`, { workflowId: workflow.id });
    const prompt = request.body?.prompt?.trim() || "Virtual Agency Studio Comfy workflow connectivity test.";
    const job = insertProviderJob(db, {
      runId: run.id,
      provider: provider.name,
      status: "submitted",
      request: { prompt, negativePrompt: request.body?.negativePrompt ?? "" },
      routeTier: "workflow_test",
      routeReason: "Operator requested Comfy workflow test."
    });
    try {
      const result = await provider.generateImage({ prompt, negativePrompt: request.body?.negativePrompt });
      const updatedJob = updateProviderJob(db, job.id, { status: result.status, response: result, externalId: result.assetId });
      runService.appendRunEvent(run.id, "provider.completed", "Comfy workflow test completed.", { providerJobId: updatedJob.id });
      runService.completeRun(run.id, "Comfy workflow test completed.");
      return { ok: true, runId: run.id, providerJob: updatedJob, result: { provider: result.provider, status: result.status, assetId: result.assetId } };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Comfy workflow test failed";
      const updatedJob = updateProviderJob(db, job.id, { status: "failed", response: { error: message } });
      runService.appendRunEvent(run.id, "provider.failed", message, { providerJobId: updatedJob.id });
      runService.failRun(run.id, message);
      return { ok: false, runId: run.id, providerJob: updatedJob, error: message };
    }
  });

  app.get("/api/settings/automation", async () => ({
    settings: getAutomationSettings(db, config),
    status: getAutomationStatus(db, config),
    characters: listCharacters(db)
  }));

  app.patch<{ Body: Record<string, unknown> }>("/api/settings/automation", async (request) => {
    const settings = updateAutomationSettings(db, config, request.body ?? {});
    automationScheduler.restart();
    return { settings, status: getAutomationStatus(db, config), characters: listCharacters(db) };
  });

  app.get("/api/automation/status", async () => ({
    status: getAutomationStatus(db, config)
  }));

  app.post<{
    Body: {
      characterId?: string;
      autoSelectTopActivity?: boolean;
      requireReviewBeforeDraft?: boolean;
      maxImagesPerRun?: number;
    };
  }>("/api/automation/daily-runs", async (request, reply) => {
    if (!request.body?.characterId) {
      return reply.code(400).send({ error: "characterId is required" });
    }
    try {
      const result = await runDailyActivityAutomation(db, config, runService, {
        characterId: request.body.characterId,
        source: "manual",
        overrideSettings: {
          autoSelectTopActivity: request.body.autoSelectTopActivity,
          requireReviewBeforeDraft: request.body.requireReviewBeforeDraft,
          maxImagesPerRun: request.body.maxImagesPerRun
        }
      });
      return reply.code(201).send({
        ...result,
        events: listRunEvents(db, result.run.id),
        artifacts: listRunArtifacts(db, result.run.id),
        status: getAutomationStatus(db, config)
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to run automation";
      return reply.code(message.startsWith("Character not found") ? 404 : 400).send({ error: message });
    }
  });

  app.post<{ Params: { id: string } }>("/api/automation/characters/:id/activity-candidates", async (request, reply) => {
    try {
      const result = generateActivityRun(db, runService, request.params.id);
      return reply.code(201).send(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to generate activity candidates";
      return reply.code(message.startsWith("Character not found") ? 404 : 400).send({ error: message });
    }
  });

  app.post<{ Params: { id: string }; Body: { count?: number } }>("/api/automation/prompt-recipes/:id/generate-images", async (request, reply) => {
    try {
      return reply.code(201).send(await generateImageCandidatesForPrompt(db, config, runService, request.params.id, request.body?.count));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to generate image candidates";
      return reply.code(message.startsWith("Prompt recipe not found") ? 404 : 400).send({ error: message });
    }
  });

  app.post<{ Params: { id: string } }>("/api/automation/characters/:id/analyze-latest", async (request, reply) => {
    try {
      return reply.code(201).send(await analyzeLatestCandidatesForCharacter(db, config, runService, request.params.id));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to analyze latest candidates";
      return reply.code(message.startsWith("Character not found") ? 404 : 400).send({ error: message });
    }
  });

  app.post<{ Params: { id: string } }>("/api/automation/assets/:id/package", async (request, reply) => {
    try {
      return reply.code(201).send(packageApprovedAsset(db, config, runService, request.params.id));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to package asset";
      return reply.code(message.startsWith("Asset not found") ? 404 : 400).send({ error: message });
    }
  });

  app.get<{ Params: { id: string } }>("/api/runs/:id/events", async (request, reply) => {
    const run = getRun(db, request.params.id);
    if (!run) {
      return reply.code(404).send({ error: "Run not found" });
    }

    return {
      events: listRunEvents(db, request.params.id)
    };
  });

  app.post<{
    Body: { characterId?: string | null; type?: string; title?: string; autoProcess?: boolean };
  }>("/api/runs", async (request, reply) => {
    const type = request.body?.type;
    const title = request.body?.title?.trim();

    if (!type || !isRunType(type)) {
      return reply.code(400).send({ error: "Invalid run type" });
    }
    if (!title) {
      return reply.code(400).send({ error: "Run title is required" });
    }

    const run = runService.createRun({
      characterId: request.body.characterId ?? null,
      type,
      title
    });

    if (request.body.autoProcess) {
      runQueue.processNext();
    }

    return reply.code(201).send({
      run: getRun(db, run.id),
        events: listRunEvents(db, run.id),
        artifacts: listRunArtifacts(db, run.id),
        decisions: listRunDecisions(db, run.id),
        providerJobs: listProviderJobsForRun(db, run.id)
      });
  });

  app.post<{ Params: { id: string }; Body: { rationale?: string } }>("/api/runs/:id/cancel", async (request, reply) => {
    try {
      const run = runService.cancelRun(request.params.id, request.body?.rationale);
      return {
        run,
        events: listRunEvents(db, request.params.id),
        decisions: listRunDecisions(db, request.params.id)
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to cancel run";
      const statusCode = message.startsWith("Run not found") ? 404 : 409;
      return reply.code(statusCode).send({ error: message });
    }
  });

  app.post("/api/runs/process-next", async () => {
    const result = runQueue.processNext();
    return {
      processed: result !== null,
      decision: result
    };
  });

  return app;
}
