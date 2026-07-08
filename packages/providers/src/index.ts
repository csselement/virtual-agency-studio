import { existsSync, readFileSync } from "node:fs";
import { basename, extname } from "node:path";

export type ProviderJobStatus = "queued" | "submitted" | "completed" | "failed";

export interface GenerateImageRequest {
  prompt: string;
  negativePrompt?: string;
  characterId?: string;
  referenceImageSource?: string;
  referenceImageUrl?: string;
  referenceImageIds?: string[];
  referenceImages?: Array<{
    id?: string;
    path: string;
    originalName?: string;
    mimeType?: string;
  }>;
  outputDir?: string;
}

export interface GenerateImageResult {
  provider: string;
  status: ProviderJobStatus;
  assetId?: string;
  filePath?: string;
  metadata: Record<string, unknown>;
}

export interface AnalyzeImageRequest {
  assetId: string;
  imagePath?: string;
  prompt?: string;
}

export interface AnalyzeImageResult {
  provider: string;
  status: ProviderJobStatus;
  identityMatch: number;
  qualityNotes: string[];
  platformFit: string[];
  suggestedPromptFixes: string[];
  altText: string;
  metadata: Record<string, unknown>;
}

export interface CreativeTextRequest {
  prompt: string;
  context?: Record<string, unknown>;
}

export interface CreativeTextResult {
  provider: string;
  status: ProviderJobStatus;
  text: string;
  metadata: Record<string, unknown>;
}

export interface ImageGenerationProvider {
  name: string;
  generateImage(request: GenerateImageRequest): Promise<GenerateImageResult>;
}

export interface ImageAnalysisProvider {
  name: string;
  analyzeImage(request: AnalyzeImageRequest): Promise<AnalyzeImageResult>;
}

export interface CreativeTextProvider {
  name: string;
  generateText(request: CreativeTextRequest): Promise<CreativeTextResult>;
}

export interface HttpProviderConfig {
  baseUrl?: string;
  apiKey?: string;
  generationPath?: string;
  analysisPath?: string;
  workflowPayload?: Record<string, unknown>;
  workflowMappings?: WorkflowMappings;
  imageModel?: string;
  imageSize?: string;
  imageQuality?: string;
  imageOutputFormat?: string;
  imageModeration?: "auto" | "low";
  pollIntervalMs?: number;
  maxPollAttempts?: number;
}

export interface WorkflowMappings {
  positivePromptNode?: string;
  positivePromptInput?: string;
  negativePromptNode?: string;
  negativePromptInput?: string;
  seedNode?: string;
  seedInput?: string;
  referenceImageNode?: string;
  referenceImageInput?: string;
  outputNodeIds?: string[];
}

export class ProviderGenerationError extends Error {
  constructor(
    message: string,
    readonly details: {
      provider: string;
      statusCode?: number;
      code?: string;
      fallbackEligible?: boolean;
      response?: unknown;
    }
  ) {
    super(message);
    this.name = "ProviderGenerationError";
  }
}

function requireConfig(value: string | undefined, label: string) {
  if (!value?.trim()) {
    throw new Error(`${label} is not configured`);
  }
  return value;
}

function endpoint(baseUrl: string, path: string) {
  return new URL(path.replace(/^\/+/, ""), baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();
}

function safeHeaders(apiKey?: string) {
  return {
    "content-type": "application/json",
    ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {})
  };
}

function comfyCloudHeaders(apiKey?: string) {
  return {
    "content-type": "application/json",
    ...(apiKey ? { "X-API-Key": apiKey } : {})
  };
}

function extractMessageContent(payload: Record<string, unknown>) {
  const choices = payload.choices;
  if (!Array.isArray(choices)) return "";
  const [first] = choices;
  if (!first || typeof first !== "object") return "";
  const message = (first as Record<string, unknown>).message;
  if (!message || typeof message !== "object") return "";
  const content = (message as Record<string, unknown>).content;
  return typeof content === "string" ? content : "";
}

function parseJsonFromText(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  if (!trimmed) return {};
  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced?.[1]) {
      try {
        return JSON.parse(fenced[1].trim()) as Record<string, unknown>;
      } catch {
        // Fall through to object matching.
      }
    }
    const objectMatch = trimmed.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]) as Record<string, unknown>;
      } catch {
        return {};
      }
    }
    return {};
  }
}

function extractUrlFromText(text: string) {
  const match = text.match(/https?:\/\/[^\s"'<>),]+/);
  return match?.[0];
}

function mimeTypeForPath(path: string) {
  const extension = extname(path).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  if (extension === ".gif") return "image/gif";
  return "image/png";
}

function localImageDataUrl(path?: string) {
  if (!path || !existsSync(path)) return undefined;
  const buffer = readFileSync(path);
  return `data:${mimeTypeForPath(path)};base64,${buffer.toString("base64")}`;
}

async function postHermesChat(baseUrl: string, path: string, apiKey: string | undefined, messages: Array<Record<string, unknown>>) {
  const response = await fetch(endpoint(baseUrl, path), {
    method: "POST",
    headers: safeHeaders(apiKey),
    body: JSON.stringify({
      model: "hermes-agent",
      stream: false,
      messages
    })
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(`Hermes chat request failed with ${response.status}`);
  }
  return payload;
}

function firstString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.find((item): item is string => typeof item === "string");
  return undefined;
}

function nestedRecord(value: unknown, key: string) {
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  const nested = record[key];
  return nested && typeof nested === "object" ? (nested as Record<string, unknown>) : undefined;
}

function extractImageUrl(payload: Record<string, unknown>) {
  const data = nestedRecord(payload, "data") ?? payload;
  return (
    firstString(data.url) ??
    firstString(data.imageUrl) ??
    firstString(data.image_url) ??
    firstString(data.output) ??
    firstString(data.outputs) ??
    firstString(data.urls) ??
    firstString(data.images) ??
    firstString(data.image) ??
    firstString(payload.url) ??
    firstString(payload.imageUrl)
  );
}

function extractImageB64(payload: Record<string, unknown>) {
  const data = payload.data;
  if (Array.isArray(data)) {
    for (const item of data) {
      if (item && typeof item === "object") {
        const b64 = (item as Record<string, unknown>).b64_json ?? (item as Record<string, unknown>).b64Json;
        if (typeof b64 === "string") return b64;
      }
    }
  }
  return firstString(payload.b64_json) ?? firstString(payload.b64Json);
}

function extractTaskId(payload: Record<string, unknown>) {
  const data = nestedRecord(payload, "data") ?? payload;
  return firstString(data.id) ?? firstString(data.task_id) ?? firstString(data.taskId) ?? firstString(data.prediction_id) ?? firstString(data.predictionId);
}

function extractStatus(payload: Record<string, unknown>) {
  const data = nestedRecord(payload, "data") ?? payload;
  return String(data.status ?? payload.status ?? "").toLowerCase();
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cloneRecord(value: Record<string, unknown>) {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

function setWorkflowInput(workflow: Record<string, unknown>, nodeId: string | undefined, inputName: string | undefined, value: unknown) {
  if (!nodeId || !inputName) return;
  const node = workflow[nodeId];
  if (!node || typeof node !== "object") return;
  const nodeRecord = node as Record<string, unknown>;
  const inputs = nodeRecord.inputs;
  if (!inputs || typeof inputs !== "object") return;
  (inputs as Record<string, unknown>)[inputName] = value;
}

function applyWorkflowMappings(workflow: Record<string, unknown>, mappings: WorkflowMappings | undefined, request: GenerateImageRequest) {
  const next = cloneRecord(workflow);
  setWorkflowInput(next, mappings?.positivePromptNode, mappings?.positivePromptInput, request.prompt);
  setWorkflowInput(next, mappings?.negativePromptNode, mappings?.negativePromptInput, request.negativePrompt ?? "");
  if (mappings?.seedNode && mappings?.seedInput) {
    setWorkflowInput(next, mappings.seedNode, mappings.seedInput, Math.floor(Math.random() * 1_000_000_000));
  }
  return next;
}

async function uploadComfyReferenceImage(baseUrl: string, apiKey: string, referenceImage: NonNullable<GenerateImageRequest["referenceImages"]>[number]) {
  if (!existsSync(referenceImage.path)) {
    throw new ProviderGenerationError(`Reference image file is missing: ${referenceImage.path}`, {
      provider: "comfyui-cloud-image-generation",
      code: "missing_reference_image",
      fallbackEligible: false
    });
  }
  const buffer = readFileSync(referenceImage.path);
  const form = new FormData();
  const filename = referenceImage.originalName?.trim() || basename(referenceImage.path);
  const mimeType = referenceImage.mimeType?.trim() || mimeTypeForPath(referenceImage.path);
  form.set("image", new Blob([new Uint8Array(buffer)], { type: mimeType }), filename);
  form.set("type", "input");
  form.set("overwrite", "false");
  const response = await fetch(endpoint(baseUrl, "/api/upload/image"), {
    method: "POST",
    headers: {
      "X-API-Key": apiKey
    },
    body: form
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    throw providerFailure("comfyui-cloud-image-generation", response.status, payload, `ComfyUI Cloud reference upload failed with ${response.status}`);
  }
  const name = firstString(payload.name) ?? firstString(payload.filename);
  if (!name) {
    throw new ProviderGenerationError("ComfyUI Cloud reference upload did not return a filename.", {
      provider: "comfyui-cloud-image-generation",
      code: "missing_upload_name",
      fallbackEligible: false,
      response: payload
    });
  }
  return {
    name,
    subfolder: typeof payload.subfolder === "string" ? payload.subfolder : "",
    type: typeof payload.type === "string" ? payload.type : "input",
    raw: payload
  };
}

function findOutputFile(value: unknown): { filename: string; subfolder?: string; type?: string } | undefined {
  if (!value || typeof value !== "object") return undefined;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findOutputFile(item);
      if (found) return found;
    }
    return undefined;
  }
  const record = value as Record<string, unknown>;
  if (typeof record.filename === "string") {
    return {
      filename: record.filename,
      subfolder: typeof record.subfolder === "string" ? record.subfolder : undefined,
      type: typeof record.type === "string" ? record.type : "output"
    };
  }
  for (const nested of Object.values(record)) {
    const found = findOutputFile(nested);
    if (found) return found;
  }
  return undefined;
}

function providerFailure(provider: string, statusCode: number | undefined, payload: Record<string, unknown>, message: string) {
  const text = JSON.stringify(payload).toLowerCase();
  const code =
    typeof payload.error === "object" && payload.error
      ? String((payload.error as Record<string, unknown>).code ?? (payload.error as Record<string, unknown>).type ?? "")
      : "";
  const fallbackEligible =
    statusCode === 429 ||
    statusCode === 408 ||
    statusCode === 500 ||
    statusCode === 502 ||
    statusCode === 503 ||
    statusCode === 504 ||
    text.includes("moderation") ||
    text.includes("policy") ||
    text.includes("safety") ||
    text.includes("refus");
  return new ProviderGenerationError(message, { provider, statusCode, code, fallbackEligible, response: payload });
}

export class MockImageGenerationProvider implements ImageGenerationProvider {
  name = "mock-image-generation";

  async generateImage(request: GenerateImageRequest): Promise<GenerateImageResult> {
    return {
      provider: this.name,
      assetId: `mock_asset_${Date.now()}`,
      filePath: "assets/mock-generated-image.txt",
      status: "completed",
      metadata: {
        mode: "mock",
        prompt: request.prompt,
        negativePrompt: request.negativePrompt ?? null,
        referenceImageIds: request.referenceImageIds ?? []
      }
    };
  }
}

export class MockImageAnalysisProvider implements ImageAnalysisProvider {
  name = "mock-image-analysis";

  async analyzeImage(request: AnalyzeImageRequest): Promise<AnalyzeImageResult> {
    return {
      provider: this.name,
      status: "completed",
      identityMatch: 0.84,
      qualityNotes: ["Mock analysis: composition is usable for review.", "Identity cues are present enough for MVP testing."],
      platformFit: ["Instagram", "Threads"],
      suggestedPromptFixes: ["Add one stronger appearance anchor in the next prompt."],
      altText: `Mock alt text for ${request.assetId}.`,
      metadata: {
        mode: "mock",
        assetId: request.assetId,
        imagePath: request.imagePath ?? null,
        prompt: request.prompt ?? null
      }
    };
  }
}

export class MockCreativeTextProvider implements CreativeTextProvider {
  name = "mock-creative-text";

  async generateText(request: CreativeTextRequest): Promise<CreativeTextResult> {
    return {
      provider: this.name,
      status: "completed",
      text: `Mock creative response for: ${request.prompt}`,
      metadata: { mode: "mock", context: request.context ?? {} }
    };
  }
}

export class HermesImageGenerationProvider implements ImageGenerationProvider {
  name = "hermes-image-generation";

  constructor(private readonly config: HttpProviderConfig) {}

  async generateImage(request: GenerateImageRequest): Promise<GenerateImageResult> {
    const baseUrl = requireConfig(this.config.baseUrl, "HERMES_BASE_URL");
    const path = requireConfig(this.config.generationPath, "HERMES_IMAGE_GENERATION_PATH");
    if (path.includes("chat/completions") || path.includes("responses")) {
      const payload = await postHermesChat(baseUrl, path, this.config.apiKey, [
        {
          role: "system",
          content:
            "You are an image generation API adapter. Generate the requested image using the configured image tool. " +
            "Return only compact JSON with imageUrl or filePath, plus optional assetId and notes. Do not wrap in markdown."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: [
                "Generate one production-ready image for this prompt.",
                `Prompt: ${request.prompt}`,
                request.negativePrompt ? `Negative prompt: ${request.negativePrompt}` : "",
                request.characterId ? `Character ID: ${request.characterId}` : "",
                "Return JSON exactly like {\"imageUrl\":\"https://...\",\"assetId\":\"optional\",\"notes\":\"optional\"}.",
                "If the image is saved locally by Hermes, return {\"filePath\":\"/absolute/path/to/image.png\"}."
              ].filter(Boolean).join("\n")
            }
          ]
        }
      ]);
      const content = extractMessageContent(payload);
      const parsed = parseJsonFromText(content);
      const imageUrl = typeof parsed.imageUrl === "string" ? parsed.imageUrl : typeof parsed.url === "string" ? parsed.url : extractUrlFromText(content);
      const filePath = typeof parsed.filePath === "string" ? parsed.filePath : typeof parsed.path === "string" ? parsed.path : undefined;
      if (!imageUrl && !filePath) {
        const notes = typeof parsed.notes === "string" ? parsed.notes : content;
        throw new Error(`Hermes image generation did not return an image URL or file path${notes ? `: ${notes}` : "."}`);
      }
      return {
        provider: this.name,
        status: "completed",
        assetId: typeof parsed.assetId === "string" ? parsed.assetId : undefined,
        filePath,
        metadata: { ...payload, hermesContent: content, ...parsed, ...(imageUrl ? { url: imageUrl } : {}) }
      };
    }
    const response = await fetch(endpoint(baseUrl, path), {
      method: "POST",
      headers: safeHeaders(this.config.apiKey),
      body: JSON.stringify({
        prompt: request.prompt,
        negative_prompt: request.negativePrompt,
        character_id: request.characterId,
        reference_image_ids: request.referenceImageIds
      })
    });
    const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (!response.ok) {
      throw new Error(`Hermes image generation failed with ${response.status}`);
    }
    return {
      provider: this.name,
      status: "submitted",
      assetId: typeof payload.assetId === "string" ? payload.assetId : undefined,
      filePath: typeof payload.filePath === "string" ? payload.filePath : undefined,
      metadata: payload
    };
  }
}

export class OpenAIImageGenerationProvider implements ImageGenerationProvider {
  name = "openai-image-generation";

  constructor(private readonly config: HttpProviderConfig) {}

  async generateImage(request: GenerateImageRequest): Promise<GenerateImageResult> {
    const baseUrl = this.config.baseUrl?.trim() || "https://api.openai.com/v1";
    const apiKey = requireConfig(this.config.apiKey, "OPENAI_API_KEY");
    const model = this.config.imageModel?.trim() || "gpt-image-1.5";
    const outputFormat = this.config.imageOutputFormat?.trim() || "png";
    const response = await fetch(endpoint(baseUrl, "/images/generations"), {
      method: "POST",
      headers: safeHeaders(apiKey),
      body: JSON.stringify({
        model,
        prompt: request.prompt,
        n: 1,
        size: this.config.imageSize?.trim() || "1024x1536",
        quality: this.config.imageQuality?.trim() || "auto",
        output_format: outputFormat,
        moderation: this.config.imageModeration ?? "low"
      })
    });
    const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (!response.ok) {
      throw providerFailure(this.name, response.status, payload, `OpenAI image generation failed with ${response.status}`);
    }
    const b64 = extractImageB64(payload);
    const url = extractImageUrl(payload);
    if (!b64 && !url) {
      throw new ProviderGenerationError("OpenAI image generation did not return image data.", {
        provider: this.name,
        fallbackEligible: true,
        response: payload
      });
    }
    return {
      provider: this.name,
      status: "completed",
      assetId: extractTaskId(payload),
      filePath: url,
      metadata: {
        ...payload,
        ...(b64 ? { b64_json: b64, mimeType: `image/${outputFormat === "jpg" ? "jpeg" : outputFormat}` } : {}),
        ...(url ? { url } : {})
      }
    };
  }
}

export class HermesImageAnalysisProvider implements ImageAnalysisProvider {
  name = "hermes-image-analysis";

  constructor(private readonly config: HttpProviderConfig) {}

  async analyzeImage(request: AnalyzeImageRequest): Promise<AnalyzeImageResult> {
    const baseUrl = requireConfig(this.config.baseUrl, "HERMES_BASE_URL");
    const path = requireConfig(this.config.analysisPath, "HERMES_IMAGE_ANALYSIS_PATH");
    if (path.includes("chat/completions") || path.includes("responses")) {
      const imageUrl = localImageDataUrl(request.imagePath);
      const content: Array<Record<string, unknown>> = [
        {
          type: "text",
          text:
            "Analyze this generated influencer image. Return only compact JSON with keys: " +
            "identityMatch as 0-100 number, qualityNotes string array, platformFit string array, " +
            "suggestedPromptFixes string array, altText string. " +
            (request.prompt ? `Original prompt: ${request.prompt}` : "")
        }
      ];
      if (imageUrl) {
        content.push({ type: "image_url", image_url: { url: imageUrl, detail: "high" } });
      } else if (request.imagePath) {
        content[0].text = `${content[0].text}\nImage path available to the API caller: ${request.imagePath}`;
      }
      const payload = await postHermesChat(baseUrl, path, this.config.apiKey, [
        {
          role: "system",
          content:
            "You are an image QA API adapter. Return valid JSON only. Do not wrap in markdown."
        },
        { role: "user", content }
      ]);
      const responseText = extractMessageContent(payload);
      const parsed = parseJsonFromText(responseText);
      return {
        provider: this.name,
        status: "completed",
        identityMatch: Number(parsed.identityMatch ?? parsed.identity_match ?? 0),
        qualityNotes: Array.isArray(parsed.qualityNotes) ? parsed.qualityNotes.map(String) : [],
        platformFit: Array.isArray(parsed.platformFit) ? parsed.platformFit.map(String) : [],
        suggestedPromptFixes: Array.isArray(parsed.suggestedPromptFixes) ? parsed.suggestedPromptFixes.map(String) : [],
        altText: String(parsed.altText ?? parsed.alt_text ?? ""),
        metadata: { ...payload, hermesContent: responseText, ...parsed }
      };
    }
    const response = await fetch(endpoint(baseUrl, path), {
      method: "POST",
      headers: safeHeaders(this.config.apiKey),
      body: JSON.stringify({
        asset_id: request.assetId,
        image_path: request.imagePath,
        prompt: request.prompt
      })
    });
    const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (!response.ok) {
      throw new Error(`Hermes image analysis failed with ${response.status}`);
    }
    return {
      provider: this.name,
      status: "completed",
      identityMatch: Number(payload.identityMatch ?? payload.identity_match ?? 0),
      qualityNotes: Array.isArray(payload.qualityNotes) ? payload.qualityNotes.map(String) : [],
      platformFit: Array.isArray(payload.platformFit) ? payload.platformFit.map(String) : [],
      suggestedPromptFixes: Array.isArray(payload.suggestedPromptFixes) ? payload.suggestedPromptFixes.map(String) : [],
      altText: String(payload.altText ?? payload.alt_text ?? ""),
      metadata: payload
    };
  }
}

export class ComfyUICloudImageGenerationProvider implements ImageGenerationProvider {
  name = "comfyui-cloud-image-generation";

  constructor(private readonly config: HttpProviderConfig) {}

  async generateImage(request: GenerateImageRequest): Promise<GenerateImageResult> {
    const baseUrl = requireConfig(this.config.baseUrl, "COMFYUI_CLOUD_BASE_URL");
    const path = this.config.generationPath ?? "/";
    const apiKey = requireConfig(this.config.apiKey, "COMFYUI_CLOUD_API_KEY");
    const workflow = this.config.workflowPayload ?? {};
    const isOfficialCloudPromptEndpoint = baseUrl.includes("cloud.comfy.org") && path.replace(/\/+$/, "") === "/api/prompt";
    if (isOfficialCloudPromptEndpoint && Object.keys(workflow).length === 0) {
      throw new ProviderGenerationError("ComfyUI Cloud workflow payload is not configured.", {
        provider: this.name,
        code: "missing_workflow",
        fallbackEligible: false
      });
    }
    const promptWorkflow = applyWorkflowMappings(workflow, this.config.workflowMappings, request);
    let uploadedReference: Awaited<ReturnType<typeof uploadComfyReferenceImage>> | undefined;
    if (isOfficialCloudPromptEndpoint && this.config.workflowMappings?.referenceImageNode && this.config.workflowMappings.referenceImageInput) {
      const [referenceImage] = request.referenceImages ?? [];
      if (!referenceImage) {
        throw new ProviderGenerationError("ComfyUI Cloud workflow requires an approved character reference image.", {
          provider: this.name,
          code: "missing_reference_image",
          fallbackEligible: false
        });
      }
      uploadedReference = await uploadComfyReferenceImage(baseUrl, apiKey, referenceImage);
      setWorkflowInput(
        promptWorkflow,
        this.config.workflowMappings.referenceImageNode,
        this.config.workflowMappings.referenceImageInput,
        uploadedReference.name
      );
    }
    const body = isOfficialCloudPromptEndpoint
      ? {
          prompt: promptWorkflow,
          extra_data: {
            api_key_comfy_org: apiKey,
            virtual_agency_prompt: request.prompt,
            negative_prompt: request.negativePrompt,
            reference_image_ids: request.referenceImageIds ?? [],
            reference_image_source: request.referenceImageSource,
            reference_image_url: request.referenceImageUrl,
            uploaded_reference: uploadedReference
          }
        }
      : {
          workflow: this.config.workflowPayload ?? {},
          prompt: request.prompt,
          negative_prompt: request.negativePrompt,
          reference_image_ids: request.referenceImageIds
        };
    const response = await fetch(endpoint(baseUrl, path), {
      method: "POST",
      headers: isOfficialCloudPromptEndpoint ? comfyCloudHeaders(apiKey) : safeHeaders(apiKey),
      body: JSON.stringify(body)
    });
    const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (!response.ok) {
      throw providerFailure(this.name, response.status, payload, `ComfyUI Cloud image generation failed with ${response.status}`);
    }
    const promptId = typeof payload.assetId === "string" ? payload.assetId : typeof payload.prompt_id === "string" ? payload.prompt_id : undefined;
    if (isOfficialCloudPromptEndpoint && promptId) {
      const pollIntervalMs = this.config.pollIntervalMs ?? 2500;
      const maxPollAttempts = this.config.maxPollAttempts ?? 90;
      let statusPayload: Record<string, unknown> = payload;
      for (let attempt = 0; attempt < maxPollAttempts; attempt += 1) {
        await sleep(pollIntervalMs);
        const statusResponse = await fetch(endpoint(baseUrl, `/api/job/${promptId}/status`), {
          method: "GET",
          headers: comfyCloudHeaders(apiKey)
        });
        statusPayload = (await statusResponse.json().catch(() => ({}))) as Record<string, unknown>;
        if (!statusResponse.ok) {
          throw providerFailure(this.name, statusResponse.status, statusPayload, `ComfyUI Cloud job status failed with ${statusResponse.status}`);
        }
        const status = extractStatus(statusPayload);
        if (status === "failed" || status === "error" || statusPayload.error_message) {
          throw new ProviderGenerationError(`ComfyUI Cloud job failed: ${String(statusPayload.error_message ?? status)}`, {
            provider: this.name,
            code: "job_failed",
            fallbackEligible: false,
            response: statusPayload
          });
        }
        if (status === "completed" || status === "succeeded" || status === "success") {
          break;
        }
        if (attempt === maxPollAttempts - 1) {
          throw new ProviderGenerationError(`ComfyUI Cloud job timed out for ${promptId}`, {
            provider: this.name,
            code: "job_timeout",
            fallbackEligible: false,
            response: statusPayload
          });
        }
      }

      const detailsResponse = await fetch(endpoint(baseUrl, `/api/jobs/${promptId}`), {
        method: "GET",
        headers: comfyCloudHeaders(apiKey)
      });
      const details = (await detailsResponse.json().catch(() => ({}))) as Record<string, unknown>;
      if (!detailsResponse.ok) {
        throw providerFailure(this.name, detailsResponse.status, details, `ComfyUI Cloud job details failed with ${detailsResponse.status}`);
      }
      const outputFile = findOutputFile(details);
      if (outputFile) {
        const viewUrl = new URL(endpoint(baseUrl, "/api/view"));
        viewUrl.searchParams.set("filename", outputFile.filename);
        if (outputFile.subfolder) viewUrl.searchParams.set("subfolder", outputFile.subfolder);
        viewUrl.searchParams.set("type", outputFile.type ?? "output");
        const fileResponse = await fetch(viewUrl.toString(), {
          method: "GET",
          headers: comfyCloudHeaders(apiKey)
        });
        if (!fileResponse.ok) {
          const failurePayload = (await fileResponse.json().catch(() => ({}))) as Record<string, unknown>;
          throw providerFailure(this.name, fileResponse.status, failurePayload, `ComfyUI Cloud output download failed with ${fileResponse.status}`);
        }
        const buffer = Buffer.from(await fileResponse.arrayBuffer());
        const mimeType = fileResponse.headers.get("content-type") ?? mimeTypeForPath(outputFile.filename);
        return {
          provider: this.name,
          status: "completed",
          assetId: promptId,
          metadata: {
            ...payload,
            status: statusPayload,
            details,
            outputFile,
            uploadedReference,
            b64_json: buffer.toString("base64"),
            mimeType
          }
        };
      }
      throw new ProviderGenerationError(`ComfyUI Cloud job completed without an output file for ${promptId}`, {
        provider: this.name,
        code: "missing_output",
        fallbackEligible: false,
        response: details
      });
    }
    return {
      provider: this.name,
      status: "submitted",
      assetId: promptId,
      filePath: typeof payload.filePath === "string" ? payload.filePath : undefined,
      metadata: payload
    };
  }
}

export class WaveSpeedImageGenerationProvider implements ImageGenerationProvider {
  name = "wavespeed-image-generation";

  constructor(private readonly config: HttpProviderConfig) {}

  async generateImage(request: GenerateImageRequest): Promise<GenerateImageResult> {
    const baseUrl = this.config.baseUrl?.trim() || "https://api.wavespeed.ai/api/v3";
    const path = this.config.generationPath?.trim() || "/wavespeed-ai/flux-dev";
    const apiKey = requireConfig(this.config.apiKey, "WAVESPEED_API_KEY");
    const response = await fetch(endpoint(baseUrl, path), {
      method: "POST",
      headers: safeHeaders(apiKey),
      body: JSON.stringify({
        prompt: request.prompt,
        negative_prompt: request.negativePrompt,
        size: "1024*1024",
        num_inference_steps: 28,
        guidance_scale: 3.5
      })
    });
    const submitted = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (!response.ok) {
      throw new Error(`WaveSpeed image generation failed with ${response.status}`);
    }

    const immediateUrl = extractImageUrl(submitted);
    if (immediateUrl) {
      return {
        provider: this.name,
        status: "completed",
        assetId: extractTaskId(submitted),
        filePath: immediateUrl,
        metadata: { ...submitted, url: immediateUrl }
      };
    }

    const taskId = extractTaskId(submitted);
    if (!taskId) {
      return {
        provider: this.name,
        status: "submitted",
        metadata: submitted
      };
    }

    const pollIntervalMs = this.config.pollIntervalMs ?? 2500;
    const maxPollAttempts = this.config.maxPollAttempts ?? 60;
    for (let attempt = 0; attempt < maxPollAttempts; attempt += 1) {
      await sleep(pollIntervalMs);
      const resultResponse = await fetch(endpoint(baseUrl, `/predictions/${taskId}/result`), {
        method: "GET",
        headers: safeHeaders(apiKey)
      });
      const result = (await resultResponse.json().catch(() => ({}))) as Record<string, unknown>;
      if (!resultResponse.ok) {
        throw new Error(`WaveSpeed result polling failed with ${resultResponse.status}`);
      }
      const status = extractStatus(result);
      if (status === "failed" || status === "error") {
        throw new Error(`WaveSpeed image generation failed: ${JSON.stringify(result)}`);
      }
      const url = extractImageUrl(result);
      if (status === "completed" || status === "succeeded" || url) {
        return {
          provider: this.name,
          status: "completed",
          assetId: taskId,
          filePath: url,
          metadata: { ...result, taskId, url }
        };
      }
    }

    throw new Error(`WaveSpeed image generation timed out for task ${taskId}`);
  }
}

export type ImageGenerationRequest = GenerateImageRequest;
export type ImageGenerationResult = GenerateImageResult;
export type ImageAnalysisRequest = AnalyzeImageRequest;
export type ImageAnalysisResult = AnalyzeImageResult;
