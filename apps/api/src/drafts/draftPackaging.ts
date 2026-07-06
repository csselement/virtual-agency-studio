import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import type { ApiConfig } from "../config";
import type { AppDatabase } from "../db/database";
import {
  getAsset,
  getContentBrief,
  getDraft,
  getPromptRecipe,
  insertDraft,
  insertPlatformVariant,
  insertPublishingEvent,
  insertPublishingPackage,
  listPlatformVariants,
  updateDraftStatus,
  type DraftSummary
} from "../db/repositories";
import { RunService } from "../runs/runService";

const platforms = ["instagram", "tiktok", "threads", "generic"] as const;

function safeSegment(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "draft";
}

function defaultHashtags(platform: string) {
  if (platform === "threads") return "#behindthescenes #creativeprocess #syntheticmedia";
  if (platform === "tiktok") return "#aicreator #visualstory #studioprocess";
  if (platform === "instagram") return "#virtualinfluencer #editorialportrait #syntheticmedia";
  return "#syntheticmedia #virtualcreator";
}

function variantCaption(platform: string, title: string, briefGoal: string | null | undefined) {
  const base = briefGoal ?? title;
  if (platform === "tiktok") return `${base}\n\nA short visual loop built from a synthetic creator workflow.`;
  if (platform === "threads") return `${base}\n\nProcess note: this is a synthetic image package prepared for manual review.`;
  if (platform === "instagram") return `${base}\n\nQuiet visual system, clear disclosure, no automation posting.`;
  return `${base}\n\nPrepared by Virtual Agency Studio.`;
}

export function createDraftPackageRun(db: AppDatabase, config: ApiConfig, runService: RunService, assetId: string) {
  const asset = getAsset(db, assetId);
  if (!asset) throw new Error(`Asset not found: ${assetId}`);
  if (!["approved_post_asset", "approved_reference", "candidate"].includes(asset.status)) {
    throw new Error(`Asset must be approved or candidate before draft packaging. Current status: ${asset.status}`);
  }
  if (!asset.character_id) throw new Error("Asset is missing character lineage.");
  const recipe = asset.prompt_recipe_id ? getPromptRecipe(db, asset.prompt_recipe_id) : undefined;
  const brief = recipe?.content_brief_id ? getContentBrief(db, recipe.content_brief_id) : undefined;
  const analysis = asset.latestAnalysis;
  const title = `Post package for ${asset.id.replace("asset_", "").slice(0, 8)}`;
  const summary = brief?.goal ?? analysis?.summary ?? "Draft created from approved image asset.";
  const run = runService.createRun({ characterId: asset.character_id, type: "draft_packaging", title: "Draft Packaging" });
  runService.updateRunStatus(run.id, "running");

  const draft = insertDraft(db, {
    characterId: asset.character_id,
    runId: run.id,
    contentBriefId: brief?.id ?? null,
    promptRecipeId: recipe?.id ?? asset.prompt_recipe_id,
    assetId: asset.id,
    createdFromRunId: asset.run_id,
    status: "needs_review",
    title,
    body: summary,
    summary
  });

  for (const platform of platforms) {
    insertPlatformVariant(db, {
      draftId: draft.id,
      platform,
      postFormat: platform === "threads" ? "text_with_image" : "single_image",
      caption: variantCaption(platform, title, brief?.goal),
      hashtags: defaultHashtags(platform),
      altText: analysis?.alt_text ?? `Synthetic creator image for ${title}.`,
      disclosureText: "AI-generated synthetic media. No automatic posting performed.",
      aiGeneratedFlag: 1,
      paidPartnershipFlag: 0,
      brandContentFlag: 0,
      notes: analysis?.recommended_action ?? "Manual review required before publishing.",
      status: "draft",
      metadata: { analysisSummary: analysis?.summary ?? null, contentBriefId: brief?.id ?? null }
    });
  }

  runService.appendRunEvent(run.id, "draft.created", "Draft package created from approved asset.", { draftId: draft.id, assetId: asset.id });
  runService.attachRunArtifact(run.id, "draft_package", "Draft Package", { draftId: draft.id, platforms });
  runService.updateRunStatus(run.id, "needs_review");
  runService.appendRunEvent(run.id, "review.required", "Draft variants are ready for human review.", { draftId: draft.id });
  return { run, draft: getDraft(db, draft.id)! };
}

export function reviewDraft(db: AppDatabase, runService: RunService, draftId: string, status: string, reason?: string) {
  const draft = updateDraftStatus(db, draftId, status);
  if (draft.run_id) {
    runService.recordRunDecision(draft.run_id, `draft.${status}`, reason ?? "Manual draft review action.");
    runService.appendRunEvent(draft.run_id, status === "rejected" ? "human.rejected" : "human.approved", `Draft marked ${status}.`, { draftId, status });
  }
  return getDraft(db, draftId)!;
}

export function exportDraftPackage(db: AppDatabase, config: ApiConfig, runService: RunService, draftId: string) {
  const draft = getDraft(db, draftId);
  if (!draft) throw new Error(`Draft not found: ${draftId}`);
  const asset = draft.asset_id ? getAsset(db, draft.asset_id) : undefined;
  if (!asset?.file_path) throw new Error("Draft asset file is missing.");
  const variants = listPlatformVariants(db, draft.id);
  const exportDir = join(config.dataDir, "exports", `${safeSegment(draft.title)}-${draft.id.replace("draft_", "").slice(0, 8)}`);
  mkdirSync(exportDir, { recursive: true });

  const files: string[] = [];
  const assetExtension = extname(asset.file_path) || ".bin";
  const assetName = `asset${assetExtension}`;
  copyFileSync(join(config.dataDir, asset.file_path), join(exportDir, assetName));
  files.push(assetName);

  for (const variant of variants) {
    const captionName = `caption_${variant.platform}.txt`;
    writeFileSync(join(exportDir, captionName), `${variant.caption}\n\n${variant.hashtags ?? ""}\n`);
    files.push(captionName);
  }

  writeFileSync(join(exportDir, "hashtags.txt"), variants.map((variant) => `${variant.platform}: ${variant.hashtags ?? ""}`).join("\n"));
  writeFileSync(join(exportDir, "alt_text.txt"), variants.map((variant) => `${variant.platform}: ${variant.alt_text ?? ""}`).join("\n\n"));
  writeFileSync(
    join(exportDir, "disclosure_checklist.md"),
    variants.map((variant) => `- [ ] ${variant.platform}: ${variant.disclosure_text}\n  - AI generated: ${Boolean(variant.ai_generated_flag)}\n  - Paid partnership: ${Boolean(variant.paid_partnership_flag)}\n  - Brand content: ${Boolean(variant.brand_content_flag)}`).join("\n")
  );
  writeFileSync(join(exportDir, "metadata.json"), JSON.stringify({ draft, variants, asset }, null, 2));
  files.push("hashtags.txt", "alt_text.txt", "disclosure_checklist.md", "metadata.json");

  const relativePath = exportDir.replace(`${config.dataDir}/`, "");
  const pkg = insertPublishingPackage(db, { draftId: draft.id, exportPath: relativePath, files, status: "exported" });
  updateDraftStatus(db, draft.id, "exported");
  if (draft.run_id) {
    runService.appendRunEvent(draft.run_id, "export.created", "Local export package created.", { draftId: draft.id, exportPath: relativePath, files });
  }
  return { package: pkg, draft: getDraft(db, draft.id)! };
}

export function markDraftPublished(
  db: AppDatabase,
  draftId: string,
  input: { platform: string; liveUrl?: string | null; publishedAt?: string | null; notes?: string | null; status?: string }
) {
  const draft = getDraft(db, draftId);
  if (!draft) throw new Error(`Draft not found: ${draftId}`);
  const event = insertPublishingEvent(db, {
    draftId,
    platform: input.platform,
    status: input.status ?? "published",
    liveUrl: input.liveUrl ?? null,
    publishedAt: input.publishedAt ?? new Date().toISOString(),
    notes: input.notes ?? null
  });
  if ((input.status ?? "published") === "published") {
    updateDraftStatus(db, draftId, "published");
  }
  return { event, draft: getDraft(db, draftId)! };
}
