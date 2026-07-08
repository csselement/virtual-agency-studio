import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  ComfyUICloudImageGenerationProvider,
  HermesImageGenerationProvider,
  MockImageAnalysisProvider,
  MockImageGenerationProvider,
  OpenAIImageGenerationProvider,
  ProviderGenerationError,
  WaveSpeedImageGenerationProvider
} from "./index";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("mock providers", () => {
  it("generates a mock image result", async () => {
    const provider = new MockImageGenerationProvider();
    const result = await provider.generateImage({ prompt: "demo portrait" });

    expect(result.provider).toBe("mock-image-generation");
    expect(result.status).toBe("completed");
  });

  it("analyzes a mock asset", async () => {
    const provider = new MockImageAnalysisProvider();
    const result = await provider.analyzeImage({ assetId: "asset_1" });

    expect(result.identityMatch).toBeGreaterThan(0);
    expect(result.altText).toContain("asset_1");
  });

  it("fails clearly when Hermes is not configured", async () => {
    const provider = new HermesImageGenerationProvider({});
    await expect(provider.generateImage({ prompt: "demo" })).rejects.toThrow("HERMES_BASE_URL");
  });

  it("fails clearly when WaveSpeed is missing an API key", async () => {
    const provider = new WaveSpeedImageGenerationProvider({});
    await expect(provider.generateImage({ prompt: "demo" })).rejects.toThrow("WAVESPEED_API_KEY");
  });

  it("generates with OpenAI image generation and returns base64 metadata", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ data: [{ b64_json: Buffer.from("png").toString("base64") }] }), { status: 200 })
    );
    const provider = new OpenAIImageGenerationProvider({
      apiKey: "test-key",
      imageModel: "gpt-image-1.5",
      imageSize: "1024x1536",
      imageQuality: "auto",
      imageOutputFormat: "png",
      imageModeration: "low"
    });

    const result = await provider.generateImage({ prompt: "demo portrait" });

    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.openai.com/v1/images/generations");
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)).moderation).toBe("low");
    expect(result.provider).toBe("openai-image-generation");
    expect(result.status).toBe("completed");
    expect(result.metadata.b64_json).toBeTruthy();
  });

  it("marks OpenAI policy-style failures as fallback eligible", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: { type: "moderation_blocked", message: "safety system blocked the request" } }), { status: 400 })
    );
    const provider = new OpenAIImageGenerationProvider({ apiKey: "test-key" });

    await expect(provider.generateImage({ prompt: "demo portrait" })).rejects.toMatchObject({
      details: { provider: "openai-image-generation", statusCode: 400, fallbackEligible: true }
    } satisfies Partial<ProviderGenerationError>);
  });

  it("fails clearly when Comfy Cloud workflow is missing", async () => {
    const provider = new ComfyUICloudImageGenerationProvider({
      baseUrl: "https://cloud.comfy.org",
      apiKey: "test-key",
      generationPath: "/api/prompt"
    });

    await expect(provider.generateImage({ prompt: "demo" })).rejects.toThrow("workflow payload is not configured");
  });

  it("submits, polls, and downloads a Comfy Cloud workflow output", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ prompt_id: "job_123", node_errors: {} }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: "success" }), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "job_123",
            outputs: {
              "9": { images: [{ filename: "ComfyUI_00001_.png", type: "output", subfolder: "" }] }
            }
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(new Response(Buffer.from("png"), { status: 200, headers: { "content-type": "image/png" } }));
    const provider = new ComfyUICloudImageGenerationProvider({
      baseUrl: "https://cloud.comfy.org",
      apiKey: "test-key",
      generationPath: "/api/prompt",
      workflowPayload: {
        "6": { inputs: { text: "old" }, class_type: "CLIPTextEncode" },
        "9": { inputs: { filename_prefix: "VirtualAgency" }, class_type: "SaveImage" }
      },
      workflowMappings: { positivePromptNode: "6", positivePromptInput: "text", outputNodeIds: ["9"] },
      pollIntervalMs: 1,
      maxPollAttempts: 1
    });

    const result = await provider.generateImage({ prompt: "new prompt" });

    const submitted = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(submitted.prompt["6"].inputs.text).toBe("new prompt");
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(result.status).toBe("completed");
    expect(result.metadata.b64_json).toBe(Buffer.from("png").toString("base64"));
  });

  it("uploads a Comfy Cloud reference image and injects the uploaded filename into the workflow", async () => {
    const tempDir = mkdtempSync(join(tmpdir(), "vas-comfy-ref-"));
    const referencePath = join(tempDir, "reference.png");
    writeFileSync(referencePath, Buffer.from("png"));
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ name: "uploaded-reference.png", type: "input", subfolder: "" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ prompt_id: "job_456", node_errors: {} }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: "success" }), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "job_456",
            outputs: {
              "5": { images: [{ filename: "VAS_00001_.png", type: "output", subfolder: "" }] }
            }
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(new Response(Buffer.from("png"), { status: 200, headers: { "content-type": "image/png" } }));
    const provider = new ComfyUICloudImageGenerationProvider({
      baseUrl: "https://cloud.comfy.org",
      apiKey: "test-key",
      generationPath: "/api/prompt",
      workflowPayload: {
        "2": { inputs: { positive: "old", negative: "old" }, class_type: "Efficient Loader" },
        "4": { inputs: { seed: 1 }, class_type: "KSampler (Efficient)" },
        "5": { inputs: { filename_prefix: "VirtualAgency" }, class_type: "SaveImage" },
        "22": { inputs: { image: "placeholder.png", upload: "image" }, class_type: "LoadImage" }
      },
      workflowMappings: {
        positivePromptNode: "2",
        positivePromptInput: "positive",
        negativePromptNode: "2",
        negativePromptInput: "negative",
        seedNode: "4",
        seedInput: "seed",
        referenceImageNode: "22",
        referenceImageInput: "image",
        outputNodeIds: ["5"]
      },
      pollIntervalMs: 1,
      maxPollAttempts: 1
    });

    try {
      const result = await provider.generateImage({
        prompt: "new prompt",
        negativePrompt: "low quality",
        referenceImageUrl: "https://test.local/api/characters/char_x/reference-images/ref_1/file",
        referenceImageIds: ["ref_1"],
        referenceImages: [{ id: "ref_1", path: referencePath, originalName: "identity.png", mimeType: "image/png" }]
      });

      expect(fetchMock.mock.calls[0]?.[0]).toBe("https://cloud.comfy.org/api/upload/image");
      const submitted = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body));
      expect(submitted.prompt["2"].inputs.positive).toBe("new prompt");
      expect(submitted.prompt["2"].inputs.negative).toBe("low quality");
      expect(submitted.prompt["22"].inputs.image).toBe("uploaded-reference.png");
      expect(submitted.extra_data.uploaded_reference.name).toBe("uploaded-reference.png");
      expect(submitted.extra_data.reference_image_ids).toEqual(["ref_1"]);
      expect(submitted.extra_data.reference_image_source).toBeUndefined();
      expect(submitted.extra_data.reference_image_url).toBe("https://test.local/api/characters/char_x/reference-images/ref_1/file");
      expect(result.status).toBe("completed");
      expect(result.metadata.uploadedReference).toMatchObject({ name: "uploaded-reference.png", type: "input" });
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("fails Comfy Cloud reference workflows before submission when no reference image is provided", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const provider = new ComfyUICloudImageGenerationProvider({
      baseUrl: "https://cloud.comfy.org",
      apiKey: "test-key",
      generationPath: "/api/prompt",
      workflowPayload: {
        "5": { inputs: { filename_prefix: "VirtualAgency" }, class_type: "SaveImage" },
        "22": { inputs: { image: "placeholder.png" }, class_type: "LoadImage" }
      },
      workflowMappings: { referenceImageNode: "22", referenceImageInput: "image", outputNodeIds: ["5"] }
    });

    await expect(provider.generateImage({ prompt: "demo" })).rejects.toThrow("requires an approved character reference image");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("submits and polls WaveSpeed image generation", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { id: "task_123", status: "created" } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { id: "task_123", status: "completed", outputs: ["https://cdn.example/image.png"] } }), { status: 200 }));
    const provider = new WaveSpeedImageGenerationProvider({
      baseUrl: "https://api.wavespeed.ai/api/v3",
      apiKey: "test-key",
      generationPath: "/wavespeed-ai/flux-dev",
      pollIntervalMs: 1,
      maxPollAttempts: 1
    });

    const result = await provider.generateImage({ prompt: "demo portrait" });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.wavespeed.ai/api/v3/wavespeed-ai/flux-dev");
    expect(fetchMock.mock.calls[1]?.[0]).toBe("https://api.wavespeed.ai/api/v3/predictions/task_123/result");
    expect(result.status).toBe("completed");
    expect(result.metadata.url).toBe("https://cdn.example/image.png");
  });
});
