import { existsSync, readFileSync } from "node:fs";
import { basename, isAbsolute, join } from "node:path";
import type { AnalyzeImageResult, GenerateImageResult, ImageGenerationProvider } from "@virtual-agency/providers";
import type { ApiConfig } from "../config";
import type { AppDatabase } from "../db/database";
import {
  getAsset,
  getPromptRecipe,
  getRun,
  insertAsset,
  insertAssetAnalysis,
  insertProviderJob,
  listAssetAnalyses,
  listReferenceImages,
  updateAssetStatus,
  updateProviderJob,
  type AssetSummary
} from "../db/repositories";
import {
  getComfyImageGenerationProvider,
  getActiveComfyWorkflow,
  getImageAnalysisProvider,
  getImageGenerationProvider,
  getOpenAIImageGenerationProvider,
  getProviderSettings
} from "../providers/providerSettings";
import { fallbackReason, routeForPrompt, type ProviderOverride } from "../providers/providerRouter";
import { RunService } from "../runs/runService";
import { saveAssetFile } from "../storage";

const assetStates = new Set([
  "raw_generation",
  "candidate",
  "approved_reference",
  "approved_post_asset",
  "rejected_identity_drift",
  "rejected_quality",
  "rejected_policy",
  "published",
  "archived"
]);

function clampScore(value: unknown, fallback: number) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return fallback;
  return Math.max(0, Math.min(100, Math.round(numberValue)));
}

function identityMatchFromScore(score: number): "strong" | "medium" | "weak" | "failed" {
  if (score >= 80) return "strong";
  if (score >= 60) return "medium";
  if (score >= 35) return "weak";
  return "failed";
}

function svgForPrompt(prompt: string, provider: string) {
  const title = prompt.replace(/[<>&]/g, " ").slice(0, 180);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500">
  <rect width="1200" height="1500" fill="#f5f1ea"/>
  <rect x="80" y="80" width="1040" height="1340" fill="#111827"/>
  <rect x="140" y="140" width="920" height="1220" fill="#e8ded1"/>
  <circle cx="600" cy="440" r="180" fill="#9fb7a5"/>
  <rect x="265" y="700" width="670" height="310" rx="22" fill="#27323f"/>
  <text x="600" y="1120" fill="#111827" font-family="Arial, sans-serif" font-size="42" text-anchor="middle">Virtual Agency Studio</text>
  <text x="600" y="1190" fill="#111827" font-family="Arial, sans-serif" font-size="28" text-anchor="middle">${provider}</text>
  <foreignObject x="180" y="1230" width="840" height="120">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font: 28px Arial, sans-serif; color: #111827; text-align: center;">${title}</div>
  </foreignObject>
</svg>`;
}

function mimeTypeForAssetPath(path: string) {
  const normalized = path.toLowerCase();
  if (normalized.endsWith(".jpg") || normalized.endsWith(".jpeg")) return "image/jpeg";
  if (normalized.endsWith(".webp")) return "image/webp";
  if (normalized.endsWith(".gif")) return "image/gif";
  if (normalized.endsWith(".svg")) return "image/svg+xml";
  return "image/png";
}

async function materializeProviderAsset(config: ApiConfig, result: GenerateImageResult, prompt: string) {
  const metadata = result.metadata as Record<string, unknown>;
  const b64 = typeof metadata.b64_json === "string" ? metadata.b64_json : typeof metadata.b64Json === "string" ? metadata.b64Json : null;
  if (b64) {
    const mimeType = typeof metadata.mimeType === "string" ? metadata.mimeType : "image/png";
    const extension = mimeType.includes("jpeg") ? "jpg" : mimeType.includes("webp") ? "webp" : "png";
    return saveAssetFile(config, {
      buffer: Buffer.from(b64, "base64"),
      originalName: `generated-image.${extension}`,
      mimeType
    });
  }

  const possibleUrl = typeof metadata.url === "string" ? metadata.url : typeof metadata.imageUrl === "string" ? metadata.imageUrl : null;
  if (possibleUrl?.startsWith("http")) {
    const response = await fetch(possibleUrl);
    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer());
      return saveAssetFile(config, {
        buffer,
        originalName: basename(new URL(possibleUrl).pathname) || "generated-image.png",
        mimeType: response.headers.get("content-type") ?? "image/png"
      });
    }
  }

  if (result.filePath) {
    const absolutePath = isAbsolute(result.filePath) ? result.filePath : join(config.dataDir, result.filePath);
    if (existsSync(absolutePath)) {
      const buffer = readFileSync(absolutePath);
      return saveAssetFile(config, {
        buffer,
        originalName: basename(absolutePath),
        mimeType: mimeTypeForAssetPath(result.filePath)
      });
    }
    if (result.provider !== "mock-image-generation") {
      throw new Error(`Provider returned an image file path that the API cannot read: ${result.filePath}`);
    }
  }

  if (result.provider !== "mock-image-generation") {
    throw new Error(`${result.provider} did not return materializable image output.`);
  }

  return saveAssetFile(config, {
    buffer: Buffer.from(svgForPrompt(prompt, result.provider)),
    originalName: "mock-generated-image.svg",
    mimeType: "image/svg+xml"
  });
}

interface NormalizedAnalysisInput {
  provider: string;
  score: number;
  summary: string;
  identityMatch: string;
  identityScore: number;
  qualityScore: number;
  storyFitScore: number;
  platformFit: string[];
  qualityIssues: string[];
  identityNotes: string;
  suggestedPromptFixes: string[];
  altText: string;
  recommendedAction: string;
  raw: unknown;
}

function normalizeAnalysisResult(result: AnalyzeImageResult): NormalizedAnalysisInput {
  const metadata = result.metadata as Record<string, unknown>;
  const identityScore = clampScore(metadata.identity_score ?? metadata.identityScore, Math.round(result.identityMatch * 100));
  const qualityScore = clampScore(metadata.quality_score ?? metadata.qualityScore, result.qualityNotes.length > 1 ? 78 : 86);
  const storyFitScore = clampScore(metadata.story_fit_score ?? metadata.storyFitScore, 80);
  const qualityIssues = result.qualityNotes.length ? result.qualityNotes : ["No major quality issues detected."];
  const identityMatch = typeof metadata.identity_match === "string" ? metadata.identity_match : identityMatchFromScore(identityScore);
  const recommendedAction =
    typeof metadata.recommended_action === "string"
      ? metadata.recommended_action
      : identityScore >= 80 && qualityScore >= 75
        ? "approve_for_draft"
        : "revise_prompt";

  return {
    provider: result.provider,
    score: Math.round((identityScore + qualityScore + storyFitScore) / 3),
    summary: `${identityMatch} identity match, ${qualityScore}/100 quality, ${storyFitScore}/100 story fit.`,
    identityMatch,
    identityScore,
    qualityScore,
    storyFitScore,
    platformFit: result.platformFit,
    qualityIssues,
    identityNotes: typeof metadata.identity_notes === "string" ? metadata.identity_notes : qualityIssues.join(" "),
    suggestedPromptFixes: result.suggestedPromptFixes,
    altText: result.altText,
    recommendedAction,
    raw: result
  };
}

export async function generateImageFromPromptRecipe(
  db: AppDatabase,
  config: ApiConfig,
  runService: RunService,
  promptRecipeId: string,
  promptSuffix = "",
  routingInput: {
    providerOverride?: ProviderOverride;
    overrideReason?: string | null;
    contentTierOverride?: string | null;
    referenceImageId?: string | null;
  } = {}
) {
  const publicApiHost = config.publicApiHost;
  const recipe = getPromptRecipe(db, promptRecipeId);
  if (!recipe) {
    throw new Error(`Prompt recipe not found: ${promptRecipeId}`);
  }
  const prompt = `${recipe.final_prompt ?? JSON.stringify(recipe.recipe)}${promptSuffix}`;
  const negativePrompt = recipe.negative_prompt ?? undefined;
  const settings = getProviderSettings(db, config);
  const route = routeForPrompt({
    prompt,
    providerOverride: routingInput.providerOverride ?? "auto",
    overrideReason: routingInput.overrideReason,
    contentTierOverride: routingInput.contentTierOverride,
    providerAvailability: settings.mockProviders
      ? undefined
      : {
          openai: settings.hasOpenaiApiKey,
          "comfyui-cloud": settings.comfyuiCloudReady,
          hermes: settings.hasHermesApiKey,
          wavespeed: settings.hasWavespeedApiKey,
          mock: settings.mockProviders
        }
  });
  const run = runService.createRun({ characterId: recipe.character_id, type: "image_generation", title: "Image Generation" });
  const currentRun = () => getRun(db, run.id) ?? run;
  runService.updateRunStatus(run.id, "running");
  const allReferences = listReferenceImages(db, recipe.character_id);
  const approvedReferences = allReferences.filter((image) => image.status === "approved");
  const profileReferenceImage = approvedReferences[0] ?? allReferences[0] ?? null;
  const requestedReferenceImageId = routingInput.referenceImageId?.trim();
  const selectedReference = profileReferenceImage;
  const comfyReferenceImage = approvedReferences[0] ?? null;
  if (requestedReferenceImageId && requestedReferenceImageId !== profileReferenceImage?.id) {
    runService.appendRunEvent(
      run.id,
      "routing.profile_reference_warning",
      "Reference image request ignored in favor of character profile source-of-truth.",
      {
        requestedReferenceImageId,
        selectedReferenceImageId: profileReferenceImage?.id ?? null,
        characterId: recipe.character_id
      }
    );
  }
  const activeComfyWorkflow = getActiveComfyWorkflow(db, route.tier);
  const requiresComfyIdentityReference = route.providers.includes("comfyui-cloud") && Boolean(activeComfyWorkflow?.reference_image_node);
  const identityReferenceImage = requiresComfyIdentityReference ? comfyReferenceImage : selectedReference;
  const strictIdentityPromptAppend =
    "IDENTITY LOCK: preserve the same person in this scene using the approved reference image as the face anchor. Keep bone structure, eye shape, nose shape, mouth shape, jawline, and complexion continuity as the same person. Do not reinterpret facial identity.";
  const strictIdentityNegativeAppend =
    "different person, changed identity, wrong face, identity swap, face mismatch, incorrect face, non-matching identity";
  const referenceImages = identityReferenceImage
    ? [
        {
          id: identityReferenceImage.id,
          path: join(config.dataDir, identityReferenceImage.file_path),
          originalName: identityReferenceImage.original_name,
          mimeType: identityReferenceImage.mime_type
        }
      ]
    : [];
  const request = {
    prompt: requiresComfyIdentityReference ? `${prompt}\n\n${strictIdentityPromptAppend}` : prompt,
    negativePrompt: requiresComfyIdentityReference
      ? [negativePrompt, strictIdentityNegativeAppend].filter(Boolean).join(", ")
      : negativePrompt,
    characterId: recipe.character_id,
    referenceImageSource: "character_profile",
    referenceImageUrl: identityReferenceImage
      ? `http://${publicApiHost}:${config.port}/api/characters/${recipe.character_id}/reference-images/${identityReferenceImage.id}/file`
      : undefined,
    referenceImageIds: referenceImages.map((image) => image.id),
    referenceImages
  };
  runService.appendRunEvent(run.id, "routing.classified", `Image generation routed as ${route.tier}.`, {
    tier: route.tier,
    routeReason: route.routeReason,
    providers: route.providers,
    promptRecipeId,
    referenceImageId: requestedReferenceImageId ?? null,
    referenceImageSource: "character_profile",
    referenceImageUrl: request.referenceImageUrl,
    selectedReferenceImageId: selectedReference?.id ?? null,
    approvedReferenceCount: approvedReferences.length,
    comfyReferenceImageId: comfyReferenceImage?.id ?? null,
    referenceImageIds: request.referenceImageIds
  });
  if (route.overrideApplied) {
    runService.appendRunEvent(run.id, "routing.override_applied", "Operator provider override applied.", {
      providerOverride: routingInput.providerOverride,
      overrideReason: routingInput.overrideReason
    });
  }
  if (route.blocked) {
    runService.appendRunEvent(run.id, "routing.blocked", route.routeReason, { tier: route.tier, promptRecipeId });
    runService.appendRunEvent(run.id, "review.required", "Image generation blocked for human routing review.", { gate: "provider_routing", tier: route.tier });
    runService.updateRunStatus(run.id, "needs_review");
    return { run: currentRun(), error: route.routeReason };
  }
  if (requiresComfyIdentityReference && referenceImages.length === 0) {
    const message = "ComfyUI identity workflow requires an approved character reference image.";
    runService.appendRunEvent(run.id, "review.required", message, {
      gate: "identity_reference",
      characterId: recipe.character_id,
      workflowId: activeComfyWorkflow?.id ?? null
    });
    runService.updateRunStatus(run.id, "needs_review");
    return { run: currentRun(), error: message };
  }

  function providerForRoute(providerName: ProviderOverride): ImageGenerationProvider {
    if (settings.mockProviders || providerName === "mock") return getImageGenerationProvider(settings, db, config);
    if (providerName === "openai") return getOpenAIImageGenerationProvider(settings, db, config);
    if (providerName === "comfyui-cloud") return getComfyImageGenerationProvider(settings, db, config, route.tier);
    const nextSettings = { ...settings, defaultImageGenerationProvider: providerName };
    return getImageGenerationProvider(nextSettings, db, config);
  }

  let lastError: string | null = null;
  for (let index = 0; index < route.providers.length; index += 1) {
    const routeProvider = route.providers[index];
    const provider = providerForRoute(routeProvider);
    const job = insertProviderJob(db, {
      runId: run.id,
      provider: provider.name,
      status: "submitted",
      request,
      attemptIndex: index + 1,
      routeTier: route.tier,
      routeReason: route.routeReason,
      fallbackReason: index > 0 ? lastError : null
    });
    runService.appendRunEvent(run.id, "provider.requested", `Requested image generation from ${provider.name}.`, {
      provider: provider.name,
      providerJobId: job.id,
      promptRecipeId,
      attemptIndex: index + 1,
      routeTier: route.tier
    });
    try {
      const result = await provider.generateImage(request);
      const stored = await materializeProviderAsset(config, result, prompt);
      const asset = insertAsset(db, {
        characterId: recipe.character_id,
        runId: run.id,
        promptRecipeId,
        filePath: stored.relativePath,
        kind: "generated_image",
        status: "raw_generation",
        provider: result.provider,
        originalPrompt: prompt,
        negativePrompt,
        mimeType: stored.mimeType,
        sizeBytes: stored.sizeBytes,
        metadata: { providerResult: result, originalName: stored.originalName }
      });
      const updatedJob = updateProviderJob(db, job.id, { status: result.status, response: result, externalId: result.assetId ?? asset.id });
      runService.appendRunEvent(run.id, "provider.completed", `${provider.name} completed image generation.`, {
        providerJobId: updatedJob.id,
        assetId: asset.id
      });
      runService.appendRunEvent(run.id, "image.generated", "Generated image asset stored locally.", { assetId: asset.id, filePath: asset.file_path });
      runService.attachRunArtifact(run.id, "generated_image", "Generated Image Asset", { assetId: asset.id, filePath: asset.file_path });
      if (route.requiresReview) {
        runService.appendRunEvent(run.id, "review.required", "Generated image requires human review for routed content tier.", {
          tier: route.tier,
          assetId: asset.id
        });
        runService.updateRunStatus(run.id, "needs_review");
      } else {
        runService.completeRun(run.id, "Image generation completed.");
      }
      return { run: currentRun(), asset, providerJob: updatedJob };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Image generation failed";
      const updatedJob = updateProviderJob(db, job.id, { status: "failed", response: { error: message } });
      const fallback = index < route.providers.length - 1 ? fallbackReason(error) : null;
      lastError = message;
      if (fallback) {
        runService.appendRunEvent(run.id, "provider.fallback", `Falling back after ${provider.name}: ${fallback}`, {
          providerJobId: updatedJob.id,
          provider: provider.name,
          fallbackReason: fallback,
          nextProvider: route.providers[index + 1]
        });
        continue;
      }
      runService.appendRunEvent(run.id, "provider.failed", message, { providerJobId: updatedJob.id, provider: provider.name });
      runService.failRun(run.id, message);
      return { run: currentRun(), providerJob: updatedJob, error: message };
    }
  }
  runService.failRun(run.id, lastError ?? "No image provider was available.");
  return { run: currentRun(), error: lastError ?? "No image provider was available." };
}

export async function analyzeImageAsset(db: AppDatabase, config: ApiConfig, runService: RunService, assetId: string) {
  const asset = getAsset(db, assetId);
  if (!asset) {
    throw new Error(`Asset not found: ${assetId}`);
  }
  const settings = getProviderSettings(db, config);
  const provider = getImageAnalysisProvider(settings, db, config);
  const run = runService.createRun({ characterId: asset.character_id, type: "image_analysis", title: "Image Analysis" });
  runService.updateRunStatus(run.id, "running");
  runService.appendRunEvent(run.id, "provider.requested", `Requested image analysis from ${provider.name}.`, { provider: provider.name, assetId });
  const request = {
    assetId,
    imagePath: asset.file_path ? join(config.dataDir, asset.file_path) : undefined,
    prompt: asset.original_prompt ?? undefined
  };
  const job = insertProviderJob(db, { runId: run.id, provider: provider.name, status: "submitted", request });

  try {
    const result = await provider.analyzeImage(request);
    const normalized = normalizeAnalysisResult(result);
    const analysis = insertAssetAnalysis(db, { assetId, ...normalized });
    const updatedAsset = updateAssetStatus(db, assetId, asset.status === "raw_generation" ? "candidate" : asset.status);
    const updatedJob = updateProviderJob(db, job.id, { status: result.status, response: result });
    runService.appendRunEvent(run.id, "provider.completed", `${provider.name} completed image analysis.`, { providerJobId: updatedJob.id, assetId });
    runService.appendRunEvent(run.id, "image.analyzed", "Image analysis stored for review.", { assetId, analysisId: analysis.id, identityScore: analysis.identity_score });
    runService.attachRunArtifact(run.id, "image_analysis", "Image Analysis", { assetId, analysis });
    runService.completeRun(run.id, "Image analysis completed.");
    return { run, asset: updatedAsset, analysis, providerJob: updatedJob };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image analysis failed";
    const updatedJob = updateProviderJob(db, job.id, { status: "failed", response: { error: message } });
    runService.appendRunEvent(run.id, "provider.failed", message, { providerJobId: updatedJob.id, provider: provider.name });
    runService.failRun(run.id, message);
    return { run, asset, providerJob: updatedJob, error: message };
  }
}

export function reviewAsset(db: AppDatabase, runService: RunService, assetId: string, status: string, reason?: string) {
  if (!assetStates.has(status)) {
    throw new Error(`Unsupported asset status: ${status}`);
  }
  const asset = updateAssetStatus(db, assetId, status, { reviewReason: reason ?? null, reviewedAt: new Date().toISOString() });
  if (asset.run_id) {
    runService.recordRunDecision(asset.run_id, `asset.${status}`, reason ?? "Manual asset review action.");
    runService.appendRunEvent(asset.run_id, status.startsWith("rejected") ? "human.rejected" : "human.approved", `Asset marked ${status}.`, { assetId, status, reason });
  }
  return { asset, analyses: listAssetAnalyses(db, assetId) };
}

export async function regenerateAssetFromFixes(db: AppDatabase, config: ApiConfig, runService: RunService, assetId: string) {
  const asset = getAsset(db, assetId);
  if (!asset?.prompt_recipe_id) {
    throw new Error("Asset does not have prompt recipe lineage for regeneration.");
  }
  const latest = asset.latestAnalysis;
  const suffix = latest?.suggested_prompt_fixes.length ? `\n\nSUGGESTED FIXES\n${latest.suggested_prompt_fixes.join("\n")}` : "";
  return generateImageFromPromptRecipe(db, config, runService, asset.prompt_recipe_id, suffix);
}
