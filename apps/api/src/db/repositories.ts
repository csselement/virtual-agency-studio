import { randomUUID } from "node:crypto";
import type { AppDatabase } from "./database";

type DbRow = Record<string, unknown>;

export interface CharacterSummary {
  id: string;
  name: string;
  status: string;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConstitutionVersion {
  id: string;
  character_id: string;
  version: number;
  body: string;
  change_reason: string | null;
  is_active: number;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CanonEntry {
  id: string;
  character_id: string;
  title: string;
  body: string;
  status: string;
  source_run_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemoryEntry {
  id: string;
  character_id: string;
  body: string;
  source: string | null;
  source_run_id: string | null;
  source_type: string;
  confidence: number;
  importance: number;
  created_at: string;
  updated_at: string;
}

export interface BodyEntry {
  id: string;
  character_id: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface PlatformPersona {
  id: string;
  character_id: string;
  platform: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface ReferenceImage {
  id: string;
  character_id: string | null;
  file_path: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CharacterDetail extends CharacterSummary {
  constitutions: ConstitutionVersion[];
  canon: CanonEntry[];
  memory: MemoryEntry[];
  appearanceProfiles: BodyEntry[];
  voiceGuides: BodyEntry[];
  platformPersonas: PlatformPersona[];
  referenceImages: ReferenceImage[];
  recentRuns: RunSummary[];
  feedback: SocialFeedbackSummary[];
  reflections: ReflectionSummary[];
  identityProposals: IdentityUpdateProposalSummary[];
}

export interface RunSummary {
  id: string;
  character_id: string | null;
  type: string;
  status: string;
  title: string;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface RunEventSummary {
  id: string;
  run_id: string;
  type: string;
  message: string;
  payload: unknown;
  created_at: string;
}

export interface RunArtifactSummary {
  id: string;
  run_id: string;
  kind: string;
  label: string;
  artifact: unknown;
  created_at: string;
  updated_at: string;
}

export interface AssetSummary {
  id: string;
  character_id: string | null;
  run_id: string | null;
  prompt_recipe_id: string | null;
  file_path: string | null;
  kind: string;
  status: string;
  provider: string | null;
  original_prompt: string | null;
  negative_prompt: string | null;
  mime_type: string | null;
  size_bytes: number;
  metadata: unknown;
  created_at: string;
  updated_at: string;
  latestAnalysis?: AssetAnalysisSummary | null;
}

export interface AssetAnalysisSummary {
  id: string;
  asset_id: string;
  provider: string;
  score: number | null;
  summary: string | null;
  identity_match: string | null;
  identity_score: number;
  quality_score: number;
  story_fit_score: number;
  platform_fit: string[];
  quality_issues: string[];
  identity_notes: string | null;
  suggested_prompt_fixes: string[];
  alt_text: string | null;
  recommended_action: string | null;
  raw: unknown;
  created_at: string;
  updated_at: string;
}

export interface DraftSummary {
  id: string;
  character_id: string;
  run_id: string | null;
  content_brief_id: string | null;
  prompt_recipe_id: string | null;
  asset_id: string | null;
  created_from_run_id: string | null;
  status: string;
  title: string;
  body: string;
  summary: string | null;
  created_at: string;
  updated_at: string;
  asset?: AssetSummary | null;
  variants?: PlatformVariantSummary[];
  packages?: PublishingPackageSummary[];
  publishingEvents?: PublishingEventSummary[];
}

export interface PlatformVariantSummary {
  id: string;
  draft_id: string;
  platform: string;
  post_format: string | null;
  caption: string;
  hashtags: string | null;
  alt_text: string | null;
  disclosure_text: string | null;
  ai_generated_flag: number;
  paid_partnership_flag: number;
  brand_content_flag: number;
  notes: string | null;
  status: string;
  metadata: unknown;
  created_at: string;
  updated_at: string;
}

export interface PublishingPackageSummary {
  id: string;
  draft_id: string;
  export_path: string;
  files: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PublishingEventSummary {
  id: string;
  draft_id: string;
  platform: string;
  status: string;
  live_url: string | null;
  published_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialFeedbackSummary {
  id: string;
  draft_id: string;
  publishing_event_id: string | null;
  character_id: string | null;
  platform: string;
  published_url: string | null;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  profile_visits: number;
  follows_gained: number;
  qualitative_notes: string | null;
  top_comments: string | null;
  operator_judgment: string | null;
  feedback: unknown;
  created_at: string;
  updated_at: string;
}

export interface ReflectionSummary {
  id: string;
  character_id: string;
  run_id: string | null;
  draft_id: string | null;
  social_feedback_id: string | null;
  summary: string | null;
  body: string;
  reflection: unknown;
  created_at: string;
  updated_at: string;
}

export interface IdentityUpdateProposalSummary {
  id: string;
  character_id: string;
  run_id: string | null;
  kind: string;
  body: string;
  rationale: string | null;
  source_run_id: string | null;
  source_reflection_id: string | null;
  risk_level: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RunDecisionSummary {
  id: string;
  run_id: string;
  decision: string;
  rationale: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProviderJobSummary {
  id: string;
  run_id: string | null;
  provider: string;
  external_id: string | null;
  status: string;
  attempt_index: number;
  route_tier: string | null;
  route_reason: string | null;
  fallback_reason: string | null;
  request: unknown;
  response: unknown;
  created_at: string;
  updated_at: string;
}

export interface ComfyWorkflowSummary {
  id: string;
  name: string;
  workflow: Record<string, unknown>;
  positive_prompt_node: string | null;
  positive_prompt_input: string | null;
  negative_prompt_node: string | null;
  negative_prompt_input: string | null;
  seed_node: string | null;
  seed_input: string | null;
  output_node_ids: string[];
  default_for_tiers: string[];
  status: string;
  validation_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityCandidate {
  id: string;
  character_id: string;
  run_id: string | null;
  title: string;
  body: string;
  location_fiction: string | null;
  activity_type: string | null;
  visual_motif: string | null;
  platform_fit: string | null;
  identity_fit_score: number;
  campaign_fit_score: number;
  freshness_score: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ContentBrief {
  id: string;
  character_id: string;
  run_id: string | null;
  activity_candidate_id: string | null;
  campaign_id: string | null;
  goal: string | null;
  platform_targets: string | null;
  content_pillar: string | null;
  visual_direction: string | null;
  caption_angle: string | null;
  disclosure_flags: string | null;
  desired_outputs: string | null;
  body: unknown;
  created_at: string;
  updated_at: string;
}

export interface PromptRecipe {
  id: string;
  character_id: string;
  run_id: string | null;
  content_brief_id: string | null;
  constitution_version_id: string | null;
  appearance_profile_id: string | null;
  final_prompt: string | null;
  negative_prompt: string | null;
  recipe: unknown;
  created_at: string;
  updated_at: string;
}

function now() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}_${randomUUID()}`;
}

function parsePayload(row: DbRow): RunEventSummary {
  return {
    id: String(row.id),
    run_id: String(row.run_id),
    type: String(row.type),
    message: String(row.message),
    payload: JSON.parse(String(row.payload_json ?? "{}")),
    created_at: String(row.created_at)
  };
}

function parseArtifact(row: DbRow): RunArtifactSummary {
  return {
    id: String(row.id),
    run_id: String(row.run_id),
    kind: String(row.kind),
    label: String(row.label),
    artifact: JSON.parse(String(row.artifact_json ?? "{}")),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  };
}

function parseProviderJob(row: DbRow): ProviderJobSummary {
  return {
    id: String(row.id),
    run_id: row.run_id ? String(row.run_id) : null,
    provider: String(row.provider),
    external_id: row.external_id ? String(row.external_id) : null,
    status: String(row.status),
    attempt_index: Number(row.attempt_index ?? 1),
    route_tier: row.route_tier ? String(row.route_tier) : null,
    route_reason: row.route_reason ? String(row.route_reason) : null,
    fallback_reason: row.fallback_reason ? String(row.fallback_reason) : null,
    request: JSON.parse(String(row.request_json ?? "{}")),
    response: JSON.parse(String(row.response_json ?? "{}")),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  };
}

function parseComfyWorkflow(row: DbRow): ComfyWorkflowSummary {
  return {
    id: String(row.id),
    name: String(row.name),
    workflow: JSON.parse(String(row.workflow_json ?? "{}")),
    positive_prompt_node: row.positive_prompt_node ? String(row.positive_prompt_node) : null,
    positive_prompt_input: row.positive_prompt_input ? String(row.positive_prompt_input) : null,
    negative_prompt_node: row.negative_prompt_node ? String(row.negative_prompt_node) : null,
    negative_prompt_input: row.negative_prompt_input ? String(row.negative_prompt_input) : null,
    seed_node: row.seed_node ? String(row.seed_node) : null,
    seed_input: row.seed_input ? String(row.seed_input) : null,
    output_node_ids: parseJsonArray(row.output_node_ids_json),
    default_for_tiers: parseJsonArray(row.default_for_tiers_json),
    status: String(row.status),
    validation_error: row.validation_error ? String(row.validation_error) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  };
}

function parseJsonArray(value: unknown): string[] {
  if (!value) return [];
  const parsed = JSON.parse(String(value));
  return Array.isArray(parsed) ? parsed.map(String) : [];
}

function parseAsset(row: DbRow): AssetSummary {
  return {
    id: String(row.id),
    character_id: row.character_id ? String(row.character_id) : null,
    run_id: row.run_id ? String(row.run_id) : null,
    prompt_recipe_id: row.prompt_recipe_id ? String(row.prompt_recipe_id) : null,
    file_path: row.file_path ? String(row.file_path) : null,
    kind: String(row.kind),
    status: String(row.status),
    provider: row.provider ? String(row.provider) : null,
    original_prompt: row.original_prompt ? String(row.original_prompt) : null,
    negative_prompt: row.negative_prompt ? String(row.negative_prompt) : null,
    mime_type: row.mime_type ? String(row.mime_type) : null,
    size_bytes: Number(row.size_bytes ?? 0),
    metadata: JSON.parse(String(row.metadata_json ?? "{}")),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  };
}

function parseAssetAnalysis(row: DbRow): AssetAnalysisSummary {
  return {
    id: String(row.id),
    asset_id: String(row.asset_id),
    provider: String(row.provider),
    score: row.score === null || row.score === undefined ? null : Number(row.score),
    summary: row.summary ? String(row.summary) : null,
    identity_match: row.identity_match ? String(row.identity_match) : null,
    identity_score: Number(row.identity_score ?? 0),
    quality_score: Number(row.quality_score ?? 0),
    story_fit_score: Number(row.story_fit_score ?? 0),
    platform_fit: parseJsonArray(row.platform_fit),
    quality_issues: parseJsonArray(row.quality_issues),
    identity_notes: row.identity_notes ? String(row.identity_notes) : null,
    suggested_prompt_fixes: parseJsonArray(row.suggested_prompt_fixes),
    alt_text: row.alt_text ? String(row.alt_text) : null,
    recommended_action: row.recommended_action ? String(row.recommended_action) : null,
    raw: JSON.parse(String(row.raw_json ?? "{}")),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  };
}

function parseDraft(row: DbRow): DraftSummary {
  return {
    id: String(row.id),
    character_id: String(row.character_id),
    run_id: row.run_id ? String(row.run_id) : null,
    content_brief_id: row.content_brief_id ? String(row.content_brief_id) : null,
    prompt_recipe_id: row.prompt_recipe_id ? String(row.prompt_recipe_id) : null,
    asset_id: row.asset_id ? String(row.asset_id) : null,
    created_from_run_id: row.created_from_run_id ? String(row.created_from_run_id) : null,
    status: String(row.status),
    title: String(row.title),
    body: String(row.body),
    summary: row.summary ? String(row.summary) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  };
}

function parsePlatformVariant(row: DbRow): PlatformVariantSummary {
  return {
    id: String(row.id),
    draft_id: String(row.draft_id),
    platform: String(row.platform),
    post_format: row.post_format ? String(row.post_format) : null,
    caption: String(row.caption),
    hashtags: row.hashtags ? String(row.hashtags) : null,
    alt_text: row.alt_text ? String(row.alt_text) : null,
    disclosure_text: row.disclosure_text ? String(row.disclosure_text) : null,
    ai_generated_flag: Number(row.ai_generated_flag ?? 1),
    paid_partnership_flag: Number(row.paid_partnership_flag ?? 0),
    brand_content_flag: Number(row.brand_content_flag ?? 0),
    notes: row.notes ? String(row.notes) : null,
    status: String(row.status ?? "draft"),
    metadata: JSON.parse(String(row.metadata_json ?? "{}")),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  };
}

function parsePublishingPackage(row: DbRow): PublishingPackageSummary {
  const files = JSON.parse(String(row.files_json ?? "[]"));
  return {
    id: String(row.id),
    draft_id: String(row.draft_id),
    export_path: String(row.export_path),
    files: Array.isArray(files) ? files.map(String) : [],
    status: String(row.status),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  };
}

function parsePublishingEvent(row: DbRow): PublishingEventSummary {
  return {
    id: String(row.id),
    draft_id: String(row.draft_id),
    platform: String(row.platform),
    status: String(row.status ?? "planned"),
    live_url: row.live_url ? String(row.live_url) : null,
    published_at: row.published_at ? String(row.published_at) : null,
    notes: row.notes ? String(row.notes) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  };
}

function parseSocialFeedback(row: DbRow): SocialFeedbackSummary {
  return {
    id: String(row.id),
    draft_id: String(row.draft_id),
    publishing_event_id: row.publishing_event_id ? String(row.publishing_event_id) : null,
    character_id: row.character_id ? String(row.character_id) : null,
    platform: String(row.platform),
    published_url: row.published_url ? String(row.published_url) : null,
    impressions: Number(row.impressions ?? 0),
    reach: Number(row.reach ?? 0),
    likes: Number(row.likes ?? 0),
    comments: Number(row.comments ?? 0),
    shares: Number(row.shares ?? 0),
    saves: Number(row.saves ?? 0),
    profile_visits: Number(row.profile_visits ?? 0),
    follows_gained: Number(row.follows_gained ?? 0),
    qualitative_notes: row.qualitative_notes ? String(row.qualitative_notes) : null,
    top_comments: row.top_comments ? String(row.top_comments) : null,
    operator_judgment: row.operator_judgment ? String(row.operator_judgment) : null,
    feedback: JSON.parse(String(row.feedback_json ?? "{}")),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  };
}

function parseReflection(row: DbRow): ReflectionSummary {
  return {
    id: String(row.id),
    character_id: String(row.character_id),
    run_id: row.run_id ? String(row.run_id) : null,
    draft_id: row.draft_id ? String(row.draft_id) : null,
    social_feedback_id: row.social_feedback_id ? String(row.social_feedback_id) : null,
    summary: row.summary ? String(row.summary) : null,
    body: String(row.body),
    reflection: JSON.parse(String(row.reflection_json ?? "{}")),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  };
}

function parseIdentityProposal(row: DbRow): IdentityUpdateProposalSummary {
  return {
    id: String(row.id),
    character_id: String(row.character_id),
    run_id: row.run_id ? String(row.run_id) : null,
    kind: String(row.kind),
    body: String(row.body),
    rationale: row.rationale ? String(row.rationale) : null,
    source_run_id: row.source_run_id ? String(row.source_run_id) : null,
    source_reflection_id: row.source_reflection_id ? String(row.source_reflection_id) : null,
    risk_level: String(row.risk_level ?? "low"),
    status: String(row.status),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  };
}

function parseContentBrief(row: DbRow): ContentBrief {
  return {
    id: String(row.id),
    character_id: String(row.character_id),
    run_id: row.run_id ? String(row.run_id) : null,
    activity_candidate_id: row.activity_candidate_id ? String(row.activity_candidate_id) : null,
    campaign_id: row.campaign_id ? String(row.campaign_id) : null,
    goal: row.goal ? String(row.goal) : null,
    platform_targets: row.platform_targets ? String(row.platform_targets) : null,
    content_pillar: row.content_pillar ? String(row.content_pillar) : null,
    visual_direction: row.visual_direction ? String(row.visual_direction) : null,
    caption_angle: row.caption_angle ? String(row.caption_angle) : null,
    disclosure_flags: row.disclosure_flags ? String(row.disclosure_flags) : null,
    desired_outputs: row.desired_outputs ? String(row.desired_outputs) : null,
    body: JSON.parse(String(row.body_json ?? "{}")),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  };
}

function parsePromptRecipe(row: DbRow): PromptRecipe {
  return {
    id: String(row.id),
    character_id: String(row.character_id),
    run_id: row.run_id ? String(row.run_id) : null,
    content_brief_id: row.content_brief_id ? String(row.content_brief_id) : null,
    constitution_version_id: row.constitution_version_id ? String(row.constitution_version_id) : null,
    appearance_profile_id: row.appearance_profile_id ? String(row.appearance_profile_id) : null,
    final_prompt: row.final_prompt ? String(row.final_prompt) : null,
    negative_prompt: row.negative_prompt ? String(row.negative_prompt) : null,
    recipe: JSON.parse(String(row.recipe_json ?? "{}")),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  };
}

export function listCharacters(db: AppDatabase): CharacterSummary[] {
  return db
    .prepare("select id, name, status, summary, created_at, updated_at from characters order by created_at desc")
    .all() as unknown as CharacterSummary[];
}

export function getCharacter(db: AppDatabase, characterId: string): CharacterSummary | undefined {
  return db
    .prepare("select id, name, status, summary, created_at, updated_at from characters where id = ?")
    .get(characterId) as CharacterSummary | undefined;
}

export function getCharacterDetail(db: AppDatabase, characterId: string): CharacterDetail | undefined {
  const character = getCharacter(db, characterId);
  if (!character) {
    return undefined;
  }

  return {
    ...character,
    constitutions: listConstitutions(db, characterId),
    canon: listCanonEntries(db, characterId),
    memory: listMemoryEntries(db, characterId),
    appearanceProfiles: listBodyEntries(db, "character_appearance_profiles", characterId),
    voiceGuides: listBodyEntries(db, "character_voice_guides", characterId),
    platformPersonas: listPlatformPersonas(db, characterId),
    referenceImages: listReferenceImages(db, characterId),
    recentRuns: listRunsForCharacter(db, characterId),
    feedback: listCharacterFeedback(db, characterId).slice(0, 8),
    reflections: listCharacterReflections(db, characterId).slice(0, 8),
    identityProposals: listCharacterIdentityProposals(db, characterId).slice(0, 12)
  };
}

export function insertCharacter(
  db: AppDatabase,
  input: { name: string; summary?: string | null; status?: string }
): CharacterSummary {
  const timestamp = now();
  const characterId = id("char");
  db.prepare("insert into characters (id, name, status, summary, created_at, updated_at) values (?, ?, ?, ?, ?, ?)").run(
    characterId,
    input.name,
    input.status ?? "idea",
    input.summary ?? null,
    timestamp,
    timestamp
  );
  const character = getCharacter(db, characterId);
  if (!character) {
    throw new Error("Character insert failed");
  }
  return character;
}

export function updateCharacter(
  db: AppDatabase,
  characterId: string,
  input: { name?: string; summary?: string | null; status?: string }
): CharacterSummary {
  const current = getCharacter(db, characterId);
  if (!current) {
    throw new Error(`Character not found: ${characterId}`);
  }
  db.prepare("update characters set name = ?, summary = ?, status = ?, updated_at = ? where id = ?").run(
    input.name ?? current.name,
    input.summary ?? current.summary,
    input.status ?? current.status,
    now(),
    characterId
  );
  return getCharacter(db, characterId)!;
}

export function listConstitutions(db: AppDatabase, characterId: string): ConstitutionVersion[] {
  return db
    .prepare(
      `select id, character_id, version, body, change_reason, is_active, approved_at, created_at, updated_at
       from character_constitution_versions where character_id = ? order by version desc`
    )
    .all(characterId) as unknown as ConstitutionVersion[];
}

export function insertConstitutionVersion(
  db: AppDatabase,
  input: { characterId: string; body: string; changeReason: string; markActive?: boolean }
): ConstitutionVersion {
  const timestamp = now();
  const latest = db
    .prepare("select coalesce(max(version), 0) as version from character_constitution_versions where character_id = ?")
    .get(input.characterId) as { version: number };
  const version = Number(latest.version) + 1;
  const constitutionId = id("constitution");
  if (input.markActive ?? true) {
    db.prepare("update character_constitution_versions set is_active = 0, updated_at = ? where character_id = ?").run(
      timestamp,
      input.characterId
    );
  }
  db.prepare(
    `insert into character_constitution_versions
      (id, character_id, version, body, change_reason, is_active, approved_at, created_at, updated_at)
      values (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    constitutionId,
    input.characterId,
    version,
    input.body,
    input.changeReason,
    input.markActive ?? true ? 1 : 0,
    timestamp,
    timestamp,
    timestamp
  );
  return listConstitutions(db, input.characterId).find((item) => item.id === constitutionId)!;
}

export function markActiveConstitution(db: AppDatabase, characterId: string, constitutionId: string) {
  const timestamp = now();
  db.prepare("update character_constitution_versions set is_active = 0, updated_at = ? where character_id = ?").run(
    timestamp,
    characterId
  );
  db.prepare("update character_constitution_versions set is_active = 1, updated_at = ? where id = ? and character_id = ?").run(
    timestamp,
    constitutionId,
    characterId
  );
  return listConstitutions(db, characterId);
}

export function listCanonEntries(db: AppDatabase, characterId: string): CanonEntry[] {
  return db
    .prepare(
      `select id, character_id, title, body, status, source_run_id, created_at, updated_at
       from character_canon_entries where character_id = ? order by created_at desc`
    )
    .all(characterId) as unknown as CanonEntry[];
}

export function insertCanonEntry(
  db: AppDatabase,
  input: { characterId: string; title: string; body: string; status?: string; sourceRunId?: string | null }
): CanonEntry {
  const timestamp = now();
  const entryId = id("canon");
  db.prepare(
    `insert into character_canon_entries
      (id, character_id, title, body, status, source_run_id, created_at, updated_at)
      values (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(entryId, input.characterId, input.title, input.body, input.status ?? "proposed", input.sourceRunId ?? null, timestamp, timestamp);
  return listCanonEntries(db, input.characterId).find((item) => item.id === entryId)!;
}

export function updateCanonStatus(db: AppDatabase, characterId: string, entryId: string, status: string): CanonEntry[] {
  db.prepare("update character_canon_entries set status = ?, updated_at = ? where id = ? and character_id = ?").run(
    status,
    now(),
    entryId,
    characterId
  );
  return listCanonEntries(db, characterId);
}

export function listMemoryEntries(db: AppDatabase, characterId: string): MemoryEntry[] {
  return db
    .prepare(
      `select id, character_id, body, source, source_run_id, source_type, confidence, importance, created_at, updated_at
       from character_memory_entries where character_id = ? order by created_at desc`
    )
    .all(characterId) as unknown as MemoryEntry[];
}

export function insertMemoryEntry(
  db: AppDatabase,
  input: {
    characterId: string;
    body: string;
    source?: string | null;
    sourceRunId?: string | null;
    sourceType?: string;
    confidence?: number;
    importance?: number;
  }
): MemoryEntry {
  const timestamp = now();
  const entryId = id("memory");
  db.prepare(
    `insert into character_memory_entries
      (id, character_id, body, source, source_run_id, source_type, confidence, importance, created_at, updated_at)
      values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    entryId,
    input.characterId,
    input.body,
    input.source ?? null,
    input.sourceRunId ?? null,
    input.sourceType ?? "manual",
    input.confidence ?? 0.7,
    input.importance ?? 3,
    timestamp,
    timestamp
  );
  return listMemoryEntries(db, input.characterId).find((item) => item.id === entryId)!;
}

export function listBodyEntries(db: AppDatabase, table: "character_appearance_profiles" | "character_voice_guides", characterId: string): BodyEntry[] {
  return db
    .prepare(`select id, character_id, body, created_at, updated_at from ${table} where character_id = ? order by created_at desc`)
    .all(characterId) as unknown as BodyEntry[];
}

export function insertBodyEntry(
  db: AppDatabase,
  table: "character_appearance_profiles" | "character_voice_guides",
  input: { characterId: string; body: string }
): BodyEntry {
  const timestamp = now();
  const entryId = id(table === "character_appearance_profiles" ? "appearance" : "voice");
  db.prepare(`insert into ${table} (id, character_id, body, created_at, updated_at) values (?, ?, ?, ?, ?)`).run(
    entryId,
    input.characterId,
    input.body,
    timestamp,
    timestamp
  );
  return listBodyEntries(db, table, input.characterId).find((item) => item.id === entryId)!;
}

export function listPlatformPersonas(db: AppDatabase, characterId: string): PlatformPersona[] {
  return db
    .prepare(
      "select id, character_id, platform, body, created_at, updated_at from character_platform_personas where character_id = ? order by platform asc"
    )
    .all(characterId) as unknown as PlatformPersona[];
}

export function upsertPlatformPersona(
  db: AppDatabase,
  input: { characterId: string; platform: string; body: string }
): PlatformPersona {
  const timestamp = now();
  const existing = db
    .prepare("select id from character_platform_personas where character_id = ? and lower(platform) = lower(?)")
    .get(input.characterId, input.platform) as { id: string } | undefined;
  if (existing) {
    db.prepare("update character_platform_personas set body = ?, updated_at = ? where id = ?").run(input.body, timestamp, existing.id);
    return listPlatformPersonas(db, input.characterId).find((item) => item.id === existing.id)!;
  }
  const personaId = id("persona");
  db.prepare(
    `insert into character_platform_personas
      (id, character_id, platform, body, created_at, updated_at)
      values (?, ?, ?, ?, ?, ?)`
  ).run(personaId, input.characterId, input.platform, input.body, timestamp, timestamp);
  return listPlatformPersonas(db, input.characterId).find((item) => item.id === personaId)!;
}

export function listReferenceImages(db: AppDatabase, characterId: string): ReferenceImage[] {
  return db
    .prepare(
      `select id, character_id, file_path, original_name, mime_type, size_bytes, status, created_at, updated_at
       from reference_images where character_id = ? order by created_at desc`
    )
    .all(characterId) as unknown as ReferenceImage[];
}

export function insertReferenceImage(
  db: AppDatabase,
  input: { characterId: string; filePath: string; originalName: string; mimeType: string; sizeBytes: number; status?: string }
): ReferenceImage {
  const timestamp = now();
  const imageId = id("ref");
  db.prepare(
    `insert into reference_images
      (id, character_id, file_path, original_name, mime_type, size_bytes, status, created_at, updated_at)
      values (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    imageId,
    input.characterId,
    input.filePath,
    input.originalName,
    input.mimeType,
    input.sizeBytes,
    input.status ?? "experimental",
    timestamp,
    timestamp
  );
  return listReferenceImages(db, input.characterId).find((item) => item.id === imageId)!;
}

export function updateReferenceImageStatus(db: AppDatabase, characterId: string, imageId: string, status: string): ReferenceImage[] {
  db.prepare("update reference_images set status = ?, updated_at = ? where id = ? and character_id = ?").run(
    status,
    now(),
    imageId,
    characterId
  );
  return listReferenceImages(db, characterId);
}

export function listRuns(db: AppDatabase): RunSummary[] {
  return db
    .prepare("select id, character_id, type, status, title, error, created_at, updated_at from runs order by created_at desc")
    .all() as unknown as RunSummary[];
}

export function listRunsForCharacter(db: AppDatabase, characterId: string): RunSummary[] {
  return db
    .prepare(
      "select id, character_id, type, status, title, error, created_at, updated_at from runs where character_id = ? order by created_at desc limit 12"
    )
    .all(characterId) as unknown as RunSummary[];
}

export function getRun(db: AppDatabase, runId: string): RunSummary | undefined {
  return db
    .prepare("select id, character_id, type, status, title, error, created_at, updated_at from runs where id = ?")
    .get(runId) as RunSummary | undefined;
}

export function getNextQueuedRun(db: AppDatabase): RunSummary | undefined {
  return db
    .prepare(
      "select id, character_id, type, status, title, error, created_at, updated_at from runs where status = ? order by created_at asc limit 1"
    )
    .get("queued") as RunSummary | undefined;
}

export function listRunEvents(db: AppDatabase, runId: string): RunEventSummary[] {
  return db
    .prepare("select id, run_id, type, message, payload_json, created_at from run_events where run_id = ? order by created_at asc")
    .all(runId)
    .map((row) => parsePayload(row as DbRow));
}

export function listRunArtifacts(db: AppDatabase, runId: string): RunArtifactSummary[] {
  return db
    .prepare("select id, run_id, kind, label, artifact_json, created_at, updated_at from run_artifacts where run_id = ? order by created_at asc")
    .all(runId)
    .map((row) => parseArtifact(row as DbRow));
}

export function listRunDecisions(db: AppDatabase, runId: string): RunDecisionSummary[] {
  return db
    .prepare("select id, run_id, decision, rationale, created_at, updated_at from run_decisions where run_id = ? order by created_at asc")
    .all(runId) as unknown as RunDecisionSummary[];
}

export function insertRun(
  db: AppDatabase,
  input: { characterId?: string | null; type: string; status: string; title: string }
): RunSummary {
  const timestamp = now();
  const runId = id("run");
  db.prepare(
    `insert into runs
      (id, character_id, type, status, title, error, created_at, updated_at)
      values (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(runId, input.characterId ?? null, input.type, input.status, input.title, null, timestamp, timestamp);

  const run = getRun(db, runId);
  if (!run) {
    throw new Error("Run insert failed");
  }
  return run;
}

export function insertRunEvent(
  db: AppDatabase,
  input: { runId: string; type: string; message: string; payload?: unknown }
): RunEventSummary {
  const timestamp = now();
  const eventId = id("event");
  db.prepare(
    `insert into run_events
      (id, run_id, type, message, payload_json, created_at)
      values (?, ?, ?, ?, ?, ?)`
  ).run(eventId, input.runId, input.type, input.message, JSON.stringify(input.payload ?? {}), timestamp);

  return {
    id: eventId,
    run_id: input.runId,
    type: input.type,
    message: input.message,
    payload: input.payload ?? {},
    created_at: timestamp
  };
}

export function updateRunStatus(
  db: AppDatabase,
  runId: string,
  status: string,
  error: string | null = null
): RunSummary {
  db.prepare("update runs set status = ?, error = ?, updated_at = ? where id = ?").run(status, error, now(), runId);
  const run = getRun(db, runId);
  if (!run) {
    throw new Error(`Run not found: ${runId}`);
  }
  return run;
}

export function insertRunArtifact(
  db: AppDatabase,
  input: { runId: string; kind: string; label: string; artifact: unknown }
): RunArtifactSummary {
  const timestamp = now();
  const artifactId = id("artifact");
  db.prepare(
    `insert into run_artifacts
      (id, run_id, kind, label, artifact_json, created_at, updated_at)
      values (?, ?, ?, ?, ?, ?, ?)`
  ).run(artifactId, input.runId, input.kind, input.label, JSON.stringify(input.artifact ?? {}), timestamp, timestamp);

  return {
    id: artifactId,
    run_id: input.runId,
    kind: input.kind,
    label: input.label,
    artifact: input.artifact ?? {},
    created_at: timestamp,
    updated_at: timestamp
  };
}

export function insertRunDecision(
  db: AppDatabase,
  input: { runId: string; decision: string; rationale?: string | null }
): RunDecisionSummary {
  const timestamp = now();
  const decisionId = id("decision");
  db.prepare(
    `insert into run_decisions
      (id, run_id, decision, rationale, created_at, updated_at)
      values (?, ?, ?, ?, ?, ?)`
  ).run(decisionId, input.runId, input.decision, input.rationale ?? null, timestamp, timestamp);

  return {
    id: decisionId,
    run_id: input.runId,
    decision: input.decision,
    rationale: input.rationale ?? null,
    created_at: timestamp,
    updated_at: timestamp
  };
}

export function insertProviderJob(
  db: AppDatabase,
  input: {
    runId?: string | null;
    provider: string;
    status: string;
    request: unknown;
    externalId?: string | null;
    attemptIndex?: number;
    routeTier?: string | null;
    routeReason?: string | null;
    fallbackReason?: string | null;
  }
): ProviderJobSummary {
  const timestamp = now();
  const jobId = id("provider_job");
  db.prepare(
    `insert into provider_jobs
      (id, run_id, provider, external_id, status, request_json, response_json, attempt_index, route_tier, route_reason, fallback_reason, created_at, updated_at)
      values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    jobId,
    input.runId ?? null,
    input.provider,
    input.externalId ?? null,
    input.status,
    JSON.stringify(input.request ?? {}),
    "{}",
    input.attemptIndex ?? 1,
    input.routeTier ?? null,
    input.routeReason ?? null,
    input.fallbackReason ?? null,
    timestamp,
    timestamp
  );
  return getProviderJob(db, jobId)!;
}

export function updateProviderJob(
  db: AppDatabase,
  jobId: string,
  input: { status: string; response: unknown; externalId?: string | null }
): ProviderJobSummary {
  const current = getProviderJob(db, jobId);
  if (!current) {
    throw new Error(`Provider job not found: ${jobId}`);
  }
  db.prepare("update provider_jobs set status = ?, response_json = ?, external_id = ?, updated_at = ? where id = ?").run(
    input.status,
    JSON.stringify(input.response ?? {}),
    input.externalId ?? current.external_id,
    now(),
    jobId
  );
  return getProviderJob(db, jobId)!;
}

export function getProviderJob(db: AppDatabase, jobId: string): ProviderJobSummary | undefined {
  const row = db
    .prepare(
      `select id, run_id, provider, external_id, status, request_json, response_json,
        attempt_index, route_tier, route_reason, fallback_reason, created_at, updated_at
       from provider_jobs where id = ?`
    )
    .get(jobId) as DbRow | undefined;
  return row ? parseProviderJob(row) : undefined;
}

export function listProviderJobsForRun(db: AppDatabase, runId: string): ProviderJobSummary[] {
  return db
    .prepare(
      `select id, run_id, provider, external_id, status, request_json, response_json,
        attempt_index, route_tier, route_reason, fallback_reason, created_at, updated_at
       from provider_jobs where run_id = ? order by created_at asc`
    )
    .all(runId)
    .map((row) => parseProviderJob(row as DbRow));
}

export function insertAsset(
  db: AppDatabase,
  input: {
    characterId?: string | null;
    runId?: string | null;
    promptRecipeId?: string | null;
    filePath?: string | null;
    kind: string;
    status: string;
    provider?: string | null;
    originalPrompt?: string | null;
    negativePrompt?: string | null;
    mimeType?: string | null;
    sizeBytes?: number;
    metadata?: unknown;
  }
): AssetSummary {
  const timestamp = now();
  const assetId = id("asset");
  db.prepare(
    `insert into assets
      (id, character_id, run_id, prompt_recipe_id, file_path, kind, status, provider, original_prompt,
       negative_prompt, mime_type, size_bytes, metadata_json, created_at, updated_at)
      values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    assetId,
    input.characterId ?? null,
    input.runId ?? null,
    input.promptRecipeId ?? null,
    input.filePath ?? null,
    input.kind,
    input.status,
    input.provider ?? null,
    input.originalPrompt ?? null,
    input.negativePrompt ?? null,
    input.mimeType ?? null,
    input.sizeBytes ?? 0,
    JSON.stringify(input.metadata ?? {}),
    timestamp,
    timestamp
  );
  return getAsset(db, assetId)!;
}

export function getAsset(db: AppDatabase, assetId: string): AssetSummary | undefined {
  const row = db
    .prepare(
      `select id, character_id, run_id, prompt_recipe_id, file_path, kind, status, provider, original_prompt,
       negative_prompt, mime_type, size_bytes, metadata_json, created_at, updated_at from assets where id = ?`
    )
    .get(assetId) as DbRow | undefined;
  if (!row) return undefined;
  const asset = parseAsset(row);
  asset.latestAnalysis = getLatestAssetAnalysis(db, asset.id) ?? null;
  return asset;
}

export function listAssets(
  db: AppDatabase,
  filters: { characterId?: string; runId?: string; status?: string; platformFit?: string } = {}
): AssetSummary[] {
  const clauses: string[] = [];
  const params: string[] = [];
  if (filters.characterId) {
    clauses.push("character_id = ?");
    params.push(filters.characterId);
  }
  if (filters.runId) {
    clauses.push("run_id = ?");
    params.push(filters.runId);
  }
  if (filters.status) {
    clauses.push("status = ?");
    params.push(filters.status);
  }
  const sql = `select id, character_id, run_id, prompt_recipe_id, file_path, kind, status, provider, original_prompt,
       negative_prompt, mime_type, size_bytes, metadata_json, created_at, updated_at from assets
       ${clauses.length ? `where ${clauses.join(" and ")}` : ""} order by created_at desc`;
  return db
    .prepare(sql)
    .all(...params)
    .map((row) => {
      const asset = parseAsset(row as DbRow);
      asset.latestAnalysis = getLatestAssetAnalysis(db, asset.id) ?? null;
      return asset;
    })
    .filter((asset) => !filters.platformFit || asset.latestAnalysis?.platform_fit.includes(filters.platformFit));
}

export function updateAssetStatus(db: AppDatabase, assetId: string, status: string, metadataPatch: unknown = {}): AssetSummary {
  const current = getAsset(db, assetId);
  if (!current) {
    throw new Error(`Asset not found: ${assetId}`);
  }
  const metadata = { ...(current.metadata as Record<string, unknown>), ...(metadataPatch as Record<string, unknown>) };
  db.prepare("update assets set status = ?, metadata_json = ?, updated_at = ? where id = ?").run(status, JSON.stringify(metadata), now(), assetId);
  return getAsset(db, assetId)!;
}

export function insertAssetAnalysis(
  db: AppDatabase,
  input: {
    assetId: string;
    provider: string;
    score?: number | null;
    summary?: string | null;
    identityMatch: string;
    identityScore: number;
    qualityScore: number;
    storyFitScore: number;
    platformFit: string[];
    qualityIssues: string[];
    identityNotes?: string | null;
    suggestedPromptFixes: string[];
    altText?: string | null;
    recommendedAction?: string | null;
    raw: unknown;
  }
): AssetAnalysisSummary {
  const timestamp = now();
  const analysisId = id("analysis");
  db.prepare(
    `insert into asset_analysis
      (id, asset_id, provider, score, summary, identity_match, identity_score, quality_score, story_fit_score,
       platform_fit, quality_issues, identity_notes, suggested_prompt_fixes, alt_text, recommended_action,
       raw_json, created_at, updated_at)
      values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    analysisId,
    input.assetId,
    input.provider,
    input.score ?? null,
    input.summary ?? null,
    input.identityMatch,
    input.identityScore,
    input.qualityScore,
    input.storyFitScore,
    JSON.stringify(input.platformFit),
    JSON.stringify(input.qualityIssues),
    input.identityNotes ?? null,
    JSON.stringify(input.suggestedPromptFixes),
    input.altText ?? null,
    input.recommendedAction ?? null,
    JSON.stringify(input.raw ?? {}),
    timestamp,
    timestamp
  );
  return getAssetAnalysis(db, analysisId)!;
}

export function getAssetAnalysis(db: AppDatabase, analysisId: string): AssetAnalysisSummary | undefined {
  const row = db
    .prepare(
      `select id, asset_id, provider, score, summary, identity_match, identity_score, quality_score, story_fit_score,
       platform_fit, quality_issues, identity_notes, suggested_prompt_fixes, alt_text, recommended_action,
       raw_json, created_at, updated_at from asset_analysis where id = ?`
    )
    .get(analysisId) as DbRow | undefined;
  return row ? parseAssetAnalysis(row) : undefined;
}

export function getLatestAssetAnalysis(db: AppDatabase, assetId: string): AssetAnalysisSummary | undefined {
  const row = db
    .prepare(
      `select id, asset_id, provider, score, summary, identity_match, identity_score, quality_score, story_fit_score,
       platform_fit, quality_issues, identity_notes, suggested_prompt_fixes, alt_text, recommended_action,
       raw_json, created_at, updated_at from asset_analysis where asset_id = ? order by created_at desc limit 1`
    )
    .get(assetId) as DbRow | undefined;
  return row ? parseAssetAnalysis(row) : undefined;
}

export function listAssetAnalyses(db: AppDatabase, assetId: string): AssetAnalysisSummary[] {
  return db
    .prepare(
      `select id, asset_id, provider, score, summary, identity_match, identity_score, quality_score, story_fit_score,
       platform_fit, quality_issues, identity_notes, suggested_prompt_fixes, alt_text, recommended_action,
       raw_json, created_at, updated_at from asset_analysis where asset_id = ? order by created_at desc`
    )
    .all(assetId)
    .map((row) => parseAssetAnalysis(row as DbRow));
}

export function insertDraft(
  db: AppDatabase,
  input: {
    characterId: string;
    runId?: string | null;
    contentBriefId?: string | null;
    promptRecipeId?: string | null;
    assetId?: string | null;
    createdFromRunId?: string | null;
    status: string;
    title: string;
    body: string;
    summary?: string | null;
  }
): DraftSummary {
  const timestamp = now();
  const draftId = id("draft");
  db.prepare(
    `insert into drafts
      (id, character_id, run_id, content_brief_id, prompt_recipe_id, asset_id, created_from_run_id,
       status, title, body, summary, created_at, updated_at)
      values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    draftId,
    input.characterId,
    input.runId ?? null,
    input.contentBriefId ?? null,
    input.promptRecipeId ?? null,
    input.assetId ?? null,
    input.createdFromRunId ?? null,
    input.status,
    input.title,
    input.body,
    input.summary ?? null,
    timestamp,
    timestamp
  );
  return getDraft(db, draftId)!;
}

export function getDraft(db: AppDatabase, draftId: string): DraftSummary | undefined {
  const row = db.prepare(
    `select id, character_id, run_id, content_brief_id, prompt_recipe_id, asset_id, created_from_run_id,
     status, title, body, summary, created_at, updated_at from drafts where id = ?`
  ).get(draftId) as DbRow | undefined;
  if (!row) return undefined;
  const draft = parseDraft(row);
  draft.asset = draft.asset_id ? getAsset(db, draft.asset_id) ?? null : null;
  draft.variants = listPlatformVariants(db, draft.id);
  draft.packages = listPublishingPackages(db, draft.id);
  draft.publishingEvents = listPublishingEvents(db, draft.id);
  return draft;
}

export function listDrafts(db: AppDatabase, filters: { status?: string; characterId?: string } = {}): DraftSummary[] {
  const clauses: string[] = [];
  const params: string[] = [];
  if (filters.status) {
    clauses.push("status = ?");
    params.push(filters.status);
  }
  if (filters.characterId) {
    clauses.push("character_id = ?");
    params.push(filters.characterId);
  }
  const sql = `select id, character_id, run_id, content_brief_id, prompt_recipe_id, asset_id, created_from_run_id,
     status, title, body, summary, created_at, updated_at from drafts
     ${clauses.length ? `where ${clauses.join(" and ")}` : ""} order by created_at desc`;
  return db.prepare(sql).all(...params).map((row) => getDraft(db, String((row as DbRow).id))!);
}

export function updateDraftStatus(db: AppDatabase, draftId: string, status: string): DraftSummary {
  db.prepare("update drafts set status = ?, updated_at = ? where id = ?").run(status, now(), draftId);
  const draft = getDraft(db, draftId);
  if (!draft) throw new Error(`Draft not found: ${draftId}`);
  return draft;
}

export function insertPlatformVariant(
  db: AppDatabase,
  input: {
    draftId: string;
    platform: string;
    postFormat: string;
    caption: string;
    hashtags: string;
    altText: string;
    disclosureText: string;
    aiGeneratedFlag?: number;
    paidPartnershipFlag?: number;
    brandContentFlag?: number;
    notes?: string | null;
    status?: string;
    metadata?: unknown;
  }
): PlatformVariantSummary {
  const timestamp = now();
  const variantId = id("variant");
  db.prepare(
    `insert into platform_variants
      (id, draft_id, platform, post_format, caption, hashtags, alt_text, disclosure_text,
       ai_generated_flag, paid_partnership_flag, brand_content_flag, notes, status, metadata_json, created_at, updated_at)
      values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    variantId,
    input.draftId,
    input.platform,
    input.postFormat,
    input.caption,
    input.hashtags,
    input.altText,
    input.disclosureText,
    input.aiGeneratedFlag ?? 1,
    input.paidPartnershipFlag ?? 0,
    input.brandContentFlag ?? 0,
    input.notes ?? null,
    input.status ?? "draft",
    JSON.stringify(input.metadata ?? {}),
    timestamp,
    timestamp
  );
  return getPlatformVariant(db, variantId)!;
}

export function getPlatformVariant(db: AppDatabase, variantId: string): PlatformVariantSummary | undefined {
  const row = db.prepare(
    `select id, draft_id, platform, post_format, caption, hashtags, alt_text, disclosure_text,
     ai_generated_flag, paid_partnership_flag, brand_content_flag, notes, status, metadata_json, created_at, updated_at
     from platform_variants where id = ?`
  ).get(variantId) as DbRow | undefined;
  return row ? parsePlatformVariant(row) : undefined;
}

export function listPlatformVariants(db: AppDatabase, draftId: string): PlatformVariantSummary[] {
  return db.prepare(
    `select id, draft_id, platform, post_format, caption, hashtags, alt_text, disclosure_text,
     ai_generated_flag, paid_partnership_flag, brand_content_flag, notes, status, metadata_json, created_at, updated_at
     from platform_variants where draft_id = ? order by platform asc`
  ).all(draftId).map((row) => parsePlatformVariant(row as DbRow));
}

export function updatePlatformVariant(
  db: AppDatabase,
  variantId: string,
  input: Partial<Pick<PlatformVariantSummary, "post_format" | "caption" | "hashtags" | "alt_text" | "disclosure_text" | "ai_generated_flag" | "paid_partnership_flag" | "brand_content_flag" | "notes" | "status">>
): PlatformVariantSummary {
  const current = getPlatformVariant(db, variantId);
  if (!current) throw new Error(`Platform variant not found: ${variantId}`);
  db.prepare(
    `update platform_variants set post_format = ?, caption = ?, hashtags = ?, alt_text = ?, disclosure_text = ?,
     ai_generated_flag = ?, paid_partnership_flag = ?, brand_content_flag = ?, notes = ?, status = ?, updated_at = ? where id = ?`
  ).run(
    input.post_format ?? current.post_format,
    input.caption ?? current.caption,
    input.hashtags ?? current.hashtags,
    input.alt_text ?? current.alt_text,
    input.disclosure_text ?? current.disclosure_text,
    input.ai_generated_flag ?? current.ai_generated_flag,
    input.paid_partnership_flag ?? current.paid_partnership_flag,
    input.brand_content_flag ?? current.brand_content_flag,
    input.notes ?? current.notes,
    input.status ?? current.status,
    now(),
    variantId
  );
  return getPlatformVariant(db, variantId)!;
}

export function insertPublishingPackage(db: AppDatabase, input: { draftId: string; exportPath: string; files: string[]; status: string }): PublishingPackageSummary {
  const timestamp = now();
  const packageId = id("package");
  db.prepare(
    `insert into publishing_packages (id, draft_id, export_path, files_json, status, created_at, updated_at)
     values (?, ?, ?, ?, ?, ?, ?)`
  ).run(packageId, input.draftId, input.exportPath, JSON.stringify(input.files), input.status, timestamp, timestamp);
  return listPublishingPackages(db, input.draftId).find((item) => item.id === packageId)!;
}

export function listPublishingPackages(db: AppDatabase, draftId: string): PublishingPackageSummary[] {
  return db.prepare("select id, draft_id, export_path, files_json, status, created_at, updated_at from publishing_packages where draft_id = ? order by created_at desc")
    .all(draftId)
    .map((row) => parsePublishingPackage(row as DbRow));
}

export function insertPublishingEvent(
  db: AppDatabase,
  input: { draftId: string; platform: string; status: string; liveUrl?: string | null; publishedAt?: string | null; notes?: string | null }
): PublishingEventSummary {
  const timestamp = now();
  const eventId = id("publish_event");
  db.prepare(
    `insert into publishing_events (id, draft_id, platform, status, live_url, published_at, notes, created_at, updated_at)
     values (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(eventId, input.draftId, input.platform, input.status, input.liveUrl ?? null, input.publishedAt ?? null, input.notes ?? null, timestamp, timestamp);
  return listPublishingEvents(db, input.draftId).find((item) => item.id === eventId)!;
}

export function listPublishingEvents(db: AppDatabase, draftId?: string): PublishingEventSummary[] {
  const sql = `select id, draft_id, platform, status, live_url, published_at, notes, created_at, updated_at from publishing_events
    ${draftId ? "where draft_id = ?" : ""} order by coalesce(published_at, created_at) desc`;
  return (draftId ? db.prepare(sql).all(draftId) : db.prepare(sql).all()).map((row) => parsePublishingEvent(row as DbRow));
}

export function getPublishingEvent(db: AppDatabase, eventId: string): PublishingEventSummary | undefined {
  const row = db.prepare("select id, draft_id, platform, status, live_url, published_at, notes, created_at, updated_at from publishing_events where id = ?").get(eventId) as DbRow | undefined;
  return row ? parsePublishingEvent(row) : undefined;
}

export function insertSocialFeedback(
  db: AppDatabase,
  input: {
    draftId: string;
    publishingEventId?: string | null;
    characterId?: string | null;
    platform: string;
    publishedUrl?: string | null;
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
    feedback?: unknown;
  }
): SocialFeedbackSummary {
  const timestamp = now();
  const feedbackId = id("feedback");
  db.prepare(
    `insert into social_feedback
      (id, draft_id, publishing_event_id, character_id, platform, published_url, impressions, reach, likes, comments, shares, saves,
       profile_visits, follows_gained, qualitative_notes, top_comments, operator_judgment, feedback_json, created_at, updated_at)
      values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    feedbackId,
    input.draftId,
    input.publishingEventId ?? null,
    input.characterId ?? null,
    input.platform,
    input.publishedUrl ?? null,
    input.impressions ?? 0,
    input.reach ?? 0,
    input.likes ?? 0,
    input.comments ?? 0,
    input.shares ?? 0,
    input.saves ?? 0,
    input.profileVisits ?? 0,
    input.followsGained ?? 0,
    input.qualitativeNotes ?? null,
    input.topComments ?? null,
    input.operatorJudgment ?? null,
    JSON.stringify(input.feedback ?? {}),
    timestamp,
    timestamp
  );
  return getSocialFeedback(db, feedbackId)!;
}

export function getSocialFeedback(db: AppDatabase, feedbackId: string): SocialFeedbackSummary | undefined {
  const row = db.prepare(
    `select id, draft_id, publishing_event_id, character_id, platform, published_url, impressions, reach, likes, comments, shares, saves,
     profile_visits, follows_gained, qualitative_notes, top_comments, operator_judgment, feedback_json, created_at, updated_at
     from social_feedback where id = ?`
  ).get(feedbackId) as DbRow | undefined;
  return row ? parseSocialFeedback(row) : undefined;
}

export function listCharacterFeedback(db: AppDatabase, characterId: string): SocialFeedbackSummary[] {
  return db.prepare(
    `select id, draft_id, publishing_event_id, character_id, platform, published_url, impressions, reach, likes, comments, shares, saves,
     profile_visits, follows_gained, qualitative_notes, top_comments, operator_judgment, feedback_json, created_at, updated_at
     from social_feedback where character_id = ? order by created_at desc`
  ).all(characterId).map((row) => parseSocialFeedback(row as DbRow));
}

export function insertReflection(
  db: AppDatabase,
  input: { characterId: string; runId?: string | null; draftId?: string | null; socialFeedbackId?: string | null; summary: string; body: string; reflection: unknown }
): ReflectionSummary {
  const timestamp = now();
  const reflectionId = id("reflection");
  db.prepare(
    `insert into reflections (id, character_id, run_id, draft_id, social_feedback_id, summary, body, reflection_json, created_at, updated_at)
     values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(reflectionId, input.characterId, input.runId ?? null, input.draftId ?? null, input.socialFeedbackId ?? null, input.summary, input.body, JSON.stringify(input.reflection), timestamp, timestamp);
  return getReflection(db, reflectionId)!;
}

export function getReflection(db: AppDatabase, reflectionId: string): ReflectionSummary | undefined {
  const row = db.prepare("select id, character_id, run_id, draft_id, social_feedback_id, summary, body, reflection_json, created_at, updated_at from reflections where id = ?").get(reflectionId) as DbRow | undefined;
  return row ? parseReflection(row) : undefined;
}

export function listCharacterReflections(db: AppDatabase, characterId: string): ReflectionSummary[] {
  return db.prepare("select id, character_id, run_id, draft_id, social_feedback_id, summary, body, reflection_json, created_at, updated_at from reflections where character_id = ? order by created_at desc")
    .all(characterId).map((row) => parseReflection(row as DbRow));
}

export function insertIdentityProposal(
  db: AppDatabase,
  input: { characterId: string; runId?: string | null; kind: string; body: string; rationale: string; sourceRunId?: string | null; sourceReflectionId?: string | null; riskLevel: string; status?: string }
): IdentityUpdateProposalSummary {
  const timestamp = now();
  const proposalId = id("proposal");
  db.prepare(
    `insert into identity_update_proposals
      (id, character_id, run_id, kind, body, rationale, source_run_id, source_reflection_id, risk_level, status, created_at, updated_at)
      values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(proposalId, input.characterId, input.runId ?? null, input.kind, input.body, input.rationale, input.sourceRunId ?? null, input.sourceReflectionId ?? null, input.riskLevel, input.status ?? "proposed", timestamp, timestamp);
  return getIdentityProposal(db, proposalId)!;
}

export function getIdentityProposal(db: AppDatabase, proposalId: string): IdentityUpdateProposalSummary | undefined {
  const row = db.prepare(
    `select id, character_id, run_id, kind, body, rationale, source_run_id, source_reflection_id, risk_level, status, created_at, updated_at
     from identity_update_proposals where id = ?`
  ).get(proposalId) as DbRow | undefined;
  return row ? parseIdentityProposal(row) : undefined;
}

export function listCharacterIdentityProposals(db: AppDatabase, characterId: string): IdentityUpdateProposalSummary[] {
  return db.prepare(
    `select id, character_id, run_id, kind, body, rationale, source_run_id, source_reflection_id, risk_level, status, created_at, updated_at
     from identity_update_proposals where character_id = ? order by created_at desc`
  ).all(characterId).map((row) => parseIdentityProposal(row as DbRow));
}

export function updateIdentityProposalStatus(db: AppDatabase, proposalId: string, status: string): IdentityUpdateProposalSummary {
  db.prepare("update identity_update_proposals set status = ?, updated_at = ? where id = ?").run(status, now(), proposalId);
  const proposal = getIdentityProposal(db, proposalId);
  if (!proposal) throw new Error(`Identity proposal not found: ${proposalId}`);
  return proposal;
}

export function getSetting(db: AppDatabase, key: string): string | undefined {
  const row = db.prepare("select value from settings where key = ?").get(key) as { value: string } | undefined;
  return row?.value;
}

export function setSetting(db: AppDatabase, key: string, value: string) {
  db.prepare(
    `insert into settings (key, value, updated_at) values (?, ?, ?)
     on conflict(key) do update set value = excluded.value, updated_at = excluded.updated_at`
  ).run(key, value, now());
}

export function listComfyWorkflows(db: AppDatabase): ComfyWorkflowSummary[] {
  return db
    .prepare(
      `select id, name, workflow_json, positive_prompt_node, positive_prompt_input, negative_prompt_node, negative_prompt_input,
        seed_node, seed_input, output_node_ids_json, default_for_tiers_json, status, validation_error, created_at, updated_at
       from comfy_workflows order by updated_at desc`
    )
    .all()
    .map((row) => parseComfyWorkflow(row as DbRow));
}

export function getComfyWorkflow(db: AppDatabase, workflowId: string): ComfyWorkflowSummary | undefined {
  const row = db
    .prepare(
      `select id, name, workflow_json, positive_prompt_node, positive_prompt_input, negative_prompt_node, negative_prompt_input,
        seed_node, seed_input, output_node_ids_json, default_for_tiers_json, status, validation_error, created_at, updated_at
       from comfy_workflows where id = ?`
    )
    .get(workflowId) as DbRow | undefined;
  return row ? parseComfyWorkflow(row) : undefined;
}

export function getDefaultComfyWorkflowForTier(db: AppDatabase, tier: string): ComfyWorkflowSummary | undefined {
  return listComfyWorkflows(db).find((workflow) => workflow.status === "active" && workflow.default_for_tiers.includes(tier));
}

export function upsertComfyWorkflow(
  db: AppDatabase,
  input: {
    id?: string;
    name: string;
    workflow: Record<string, unknown>;
    positivePromptNode?: string | null;
    positivePromptInput?: string | null;
    negativePromptNode?: string | null;
    negativePromptInput?: string | null;
    seedNode?: string | null;
    seedInput?: string | null;
    outputNodeIds?: string[];
    defaultForTiers?: string[];
    status?: string;
    validationError?: string | null;
  }
): ComfyWorkflowSummary {
  const timestamp = now();
  const workflowId = input.id ?? id("comfy_workflow");
  db.prepare(
    `insert into comfy_workflows
      (id, name, workflow_json, positive_prompt_node, positive_prompt_input, negative_prompt_node, negative_prompt_input,
       seed_node, seed_input, output_node_ids_json, default_for_tiers_json, status, validation_error, created_at, updated_at)
      values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      on conflict(id) do update set
        name = excluded.name,
        workflow_json = excluded.workflow_json,
        positive_prompt_node = excluded.positive_prompt_node,
        positive_prompt_input = excluded.positive_prompt_input,
        negative_prompt_node = excluded.negative_prompt_node,
        negative_prompt_input = excluded.negative_prompt_input,
        seed_node = excluded.seed_node,
        seed_input = excluded.seed_input,
        output_node_ids_json = excluded.output_node_ids_json,
        default_for_tiers_json = excluded.default_for_tiers_json,
        status = excluded.status,
        validation_error = excluded.validation_error,
        updated_at = excluded.updated_at`
  ).run(
    workflowId,
    input.name,
    JSON.stringify(input.workflow ?? {}),
    input.positivePromptNode ?? null,
    input.positivePromptInput ?? null,
    input.negativePromptNode ?? null,
    input.negativePromptInput ?? null,
    input.seedNode ?? null,
    input.seedInput ?? null,
    JSON.stringify(input.outputNodeIds ?? []),
    JSON.stringify(input.defaultForTiers ?? []),
    input.status ?? "draft",
    input.validationError ?? null,
    timestamp,
    timestamp
  );
  return getComfyWorkflow(db, workflowId)!;
}

export function activateComfyWorkflowForTier(db: AppDatabase, workflowId: string, tier: string): ComfyWorkflowSummary {
  const workflows = listComfyWorkflows(db);
  const target = workflows.find((workflow) => workflow.id === workflowId);
  if (!target) throw new Error(`Comfy workflow not found: ${workflowId}`);
  for (const workflow of workflows) {
    const nextTiers = workflow.id === workflowId
      ? Array.from(new Set([...workflow.default_for_tiers, tier]))
      : workflow.default_for_tiers.filter((item) => item !== tier);
    db.prepare("update comfy_workflows set default_for_tiers_json = ?, updated_at = ? where id = ?").run(JSON.stringify(nextTiers), now(), workflow.id);
  }
  db.prepare("update comfy_workflows set status = 'active', validation_error = null, updated_at = ? where id = ?").run(now(), workflowId);
  return getComfyWorkflow(db, workflowId)!;
}

export function insertActivityCandidate(
  db: AppDatabase,
  input: {
    characterId: string;
    runId?: string | null;
    title: string;
    description: string;
    locationFiction?: string;
    activityType?: string;
    visualMotif?: string;
    platformFit?: string;
    identityFitScore?: number;
    campaignFitScore?: number;
    freshnessScore?: number;
    status?: string;
  }
): ActivityCandidate {
  const timestamp = now();
  const candidateId = id("activity");
  db.prepare(
    `insert into activity_candidates
      (id, character_id, run_id, title, body, location_fiction, activity_type, visual_motif, platform_fit,
       identity_fit_score, campaign_fit_score, freshness_score, status, created_at, updated_at)
      values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    candidateId,
    input.characterId,
    input.runId ?? null,
    input.title,
    input.description,
    input.locationFiction ?? null,
    input.activityType ?? null,
    input.visualMotif ?? null,
    input.platformFit ?? null,
    input.identityFitScore ?? 0,
    input.campaignFitScore ?? 0,
    input.freshnessScore ?? 0,
    input.status ?? "proposed",
    timestamp,
    timestamp
  );
  return getActivityCandidate(db, candidateId)!;
}

export function getActivityCandidate(db: AppDatabase, candidateId: string): ActivityCandidate | undefined {
  return db
    .prepare(
      `select id, character_id, run_id, title, body, location_fiction, activity_type, visual_motif, platform_fit,
       identity_fit_score, campaign_fit_score, freshness_score, status, created_at, updated_at
       from activity_candidates where id = ?`
    )
    .get(candidateId) as ActivityCandidate | undefined;
}

export function listActivityCandidates(db: AppDatabase, characterId?: string): ActivityCandidate[] {
  const sql =
    `select id, character_id, run_id, title, body, location_fiction, activity_type, visual_motif, platform_fit,
     identity_fit_score, campaign_fit_score, freshness_score, status, created_at, updated_at
     from activity_candidates ${characterId ? "where character_id = ?" : ""} order by created_at desc`;
  return (characterId ? db.prepare(sql).all(characterId) : db.prepare(sql).all()) as unknown as ActivityCandidate[];
}

export function updateActivityCandidateStatus(db: AppDatabase, candidateId: string, status: string): ActivityCandidate {
  db.prepare("update activity_candidates set status = ?, updated_at = ? where id = ?").run(status, now(), candidateId);
  return getActivityCandidate(db, candidateId)!;
}

export function insertContentBrief(
  db: AppDatabase,
  input: {
    characterId: string;
    runId?: string | null;
    activityCandidateId?: string | null;
    campaignId?: string | null;
    goal: string;
    platformTargets: string;
    contentPillar: string;
    visualDirection: string;
    captionAngle: string;
    disclosureFlags: string;
    desiredOutputs: string;
    body?: unknown;
  }
): ContentBrief {
  const timestamp = now();
  const briefId = id("brief");
  db.prepare(
    `insert into content_briefs
      (id, character_id, run_id, activity_candidate_id, campaign_id, goal, platform_targets, content_pillar,
       visual_direction, caption_angle, disclosure_flags, desired_outputs, body_json, created_at, updated_at)
      values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    briefId,
    input.characterId,
    input.runId ?? null,
    input.activityCandidateId ?? null,
    input.campaignId ?? null,
    input.goal,
    input.platformTargets,
    input.contentPillar,
    input.visualDirection,
    input.captionAngle,
    input.disclosureFlags,
    input.desiredOutputs,
    JSON.stringify(input.body ?? {}),
    timestamp,
    timestamp
  );
  return getContentBrief(db, briefId)!;
}

export function getContentBrief(db: AppDatabase, briefId: string): ContentBrief | undefined {
  const row = db
    .prepare(
      `select id, character_id, run_id, activity_candidate_id, campaign_id, goal, platform_targets, content_pillar,
       visual_direction, caption_angle, disclosure_flags, desired_outputs, body_json, created_at, updated_at
       from content_briefs where id = ?`
    )
    .get(briefId) as DbRow | undefined;
  return row ? parseContentBrief(row) : undefined;
}

export function listContentBriefs(db: AppDatabase, characterId?: string): ContentBrief[] {
  const sql =
    `select id, character_id, run_id, activity_candidate_id, campaign_id, goal, platform_targets, content_pillar,
     visual_direction, caption_angle, disclosure_flags, desired_outputs, body_json, created_at, updated_at
     from content_briefs ${characterId ? "where character_id = ?" : ""} order by created_at desc`;
  return (characterId ? db.prepare(sql).all(characterId) : db.prepare(sql).all()).map((row) => parseContentBrief(row as DbRow));
}

export function insertPromptRecipe(
  db: AppDatabase,
  input: {
    characterId: string;
    runId?: string | null;
    contentBriefId?: string | null;
    constitutionVersionId?: string | null;
    appearanceProfileId?: string | null;
    finalPrompt: string;
    negativePrompt: string;
    recipe: unknown;
  }
): PromptRecipe {
  const timestamp = now();
  const recipeId = id("prompt_recipe");
  db.prepare(
    `insert into prompt_recipes
      (id, character_id, run_id, content_brief_id, constitution_version_id, appearance_profile_id,
       final_prompt, negative_prompt, recipe_json, created_at, updated_at)
      values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    recipeId,
    input.characterId,
    input.runId ?? null,
    input.contentBriefId ?? null,
    input.constitutionVersionId ?? null,
    input.appearanceProfileId ?? null,
    input.finalPrompt,
    input.negativePrompt,
    JSON.stringify(input.recipe),
    timestamp,
    timestamp
  );
  return getPromptRecipe(db, recipeId)!;
}

export function getPromptRecipe(db: AppDatabase, recipeId: string): PromptRecipe | undefined {
  const row = db
    .prepare(
      `select id, character_id, run_id, content_brief_id, constitution_version_id, appearance_profile_id,
       final_prompt, negative_prompt, recipe_json, created_at, updated_at from prompt_recipes where id = ?`
    )
    .get(recipeId) as DbRow | undefined;
  return row ? parsePromptRecipe(row) : undefined;
}

export function listPromptRecipes(db: AppDatabase, characterId?: string): PromptRecipe[] {
  const sql =
    `select id, character_id, run_id, content_brief_id, constitution_version_id, appearance_profile_id,
     final_prompt, negative_prompt, recipe_json, created_at, updated_at from prompt_recipes
     ${characterId ? "where character_id = ?" : ""} order by created_at desc`;
  return (characterId ? db.prepare(sql).all(characterId) : db.prepare(sql).all()).map((row) => parsePromptRecipe(row as DbRow));
}

export function seedDemoData(db: AppDatabase) {
  const count = db.prepare("select count(*) as count from characters").get() as { count: number };
  if (count.count > 0) {
    return { skipped: true };
  }

  const timestamp = now();
  const characterId = id("char");
  const runId = id("run");

  const insertCharacter = db.prepare(
    "insert into characters (id, name, status, summary, created_at, updated_at) values (?, ?, ?, ?, ?, ?)"
  );
  const insertConstitution = db.prepare(
    `insert into character_constitution_versions
      (id, character_id, version, body, change_reason, is_active, approved_at, created_at, updated_at)
      values (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertText = (table: string, body: string) => {
    db.prepare(
      `insert into ${table} (id, character_id, body, created_at, updated_at) values (?, ?, ?, ?, ?)`
    ).run(id(table), characterId, body, timestamp, timestamp);
  };
  const insertPersona = db.prepare(
    `insert into character_platform_personas
      (id, character_id, platform, body, created_at, updated_at)
      values (?, ?, ?, ?, ?, ?)`
  );
  const insertRun = db.prepare(
    `insert into runs
      (id, character_id, type, status, title, error, created_at, updated_at)
      values (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertEvent = db.prepare(
    `insert into run_events
      (id, run_id, type, message, payload_json, created_at)
      values (?, ?, ?, ?, ?, ?)`
  );

  db.exec("begin");
  try {
    insertCharacter.run(
      characterId,
      "Mira Vale",
      "briefed",
      "A synthetic lifestyle creator focused on quiet design, daily rituals, and behind-the-scenes craft.",
      timestamp,
      timestamp
    );
    insertConstitution.run(
      id("constitution"),
      characterId,
      1,
      "Mira protects visual consistency, speaks with calm specificity, and never claims real-world experiences she did not have.",
      "Initial seeded constitution.",
      1,
      timestamp,
      timestamp,
      timestamp
    );
    insertText(
      "character_appearance_profiles",
      "Warm studio lighting, clean silhouettes, dark bob haircut, natural makeup, tactile neutral wardrobe with one saturated accent."
    );
    insertText(
      "character_voice_guides",
      "Precise, observational, low-hype. Short captions with one concrete sensory detail and one reflective note."
    );
    insertText(
      "character_memory_entries",
      "Prefers morning planning sessions and keeps a visual notebook of recurring motifs."
    );
    db.prepare(
      `insert into character_canon_entries
        (id, character_id, title, body, status, source_run_id, created_at, updated_at)
        values (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id("canon"),
      characterId,
      "Studio Practice",
      "Mira's work is framed as studio-made synthetic media, with process transparency as part of the character.",
      "approved",
      null,
      timestamp,
      timestamp
    );
    for (const platform of ["Instagram", "TikTok", "Threads"]) {
      insertPersona.run(
        id("persona"),
        characterId,
        platform,
        `${platform} persona for concise, platform-ready synthetic creator posts.`,
        timestamp,
        timestamp
      );
    }
    insertRun.run(
      runId,
      characterId,
      "character_birth",
      "completed",
      "Demo Character Birth Run",
      null,
      timestamp,
      timestamp
    );
    for (const [type, message] of [
      ["run.created", "Character birth run created."],
      ["context.loaded", "Loaded constitution, appearance, voice, and platform personas."],
      ["run.completed", "Demo character birth run completed."]
    ]) {
      insertEvent.run(id("event"), runId, type, message, "{}", timestamp);
    }
    db.exec("commit");
  } catch (error) {
    db.exec("rollback");
    throw error;
  }

  return { skipped: false, characterId, runId };
}
