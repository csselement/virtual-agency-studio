import {
  ComfyUICloudImageGenerationProvider,
  HermesImageAnalysisProvider,
  HermesImageGenerationProvider,
  MockImageAnalysisProvider,
  MockImageGenerationProvider,
  OpenAIImageGenerationProvider,
  WaveSpeedImageGenerationProvider,
  type AnalyzeImageResult,
  type GenerateImageResult
} from "@virtual-agency/providers";
import type { ApiConfig } from "../config";
import type { AppDatabase } from "../db/database";
import { getDefaultComfyWorkflowForTier, getSetting, insertProviderJob, setSetting, updateProviderJob } from "../db/repositories";
import { RunService } from "../runs/runService";

export interface ProviderSettings {
  mockProviders: boolean;
  defaultImageGenerationProvider: string;
  defaultAnalysisProvider: string;
  hermesBaseUrl: string;
  hermesImageGenerationPath: string;
  hermesImageAnalysisPath: string;
  comfyuiCloudBaseUrl: string;
  comfyuiCloudGenerationPath: string;
  openaiBaseUrl: string;
  openaiImageModel: string;
  openaiImageSize: string;
  openaiImageQuality: string;
  openaiImageOutputFormat: string;
  openaiImageModeration: "auto" | "low";
  wavespeedBaseUrl: string;
  wavespeedImageGenerationPath: string;
  hasHermesApiKey: boolean;
  hasComfyuiCloudApiKey: boolean;
  hasActiveComfyuiCloudWorkflow: boolean;
  comfyuiCloudReady: boolean;
  hasOpenaiApiKey: boolean;
  hasWavespeedApiKey: boolean;
}

export function getActiveComfyWorkflow(db: AppDatabase, routeTier = "sfw_standard") {
  return (
    getDefaultComfyWorkflowForTier(db, routeTier) ??
    getDefaultComfyWorkflowForTier(db, "sfw_standard") ??
    getDefaultComfyWorkflowForTier(db, "mature_adult")
  );
}

export function hasRunnableComfyWorkflow(db: AppDatabase, routeTier = "sfw_standard") {
  const workflow = getActiveComfyWorkflow(db, routeTier);
  return Boolean(workflow && Object.keys(workflow.workflow).length > 0 && workflow.output_node_ids.length > 0);
}

export function getProviderSettings(db: AppDatabase, config: ApiConfig): ProviderSettings {
  const hasComfyuiCloudApiKey = Boolean(getSetting(db, "comfyuiCloudApiKey") ?? config.comfyuiCloudApiKey);
  const hasActiveComfyuiCloudWorkflow = hasRunnableComfyWorkflow(db);
  return {
    mockProviders: (getSetting(db, "mockProviders") ?? String(config.mockProviders)) !== "false",
    defaultImageGenerationProvider: getSetting(db, "defaultImageGenerationProvider") ?? "mock",
    defaultAnalysisProvider: getSetting(db, "defaultAnalysisProvider") ?? "mock",
    hermesBaseUrl: getSetting(db, "hermesBaseUrl") ?? config.hermesBaseUrl,
    hermesImageGenerationPath: getSetting(db, "hermesImageGenerationPath") ?? config.hermesImageGenerationPath,
    hermesImageAnalysisPath: getSetting(db, "hermesImageAnalysisPath") ?? config.hermesImageAnalysisPath,
    comfyuiCloudBaseUrl: getSetting(db, "comfyuiCloudBaseUrl") ?? config.comfyuiCloudBaseUrl,
    comfyuiCloudGenerationPath: getSetting(db, "comfyuiCloudGenerationPath") ?? config.comfyuiCloudGenerationPath,
    openaiBaseUrl: getSetting(db, "openaiBaseUrl") ?? config.openaiBaseUrl,
    openaiImageModel: getSetting(db, "openaiImageModel") ?? config.openaiImageModel,
    openaiImageSize: getSetting(db, "openaiImageSize") ?? config.openaiImageSize,
    openaiImageQuality: getSetting(db, "openaiImageQuality") ?? config.openaiImageQuality,
    openaiImageOutputFormat: getSetting(db, "openaiImageOutputFormat") ?? config.openaiImageOutputFormat,
    openaiImageModeration: (getSetting(db, "openaiImageModeration") ?? config.openaiImageModeration) === "auto" ? "auto" : "low",
    wavespeedBaseUrl: getSetting(db, "wavespeedBaseUrl") ?? config.wavespeedBaseUrl,
    wavespeedImageGenerationPath: getSetting(db, "wavespeedImageGenerationPath") ?? config.wavespeedImageGenerationPath,
    hasHermesApiKey: Boolean(getSetting(db, "hermesApiKey") ?? config.hermesApiKey),
    hasComfyuiCloudApiKey,
    hasActiveComfyuiCloudWorkflow,
    comfyuiCloudReady: hasComfyuiCloudApiKey && hasActiveComfyuiCloudWorkflow,
    hasOpenaiApiKey: Boolean(getSetting(db, "openaiApiKey") ?? config.openaiApiKey),
    hasWavespeedApiKey: Boolean(getSetting(db, "wavespeedApiKey") ?? config.wavespeedApiKey)
  };
}

export function updateProviderSettings(
  db: AppDatabase,
  input: Partial<ProviderSettings> & { hermesApiKey?: string; comfyuiCloudApiKey?: string; openaiApiKey?: string; wavespeedApiKey?: string }
) {
  const ignoredKeys = new Set([
    "hasHermesApiKey",
    "hasComfyuiCloudApiKey",
    "hasActiveComfyuiCloudWorkflow",
    "comfyuiCloudReady",
    "hasOpenaiApiKey",
    "hasWavespeedApiKey"
  ]);
  const secretKeys = new Set(["hermesApiKey", "comfyuiCloudApiKey", "openaiApiKey", "wavespeedApiKey"]);
  for (const [key, value] of Object.entries(input)) {
    if (ignoredKeys.has(key)) continue;
    if (secretKeys.has(key) && typeof value === "string" && !value.trim()) continue;
    if (value !== undefined) {
      setSetting(db, key, String(value));
    }
  }
}

export function getImageGenerationProvider(settings: ProviderSettings, db: AppDatabase, config: ApiConfig) {
  if (settings.mockProviders || settings.defaultImageGenerationProvider === "mock") {
    return new MockImageGenerationProvider();
  }
  if (settings.defaultImageGenerationProvider === "hermes") {
    return new HermesImageGenerationProvider({
      baseUrl: settings.hermesBaseUrl,
      apiKey: getSetting(db, "hermesApiKey") ?? config.hermesApiKey,
      generationPath: settings.hermesImageGenerationPath
    });
  }
  if (settings.defaultImageGenerationProvider === "openai") {
    return getOpenAIImageGenerationProvider(settings, db, config);
  }
  if (settings.defaultImageGenerationProvider === "comfyui-cloud") {
    return getComfyImageGenerationProvider(settings, db, config, "sfw_standard");
  }
  if (settings.defaultImageGenerationProvider === "wavespeed") {
    return new WaveSpeedImageGenerationProvider({
      baseUrl: settings.wavespeedBaseUrl,
      apiKey: getSetting(db, "wavespeedApiKey") ?? config.wavespeedApiKey,
      generationPath: settings.wavespeedImageGenerationPath
    });
  }
  return new MockImageGenerationProvider();
}

export function getOpenAIImageGenerationProvider(settings: ProviderSettings, db: AppDatabase, config: ApiConfig) {
  return new OpenAIImageGenerationProvider({
    baseUrl: settings.openaiBaseUrl,
    apiKey: getSetting(db, "openaiApiKey") ?? config.openaiApiKey,
    imageModel: settings.openaiImageModel,
    imageSize: settings.openaiImageSize,
    imageQuality: settings.openaiImageQuality,
    imageOutputFormat: settings.openaiImageOutputFormat,
    imageModeration: settings.openaiImageModeration
  });
}

export function getComfyImageGenerationProvider(settings: ProviderSettings, db: AppDatabase, config: ApiConfig, routeTier: string) {
  const workflow = getActiveComfyWorkflow(db, routeTier);
  return new ComfyUICloudImageGenerationProvider({
    baseUrl: settings.comfyuiCloudBaseUrl,
    apiKey: getSetting(db, "comfyuiCloudApiKey") ?? config.comfyuiCloudApiKey,
    generationPath: settings.comfyuiCloudGenerationPath,
    workflowPayload: workflow?.workflow,
    workflowMappings: workflow
      ? {
          positivePromptNode: workflow.positive_prompt_node ?? undefined,
          positivePromptInput: workflow.positive_prompt_input ?? undefined,
          negativePromptNode: workflow.negative_prompt_node ?? undefined,
          negativePromptInput: workflow.negative_prompt_input ?? undefined,
          seedNode: workflow.seed_node ?? undefined,
          seedInput: workflow.seed_input ?? undefined,
          referenceImageNode: workflow.reference_image_node ?? undefined,
          referenceImageInput: workflow.reference_image_input ?? undefined,
          outputNodeIds: workflow.output_node_ids
        }
      : undefined
  });
}

export function getImageAnalysisProvider(settings: ProviderSettings, db: AppDatabase, config: ApiConfig) {
  if (settings.mockProviders || settings.defaultAnalysisProvider === "mock") {
    return new MockImageAnalysisProvider();
  }
  return new HermesImageAnalysisProvider({
    baseUrl: settings.hermesBaseUrl,
    apiKey: getSetting(db, "hermesApiKey") ?? config.hermesApiKey,
    analysisPath: settings.hermesImageAnalysisPath
  });
}

export async function testImageGenerationProvider(db: AppDatabase, config: ApiConfig, runService: RunService) {
  const settings = getProviderSettings(db, config);
  if (settings.defaultImageGenerationProvider === "comfyui-cloud" && !settings.comfyuiCloudReady) {
    const missing = [
      settings.hasComfyuiCloudApiKey ? null : "API key",
      settings.hasActiveComfyuiCloudWorkflow ? null : "active workflow"
    ].filter(Boolean);
    return {
      ok: false,
      setupRequired: true,
      provider: "comfyui-cloud-image-generation",
      error: `ComfyUI Cloud is not ready. Configure ${missing.join(" and ")} before testing image generation.`
    };
  }
  const provider = getImageGenerationProvider(settings, db, config);
  const run = runService.createRun({ type: "image_generation", title: "Provider Test: Image Generation" });
  runService.updateRunStatus(run.id, "running");
  runService.appendRunEvent(run.id, "provider.requested", `Testing ${provider.name}.`, { provider: provider.name });
  const request = { prompt: "Provider connectivity test image prompt.", referenceImageIds: [] };
  const job = insertProviderJob(db, { runId: run.id, provider: provider.name, status: "submitted", request });
  try {
    const result: GenerateImageResult = await provider.generateImage(request);
    const updatedJob = updateProviderJob(db, job.id, { status: result.status, response: result, externalId: result.assetId });
    runService.appendRunEvent(run.id, "provider.completed", `${provider.name} completed provider test.`, {
      providerJobId: updatedJob.id,
      provider: provider.name
    });
    runService.completeRun(run.id, "Provider generation test completed.");
    return { ok: true, runId: run.id, providerJob: updatedJob, result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Provider generation test failed";
    const updatedJob = updateProviderJob(db, job.id, { status: "failed", response: { error: message } });
    runService.appendRunEvent(run.id, "provider.failed", message, { providerJobId: updatedJob.id, provider: provider.name });
    runService.failRun(run.id, message);
    return { ok: false, runId: run.id, providerJob: updatedJob, error: message };
  }
}

export async function testImageAnalysisProvider(db: AppDatabase, config: ApiConfig, runService: RunService) {
  const settings = getProviderSettings(db, config);
  const provider = getImageAnalysisProvider(settings, db, config);
  const run = runService.createRun({ type: "image_analysis", title: "Provider Test: Image Analysis" });
  runService.updateRunStatus(run.id, "running");
  runService.appendRunEvent(run.id, "provider.requested", `Testing ${provider.name}.`, { provider: provider.name });
  const request = { assetId: "provider_test_asset", prompt: "Provider connectivity test analysis prompt." };
  const job = insertProviderJob(db, { runId: run.id, provider: provider.name, status: "submitted", request });
  try {
    const result: AnalyzeImageResult = await provider.analyzeImage(request);
    const updatedJob = updateProviderJob(db, job.id, { status: result.status, response: result });
    runService.appendRunEvent(run.id, "provider.completed", `${provider.name} completed provider test.`, {
      providerJobId: updatedJob.id,
      provider: provider.name
    });
    runService.completeRun(run.id, "Provider analysis test completed.");
    return { ok: true, runId: run.id, providerJob: updatedJob, result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Provider analysis test failed";
    const updatedJob = updateProviderJob(db, job.id, { status: "failed", response: { error: message } });
    runService.appendRunEvent(run.id, "provider.failed", message, { providerJobId: updatedJob.id, provider: provider.name });
    runService.failRun(run.id, message);
    return { ok: false, runId: run.id, providerJob: updatedJob, error: message };
  }
}
