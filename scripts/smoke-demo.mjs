#!/usr/bin/env node

const apiBaseUrl = process.env.API_BASE_URL ?? "http://127.0.0.1:4317";

async function request(path, options = {}) {
  const init = { method: options.method ?? "GET", headers: {}, ...options };
  if (options.body !== undefined) {
    init.headers = { "content-type": "application/json", ...(options.headers ?? {}) };
    init.body = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
  }
  const response = await fetch(`${apiBaseUrl}${path}`, init);
  const text = await response.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { text };
  }
  if (!response.ok) {
    throw new Error(`${init.method} ${path} failed with ${response.status}: ${text}`);
  }
  return json;
}

async function main() {
  const health = await request("/health");
  console.log(`API: ${health.service} ${health.version} at ${apiBaseUrl}`);

  await request("/api/settings/providers", {
    method: "PATCH",
    body: {
      mockProviders: true,
      defaultImageGenerationProvider: "mock",
      defaultAnalysisProvider: "mock"
    }
  });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const created = await request("/api/characters", {
    method: "POST",
    body: {
      name: `Demo Character ${stamp}`,
      summary: "A mock-mode virtual creator used for the end-to-end MVP smoke demo."
    }
  });
  const characterId = created.character.id;

  await request(`/api/characters/${characterId}/constitutions`, {
    method: "POST",
    body: {
      body: "Stay visually consistent, disclose synthetic media, never publish automatically, and never mutate identity without review.",
      changeReason: "Smoke demo baseline."
    }
  });
  await request(`/api/characters/${characterId}/appearance`, {
    method: "POST",
    body: { body: "Editorial studio identity: black bob, white overshirt, graphite and teal palette, soft daylight." }
  });
  await request(`/api/characters/${characterId}/voice`, {
    method: "POST",
    body: { body: "Calm, concise, process-aware captions. Avoid claims of being a real human." }
  });
  await request(`/api/characters/${characterId}/personas`, {
    method: "POST",
    body: { platform: "Instagram", body: "Visual-first captions with explicit synthetic media disclosure." }
  });

  const birth = await request(`/api/characters/${characterId}/birth-run`, { method: "POST", body: {} });

  const automation = await request("/api/automation/daily-runs", {
    method: "POST",
    body: {
      characterId,
      autoSelectTopActivity: true,
      requireReviewBeforeDraft: false,
      maxImagesPerRun: 1
    }
  });
  const draftId = automation.draft?.id;
  if (!draftId) {
    throw new Error("Daily automation did not create a draft. Check run events for review gate details.");
  }

  const exported = await request(`/api/drafts/${draftId}/export`, { method: "POST", body: {} });
  const published = await request(`/api/drafts/${draftId}/publish`, {
    method: "POST",
    body: {
      platform: "instagram",
      liveUrl: "https://example.com/virtual-agency-demo",
      notes: "Smoke demo manual publish marker. No automatic posting occurred."
    }
  });

  const feedback = await request(`/api/publishing-events/${published.event.id}/feedback`, {
    method: "POST",
    body: {
      platform: "instagram",
      publishedUrl: "https://example.com/virtual-agency-demo",
      impressions: 1200,
      reach: 900,
      likes: 96,
      comments: 18,
      shares: 9,
      saves: 22,
      profileVisits: 24,
      followsGained: 5,
      qualitativeNotes: "Demo audience liked the transparent studio-process framing.",
      topComments: "Feels consistent and easy to understand.",
      operatorJudgment: "On-character; repeat process framing."
    }
  });

  const reflection = await request(`/api/feedback/${feedback.feedback.id}/reflection-run`, { method: "POST", body: {} });

  const summary = {
    characterId,
    birthRunId: birth.run.id,
    dailyRunId: automation.run.id,
    selectedActivityId: automation.selectedCandidate?.id,
    promptRecipeId: automation.promptRecipe?.id,
    assetIds: automation.assets.map((asset) => asset.id),
    draftId,
    exportPath: exported.package.export_path,
    publishingEventId: published.event.id,
    feedbackId: feedback.feedback.id,
    reflectionRunId: reflection.run.id,
    proposalKinds: reflection.proposals.map((proposal) => proposal.kind)
  };
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

