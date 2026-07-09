import { describe, expect, it } from "vitest";
import {
  agencyFacingPackageTitle,
  agencyFacingStagePresentation,
  apiBaseUrl,
  buildAudienceDebriefModels,
  buildBookingDeskModel,
  buildDirectorDeskModel,
  buildNewFaceDossier,
  buildReviewDecisionPackets,
  buildRosterLanes,
  buildStudioOpsModel,
  buildStrategyBoardModel,
  buildTalentCareerSummary,
  readAssetRouteState,
  readCalendarRouteState,
  readCharacterRouteState,
  readDraftRouteState,
  readFeedbackRouteState,
  readReviewRouteState,
  safeAssetAltText,
  supportNavPaths,
  workModeModel,
  workflowStageModel
} from "./App";

describe("web app config", () => {
  it("uses the local API by default", () => {
    expect(apiBaseUrl()).toBe("http://127.0.0.1:4317");
  });

  it("keeps the work mode model in agency workflow order", () => {
    expect(workModeModel.map((mode) => [mode.id, mode.path])).toEqual([
      ["command", "/"],
      ["talent", "/talent"],
      ["create", "/create"],
      ["bookings", "/prompt-studio"],
      ["library", "/library"],
      ["review", "/review"],
      ["calendar", "/calendar"],
      ["insights", "/insights"],
      ["settings", "/settings"],
      ["help", "/help"]
    ]);
  });

  it("keeps workflow stages mapped to user-facing work modes", () => {
    expect(workflowStageModel.map((stage) => [stage.id, stage.path])).toEqual([
      ["heartbeat", "/"],
      ["birth", "/create"],
      ["production", "/library"],
      ["review", "/review"],
      ["publishing", "/calendar"],
      ["feedback", "/insights"]
    ]);
  });

  it("keeps help outside the core workflow stage model", () => {
    expect(workflowStageModel.map((stage) => stage.path)).not.toContain("/help");
    expect(supportNavPaths).toContain("/help");
  });

  it("cleans generated asset alt text before it reaches agency-facing surfaces", () => {
    expect(safeAssetAltText("Mock alt text for asset_b230c06e-47a1-479f-b3a7-2b49f395060d.", "Portfolio shot")).toBe("Portfolio shot");
    expect(safeAssetAltText("Editorial shot for asset_b230c06e.", "Portfolio shot")).toBe("Editorial shot");
    expect(safeAssetAltText("Editorial morning scene", "Portfolio shot")).toBe("Editorial morning scene");
  });

  it("keeps generated package names and workflow handoffs agency-facing", () => {
    expect(agencyFacingPackageTitle("Post package for 6d41929f", "Lena Vale")).toBe("Lena Vale placement");
    expect(agencyFacingPackageTitle("Summer gallery story", "Lena Vale")).toBe("Summer gallery story");
    expect(agencyFacingStagePresentation("birth", "Birth Run output needs operator review", "Review Birth Run", "/runs?type=character_birth")).toEqual({
      detail: "Birth Dossier needs operator review",
      primaryActionLabel: "Review Birth Dossier",
      primaryActionPath: "/create"
    });
    expect(agencyFacingStagePresentation("review", "23 runs need review", "Review runs", "/runs?status=needs_review")).toEqual({
      detail: "23 runs need review",
      primaryActionLabel: "Review Decisions",
      primaryActionPath: "/review"
    });
    expect(agencyFacingStagePresentation("feedback", "1 published event need response logging", "Log feedback", "/feedback?eventId=event_1")).toEqual({
      detail: "1 published event needs response logging",
      primaryActionLabel: "Log Audience Response",
      primaryActionPath: "/insights?eventId=event_1"
    });
  });

  it("translates home data into a director-facing desk model", () => {
    const timestamp = "2026-07-08T12:00:00.000Z";
    const model = buildDirectorDeskModel({
      health: {
        ok: true,
        service: "virtual-agency-api",
        version: "test",
        timestamp,
        dataDir: "/tmp/vas"
      },
      characters: [
        {
          id: "char_lena",
          name: "Lena Vale",
          status: "idea",
          summary: "Editorial synthetic talent.",
          created_at: timestamp,
          updated_at: timestamp
        }
      ],
      runs: [
        {
          id: "run_birth_gate",
          character_id: "char_lena",
          type: "character_birth",
          status: "needs_review",
          title: "Birth gate",
          error: null,
          created_at: timestamp,
          updated_at: timestamp
        },
        {
          id: "run_daily_booking",
          character_id: "char_lena",
          type: "daily_activity",
          status: "running",
          title: "Daily booking",
          error: null,
          created_at: timestamp,
          updated_at: timestamp
        }
      ],
      automationStatus: {
        schedulerEnabled: true,
        nextRunAt: "2026-07-08T17:30:00.000Z",
        lastSchedulerCheckAt: timestamp,
        lastTriggeredAt: timestamp,
        currentlyRunning: null,
        runsNeedingReview: [],
        settings: {
          enableDailyActivityRuns: true,
          dailyRunTime: "09:30",
          defaultCharacterIds: ["char_lena"],
          defaultPlatforms: ["Instagram"],
          defaultImageProvider: "mock",
          defaultAnalysisProvider: "mock",
          maxImagesPerRun: 1,
          requireReviewBeforeDraft: true,
          autoSelectTopActivity: true
        }
      },
      workflowSummary: [
        {
          id: "review",
          label: "Review",
          path: "/drafts",
          status: "attention",
          count: 3,
          detail: "1 drafts, 1 runs, 1 identity proposals",
          primaryActionLabel: "Review drafts",
          primaryActionPath: "/drafts?status=needs_review"
        },
        {
          id: "production",
          label: "Production",
          path: "/assets",
          status: "attention",
          count: 2,
          detail: "2 assets need analysis or approval",
          primaryActionLabel: "Review assets",
          primaryActionPath: "/assets?status=candidate"
        },
        {
          id: "publishing",
          label: "Publishing",
          path: "/calendar",
          status: "attention",
          count: 2,
          detail: "2 approved/exported drafts need manual publishing",
          primaryActionLabel: "Open ledger",
          primaryActionPath: "/calendar?bucket=draft_ready"
        },
        {
          id: "feedback",
          label: "Feedback",
          path: "/feedback",
          status: "attention",
          count: 1,
          detail: "1 published event needs response logging",
          primaryActionLabel: "Log feedback",
          primaryActionPath: "/feedback?eventId=event_123"
        }
      ]
    });

    expect(model.primaryAction.label).toBe("Review Today's Decisions");
    expect(model.primaryAction.path).toBe("/review");
    expect(model.todayDecisions.map((item) => item.title)).toEqual(expect.arrayContaining([
      "talent items need approval",
      "social packages need approval",
      "social packages ready for publishing",
      "audience responses need debrief",
      "career direction proposals waiting",
      "portfolio candidates need review"
    ]));
    expect(model.audienceSignals[0].path).toBe("/insights?eventId=event_123");
    expect(model.studioOpsHealth.summary).toBe("Studio Ops: healthy");

    const visibleDeskText = [
      ...model.todayDecisions,
      ...model.starWatch,
      ...model.todaysBookings,
      ...model.audienceSignals,
      ...model.publishingFollowUp
    ].flatMap((item) => [item.title, item.detail, item.actionLabel, String(item.count ?? "")]).join(" ");
    expect(visibleDeskText).not.toMatch(/run_/i);
    expect(visibleDeskText).not.toMatch(/provider/i);
  });

  it("derives roster lanes and talent career summaries from existing records", () => {
    const timestamp = "2026-07-08T12:00:00.000Z";
    const characters = [
      {
        id: "char_new_face",
        name: "Inez Vale",
        status: "idea",
        summary: "Soft editorial identity.",
        created_at: timestamp,
        updated_at: timestamp
      },
      {
        id: "char_rising",
        name: "Mara Sol",
        status: "feedback_logged",
        summary: "Process-led visual storyteller.",
        created_at: timestamp,
        updated_at: timestamp
      }
    ];
    const lanes = buildRosterLanes(characters, [
      {
        id: "run_birth",
        character_id: "char_rising",
        type: "character_birth",
        status: "completed",
        title: "Birth",
        error: null,
        created_at: timestamp,
        updated_at: timestamp
      },
      {
        id: "run_work",
        character_id: "char_rising",
        type: "daily_activity",
        status: "completed",
        title: "Daily work",
        error: null,
        created_at: timestamp,
        updated_at: timestamp
      }
    ]);

    expect(lanes.find((lane) => lane.id === "new_face")?.talent.map((item) => item.displayName)).toContain("Inez Vale");
    expect(lanes.find((lane) => lane.id === "rising_talent")?.talent.map((item) => item.displayName)).toContain("Mara Sol");

    const detailed = buildTalentCareerSummary({
      ...characters[1],
      constitutions: [{ id: "const_1", version: 1, body: "Keep public story consistent.", change_reason: null, is_active: 1, created_at: timestamp }],
      canon: [],
      memory: [],
      appearanceProfiles: [{ id: "appearance_1", body: "Editorial studio look.", created_at: timestamp }],
      voiceGuides: [{ id: "voice_1", body: "Measured captions.", created_at: timestamp }],
      platformPersonas: [{ id: "persona_1", platform: "Instagram", body: "Visual process notes." }],
      referenceImages: [],
      recentRuns: [],
      feedback: [{
        id: "feedback_1",
        draft_id: "draft_1",
        platform: "Instagram",
        published_url: "https://example.com/post",
        impressions: 1200,
        reach: 900,
        likes: 80,
        comments: 12,
        shares: 7,
        saves: 18,
        profile_visits: 20,
        follows_gained: 4,
        qualitative_notes: "Audience liked the consistent process framing.",
        top_comments: "Love the process.",
        operator_judgment: "Strong, on-character, worth repeating."
      }],
      reflections: [],
      identityProposals: [{ id: "proposal_1", kind: "memory", body: "Repeat process framing.", rationale: "Audience pull.", risk_level: "low", status: "proposed" }]
    });

    expect(detailed.stage).toBe("rising_talent");
    expect(detailed.agencyPriority).toBe("push");
    expect(detailed.bestPlatform).toBe("Instagram");
    expect(detailed.nextRecommendedMove).toBe("Review Career Direction");
    expect(detailed.latestAudienceSignal).not.toMatch(/run_|provider|prompt recipe/i);
  });

  it("builds Audience Debriefs from public response and career-direction proposals", () => {
    const timestamp = "2026-07-08T12:00:00.000Z";
    const debriefs = buildAudienceDebriefModels([
      {
        id: "char_audience",
        name: "Mara Sol",
        status: "feedback_logged",
        summary: "Process-led visual storyteller.",
        created_at: timestamp,
        updated_at: timestamp,
        constitutions: [],
        canon: [],
        memory: [],
        appearanceProfiles: [{ id: "appearance_1", body: "Calm studio process look.", created_at: timestamp }],
        voiceGuides: [{ id: "voice_1", body: "Measured captions.", created_at: timestamp }],
        platformPersonas: [{ id: "persona_1", platform: "Instagram", body: "Visual process notes." }],
        referenceImages: [],
        recentRuns: [],
        feedback: [{
          id: "feedback_strong",
          draft_id: "draft_1",
          publishing_event_id: "event_1",
          character_id: "char_audience",
          platform: "Instagram",
          published_url: "https://example.com/post",
          impressions: 1500,
          reach: 1000,
          likes: 92,
          comments: 14,
          shares: 8,
          saves: 22,
          profile_visits: 31,
          follows_gained: 5,
          qualitative_notes: "Audience loved the calm studio-process framing.",
          top_comments: "Love the process.; Saved this for later.",
          operator_judgment: "Strong, on-character, worth repeating.",
          feedback: { source: "manual_operator_entry" },
          created_at: timestamp,
          updated_at: timestamp
        }],
        reflections: [{
          id: "reflection_1",
          character_id: "char_audience",
          run_id: "run_reflection_1",
          draft_id: "draft_1",
          social_feedback_id: "feedback_strong",
          summary: "13.6% engagement signal on Instagram",
          body: [
            "Worked: Calm process framing gave the post save value.",
            "Off-character: No major off-character signal was logged by the operator.",
            "Repeat: Repeat the morning ritual framing.",
            "Avoid: Avoid changing core identity traits based on one post.",
            "Next: Create a saveable behind-the-scenes ritual."
          ].join("\n"),
          reflection: {
            whatWorked: "Mock analysis: Calm process framing gave the post save value.",
            offCharacter: "No major off-character signal was logged by the operator.",
            repeat: "Repeat the morning ritual framing.",
            avoid: "Avoid changing core identity traits based on one post.",
            suggestedNextActivity: "Create a saveable behind-the-scenes ritual.",
            proposedMemory: "Mara learned that audience response favored calm studio-process framing."
          },
          created_at: timestamp,
          updated_at: timestamp
        }],
        identityProposals: [{
          id: "proposal_memory",
          character_id: "char_audience",
          run_id: "run_reflection_1",
          kind: "memory",
          body: "Repeat calm studio-process framing when saves are strong.",
          rationale: "Saves and follows were above baseline.",
          source_run_id: "run_reflection_1",
          source_reflection_id: "reflection_1",
          risk_level: "low",
          status: "proposed"
        }]
      }
    ]);

    expect(debriefs).toHaveLength(1);
    expect(debriefs[0].result.label).toBe("Strong");
    expect(debriefs[0].whatWorked.join(" ")).toContain("save value");
    expect(debriefs[0].whatWorked.join(" ")).not.toContain("Mock analysis");
    expect(debriefs[0].commentThemes.join(" ")).toContain("Saved this");
    expect(debriefs[0].recommendedNextTest).toBe("Create a saveable behind-the-scenes ritual.");
    expect(debriefs[0].careerDirection.actionLabel).toBe("Approve Memory Update");
    expect(debriefs[0].pendingProposals.map((proposal) => proposal.kind)).toEqual(["memory"]);

    const visibleDebriefText = [
      debriefs[0].talentName,
      debriefs[0].platform,
      debriefs[0].result.label,
      debriefs[0].summary,
      ...debriefs[0].whatWorked,
      ...debriefs[0].whatFailed,
      ...debriefs[0].commentThemes,
      debriefs[0].meaningForTalent,
      debriefs[0].recommendedNextTest,
      debriefs[0].careerDirection.label,
      debriefs[0].careerDirection.body,
      debriefs[0].careerDirection.rationale
    ].join(" ");
    expect(visibleDebriefText).not.toMatch(/feedback_|reflection_|proposal_|run_|draft_|provider|raw json/i);
    expect(JSON.stringify(debriefs[0].technicalAudit)).toContain("feedback_strong");
  });

  it("builds a Strategy / Star Board that makes winners and risks visible", () => {
    const timestamp = "2026-07-08T12:00:00.000Z";
    const feedback = (id: string, judgment: string) => ({
      id,
      draft_id: `${id}_draft`,
      publishing_event_id: `${id}_event`,
      character_id: "char_star",
      platform: "Instagram",
      published_url: "https://example.com/post",
      impressions: 1600,
      reach: 1000,
      likes: 95,
      comments: 12,
      shares: 8,
      saves: 24,
      profile_visits: 28,
      follows_gained: 5,
      qualitative_notes: "Audience liked the consistent process framing.",
      top_comments: "Love this series.",
      operator_judgment: judgment,
      created_at: timestamp,
      updated_at: timestamp
    });
    const board = buildStrategyBoardModel([
      {
        id: "char_star",
        name: "Mara Sol",
        status: "feedback_logged",
        summary: "Process-led visual storyteller.",
        created_at: timestamp,
        updated_at: timestamp,
        constitutions: [{ id: "const_1", version: 1, body: "Keep the public story consistent.", change_reason: null, is_active: 1, created_at: timestamp }],
        canon: [],
        memory: [],
        appearanceProfiles: [{ id: "appearance_1", body: "Calm process look.", created_at: timestamp }],
        voiceGuides: [{ id: "voice_1", body: "Measured captions.", created_at: timestamp }],
        platformPersonas: [{ id: "persona_1", platform: "Instagram", body: "Visual process notes." }],
        referenceImages: [],
        recentRuns: [],
        feedback: [
          feedback("feedback_star_1", "Strong, on-character, worth repeating."),
          feedback("feedback_star_2", "Strong positive response; repeat this direction."),
          feedback("feedback_star_3", "Audience loved this and saves were strong.")
        ],
        reflections: [{ id: "reflection_star", character_id: "char_star", run_id: "run_star", draft_id: "feedback_star_1_draft", social_feedback_id: "feedback_star_1", summary: "Strong signal", body: "Worked: repeat", reflection: {}, created_at: timestamp, updated_at: timestamp }],
        identityProposals: []
      },
      {
        id: "char_risk",
        name: "Noa Vale",
        status: "feedback_logged",
        summary: "City-walk fashion talent.",
        created_at: timestamp,
        updated_at: timestamp,
        constitutions: [],
        canon: [],
        memory: [],
        appearanceProfiles: [],
        voiceGuides: [],
        platformPersonas: [],
        referenceImages: [],
        recentRuns: [],
        feedback: [{
          ...feedback("feedback_risk", "Weak, off-character, pause this direction."),
          character_id: "char_risk",
          likes: 1,
          comments: 0,
          shares: 0,
          saves: 0,
          follows_gained: 0,
          qualitative_notes: "Audience found the post inconsistent."
        }],
        reflections: [],
        identityProposals: []
      },
      {
        id: "char_bet",
        name: "Inez Vale",
        status: "idea",
        summary: "Soft editorial identity.",
        created_at: timestamp,
        updated_at: timestamp,
        constitutions: [],
        canon: [],
        memory: [],
        appearanceProfiles: [],
        voiceGuides: [],
        platformPersonas: [],
        referenceImages: [],
        recentRuns: [],
        feedback: [],
        reflections: [],
        identityProposals: []
      }
    ]);

    expect(board.lanes.find((lane) => lane.id === "star_talent")?.talent.map((talent) => talent.displayName)).toContain("Mara Sol");
    expect(board.lanes.find((lane) => lane.id === "at_risk")?.talent.map((talent) => talent.displayName)).toContain("Noa Vale");
    expect(board.lanes.find((lane) => lane.id === "development_bets")?.talent.map((talent) => talent.displayName)).toContain("Inez Vale");
    expect(board.summary.pushCount).toBe(1);
    expect(board.summary.riskCount).toBe(1);

    const visibleStrategyText = board.lanes.flatMap((lane) => [
      lane.label,
      lane.detail,
      ...lane.talent.flatMap((talent) => [
        talent.displayName,
        talent.momentum,
        talent.audiencePull,
        talent.identityStrength,
        talent.platformFit,
        talent.developmentRisk,
        talent.recommendedInvestment,
        talent.nextMove,
        talent.latestSignal
      ])
    ]).join(" ");
    expect(visibleStrategyText).not.toMatch(/feedback_|reflection_|proposal_|run_|draft_|provider|raw json/i);
  });

  it("builds Studio Ops around production logs, providers, workflow engines, and audit state", () => {
    const timestamp = "2026-07-08T12:00:00.000Z";
    const automationSettings = {
      enableDailyActivityRuns: true,
      dailyRunTime: "09:30",
      defaultCharacterIds: ["char_ops"],
      defaultPlatforms: ["Instagram"],
      defaultImageProvider: "openai",
      defaultAnalysisProvider: "hermes",
      maxImagesPerRun: 2,
      requireReviewBeforeDraft: true,
      autoSelectTopActivity: true
    };
    const model = buildStudioOpsModel({
      data: {
        health: {
          ok: true,
          service: "virtual-agency-api",
          version: "test",
          timestamp,
          dataDir: "/tmp/vas"
        },
        characters: [
          {
            id: "char_ops",
            name: "Mira Vale",
            status: "approved",
            summary: "Quiet ritual and design-process talent.",
            created_at: timestamp,
            updated_at: timestamp
          }
        ],
        runs: [
          {
            id: "run_active",
            character_id: "char_ops",
            type: "daily_activity",
            status: "running",
            title: "Daily booking work",
            error: null,
            created_at: timestamp,
            updated_at: timestamp
          },
          {
            id: "run_review",
            character_id: "char_ops",
            type: "image_generation",
            status: "needs_review",
            title: "Candidate review gate",
            error: null,
            created_at: timestamp,
            updated_at: timestamp
          },
          {
            id: "run_failed",
            character_id: "char_ops",
            type: "image_generation",
            status: "failed",
            title: "Provider timeout",
            error: "Image provider timed out.",
            created_at: timestamp,
            updated_at: "2026-07-08T12:10:00.000Z"
          }
        ],
        automationStatus: {
          schedulerEnabled: true,
          nextRunAt: "2026-07-08T17:30:00.000Z",
          lastSchedulerCheckAt: timestamp,
          lastTriggeredAt: timestamp,
          currentlyRunning: null,
          runsNeedingReview: [
            {
              id: "run_review",
              character_id: "char_ops",
              type: "image_generation",
              status: "needs_review",
              title: "Candidate review gate",
              error: null,
              created_at: timestamp,
              updated_at: timestamp
            }
          ],
          settings: automationSettings
        },
        workflowSummary: []
      },
      settings: {
        mockProviders: false,
        defaultImageGenerationProvider: "openai",
        defaultAnalysisProvider: "hermes",
        hermesBaseUrl: "http://127.0.0.1:4000",
        hermesImageGenerationPath: "/images",
        hermesImageAnalysisPath: "/analysis",
        comfyuiCloudBaseUrl: "https://cloud.comfy.org",
        comfyuiCloudGenerationPath: "/api/prompt",
        openaiBaseUrl: "https://api.openai.com/v1",
        openaiImageModel: "gpt-image-1",
        openaiImageSize: "1024x1024",
        openaiImageQuality: "auto",
        openaiImageOutputFormat: "png",
        openaiImageModeration: "auto",
        wavespeedBaseUrl: "https://api.wavespeed.ai",
        wavespeedImageGenerationPath: "/api/v3/wavespeed-ai/flux-dev-ultra-fast",
        hasHermesApiKey: true,
        hasComfyuiCloudApiKey: true,
        hasActiveComfyuiCloudWorkflow: true,
        comfyuiCloudReady: true,
        hasOpenaiApiKey: true,
        hasWavespeedApiKey: false
      },
      automationSettings,
      automationStatus: {
        schedulerEnabled: true,
        nextRunAt: "2026-07-08T17:30:00.000Z",
        lastSchedulerCheckAt: timestamp,
        lastTriggeredAt: timestamp,
        currentlyRunning: null,
        runsNeedingReview: [],
        settings: automationSettings
      },
      workflows: [
        {
          id: "workflow_portrait",
          name: "Portrait API workflow",
          workflow: { nodes: [] },
          positive_prompt_node: "1",
          positive_prompt_input: "text",
          negative_prompt_node: "2",
          negative_prompt_input: "text",
          seed_node: "3",
          seed_input: "seed",
          reference_image_node: null,
          reference_image_input: null,
          output_node_ids: ["9"],
          default_for_tiers: ["sfw_standard"],
          status: "active",
          validation_error: null,
          updated_at: timestamp
        }
      ],
      promptRecipes: [
        {
          id: "prompt_recipe_ops",
          character_id: "char_ops",
          run_id: "run_review",
          content_brief_id: "brief_ops",
          final_prompt: "Editorial morning ritual scene.",
          negative_prompt: "identity drift",
          constitution_version_id: "const_ops",
          appearance_profile_id: "appearance_ops",
          created_at: timestamp
        }
      ],
      assets: [
        {
          id: "asset_ops",
          character_id: "char_ops",
          run_id: "run_review",
          prompt_recipe_id: "prompt_recipe_ops",
          file_path: "assets/asset_ops.png",
          kind: "image",
          status: "candidate",
          provider: "openai",
          original_prompt: "Editorial morning ritual scene.",
          negative_prompt: "identity drift",
          mime_type: "image/png",
          size_bytes: 2048,
          created_at: timestamp
        }
      ]
    });

    expect(model.primaryQuestion).toBe("What did the machine do, and is the studio configured correctly?");
    expect(model.tabs.map((tab) => [tab.id, tab.label])).toEqual([
      ["overview", "Overview"],
      ["logs", "Production Logs"],
      ["providers", "Providers"],
      ["workflows", "Workflow Engines"],
      ["automation", "Automation"],
      ["manual", "Console"],
      ["audit", "Technical Audit"]
    ]);
    expect(model.productionLogSummary).toMatchObject({
      total: 3,
      active: 1,
      review: 1,
      failed: 1
    });
    expect(model.productionLogSummary.latestFailure?.id).toBe("run_failed");
    expect(model.providerReadiness.find((provider) => provider.label === "ComfyUI Cloud")?.status).toBe("Ready");
    expect(model.technicalAudit.productionLogIds).toEqual(["run_active", "run_review", "run_failed"]);
    expect(model.technicalAudit.workflowIds).toEqual(["workflow_portrait"]);
    expect(model.technicalAudit.promptRecipeIds).toEqual(["prompt_recipe_ops"]);
    expect(model.technicalAudit.assetIds).toEqual(["asset_ops"]);

    const visibleOpsText = [
      model.headline,
      model.primaryQuestion,
      ...model.overviewCards.flatMap((card) => [card.label, String(card.value), card.detail]),
      ...model.tabs.flatMap((tab) => [tab.label, String(tab.value), tab.detail]),
      ...model.providerReadiness.flatMap((provider) => [provider.label, provider.status, provider.detail])
    ].join(" ");
    expect(visibleOpsText).toMatch(/Production Logs|Providers|Workflow Engines|Technical Audit/);
    expect(visibleOpsText).not.toMatch(/Director's Desk|Review Today/i);
  });

  it("builds a director-facing New Face Dossier from birth output", () => {
    const timestamp = "2026-07-08T12:00:00.000Z";
    const dossier = buildNewFaceDossier(
      {
        id: "char_new_face",
        name: "Noa Vale",
        status: "idea",
        summary: "A cinematic city-walk identity for short-form fashion audiences.",
        created_at: timestamp,
        updated_at: timestamp,
        constitutions: [{ id: "const_1", version: 1, body: "Public archetype: grounded aspirational friend.", change_reason: "Initial scouting.", is_active: 1, created_at: timestamp }],
        canon: [],
        memory: [],
        appearanceProfiles: [{ id: "appearance_1", body: "Night-market textures, tailored outerwear, soft flash.", created_at: timestamp }],
        voiceGuides: [{ id: "voice_1", body: "Warm, observant, slightly wry, never over-explaining.", created_at: timestamp }],
        platformPersonas: [{ id: "persona_1", platform: "TikTok", body: "Short walking edits with intimate captions." }],
        referenceImages: [{ id: "ref_1", file_path: "assets/ref.png", original_name: "ref.png", mime_type: "image/png", size_bytes: 1200, status: "approved" }],
        recentRuns: [{
          id: "run_birth_ready",
          character_id: "char_new_face",
          type: "character_birth",
          status: "needs_review",
          title: "Noa Vale Character Birth Run",
          error: null,
          created_at: timestamp,
          updated_at: timestamp
        }],
        feedback: [],
        reflections: [],
        identityProposals: []
      }
    );

    expect(dossier.stageLabel).toBe("Development");
    expect(dossier.directorDecision).toBe("Director decision needed");
    expect(dossier.productionLogPath).toBe("/runs/run_birth_ready");
    expect(dossier.steps.map((step) => step.label)).toContain("New Face Dossier");
    expect(dossier.recommendedFirstBooking).toBe("First portfolio test for TikTok");

    const visibleDossierText = [
      dossier.publicPromise,
      dossier.visualDirection,
      dossier.voiceInteriority,
      dossier.platformFit,
      dossier.developmentRisk,
      dossier.recommendedFirstBooking,
      dossier.directorDecision
    ].join(" ");
    expect(visibleDossierText).not.toMatch(/run_|provider|prompt recipe|raw artifacts/i);
  });

  it("builds a Booking Desk model around assignments instead of prompt recipes", () => {
    const timestamp = "2026-07-08T12:00:00.000Z";
    const booking = buildBookingDeskModel({
      character: {
        id: "char_booking",
        name: "Mira Vale",
        status: "approved",
        summary: "Quiet ritual and design-process talent.",
        created_at: timestamp,
        updated_at: timestamp
      },
      candidate: {
        id: "activity_1",
        character_id: "char_booking",
        title: "Café morning ritual",
        body: "Preparing notes before a client-facing creative day.",
        location_fiction: "corner cafe",
        activity_type: "process",
        visual_motif: "window light, notebook, espresso",
        platform_fit: "Instagram, Threads",
        identity_fit_score: 0.91,
        campaign_fit_score: 0.82,
        freshness_score: 0.78,
        status: "selected"
      },
      brief: {
        id: "brief_1",
        activity_candidate_id: "activity_1",
        goal: "Deepen morning ritual identity.",
        platform_targets: "Instagram",
        content_pillar: "process",
        visual_direction: "Window light, notebook, espresso.",
        caption_angle: "Show the process before the result.",
        desired_outputs: "Audience hypothesis: This booking tests whether Mira's audience saves quiet process rituals.\nImage prompt and caption variants"
      },
      recipe: {
        id: "prompt_recipe_1",
        character_id: "char_booking",
        run_id: "run_recipe_1",
        content_brief_id: "brief_1",
        final_prompt: "CHARACTER CORE\nMira\n\nSCENE\nWindow light, notebook, espresso.\n\nPLATFORM\nInstagram",
        negative_prompt: "identity drift",
        constitution_version_id: "const_1",
        appearance_profile_id: "appearance_1",
        created_at: timestamp
      },
      platform: "Instagram"
    });

    expect(booking.primaryActionLabel).toBe("Start Production");
    expect(booking.status).toBe("treatment_ready");
    expect(booking.audienceHypothesis).toBe("This booking tests whether Mira's audience saves quiet process rituals.");
    expect(booking.creativeTreatmentSummary).toContain("Window light");

    const visibleBookingText = [
      booking.title,
      booking.careerGoal,
      booking.bookingIdea,
      booking.shootBriefSummary,
      booking.creativeTreatmentSummary,
      booking.audienceHypothesis,
      booking.primaryActionLabel,
      booking.nextStep
    ].join(" ");
    expect(visibleBookingText).not.toMatch(/prompt recipe|provider|routing|workflow json|run_/i);
  });

  it("builds Review Desk decision packets without exposing technical sources by default", () => {
    const timestamp = "2026-07-08T12:00:00.000Z";
    const asset = {
      id: "asset_candidate",
      character_id: "char_review",
      run_id: "run_asset_source",
      prompt_recipe_id: "prompt_recipe_source",
      file_path: "assets/test.png",
      kind: "image",
      status: "candidate",
      provider: "mock",
      original_prompt: "RAW PROMPT SOURCE",
      negative_prompt: "identity drift",
      mime_type: "image/png",
      size_bytes: 2048,
      created_at: timestamp,
      latestAnalysis: {
        id: "analysis_1",
        provider: "mock",
        summary: "Strong editorial candidate.",
        identity_match: "Strong",
        identity_score: 0.91,
        quality_score: 0.88,
        story_fit_score: 0.84,
        platform_fit: ["Instagram"],
        quality_issues: [],
        identity_notes: "Looks consistent with the current identity.",
        suggested_prompt_fixes: [],
        alt_text: "Editorial portrait",
        recommended_action: "approve_for_draft"
      }
    };
    const packets = buildReviewDecisionPackets({
      characters: [
        {
          id: "char_review",
          name: "Selene Hart",
          status: "feedback_logged",
          summary: "Quiet fashion process talent.",
          created_at: timestamp,
          updated_at: timestamp,
          constitutions: [],
          canon: [],
          memory: [],
          appearanceProfiles: [],
          voiceGuides: [],
          platformPersonas: [],
          referenceImages: [],
          recentRuns: [],
          feedback: [],
          reflections: [],
          identityProposals: [
            {
              id: "proposal_memory",
              character_id: "char_review",
              kind: "memory",
              body: "Repeat calm morning ritual scenes when saves are strong.",
              rationale: "Saves and comments were above baseline.",
              risk_level: "low",
              status: "proposed"
            }
          ]
        }
      ],
      assets: [asset],
      drafts: [
        {
          id: "draft_social",
          character_id: "char_review",
          run_id: "run_draft_source",
          content_brief_id: "brief_source",
          prompt_recipe_id: "prompt_recipe_source",
          asset_id: "asset_candidate",
          status: "needs_review",
          title: "Café Morning Series",
          body: "Caption body",
          summary: "Image and caption are ready for review.",
          created_at: timestamp,
          asset,
          variants: [
            {
              id: "variant_instagram",
              draft_id: "draft_social",
              platform: "instagram",
              post_format: "feed",
              caption: "A quiet morning ritual before the creative day begins with notes and coffee.",
              hashtags: "#morningritual",
              alt_text: "Editorial morning scene",
              disclosure_text: "AI-generated image.",
              ai_generated_flag: 1,
              paid_partnership_flag: 0,
              brand_content_flag: 0,
              notes: "Ready for final caption review.",
              status: "draft"
            }
          ],
          packages: [],
          publishingEvents: []
        }
      ],
      runs: [
        {
          id: "run_studio_attention",
          character_id: "char_review",
          type: "image_generation",
          status: "needs_review",
          title: "Provider failed before candidates",
          error: "Image provider timed out",
          created_at: timestamp,
          updated_at: timestamp
        }
      ]
    });

    expect(packets.map((packet) => packet.type)).toEqual([
      "social_package",
      "portfolio_candidate",
      "career_direction",
      "studio_attention"
    ]);
    expect(packets.every((packet) => packet.recommendation && packet.consequence && packet.why.length > 0)).toBe(true);
    expect(packets.find((packet) => packet.type === "social_package")?.primaryActionLabel).toBe("Approve Package");
    expect(packets.find((packet) => packet.type === "portfolio_candidate")?.secondaryActionLabels).toContain("Request Revision");
    expect(packets.find((packet) => packet.type === "career_direction")?.primaryActionLabel).toBe("Approve Career Update");

    const visibleReviewText = packets.flatMap((packet) => [
      packet.title,
      packet.talentName,
      packet.statusLabel,
      packet.summary,
      packet.recommendation,
      packet.risk,
      packet.consequence,
      packet.previewAlt,
      packet.primaryActionLabel,
      ...packet.secondaryActionLabels,
      ...packet.why
    ]).join(" ");
    expect(visibleReviewText).not.toMatch(/asset_|draft_|proposal_|run_|provider|route tier|raw json|RAW PROMPT SOURCE/i);
    expect(JSON.stringify(packets[0].technicalAudit)).toContain("draft_social");
  });

  it("reads workflow continuity query params", () => {
    expect(readCharacterRouteState("?selected=char_123")).toEqual({ selected: "char_123" });
    expect(readAssetRouteState("?characterId=char_123&status=candidate&platformFit=Instagram")).toEqual({
      characterId: "char_123",
      status: "candidate",
      platformFit: "Instagram"
    });
    expect(readDraftRouteState("?status=needs_review")).toEqual({ status: "needs_review" });
    expect(readCalendarRouteState("?bucket=needs_feedback")).toEqual({ bucket: "needs_feedback" });
    expect(readFeedbackRouteState("?eventId=publish_event_123")).toEqual({ eventId: "publish_event_123" });
    expect(readReviewRouteState("?type=career_direction")).toEqual({ type: "career_direction" });
    expect(readReviewRouteState("?type=unknown")).toEqual({ type: "all" });
  });
});
