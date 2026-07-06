import { describe, expect, it } from "vitest";
import { buildApp } from "./app";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { ApiConfig } from "./config";

function testConfig(dir: string, overrides: Partial<ApiConfig> = {}): ApiConfig {
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
    ...overrides
  };
}

describe("api app", () => {
  it("returns health", async () => {
    const dir = mkdtempSync(join(tmpdir(), "vas-api-"));
    const app = buildApp(testConfig(dir));

    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      ok: true,
      service: "virtual-agency-api"
    });
    await app.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("lists characters from an empty migrated database", async () => {
    const dir = mkdtempSync(join(tmpdir(), "vas-api-"));
    const app = buildApp(testConfig(dir));

    const response = await app.inject({ method: "GET", url: "/api/characters" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ characters: [] });
    await app.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("redacts provider secrets while exposing OpenAI image settings", async () => {
    const dir = mkdtempSync(join(tmpdir(), "vas-api-"));
    const app = buildApp(testConfig(dir));

    const initial = await app.inject({ method: "GET", url: "/api/settings/providers" });
    expect(initial.statusCode).toBe(200);
    expect(initial.json().settings).toMatchObject({
      openaiBaseUrl: "https://api.openai.com/v1",
      openaiImageModel: "gpt-image-1.5",
      openaiImageModeration: "low",
      hasActiveComfyuiCloudWorkflow: false,
      comfyuiCloudReady: false,
      hasOpenaiApiKey: false
    });
    expect(initial.json().settings.openaiApiKey).toBeUndefined();

    const saved = await app.inject({
      method: "PATCH",
      url: "/api/settings/providers",
      payload: {
        openaiApiKey: "sk-test",
        openaiImageModel: "gpt-image-1.5",
        openaiImageSize: "1024x1536",
        openaiImageQuality: "high",
        openaiImageOutputFormat: "png",
        openaiImageModeration: "auto"
      }
    });
    expect(saved.statusCode).toBe(200);
    expect(saved.json().settings.hasOpenaiApiKey).toBe(true);
    expect(saved.json().settings.openaiApiKey).toBeUndefined();
    expect(saved.json().settings.openaiImageModeration).toBe("auto");

    await app.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("validates and activates named Comfy workflows by tier", async () => {
    const dir = mkdtempSync(join(tmpdir(), "vas-api-"));
    const app = buildApp(testConfig(dir));

    const invalid = await app.inject({
      method: "POST",
      url: "/api/settings/comfy-workflows",
      payload: {
        name: "No output",
        workflow: { "6": { class_type: "CLIPTextEncode", inputs: { text: "old" } } },
        positivePromptNode: "6",
        positivePromptInput: "text"
      }
    });
    expect(invalid.statusCode).toBe(201);
    expect(invalid.json().validation.valid).toBe(false);
    const blockedActivation = await app.inject({
      method: "POST",
      url: `/api/settings/comfy-workflows/${invalid.json().workflow.id}/activate`,
      payload: { tier: "sfw_standard" }
    });
    expect(blockedActivation.statusCode).toBe(400);

    const valid = await app.inject({
      method: "POST",
      url: "/api/settings/comfy-workflows",
      payload: {
        name: "Portrait API workflow",
        workflow: {
          "6": { class_type: "CLIPTextEncode", inputs: { text: "old prompt" } },
          "9": { class_type: "SaveImage", inputs: { filename_prefix: "VirtualAgency" } }
        },
        positivePromptNode: "6",
        positivePromptInput: "text"
      }
    });
    expect(valid.statusCode).toBe(201);
    expect(valid.json().validation).toMatchObject({ valid: true, outputNodeIds: ["9"] });
    const activated = await app.inject({
      method: "POST",
      url: `/api/settings/comfy-workflows/${valid.json().workflow.id}/activate`,
      payload: { tier: "sfw_standard" }
    });
    expect(activated.statusCode).toBe(200);
    expect(activated.json().workflow.default_for_tiers).toContain("sfw_standard");
    const providers = await app.inject({ method: "GET", url: "/api/settings/providers" });
    expect(providers.json().settings).toMatchObject({
      hasActiveComfyuiCloudWorkflow: true,
      comfyuiCloudReady: false
    });

    await app.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("blocks Comfy provider tests until an active workflow is configured", async () => {
    const dir = mkdtempSync(join(tmpdir(), "vas-api-"));
    const app = buildApp(testConfig(dir, { mockProviders: false, comfyuiCloudApiKey: "comfy-key" }));

    const settingsResponse = await app.inject({
      method: "PATCH",
      url: "/api/settings/providers",
      payload: {
        mockProviders: false,
        defaultImageGenerationProvider: "comfyui-cloud"
      }
    });
    expect(settingsResponse.statusCode).toBe(200);
    expect(settingsResponse.json().settings).toMatchObject({
      hasComfyuiCloudApiKey: true,
      hasActiveComfyuiCloudWorkflow: false,
      comfyuiCloudReady: false
    });

    const providerTest = await app.inject({
      method: "POST",
      url: "/api/settings/providers/test",
      payload: { capability: "image_generation" }
    });
    expect(providerTest.statusCode).toBe(200);
    expect(providerTest.json()).toMatchObject({
      ok: false,
      setupRequired: true,
      provider: "comfyui-cloud-image-generation"
    });
    expect(providerTest.json().runId).toBeUndefined();

    await app.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("creates and processes a run through the API", async () => {
    const dir = mkdtempSync(join(tmpdir(), "vas-api-"));
    const app = buildApp(testConfig(dir));

    const response = await app.inject({
      method: "POST",
      url: "/api/runs",
      payload: {
        type: "daily_activity",
        title: "API Daily Activity Run",
        autoProcess: true
      }
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.run.status).toBe("needs_review");
    expect(body.events.map((event: { type: string }) => event.type)).toContain("review.required");
    expect(body.artifacts[0].kind).toBe("queue_trace");
    await app.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("creates a character profile and starts a Character Birth Run", async () => {
    const dir = mkdtempSync(join(tmpdir(), "vas-api-"));
    const app = buildApp(testConfig(dir));

    const created = await app.inject({
      method: "POST",
      url: "/api/characters",
      payload: { name: "Phase Five", summary: "A test character for birth workflow." }
    });
    expect(created.statusCode).toBe(201);
    const characterId = created.json().character.id;

    const calls = [
      app.inject({
        method: "POST",
        url: `/api/characters/${characterId}/constitutions`,
        payload: { body: "Protect identity consistency.", changeReason: "Initial constitution." }
      }),
      app.inject({
        method: "POST",
        url: `/api/characters/${characterId}/appearance`,
        payload: { body: JSON.stringify({ hair: "black bob", palette: "teal and white" }) }
      }),
      app.inject({
        method: "POST",
        url: `/api/characters/${characterId}/voice`,
        payload: { body: JSON.stringify({ tone: "calm", emojiPolicy: "rare" }) }
      }),
      app.inject({
        method: "POST",
        url: `/api/characters/${characterId}/personas`,
        payload: { platform: "Instagram", body: "Concise visual captions." }
      }),
      app.inject({
        method: "POST",
        url: `/api/characters/${characterId}/canon`,
        payload: { title: "Studio Origin", body: "Born inside the local agency machine.", status: "approved" }
      }),
      app.inject({
        method: "POST",
        url: `/api/characters/${characterId}/memory`,
        payload: { body: "Keeps a morning notebook.", sourceType: "manual", confidence: 0.9, importance: 4 }
      }),
      app.inject({
        method: "POST",
        url: `/api/characters/${characterId}/reference-images`,
        payload: {
          originalName: "reference.txt",
          mimeType: "text/plain",
          base64: Buffer.from("reference").toString("base64"),
          status: "approved"
        }
      })
    ];
    const responses = await Promise.all(calls);
    expect(responses.every((response) => response.statusCode === 201)).toBe(true);

    const birth = await app.inject({ method: "POST", url: `/api/characters/${characterId}/birth-run` });
    const birthBody = birth.json();
    expect(birth.statusCode).toBe(201);
    expect(birthBody.run.status).toBe("needs_review");
    expect(birthBody.events.map((event: { type: string }) => event.type)).toContain("context.loaded");
    expect(birthBody.artifacts.map((artifact: { kind: string }) => artifact.kind)).toEqual(["birth_summary", "prompt_core"]);

    await app.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("updates provider settings and records mock provider jobs through test endpoint", async () => {
    const dir = mkdtempSync(join(tmpdir(), "vas-api-"));
    const app = buildApp(testConfig(dir));

    const settingsResponse = await app.inject({
      method: "PATCH",
      url: "/api/settings/providers",
      payload: {
        mockProviders: true,
        defaultImageGenerationProvider: "mock",
        defaultAnalysisProvider: "mock",
        hermesImageGenerationPath: "/images",
        hermesApiKey: "secret-value"
      }
    });
    expect(settingsResponse.statusCode).toBe(200);
    expect(settingsResponse.json().settings.hasHermesApiKey).toBe(true);
    expect(JSON.stringify(settingsResponse.json())).not.toContain("secret-value");

    const providerTest = await app.inject({
      method: "POST",
      url: "/api/settings/providers/test",
      payload: { capability: "image_generation" }
    });
    expect(providerTest.statusCode).toBe(200);
    const body = providerTest.json();
    expect(body.ok).toBe(true);
    expect(body.providerJob.status).toBe("completed");

    const runDetail = await app.inject({ method: "GET", url: `/api/runs/${body.runId}` });
    const detail = runDetail.json();
    expect(detail.events.map((event: { type: string }) => event.type)).toContain("provider.completed");
    expect(detail.providerJobs).toHaveLength(1);

    await app.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("generates activities, selects one, creates a brief, and composes a prompt recipe", async () => {
    const dir = mkdtempSync(join(tmpdir(), "vas-api-"));
    const app = buildApp(testConfig(dir));
    const created = await app.inject({
      method: "POST",
      url: "/api/characters",
      payload: { name: "Prompt Phase", summary: "Prompt studio test character." }
    });
    const characterId = created.json().character.id;
    await app.inject({
      method: "POST",
      url: `/api/characters/${characterId}/constitutions`,
      payload: { body: "Keep identity consistent.", changeReason: "Prompt test." }
    });
    await app.inject({
      method: "POST",
      url: `/api/characters/${characterId}/appearance`,
      payload: { body: "Hair: dark bob. Palette: teal. Wardrobe: clean studio layers." }
    });
    await app.inject({
      method: "POST",
      url: `/api/characters/${characterId}/personas`,
      payload: { platform: "Instagram", body: "Visual-first process captions." }
    });

    const activityRun = await app.inject({ method: "POST", url: `/api/characters/${characterId}/activity-runs` });
    expect(activityRun.statusCode).toBe(201);
    expect(activityRun.json().candidates).toHaveLength(5);
    const candidateId = activityRun.json().candidates[0].id;

    const selected = await app.inject({ method: "POST", url: `/api/activity-candidates/${candidateId}/select`, payload: { status: "selected" } });
    expect(selected.json().candidate.status).toBe("selected");

    const brief = await app.inject({
      method: "POST",
      url: "/api/content-briefs",
      payload: {
        characterId,
        activityCandidateId: candidateId,
        goal: "Show a daily ritual",
        platformTargets: "Instagram, Threads",
        contentPillar: "process",
        disclosureFlags: "synthetic media",
        desiredOutputs: "image prompt"
      }
    });
    expect(brief.statusCode).toBe(201);

    const recipe = await app.inject({
      method: "POST",
      url: "/api/prompt-recipes/compose",
      payload: {
        characterId,
        contentBriefId: brief.json().brief.id,
        platform: "Instagram",
        scene: "A quiet studio reset with tactile props.",
        generationSettings: { aspectRatio: "4:5" }
      }
    });
    expect(recipe.statusCode).toBe(201);
    const recipeBody = recipe.json().recipe;
    expect(recipeBody.final_prompt).toContain("CHARACTER CORE");
    expect(recipeBody.constitution_version_id).toBeTruthy();
    expect(recipeBody.appearance_profile_id).toBeTruthy();

    await app.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("generates, stores, analyzes, and reviews image assets from a prompt recipe", async () => {
    const dir = mkdtempSync(join(tmpdir(), "vas-api-"));
    const app = buildApp(testConfig(dir));
    const created = await app.inject({
      method: "POST",
      url: "/api/characters",
      payload: { name: "Image Loop", summary: "Phase 8 test character." }
    });
    const characterId = created.json().character.id;
    await app.inject({
      method: "POST",
      url: `/api/characters/${characterId}/constitutions`,
      payload: { body: "Preserve a clear synthetic identity.", changeReason: "Image loop test." }
    });
    await app.inject({
      method: "POST",
      url: `/api/characters/${characterId}/appearance`,
      payload: { body: "Matte black outfit, calm expression, soft daylight." }
    });
    const recipe = await app.inject({
      method: "POST",
      url: "/api/prompt-recipes/compose",
      payload: {
        characterId,
        platform: "Instagram",
        scene: "A composed editorial portrait in a quiet studio.",
        generationSettings: { aspectRatio: "4:5" }
      }
    });
    const recipeId = recipe.json().recipe.id;

    const generated = await app.inject({ method: "POST", url: `/api/prompt-recipes/${recipeId}/generate-image` });
    expect(generated.statusCode).toBe(201);
    const generatedBody = generated.json();
    expect(generatedBody.asset.status).toBe("raw_generation");
    expect(generatedBody.asset.file_path).toContain("assets/");
    expect(generatedBody.providerJob.status).toBe("completed");

    const file = await app.inject({ method: "GET", url: `/api/assets/${generatedBody.asset.id}/file` });
    expect(file.statusCode).toBe(200);
    expect(file.headers["content-type"]).toContain("image/svg+xml");

    const analyzed = await app.inject({ method: "POST", url: `/api/assets/${generatedBody.asset.id}/analyze` });
    expect(analyzed.statusCode).toBe(201);
    const analyzedBody = analyzed.json();
    expect(analyzedBody.asset.status).toBe("candidate");
    expect(analyzedBody.analysis.identity_match).toBe("strong");
    expect(analyzedBody.analysis.identity_score).toBeGreaterThan(0);
    expect(analyzedBody.analysis.platform_fit).toContain("Instagram");

    const reviewed = await app.inject({
      method: "POST",
      url: `/api/assets/${generatedBody.asset.id}/review`,
      payload: { status: "approved_post_asset", reason: "Ready for draft packaging." }
    });
    expect(reviewed.statusCode).toBe(200);
    expect(reviewed.json().asset.status).toBe("approved_post_asset");

    const runDetail = await app.inject({ method: "GET", url: `/api/runs/${generatedBody.run.id}` });
    const detail = runDetail.json();
    expect(detail.events.map((event: { type: string }) => event.type)).toContain("image.generated");
    expect(detail.events.map((event: { type: string }) => event.type)).toContain("human.approved");
    expect(detail.decisions.map((decision: { decision: string }) => decision.decision)).toContain("asset.approved_post_asset");

    await app.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("blocks uncertain image routing before provider spend", async () => {
    const dir = mkdtempSync(join(tmpdir(), "vas-api-"));
    const app = buildApp(testConfig(dir));
    const created = await app.inject({ method: "POST", url: "/api/characters", payload: { name: "Routing Gate", summary: "Routing test." } });
    const characterId = created.json().character.id;
    await app.inject({
      method: "POST",
      url: `/api/characters/${characterId}/constitutions`,
      payload: { body: "Never route blocked content around provider policy.", changeReason: "Routing test." }
    });
    await app.inject({
      method: "POST",
      url: `/api/characters/${characterId}/appearance`,
      payload: { body: "Standard editorial identity." }
    });
    const recipe = await app.inject({
      method: "POST",
      url: "/api/prompt-recipes/compose",
      payload: {
        characterId,
        platform: "Instagram",
        scene: "underage sexual content",
        generationSettings: { aspectRatio: "4:5" }
      }
    });

    const generated = await app.inject({
      method: "POST",
      url: `/api/prompt-recipes/${recipe.json().recipe.id}/generate-image`,
      payload: { providerOverride: "comfyui-cloud", overrideReason: "operator test" }
    });
    expect(generated.statusCode).toBe(202);
    expect(generated.json().run.status).toBe("needs_review");
    const detail = await app.inject({ method: "GET", url: `/api/runs/${generated.json().run.id}` });
    expect(detail.json().events.map((event: { type: string }) => event.type)).toContain("routing.blocked");
    expect(detail.json().providerJobs).toHaveLength(0);

    await app.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("creates draft variants, exports a package, and records manual publishing", async () => {
    const dir = mkdtempSync(join(tmpdir(), "vas-api-"));
    const app = buildApp(testConfig(dir));
    const created = await app.inject({
      method: "POST",
      url: "/api/characters",
      payload: { name: "Draft Loop", summary: "Phase 9 test character." }
    });
    const characterId = created.json().character.id;
    await app.inject({
      method: "POST",
      url: `/api/characters/${characterId}/constitutions`,
      payload: { body: "Keep social posts transparent and identity-consistent.", changeReason: "Draft loop test." }
    });
    await app.inject({
      method: "POST",
      url: `/api/characters/${characterId}/appearance`,
      payload: { body: "Editorial studio look with soft daylight." }
    });
    const recipe = await app.inject({
      method: "POST",
      url: "/api/prompt-recipes/compose",
      payload: { characterId, platform: "Instagram", scene: "A ready-to-post studio portrait." }
    });
    const generated = await app.inject({ method: "POST", url: `/api/prompt-recipes/${recipe.json().recipe.id}/generate-image` });
    const assetId = generated.json().asset.id;
    await app.inject({ method: "POST", url: `/api/assets/${assetId}/analyze` });
    await app.inject({ method: "POST", url: `/api/assets/${assetId}/review`, payload: { status: "approved_post_asset" } });

    const draftResponse = await app.inject({ method: "POST", url: `/api/assets/${assetId}/create-draft` });
    expect(draftResponse.statusCode).toBe(201);
    const draft = draftResponse.json().draft;
    expect(draft.status).toBe("needs_review");
    expect(draft.variants).toHaveLength(4);
    const instagram = draft.variants.find((variant: { platform: string }) => variant.platform === "instagram");
    expect(instagram.disclosure_text).toContain("AI-generated");

    const edited = await app.inject({
      method: "PATCH",
      url: `/api/platform-variants/${instagram.id}`,
      payload: {
        caption: "Edited Instagram caption.",
        hashtags: "#edited #syntheticmedia",
        ai_generated_flag: 1,
        paid_partnership_flag: 0,
        brand_content_flag: 0,
        status: "ready"
      }
    });
    expect(edited.statusCode).toBe(200);
    expect(edited.json().variant.caption).toBe("Edited Instagram caption.");

    const exported = await app.inject({ method: "POST", url: `/api/drafts/${draft.id}/export` });
    expect(exported.statusCode).toBe(201);
    expect(exported.json().package.files).toContain("caption_instagram.txt");
    expect(exported.json().package.files).toContain("metadata.json");
    expect(exported.json().draft.status).toBe("exported");

    const published = await app.inject({
      method: "POST",
      url: `/api/drafts/${draft.id}/publish`,
      payload: { platform: "instagram", liveUrl: "https://example.com/post/1", notes: "Published manually." }
    });
    expect(published.statusCode).toBe(200);
    expect(published.json().draft.status).toBe("published");
    expect(published.json().event.live_url).toBe("https://example.com/post/1");

    const ledger = await app.inject({ method: "GET", url: "/api/publishing-events" });
    expect(ledger.json().events.map((event: { draft_id: string }) => event.draft_id)).toContain(draft.id);

    await app.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("logs social feedback, runs reflection, and approves identity proposals", async () => {
    const dir = mkdtempSync(join(tmpdir(), "vas-api-"));
    const app = buildApp(testConfig(dir));
    const created = await app.inject({ method: "POST", url: "/api/characters", payload: { name: "Reflection Loop", summary: "Phase 10 test character." } });
    const characterId = created.json().character.id;
    await app.inject({ method: "POST", url: `/api/characters/${characterId}/constitutions`, payload: { body: "Keep feedback changes review-gated.", changeReason: "Reflection test." } });
    await app.inject({ method: "POST", url: `/api/characters/${characterId}/appearance`, payload: { body: "Editorial daylight look." } });
    const recipe = await app.inject({ method: "POST", url: "/api/prompt-recipes/compose", payload: { characterId, platform: "Instagram", scene: "Feedback-ready portrait." } });
    const generated = await app.inject({ method: "POST", url: `/api/prompt-recipes/${recipe.json().recipe.id}/generate-image` });
    const assetId = generated.json().asset.id;
    await app.inject({ method: "POST", url: `/api/assets/${assetId}/analyze` });
    await app.inject({ method: "POST", url: `/api/assets/${assetId}/review`, payload: { status: "approved_post_asset" } });
    const draft = await app.inject({ method: "POST", url: `/api/assets/${assetId}/create-draft` });
    const draftId = draft.json().draft.id;
    const published = await app.inject({ method: "POST", url: `/api/drafts/${draftId}/publish`, payload: { platform: "instagram", liveUrl: "https://example.com/reflection" } });
    const eventId = published.json().event.id;

    const feedback = await app.inject({
      method: "POST",
      url: `/api/publishing-events/${eventId}/feedback`,
      payload: {
        impressions: 1200,
        reach: 900,
        likes: 80,
        comments: 12,
        shares: 7,
        saves: 18,
        profileVisits: 20,
        followsGained: 4,
        qualitativeNotes: "Audience liked the transparent studio-process framing.",
        topComments: "Love the process; feels consistent.",
        operatorJudgment: "On-character and worth repeating."
      }
    });
    expect(feedback.statusCode).toBe(201);

    const reflection = await app.inject({ method: "POST", url: `/api/feedback/${feedback.json().feedback.id}/reflection-run` });
    expect(reflection.statusCode).toBe(201);
    expect(reflection.json().reflection.summary).toContain("engagement");
    expect(reflection.json().proposals.map((proposal: { kind: string }) => proposal.kind)).toContain("memory");
    const memoryProposal = reflection.json().proposals.find((proposal: { kind: string }) => proposal.kind === "memory");

    const approved = await app.inject({ method: "POST", url: `/api/identity-proposals/${memoryProposal.id}/review`, payload: { status: "approved" } });
    expect(approved.statusCode).toBe(200);
    expect(approved.json().proposal.status).toBe("approved");

    const profile = await app.inject({ method: "GET", url: `/api/characters/${characterId}` });
    expect(profile.json().character.feedback).toHaveLength(1);
    expect(profile.json().character.reflections).toHaveLength(1);
    expect(profile.json().character.memory.map((item: { source_type: string }) => item.source_type)).toContain("feedback");

    await app.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("updates automation settings and runs supervised daily automation", async () => {
    const dir = mkdtempSync(join(tmpdir(), "vas-api-"));
    const app = buildApp(testConfig(dir));
    const created = await app.inject({
      method: "POST",
      url: "/api/characters",
      payload: { name: "Automation Loop", summary: "Phase 11 test character." }
    });
    const characterId = created.json().character.id;
    await app.inject({
      method: "POST",
      url: `/api/characters/${characterId}/constitutions`,
      payload: { body: "Never publish automatically and preserve identity review gates.", changeReason: "Automation test." }
    });
    await app.inject({
      method: "POST",
      url: `/api/characters/${characterId}/appearance`,
      payload: { body: "Editorial studio look with clear visual continuity." }
    });

    const settings = await app.inject({
      method: "PATCH",
      url: "/api/settings/automation",
      payload: {
        enableDailyActivityRuns: true,
        dailyRunTime: "09:30",
        defaultCharacterIds: [characterId],
        defaultPlatforms: ["Instagram", "Threads"],
        defaultImageProvider: "mock",
        defaultAnalysisProvider: "mock",
        maxImagesPerRun: 1,
        requireReviewBeforeDraft: true,
        autoSelectTopActivity: true
      }
    });
    expect(settings.statusCode).toBe(200);
    expect(settings.json().settings.enableDailyActivityRuns).toBe(true);
    expect(settings.json().status.nextRunAt).toBeTruthy();

    const manual = await app.inject({
      method: "POST",
      url: "/api/automation/daily-runs",
      payload: { characterId, autoSelectTopActivity: true, requireReviewBeforeDraft: true, maxImagesPerRun: 1 }
    });
    expect(manual.statusCode).toBe(201);
    expect(manual.json().run.status).toBe("needs_review");
    expect(manual.json().selectedCandidate.id).toBeTruthy();
    expect(manual.json().promptRecipe.id).toBeTruthy();
    expect(manual.json().assets).toHaveLength(1);
    expect(manual.json().draft).toBeNull();
    const eventTypes = manual.json().events.map((event: { type: string }) => event.type);
    expect(eventTypes).toContain("automation.step");
    expect(eventTypes).toContain("automation.decision");
    expect(eventTypes).toContain("image.generated");
    expect(eventTypes).toContain("image.analyzed");
    expect(eventTypes).toContain("review.required");

    const status = await app.inject({ method: "GET", url: "/api/automation/status" });
    expect(status.statusCode).toBe(200);
    expect(status.json().status.runsNeedingReview.map((run: { id: string }) => run.id)).toContain(manual.json().run.id);

    await app.close();
    rmSync(dir, { recursive: true, force: true });
  });
});
