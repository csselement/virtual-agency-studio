import type { AppDatabase } from "../db/database";
import {
  getCharacterDetail,
  getDraft,
  getIdentityProposal,
  getPublishingEvent,
  getSocialFeedback,
  insertCanonEntry,
  insertConstitutionVersion,
  insertIdentityProposal,
  insertMemoryEntry,
  insertReflection,
  insertSocialFeedback,
  updateIdentityProposalStatus
} from "../db/repositories";
import { RunService } from "../runs/runService";

function engagementRate(feedback: { likes: number; comments: number; shares: number; saves: number; reach: number }) {
  const total = feedback.likes + feedback.comments + feedback.shares + feedback.saves;
  return feedback.reach > 0 ? Math.round((total / feedback.reach) * 1000) / 10 : 0;
}

export function logSocialFeedback(
  db: AppDatabase,
  runService: RunService,
  publishingEventId: string,
  input: {
    impressions?: number;
    reach?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
    profileVisits?: number;
    followsGained?: number;
    qualitativeNotes?: string | null;
    topComments?: string | null;
    operatorJudgment?: string | null;
  }
) {
  const event = getPublishingEvent(db, publishingEventId);
  if (!event) throw new Error(`Publishing event not found: ${publishingEventId}`);
  const draft = getDraft(db, event.draft_id);
  if (!draft) throw new Error(`Draft not found: ${event.draft_id}`);
  const feedback = insertSocialFeedback(db, {
    draftId: draft.id,
    publishingEventId,
    characterId: draft.character_id,
    platform: event.platform,
    publishedUrl: event.live_url,
    impressions: input.impressions,
    reach: input.reach,
    likes: input.likes,
    comments: input.comments,
    shares: input.shares,
    saves: input.saves,
    profileVisits: input.profileVisits,
    followsGained: input.followsGained,
    qualitativeNotes: input.qualitativeNotes,
    topComments: input.topComments,
    operatorJudgment: input.operatorJudgment,
    feedback: { source: "manual_operator_entry" }
  });
  if (draft.run_id) {
    runService.appendRunEvent(draft.run_id, "feedback.logged", "Social feedback logged for published post.", {
      feedbackId: feedback.id,
      publishingEventId
    });
  }
  return { feedback };
}

export function runFeedbackReflection(db: AppDatabase, runService: RunService, feedbackId: string) {
  const feedback = getSocialFeedback(db, feedbackId);
  if (!feedback) throw new Error(`Feedback not found: ${feedbackId}`);
  if (!feedback.character_id) throw new Error("Feedback is missing character lineage.");
  const character = getCharacterDetail(db, feedback.character_id);
  if (!character) throw new Error(`Character not found: ${feedback.character_id}`);
  const draft = getDraft(db, feedback.draft_id);
  const rate = engagementRate(feedback);
  const activeConstitution = character.constitutions.find((item) => item.is_active === 1) ?? character.constitutions[0];
  const run = runService.createRun({ characterId: character.id, type: "feedback_reflection", title: `${character.name} Feedback Reflection` });
  runService.updateRunStatus(run.id, "running");
  runService.appendRunEvent(run.id, "context.loaded", "Loaded character identity, draft package, analysis, and social feedback.", {
    constitution: activeConstitution?.id ?? null,
    canon: character.canon.length,
    memory: character.memory.length,
    draftId: draft?.id ?? null,
    feedbackId
  });

  const reflection = {
    whatWorked: rate >= 5 ? "The post generated enough engagement to repeat the visual premise with small refinements." : "The post produced modest engagement but still provides a useful identity signal.",
    offCharacter: feedback.operator_judgment?.toLowerCase().includes("off") ? feedback.operator_judgment : "No major off-character signal was logged by the operator.",
    repeat: draft?.asset?.latestAnalysis?.identity_notes ?? "Repeat the strongest appearance anchors and disclosure-forward packaging.",
    avoid: "Avoid changing core identity traits based on one post.",
    suggestedNextActivity: feedback.saves > feedback.shares ? "Create a saveable behind-the-scenes ritual." : "Create a lightweight follow-up activity that keeps the same visual motif.",
    proposedMemory: `${character.name} learned from ${feedback.platform} feedback that ${feedback.qualitative_notes ?? "audience response favored clear synthetic disclosure and consistent visual anchors"}.`,
    proposedCanon: rate >= 8 ? `${character.name}'s audience responds strongly to transparent studio-process posts.` : null,
    constitutionPatch: rate >= 15 && feedback.operator_judgment?.toLowerCase().includes("identity") ? "Add a note that high-performing feedback can inform presentation tactics, not immutable identity." : null,
    evidence: {
      engagementRate: rate,
      likes: feedback.likes,
      comments: feedback.comments,
      saves: feedback.saves,
      followsGained: feedback.follows_gained,
      topComments: feedback.top_comments
    }
  };
  const summary = `${rate}% engagement signal on ${feedback.platform}; ${reflection.suggestedNextActivity}`;
  const body = [
    `Worked: ${reflection.whatWorked}`,
    `Off-character: ${reflection.offCharacter}`,
    `Repeat: ${reflection.repeat}`,
    `Avoid: ${reflection.avoid}`,
    `Next: ${reflection.suggestedNextActivity}`
  ].join("\n");
  const savedReflection = insertReflection(db, {
    characterId: character.id,
    runId: run.id,
    draftId: draft?.id ?? null,
    socialFeedbackId: feedback.id,
    summary,
    body,
    reflection
  });
  const memoryProposal = insertIdentityProposal(db, {
    characterId: character.id,
    runId: run.id,
    kind: "memory",
    body: reflection.proposedMemory,
    rationale: "Operator-entered social feedback should become lightweight memory after review.",
    sourceRunId: run.id,
    sourceReflectionId: savedReflection.id,
    riskLevel: "low"
  });
  runService.appendRunEvent(run.id, "memory.proposed", "Reflection proposed a memory entry.", { proposalId: memoryProposal.id });
  let canonProposal = null;
  if (reflection.proposedCanon) {
    canonProposal = insertIdentityProposal(db, {
      characterId: character.id,
      runId: run.id,
      kind: "canon",
      body: reflection.proposedCanon,
      rationale: "Engagement rate was high enough to propose a canon-level audience pattern.",
      sourceRunId: run.id,
      sourceReflectionId: savedReflection.id,
      riskLevel: "medium"
    });
    runService.appendRunEvent(run.id, "canon_update.proposed", "Reflection proposed a canon update.", { proposalId: canonProposal.id });
  }
  let constitutionProposal = null;
  if (reflection.constitutionPatch) {
    constitutionProposal = insertIdentityProposal(db, {
      characterId: character.id,
      runId: run.id,
      kind: "constitution_patch",
      body: reflection.constitutionPatch,
      rationale: "High engagement plus identity-specific operator judgment justifies explicit constitution review.",
      sourceRunId: run.id,
      sourceReflectionId: savedReflection.id,
      riskLevel: "high"
    });
    runService.appendRunEvent(run.id, "constitution_patch.proposed", "Reflection proposed a Constitution patch.", { proposalId: constitutionProposal.id });
  }
  runService.attachRunArtifact(run.id, "feedback_reflection", "Feedback Reflection", { reflectionId: savedReflection.id, reflection });
  const updatedRun = runService.updateRunStatus(run.id, "needs_review");
  runService.appendRunEvent(run.id, "review.required", "Reflection proposals require human review.", { reflectionId: savedReflection.id });
  return { run: updatedRun, reflection: savedReflection, proposals: [memoryProposal, canonProposal, constitutionProposal].filter(Boolean) };
}

export function reviewIdentityProposal(
  db: AppDatabase,
  runService: RunService,
  proposalId: string,
  input: { status: "approved" | "rejected"; constitutionChangeReason?: string | null }
) {
  const proposal = getIdentityProposal(db, proposalId);
  if (!proposal) throw new Error(`Identity proposal not found: ${proposalId}`);
  if (input.status === "approved" && proposal.kind === "constitution_patch" && !input.constitutionChangeReason?.trim()) {
    throw new Error("Constitution patch approval requires an explicit change reason.");
  }
  const updated = updateIdentityProposalStatus(db, proposalId, input.status);
  let created: unknown = null;
  if (input.status === "approved") {
    if (proposal.kind === "memory") {
      created = insertMemoryEntry(db, {
        characterId: proposal.character_id,
        body: proposal.body,
        source: "feedback_reflection",
        sourceRunId: proposal.source_run_id,
        sourceType: "feedback",
        confidence: 0.76,
        importance: 3
      });
    } else if (proposal.kind === "canon") {
      created = insertCanonEntry(db, {
        characterId: proposal.character_id,
        title: "Feedback Pattern",
        body: proposal.body,
        status: "approved",
        sourceRunId: proposal.source_run_id
      });
    } else if (proposal.kind === "constitution_patch") {
      const changeReason = input.constitutionChangeReason?.trim() ?? "";
      const character = getCharacterDetail(db, proposal.character_id);
      const active = character?.constitutions.find((item) => item.is_active === 1) ?? character?.constitutions[0];
      created = insertConstitutionVersion(db, {
        characterId: proposal.character_id,
        body: `${active?.body ?? ""}\n\nFeedback patch: ${proposal.body}`.trim(),
        changeReason,
        markActive: true
      });
    }
  }
  if (proposal.source_run_id) {
    runService.recordRunDecision(proposal.source_run_id, `proposal.${proposal.kind}.${input.status}`, proposal.rationale);
    runService.appendRunEvent(proposal.source_run_id, input.status === "approved" ? "human.approved" : "human.rejected", `Identity proposal ${input.status}.`, {
      proposalId,
      kind: proposal.kind
    });
  }
  return { proposal: updated, created };
}
