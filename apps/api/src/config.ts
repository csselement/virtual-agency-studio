import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export interface ApiConfig {
  host: string;
  port: number;
  dataDir: string;
  databaseUrl: string;
  version: string;
  mockProviders: boolean;
  hermesBaseUrl: string;
  hermesApiKey: string;
  hermesImageGenerationPath: string;
  hermesImageAnalysisPath: string;
  comfyuiCloudBaseUrl: string;
  comfyuiCloudApiKey: string;
  comfyuiCloudGenerationPath: string;
  openaiBaseUrl: string;
  openaiApiKey: string;
  openaiImageModel: string;
  openaiImageSize: string;
  openaiImageQuality: string;
  openaiImageOutputFormat: string;
  openaiImageModeration: "auto" | "low";
  wavespeedBaseUrl: string;
  wavespeedApiKey: string;
  wavespeedImageGenerationPath: string;
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

function resolveFromRepo(pathValue: string) {
  return resolve(repoRoot, pathValue);
}

export function loadConfig(): ApiConfig {
  const dataDir = process.env.DATA_DIR ?? "./data";
  const databaseUrl = process.env.DATABASE_URL ?? "./data/agency.sqlite";

  return {
    host: process.env.API_HOST ?? "127.0.0.1",
    port: Number(process.env.API_PORT ?? "4317"),
    dataDir: resolveFromRepo(dataDir),
    databaseUrl: resolveFromRepo(databaseUrl),
    version: process.env.npm_package_version ?? "0.1.0",
    mockProviders: (process.env.MOCK_PROVIDERS ?? "true") !== "false",
    hermesBaseUrl: process.env.HERMES_BASE_URL ?? "",
    hermesApiKey: process.env.HERMES_API_KEY ?? "",
    hermesImageGenerationPath: process.env.HERMES_IMAGE_GENERATION_PATH ?? "",
    hermesImageAnalysisPath: process.env.HERMES_IMAGE_ANALYSIS_PATH ?? "",
    comfyuiCloudBaseUrl: process.env.COMFYUI_CLOUD_BASE_URL ?? "https://cloud.comfy.org",
    comfyuiCloudApiKey: process.env.COMFYUI_CLOUD_API_KEY ?? process.env.COMFY_API_KEY ?? "",
    comfyuiCloudGenerationPath: process.env.COMFYUI_CLOUD_GENERATION_PATH ?? "/api/prompt",
    openaiBaseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
    openaiApiKey: process.env.OPENAI_API_KEY ?? "",
    openaiImageModel: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1.5",
    openaiImageSize: process.env.OPENAI_IMAGE_SIZE ?? "1024x1536",
    openaiImageQuality: process.env.OPENAI_IMAGE_QUALITY ?? "auto",
    openaiImageOutputFormat: process.env.OPENAI_IMAGE_OUTPUT_FORMAT ?? "png",
    openaiImageModeration: process.env.OPENAI_IMAGE_MODERATION === "auto" ? "auto" : "low",
    wavespeedBaseUrl: process.env.WAVESPEED_BASE_URL ?? "https://api.wavespeed.ai/api/v3",
    wavespeedApiKey: process.env.WAVESPEED_API_KEY ?? "",
    wavespeedImageGenerationPath: process.env.WAVESPEED_IMAGE_GENERATION_PATH ?? "/wavespeed-ai/flux-dev"
  };
}
