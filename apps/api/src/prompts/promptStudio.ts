import type { AppDatabase } from "../db/database";
import {
  getActivityCandidate,
  getCharacterDetail,
  getContentBrief,
  insertActivityCandidate,
  insertContentBrief,
  insertPromptRecipe,
  updateActivityCandidateStatus
} from "../db/repositories";
import { RunService } from "../runs/runService";

const activityTemplates = [
  ["Morning studio reset", "Preparing the studio before a shoot", "studio loft", "workday", "soft window light"],
  ["Leaving the office", "Stepping out after reviewing proofs", "downtown sidewalk", "transition", "motion blur and tote bag"],
  ["Coffee with a collaborator", "Meeting a creative partner to compare references", "quiet cafe", "social", "tabletop details"],
  ["Packing for LA", "Choosing travel pieces and prompt references", "bedroom floor", "travel", "open suitcase"],
  ["Gallery errand", "Collecting visual notes from a small exhibition", "local gallery", "research", "framed negative space"]
] as const;

export function generateActivityRun(db: AppDatabase, runService: RunService, characterId: string) {
  const character = getCharacterDetail(db, characterId);
  if (!character) throw new Error(`Character not found: ${characterId}`);
  const run = runService.createRun({ characterId, type: "daily_activity", title: `${character.name} Daily Activity Run` });
  runService.updateRunStatus(run.id, "running");
  runService.appendRunEvent(run.id, "run.started", "Daily activity generation started.", { characterId });
  runService.appendRunEvent(run.id, "context.loaded", "Loaded character identity context for activity scoring.", {
    constitution: character.constitutions[0]?.id ?? null,
    canon: character.canon.length,
    memory: character.memory.length,
    appearance: character.appearanceProfiles[0]?.id ?? null
  });
  const candidates = activityTemplates.map((template, index) => {
    const [title, description, locationFiction, activityType, visualMotif] = template;
    const candidate = insertActivityCandidate(db, {
      characterId,
      runId: run.id,
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
    runService.appendRunEvent(run.id, "activity.proposed", `Proposed activity: ${title}.`, {
      candidateId: candidate.id,
      scores: {
        identityFit: candidate.identity_fit_score,
        campaignFit: candidate.campaign_fit_score,
        freshness: candidate.freshness_score
      }
    });
    return candidate;
  });
  runService.attachRunArtifact(run.id, "activity_candidates", "Generated Activity Candidates", { candidates });
  runService.updateRunStatus(run.id, "needs_review");
  runService.appendRunEvent(run.id, "review.required", "Activity candidates are ready for selection.");
  return { run, candidates };
}

export function selectActivityCandidate(db: AppDatabase, runService: RunService, candidateId: string, status: "selected" | "rejected") {
  const candidate = updateActivityCandidateStatus(db, candidateId, status);
  if (candidate.run_id) {
    runService.appendRunEvent(
      candidate.run_id,
      status === "selected" ? "activity.selected" : "human.rejected",
      `${candidate.title} marked ${status}.`,
      { candidateId }
    );
  }
  return candidate;
}

export function createContentBriefFromInput(
  db: AppDatabase,
  runService: RunService,
  input: {
    characterId: string;
    activityCandidateId?: string | null;
    goal: string;
    platformTargets: string;
    contentPillar: string;
    visualDirection?: string;
    captionAngle?: string;
    disclosureFlags?: string;
    desiredOutputs?: string;
  }
) {
  const character = getCharacterDetail(db, input.characterId);
  if (!character) throw new Error(`Character not found: ${input.characterId}`);
  const candidate = input.activityCandidateId ? getActivityCandidate(db, input.activityCandidateId) : undefined;
  const run = runService.createRun({ characterId: input.characterId, type: "prompt_generation", title: `${character.name} Content Brief` });
  runService.updateRunStatus(run.id, "running");
  const brief = insertContentBrief(db, {
    characterId: input.characterId,
    runId: run.id,
    activityCandidateId: input.activityCandidateId ?? null,
    goal: input.goal,
    platformTargets: input.platformTargets,
    contentPillar: input.contentPillar,
    visualDirection: input.visualDirection || candidate?.visual_motif || "identity-consistent editorial scene",
    captionAngle: input.captionAngle || `A concise process-aware caption for ${candidate?.title ?? character.name}.`,
    disclosureFlags: input.disclosureFlags ?? "synthetic media disclosure",
    desiredOutputs: input.desiredOutputs ?? "1 image prompt, 3 caption variants",
    body: { source: "prompt_studio", candidate }
  });
  runService.appendRunEvent(run.id, "brief.created", `Content brief created for ${character.name}.`, { briefId: brief.id });
  runService.completeRun(run.id, "Content brief generation completed.");
  return brief;
}

export function composePromptRecipe(
  db: AppDatabase,
  runService: RunService,
  input: { characterId: string; contentBriefId?: string | null; platform: string; scene: string; generationSettings?: unknown }
) {
  const character = getCharacterDetail(db, input.characterId);
  if (!character) throw new Error(`Character not found: ${input.characterId}`);
  const constitution = character.constitutions.find((item) => item.is_active === 1) ?? character.constitutions[0];
  const appearance = character.appearanceProfiles[0];
  const brief = input.contentBriefId ? getContentBrief(db, input.contentBriefId) : undefined;
  const platformPersona = character.platformPersonas.find((persona) => persona.platform.toLowerCase() === input.platform.toLowerCase());
  const blocks = {
    characterCore: `${character.name}: ${character.summary ?? "Synthetic creator in Virtual Agency Studio."}`,
    constitution: constitution?.body ?? "No active constitution.",
    appearance: appearance?.body ?? "No appearance bible.",
    scene: input.scene,
    platform: platformPersona?.body ?? `${input.platform} platform persona.`,
    campaign: brief?.goal ?? "No campaign goal.",
    negativePrompt: "identity drift, inconsistent face, undisclosed real-world claims, low-quality hands, extra limbs"
  };
  const finalPrompt = [
    `CHARACTER CORE\n${blocks.characterCore}`,
    `CONSTITUTION\n${blocks.constitution}`,
    `APPEARANCE BIBLE\n${blocks.appearance}`,
    `SCENE\n${blocks.scene}`,
    `PLATFORM\n${blocks.platform}`,
    `CAMPAIGN\n${blocks.campaign}`
  ].join("\n\n");
  const run = runService.createRun({ characterId: input.characterId, type: "prompt_generation", title: `${character.name} Prompt Recipe` });
  runService.updateRunStatus(run.id, "running");
  const recipe = insertPromptRecipe(db, {
    characterId: input.characterId,
    runId: run.id,
    contentBriefId: input.contentBriefId ?? null,
    constitutionVersionId: constitution?.id ?? null,
    appearanceProfileId: appearance?.id ?? null,
    finalPrompt,
    negativePrompt: blocks.negativePrompt,
    recipe: { blocks, lineage: { constitutionVersionId: constitution?.id, appearanceProfileId: appearance?.id, contentBriefId: input.contentBriefId }, generationSettings: input.generationSettings ?? {} }
  });
  runService.appendRunEvent(run.id, "prompt.generated", "Prompt recipe composed from character identity and brief.", {
    promptRecipeId: recipe.id,
    constitutionVersionId: constitution?.id ?? null,
    appearanceProfileId: appearance?.id ?? null
  });
  runService.attachRunArtifact(run.id, "prompt_recipe", "Prompt Recipe", { recipeId: recipe.id, finalPrompt, negativePrompt: blocks.negativePrompt });
  runService.completeRun(run.id, "Prompt recipe composition completed.");
  return recipe;
}
