import type { AppDatabase } from "../db/database";
import { getCharacterDetail } from "../db/repositories";
import { RunService } from "../runs/runService";

export function startCharacterBirthRun(db: AppDatabase, runService: RunService, characterId: string) {
  const character = getCharacterDetail(db, characterId);
  if (!character) {
    throw new Error(`Character not found: ${characterId}`);
  }

  const activeConstitution = character.constitutions.find((item) => item.is_active === 1) ?? character.constitutions[0];
  const appearance = character.appearanceProfiles[0];
  const voice = character.voiceGuides[0];
  const approvedReferences = character.referenceImages.filter((image) => image.status === "approved");

  const run = runService.createRun({
    characterId,
    type: "character_birth",
    title: `${character.name} Character Birth Run`
  });

  runService.updateRunStatus(run.id, "running");
  runService.appendRunEvent(run.id, "run.started", "Character birth workflow started.", { characterId });
  runService.appendRunEvent(run.id, "context.loaded", "Loaded constitution, appearance, voice, personas, canon, memory, and references.", {
    constitutionVersion: activeConstitution?.version ?? null,
    canonEntries: character.canon.length,
    memoryEntries: character.memory.length,
    platformPersonas: character.platformPersonas.map((persona) => persona.platform),
    approvedReferences: approvedReferences.length
  });

  runService.attachRunArtifact(run.id, "birth_summary", "Birth Summary", {
    character: {
      id: character.id,
      name: character.name,
      status: character.status,
      summary: character.summary
    },
    constitution: activeConstitution?.body ?? null,
    appearance: appearance?.body ?? null,
    voice: voice?.body ?? null,
    canon: character.canon.filter((entry) => entry.status === "approved").map((entry) => entry.title),
    memoryCount: character.memory.length,
    referenceCount: character.referenceImages.length
  });

  runService.attachRunArtifact(run.id, "prompt_core", "Initial Prompt Core", {
    identity: `${character.name}: ${character.summary ?? "Synthetic agency character."}`,
    constitution: activeConstitution?.body ?? "No active constitution yet.",
    appearanceBible: appearance?.body ?? "No appearance bible yet.",
    voiceGuide: voice?.body ?? "No voice guide yet.",
    platformPersonas: Object.fromEntries(character.platformPersonas.map((persona) => [persona.platform, persona.body])),
    referenceImages: approvedReferences.map((image) => ({
      id: image.id,
      path: image.file_path,
      status: image.status
    }))
  });

  runService.updateRunStatus(run.id, "needs_review");
  runService.appendRunEvent(run.id, "review.required", "Character birth artifacts are ready for human review.", {
    nextAction: "Review birth summary and prompt core."
  });
  runService.recordRunDecision(run.id, "needs_human_review", "Character birth requires human review before downstream generation.");

  return run;
}
