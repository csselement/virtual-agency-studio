import { Fragment, useEffect, useId, useMemo, useState } from "react";
import type { ComponentType, CSSProperties, MouseEvent, ReactNode } from "react";
import {
  Article,
  BookOpen,
  CalendarBlank,
  CaretLeft,
  CaretRight,
  CheckCircle,
  CheckSquare,
  Circle,
  ClockCounterClockwise,
  Command,
  Gear,
  Image,
  MagicWand,
  Package,
  Pulse,
  SquaresFour,
  TiktokLogo,
  ThreadsLogo,
  User,
  X as XIcon,
  XLogo
} from "@phosphor-icons/react";
import type { ApiHealth } from "@virtual-agency/shared";

type RunStatus = "queued" | "running" | "waiting_for_provider" | "needs_review" | "completed" | "failed" | "cancelled";
type SettingsView = "overview" | "logs" | "providers" | "workflows" | "automation" | "manual" | "audit";
type PhosphorIconComponent = ComponentType<{
  "aria-hidden"?: boolean;
  className?: string;
  size?: number;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
}>;

interface CharacterSummary {
  id: string;
  name: string;
  status: string;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

interface ConstitutionVersion {
  id: string;
  version: number;
  body: string;
  change_reason: string | null;
  is_active: number;
  created_at: string;
}

interface CanonEntry {
  id: string;
  title: string;
  body: string;
  status: string;
  source_run_id: string | null;
}

interface MemoryEntry {
  id: string;
  body: string;
  source_type: string;
  source_run_id: string | null;
  confidence: number;
  importance: number;
}

interface BodyEntry {
  id: string;
  body: string;
  created_at: string;
}

interface PlatformPersona {
  id: string;
  platform: string;
  body: string;
}

interface ReferenceImage {
  id: string;
  file_path: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  status: string;
}

interface CharacterDetail extends CharacterSummary {
  constitutions: ConstitutionVersion[];
  canon: CanonEntry[];
  memory: MemoryEntry[];
  appearanceProfiles: BodyEntry[];
  voiceGuides: BodyEntry[];
  platformPersonas: PlatformPersona[];
  referenceImages: ReferenceImage[];
  recentRuns: RunSummary[];
  feedback: SocialFeedback[];
  reflections: ReflectionEntry[];
  identityProposals: IdentityProposal[];
}

interface RunSummary {
  id: string;
  character_id: string | null;
  type: string;
  status: RunStatus;
  title: string;
  error: string | null;
  created_at: string;
  updated_at: string;
}

interface RunEvent {
  id: string;
  run_id: string;
  type: string;
  message: string;
  payload: unknown;
  created_at: string;
}

interface RunArtifact {
  id: string;
  run_id: string;
  kind: string;
  label: string;
  artifact: unknown;
  created_at: string;
  updated_at: string;
}

interface RunDecision {
  id: string;
  run_id: string;
  decision: string;
  rationale: string | null;
  created_at: string;
  updated_at: string;
}

interface ProviderJob {
  id: string;
  provider: string;
  status: string;
  attempt_index?: number;
  route_tier?: string | null;
  route_reason?: string | null;
  fallback_reason?: string | null;
  request: unknown;
  response: unknown;
}

interface RunDetailPayload {
  run: RunSummary;
  events: RunEvent[];
  artifacts: RunArtifact[];
  decisions: RunDecision[];
  providerJobs?: ProviderJob[];
}

interface ProviderSettings {
  mockProviders: boolean;
  defaultImageGenerationProvider: string;
  defaultAnalysisProvider: string;
  hermesBaseUrl: string;
  hermesImageGenerationPath: string;
  hermesImageAnalysisPath: string;
  comfyuiCloudBaseUrl: string;
  comfyuiCloudGenerationPath: string;
  openaiBaseUrl: string;
  openaiImageModel: string;
  openaiImageSize: string;
  openaiImageQuality: string;
  openaiImageOutputFormat: string;
  openaiImageModeration: "auto" | "low";
  wavespeedBaseUrl: string;
  wavespeedImageGenerationPath: string;
  hasHermesApiKey: boolean;
  hasComfyuiCloudApiKey: boolean;
  hasActiveComfyuiCloudWorkflow: boolean;
  comfyuiCloudReady: boolean;
  hasOpenaiApiKey: boolean;
  hasWavespeedApiKey: boolean;
}

interface ComfyWorkflow {
  id: string;
  name: string;
  workflow: Record<string, unknown>;
  positive_prompt_node: string | null;
  positive_prompt_input: string | null;
  negative_prompt_node: string | null;
  negative_prompt_input: string | null;
  seed_node: string | null;
  seed_input: string | null;
  reference_image_node: string | null;
  reference_image_input: string | null;
  output_node_ids: string[];
  default_for_tiers: string[];
  status: string;
  validation_error: string | null;
  updated_at: string;
}

interface ActivityCandidate {
  id: string;
  character_id: string;
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
}

interface ContentBrief {
  id: string;
  activity_candidate_id: string | null;
  goal: string | null;
  platform_targets: string | null;
  content_pillar: string | null;
  visual_direction: string | null;
  caption_angle: string | null;
  disclosure_flags?: string | null;
  desired_outputs?: string | null;
}

interface PromptRecipe {
  id: string;
  character_id?: string;
  run_id?: string | null;
  content_brief_id?: string | null;
  final_prompt: string | null;
  negative_prompt: string | null;
  constitution_version_id: string | null;
  appearance_profile_id: string | null;
  created_at?: string;
}

interface AssetAnalysis {
  id: string;
  provider: string;
  summary?: string | null;
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
}

interface ImageAsset {
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
  created_at: string;
  latestAnalysis?: AssetAnalysis | null;
}

interface PlatformVariant {
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
}

interface PublishingPackage {
  id: string;
  export_path: string;
  files: string[];
  status: string;
  created_at: string;
}

interface PublishingEvent {
  id: string;
  draft_id: string;
  platform: string;
  status: string;
  live_url: string | null;
  published_at: string | null;
  notes: string | null;
  created_at: string;
}

interface SocialFeedback {
  id: string;
  draft_id: string;
  publishing_event_id?: string | null;
  character_id?: string | null;
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
  feedback?: unknown;
  created_at?: string;
  updated_at?: string;
}

interface ReflectionEntry {
  id: string;
  character_id?: string;
  run_id: string | null;
  draft_id?: string | null;
  social_feedback_id?: string | null;
  summary: string | null;
  body: string;
  reflection?: unknown;
  created_at?: string;
  updated_at?: string;
}

interface IdentityProposal {
  id: string;
  character_id?: string;
  run_id?: string | null;
  kind: string;
  body: string;
  rationale: string | null;
  risk_level: string;
  source_run_id?: string | null;
  source_reflection_id?: string | null;
  status: string;
}

interface Draft {
  id: string;
  character_id: string;
  run_id: string | null;
  content_brief_id: string | null;
  prompt_recipe_id: string | null;
  asset_id: string | null;
  status: string;
  title: string;
  body: string;
  summary: string | null;
  created_at: string;
  asset?: ImageAsset | null;
  variants?: PlatformVariant[];
  packages?: PublishingPackage[];
  publishingEvents?: PublishingEvent[];
}

interface AutomationSettings {
  enableDailyActivityRuns: boolean;
  dailyRunTime: string;
  defaultCharacterIds: string[];
  defaultPlatforms: string[];
  defaultImageProvider: string;
  defaultAnalysisProvider: string;
  maxImagesPerRun: number;
  requireReviewBeforeDraft: boolean;
  autoSelectTopActivity: boolean;
}

interface AutomationStatus {
  settings: AutomationSettings;
  schedulerEnabled: boolean;
  nextRunAt: string | null;
  lastSchedulerCheckAt: string | null;
  lastTriggeredAt: string | null;
  currentlyRunning: RunSummary | null;
  runsNeedingReview: RunSummary[];
}

interface AppData {
  health: ApiHealth | null;
  characters: CharacterSummary[];
  runs: RunSummary[];
  automationStatus: AutomationStatus | null;
  workflowSummary: WorkflowStageSummary[];
}

type WorkflowStageId = "heartbeat" | "birth" | "production" | "review" | "publishing" | "feedback";
type WorkflowStageStatus = "blocked" | "ready" | "attention" | "complete";
type WorkModeId = "command" | "talent" | "create" | "bookings" | "library" | "review" | "calendar" | "insights" | "settings" | "help" | "runs";

interface WorkflowStageSummary {
  id: WorkflowStageId;
  label: string;
  path: string;
  status: WorkflowStageStatus;
  count: number;
  detail: string;
  primaryActionLabel: string;
  primaryActionPath: string;
}

export const workflowStageModel: Array<{
  id: WorkflowStageId;
  label: string;
  detail: string;
  path: string;
  icon: PhosphorIconComponent;
}> = [
  { id: "heartbeat", label: "Director's Desk", detail: "Today's decisions", path: "/", icon: Pulse },
  { id: "birth", label: "Scouting", detail: "New faces", path: "/create", icon: User },
  { id: "production", label: "Portfolio", detail: "Candidate work", path: "/library", icon: Package },
  { id: "review", label: "Review Desk", detail: "Director approval", path: "/review", icon: CheckSquare },
  { id: "publishing", label: "Publishing", detail: "Placements", path: "/calendar", icon: CalendarBlank },
  { id: "feedback", label: "Audience", detail: "Audience response", path: "/insights", icon: BookOpen }
];

export const workModeModel: Array<{
  id: WorkModeId;
  label: string;
  detail: string;
  path: string;
  icon: PhosphorIconComponent;
}> = [
  { id: "command", label: "Director's Desk", path: "/", detail: "Today's decisions", icon: Pulse },
  { id: "talent", label: "Roster", path: "/talent", detail: "Represented talent", icon: User },
  { id: "create", label: "Scouting", path: "/create", detail: "New faces", icon: MagicWand },
  { id: "bookings", label: "Bookings", path: "/prompt-studio", detail: "Creative briefs", icon: Article },
  { id: "library", label: "Portfolio", path: "/library", detail: "Candidate work", icon: Package },
  { id: "review", label: "Review Desk", path: "/review", detail: "Director approval", icon: CheckSquare },
  { id: "calendar", label: "Publishing", path: "/calendar", detail: "Placements", icon: CalendarBlank },
  { id: "insights", label: "Audience", path: "/insights", detail: "Audience response", icon: BookOpen },
  { id: "settings", label: "Studio Ops", path: "/settings", detail: "Studio operations", icon: Gear },
  { id: "help", label: "Guide", path: "/help", detail: "Agency guide", icon: BookOpen }
];

export const supportNavPaths = ["/help"];

const navItems = workModeModel;

const workModeSteps = workModeModel.filter((mode) => !["command", "settings", "help", "runs"].includes(mode.id));
const newFaceIntakeSteps = [
  "Market Opportunity",
  "Identity Seed",
  "Look Direction",
  "Voice and Inner Life",
  "Platform Fit",
  "First Portfolio Test",
  "New Face Dossier"
] as const;

const runTypeLabels: Record<string, string> = {
  character_birth: "New Face Birth",
  daily_activity: "Daily Activity",
  prompt_generation: "Prompt Generation",
  image_generation: "Image Generation",
  image_analysis: "Image Analysis",
  draft_packaging: "Draft Packaging",
  feedback_reflection: "Audience Debrief",
  canon_evolution: "Canon Evolution"
};

export function apiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:4317";
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not yet";
  }
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatTime(value: string | null | undefined) {
  if (!value) {
    return "Not scheduled";
  }
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatBytes(value: number | null | undefined) {
  if (!value) {
    return "0 KB";
  }
  if (value < 1024 * 1024) {
    return `${Math.max(1, Math.round(value / 1024))} KB`;
  }
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function shortRunId(id: string) {
  return id.replace(/^run_/, "").slice(0, 8);
}

function displayModelName(name: string) {
  return name.replace(/\s+\d{4}-\d{2}-\d{2}T[\d-]+Z$/, "").trim() || name;
}

function modelInitials(name: string) {
  return displayModelName(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function compactInlineText(value: string | null | undefined, maxLength: number) {
  const normalized = (value ?? "").replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? normalized.slice(0, maxLength).trim() : normalized;
}

function normalizePlatform(value: string | null | undefined) {
  return (value ?? "post").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function platformLabel(value: string | null | undefined) {
  const normalized = normalizePlatform(value);
  if (normalized === "x" || normalized === "twitter") return "X";
  if (normalized === "tiktok") return "TikTok";
  if (normalized === "youtube") return "YouTube";
  if (normalized === "instagram") return "Instagram";
  if (normalized === "threads") return "Threads";
  if (normalized === "blog") return "Blog";
  if (normalized === "generic") return "Generic";
  if (!value) return "Post";
  return value;
}

function platformClass(platform: string | null | undefined) {
  const normalized = normalizePlatform(platform);
  if (normalized === "instagram") return "platform-instagram";
  if (normalized === "tiktok") return "platform-tiktok";
  if (normalized === "x" || normalized === "twitter") return "platform-x";
  if (normalized === "youtube") return "platform-youtube";
  if (normalized === "threads") return "platform-threads";
  if (normalized === "blog") return "platform-blog";
  return "platform-generic";
}

function iconSizeStyle(size: number) {
  return { "--brand-icon-size": `${size}px` } as CSSProperties;
}

function InstagramBrandIcon({ size }: { size: number }) {
  const gradientId = useId();

  return (
    <svg className="brand-icon brand-icon-instagram-spectrum" aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" role="img">
      <defs>
        <radialGradient id={`${gradientId}-ig`} cx="30%" cy="108%" r="120%">
          <stop offset="0%" stopColor="var(--brand-instagram-yellow)" />
          <stop offset="32%" stopColor="var(--brand-instagram-orange)" />
          <stop offset="58%" stopColor="var(--brand-instagram-red)" />
          <stop offset="82%" stopColor="var(--brand-instagram-pink)" />
          <stop offset="100%" stopColor="var(--brand-instagram-purple)" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5.2" fill={`url(#${gradientId}-ig)`} />
      <rect x="7" y="7" width="10" height="10" rx="3.2" fill="none" stroke="white" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2.5" fill="none" stroke="white" strokeWidth="1.8" />
      <circle cx="16" cy="8" r="1.05" fill="white" />
    </svg>
  );
}

function TikTokBrandIcon({ size }: { size: number }) {
  return (
    <span className="brand-icon brand-icon-tiktok-spectrum" aria-hidden="true" style={iconSizeStyle(size)}>
      <TiktokLogo className="brand-icon-layer brand-icon-layer-cyan" size={size} weight="fill" />
      <TiktokLogo className="brand-icon-layer brand-icon-layer-red" size={size} weight="fill" />
      <TiktokLogo className="brand-icon-layer brand-icon-layer-black" size={size} weight="fill" />
    </span>
  );
}

function YouTubeBrandIcon({ size }: { size: number }) {
  return (
    <svg className="brand-icon brand-icon-youtube-spectrum" aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" role="img">
      <rect x="2" y="6" width="20" height="12" rx="3.6" fill="var(--brand-youtube-red)" />
      <path d="M10 9.25v5.5L15 12z" fill="white" />
    </svg>
  );
}

function platformIcon(platform: string | null | undefined, size = 16) {
  const normalized = normalizePlatform(platform);
  if (normalized === "instagram") return <InstagramBrandIcon size={size} />;
  if (normalized === "tiktok") return <TikTokBrandIcon size={size} />;
  if (normalized === "x" || normalized === "twitter") return <XLogo className="brand-icon brand-icon-x" aria-hidden="true" size={size} weight="bold" />;
  if (normalized === "youtube") return <YouTubeBrandIcon size={size} />;
  if (normalized === "threads") return <ThreadsLogo className="brand-icon brand-icon-threads" aria-hidden="true" size={size} weight="bold" />;
  if (normalized === "blog") return <Article aria-hidden="true" size={size} weight="regular" />;
  return <SquaresFour aria-hidden="true" size={size} weight="regular" />;
}

function SystemIcon({ icon: Icon, weight = "regular" }: { icon: PhosphorIconComponent; weight?: "regular" | "bold" | "fill" }) {
  return <Icon aria-hidden className="ui-icon" size={18} weight={weight} />;
}

function runTypeLabel(type: string) {
  return runTypeLabels[type] ?? type.replaceAll("_", " ");
}

function currentStep(run: RunSummary, events: RunEvent[] = []) {
  if (run.error) {
    return run.error;
  }
  const latest = events.at(-1);
  if (latest) {
    return latest.message;
  }
  if (run.status === "queued") {
    return "Waiting in local queue";
  }
  if (run.status === "needs_review") {
    return "Waiting for human review";
  }
  return run.status.replaceAll("_", " ");
}

function nextAction(run: RunSummary) {
  if (run.status === "failed") {
    return "Failure needs Studio Ops inspection before related agency work continues.";
  }
  if (run.status === "needs_review") {
    return "This production log is parked at a review gate; make the director decision from Review Desk.";
  }
  if (run.status === "queued") {
    return "This production job is queued in the local runner.";
  }
  if (run.status === "running" || run.status === "waiting_for_provider") {
    return "Watch engine and event entries for the next state change.";
  }
  if (run.status === "completed") {
    return "Machine work completed; use the relevant agency screen for the next director action.";
  }
  return "No action required.";
}

function usePath() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (nextPath: string) => {
    window.history.pushState({}, "", nextPath);
    setPath(window.location.pathname);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.requestAnimationFrame(() => document.getElementById("workspace")?.focus({ preventScroll: true }));
  };

  return { path, navigate };
}

function searchParamsFrom(search?: string) {
  if (search !== undefined) {
    return new URLSearchParams(search);
  }
  return new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
}

export function readCharacterRouteState(search?: string) {
  return { selected: searchParamsFrom(search).get("selected") ?? "" };
}

export function readAssetRouteState(search?: string) {
  const params = searchParamsFrom(search);
  return {
    characterId: params.get("characterId") ?? "",
    status: params.get("status") ?? "",
    platformFit: params.get("platformFit") ?? ""
  };
}

export function readDraftRouteState(search?: string) {
  return { status: searchParamsFrom(search).get("status") ?? "" };
}

export function readReviewRouteState(search?: string) {
  const type = searchParamsFrom(search).get("type") ?? "all";
  const allowedTypes: Array<ReviewDecisionType | "all"> = ["all", "portfolio_candidate", "social_package", "career_direction", "studio_attention"];
  return { type: allowedTypes.includes(type as ReviewDecisionType | "all") ? (type as ReviewDecisionType | "all") : "all" };
}

export function readCalendarRouteState(search?: string) {
  return { bucket: searchParamsFrom(search).get("bucket") ?? "all" };
}

export function readFeedbackRouteState(search?: string) {
  return { eventId: searchParamsFrom(search).get("eventId") ?? "" };
}

function replaceRouteQuery(path: string, values: Record<string, string | null | undefined>) {
  const params = new URLSearchParams(window.location.search);
  Object.entries(values).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  });
  const query = params.toString();
  window.history.replaceState({}, "", query ? `${path}?${query}` : path);
}

function useAppData() {
  const [data, setData] = useState<AppData>({ health: null, characters: [], runs: [], automationStatus: null, workflowSummary: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let timeoutId: number | undefined;

    async function load() {
      try {
        const [healthResponse, charactersResponse, runsResponse, automationResponse, workflowResponse] = await Promise.all([
          fetch(`${apiBaseUrl()}/health`),
          fetch(`${apiBaseUrl()}/api/characters`),
          fetch(`${apiBaseUrl()}/api/runs`),
          fetch(`${apiBaseUrl()}/api/automation/status`),
          fetch(`${apiBaseUrl()}/api/workflow/summary`)
        ]);

        if (!healthResponse.ok || !charactersResponse.ok || !runsResponse.ok || !automationResponse.ok || !workflowResponse.ok) {
          throw new Error("One or more local API requests failed.");
        }

        const [health, charactersPayload, runsPayload, automationPayload, workflowPayload] = await Promise.all([
          healthResponse.json() as Promise<ApiHealth>,
          charactersResponse.json() as Promise<{ characters: CharacterSummary[] }>,
          runsResponse.json() as Promise<{ runs: RunSummary[] }>,
          automationResponse.json() as Promise<{ status: AutomationStatus }>,
          workflowResponse.json() as Promise<{ stages: WorkflowStageSummary[] }>
        ]);

        if (active) {
          setData({
            health,
            characters: charactersPayload.characters,
            runs: runsPayload.runs,
            automationStatus: automationPayload.status,
            workflowSummary: workflowPayload.stages
          });
          setError(null);
          setLoading(false);
        }
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : "Unable to load agency desk.");
          setLoading(false);
        }
      } finally {
        if (active) {
          timeoutId = window.setTimeout(load, 5000);
        }
      }
    }

    void load();

    return () => {
      active = false;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return { data, loading, error };
}

function statusClass(status: string) {
  return `status-pill ${status}`;
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function assetStatusLabel(status: string) {
  if (status === "raw_generation") return "Raw";
  if (status === "candidate") return "Candidate";
  if (status === "approved_post_asset") return "Post";
  if (status === "approved_reference") return "Reference";
  if (status === "published") return "Published";
  if (status.startsWith("rejected")) return "Rejected";
  return statusLabel(status);
}

const rawIdTextPattern = /\b(?:asset|run|draft|prompt_recipe|feedback|reflection|proposal|activity|brief|char)_[a-z0-9-]+\b/gi;
const generatedPackageTitlePattern = /^(?:post|placement) package for [0-9a-f]{8}(?:-[0-9a-f-]+)?$/i;

export function safeAssetAltText(altText: string | null | undefined, fallback: string) {
  const source = altText?.trim();
  if (!source) return fallback;
  const stripped = source
    .replace(rawIdTextPattern, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/\bfor\s*[.]?$/i, "")
    .trim();
  if (!stripped || /^mock alt text\b/i.test(stripped)) return fallback;
  return stripped;
}

export function profileReferenceImage(referenceImages: ReferenceImage[]) {
  return referenceImages.find((image) => image.status === "approved") ?? referenceImages[0] ?? null;
}

export function agencyFacingPackageTitle(title: string | null | undefined, talentName?: string | null) {
  const source = title?.trim();
  if (!source || generatedPackageTitlePattern.test(source)) {
    return talentName ? `${displayModelName(talentName)} placement` : "Placement package";
  }
  return source;
}

export function agencyFacingStagePresentation(
  stageId: WorkflowStageId,
  detail: string,
  primaryActionLabel: string,
  primaryActionPath: string
) {
  const normalizedDetail = agencyFacingCountDetail(detail);
  const normalizedPath = remapLegacyModePath(primaryActionPath);
  if (stageId === "birth") {
    return {
      detail: normalizedDetail.replace(/Birth Run output/gi, "Birth Dossier"),
      primaryActionLabel: "Review Birth Dossier",
      primaryActionPath: "/create"
    };
  }
  if (stageId === "review") {
    return {
      detail: normalizedDetail,
      primaryActionLabel: "Review Decisions",
      primaryActionPath: "/review"
    };
  }
  if (stageId === "publishing") {
    return {
      detail: normalizedDetail,
      primaryActionLabel: "Open Publishing",
      primaryActionPath: "/calendar"
    };
  }
  if (stageId === "production") {
    return {
      detail: normalizedDetail,
      primaryActionLabel: "Review Portfolio",
      primaryActionPath: "/library"
    };
  }
  if (stageId === "feedback") {
    return {
      detail: normalizedDetail,
      primaryActionLabel: /reflection|debrief/i.test(primaryActionLabel) ? "Debrief Audience Response" : "Log Audience Response",
      primaryActionPath: normalizedPath
    };
  }
  return { detail: normalizedDetail, primaryActionLabel, primaryActionPath: normalizedPath };
}

function agencyFacingCountDetail(detail: string) {
  return detail.replace(/^1 (.+?) need\b/i, "1 $1 needs");
}

function remapLegacyModePath(path: string) {
  if (path === "/characters" || path.startsWith("/characters?")) return path.replace(/^\/characters/, "/talent");
  if (path === "/prompt-studio" || path.startsWith("/prompt-studio?")) return path;
  if (path === "/assets" || path.startsWith("/assets?")) return path.replace(/^\/assets/, "/library");
  if (path === "/drafts" || path.startsWith("/drafts?")) return path.replace(/^\/drafts/, "/review");
  if (path === "/feedback" || path.startsWith("/feedback?")) return path.replace(/^\/feedback/, "/insights");
  return path;
}

function workModeActive(path: string, modeId: WorkModeId) {
  if (modeId === "command") return path === "/";
  if (modeId === "create") return path === "/create";
  if (modeId === "bookings") return path === "/prompt-studio";
  if (modeId === "runs") return path === "/runs" || path.startsWith("/runs/");
  if (modeId === "review") return path === "/review" || path === "/drafts";
  if (modeId === "calendar") return path === "/calendar";
  if (modeId === "library") return path === "/library" || path === "/assets";
  if (modeId === "talent") return path === "/talent" || path.startsWith("/characters");
  if (modeId === "insights") return path === "/insights" || path === "/feedback";
  if (modeId === "settings") return path === "/settings" || path === "/runs" || path.startsWith("/runs/");
  if (modeId === "help") return path === "/help";
  return false;
}

function stageSummaryForMode(data: AppData, modeId: WorkModeId) {
  const stageIdByMode: Partial<Record<WorkModeId, WorkflowStageId>> = {
    command: "heartbeat",
    create: "birth",
    bookings: "production",
    review: "review",
    calendar: "publishing",
    library: "production",
    talent: "birth",
    insights: "feedback"
  };
  if (modeId === "runs") {
    const activeRuns = data.runs.filter((run) => ["queued", "running", "waiting_for_provider"].includes(run.status)).length;
    const reviewRuns = data.runs.filter((run) => run.status === "needs_review").length;
    return { count: activeRuns + reviewRuns, status: activeRuns ? "active" : reviewRuns ? "review" : "history" };
  }
  const stageId = stageIdByMode[modeId];
  return stageId ? data.workflowSummary.find((stage) => stage.id === stageId) : null;
}

function getWorkflowStage(data: AppData, stageId: WorkflowStageId) {
  const model = workflowStageModel.find((stage) => stage.id === stageId);
  const summary = data.workflowSummary.find((stage) => stage.id === stageId);
  if (summary && model) {
    return {
      ...summary,
      label: model.label,
      path: model.path,
      primaryActionPath: remapLegacyModePath(summary.primaryActionPath)
    };
  }
  return model;
}

function characterNeedsSetup(character: CharacterSummary, characterRunIds: Set<string | null>) {
  const status = character.status.toLowerCase();
  return ["idea", "draft", "setup", "needs_setup", "incomplete"].some((value) => status.includes(value)) || !characterRunIds.has(character.id);
}

function activeRunProgress(run: RunSummary) {
  const total = 5;
  const currentByStatus: Record<RunStatus, number> = {
    queued: 1,
    running: 2,
    waiting_for_provider: 3,
    needs_review: 4,
    completed: 5,
    failed: 2,
    cancelled: 1
  };
  const current = currentByStatus[run.status] ?? 1;
  return `${current} of ${total} steps ${run.status === "queued" ? "queued" : run.status === "failed" || run.status === "cancelled" ? "reached" : "complete"}`;
}

function activeRunStatusText(run: RunSummary) {
  if (run.status === "waiting_for_provider") {
    if (run.type === "image_generation" || run.type === "daily_activity") return "Waiting for image results";
    return "Waiting for provider results";
  }
  if (run.status === "running") return "Running";
  if (run.status === "queued") return "Queued";
  return statusLabel(run.status);
}

function humanRunTitle(run: RunSummary) {
  const cleaned = run.title
    .replace(/\b\d{4}-\d{2}-\d{2}T[\d-]+Z\b/g, "")
    .replace(/^Phase\s+\d+\s+Smoke\s+/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (!cleaned || cleaned.toLowerCase() === run.type.replaceAll("_", " ")) return runTypeLabel(run.type);
  return cleaned;
}

function reviewItemLabel(run: RunSummary) {
  const title = humanRunTitle(run);
  if (run.type === "image_generation" || run.type === "image_analysis") return `Image set: ${title}`;
  if (run.type === "draft_packaging") return `Caption draft: ${title}`;
  if (run.type === "prompt_generation") return `Prompt set: ${title}`;
  if (run.type === "feedback_reflection" || run.type === "canon_evolution" || run.type === "character_birth") return `Character update: ${title}`;
  if (run.type === "daily_activity") return `Creative run: ${title}`;
  return title;
}

interface DirectorDeskItem {
  id: string;
  title: string;
  detail: string;
  path: string;
  actionLabel: string;
  count?: number;
  priority?: number;
}

interface DirectorDeskModel {
  todayDecisions: DirectorDeskItem[];
  starWatch: DirectorDeskItem[];
  todaysBookings: DirectorDeskItem[];
  audienceSignals: DirectorDeskItem[];
  publishingFollowUp: DirectorDeskItem[];
  primaryAction: {
    label: string;
    path: string;
  };
  studioOpsHealth: {
    summary: string;
    detail: string;
    apiStatus: string;
    engineStatus: string;
    schedulerState: string;
    activeProductions: number;
    failedProductions: number;
  };
}

type TalentStageId = "star_talent" | "core_talent" | "rising_talent" | "development" | "new_face" | "at_risk" | "paused_retired";
type AgencyPriority = "push" | "develop" | "test" | "pause" | "retire";

interface TalentCareerSummary {
  talentId: string;
  displayName: string;
  stage: TalentStageId;
  agencyPriority: AgencyPriority;
  shortPositioning: string;
  bestPlatform: string;
  momentum: string;
  identityStability: string;
  developmentRisk: "low" | "medium" | "high" | "unknown";
  nextRecommendedMove: string;
  pendingDecisionCount: number;
  latestAudienceSignal: string;
  updatedAt: string;
}

type AudienceResultId = "strong" | "promising" | "mixed" | "weak" | "unknown";

interface AudienceDebriefModel {
  id: string;
  feedbackId: string;
  talentId: string;
  talentName: string;
  platform: string;
  result: {
    id: AudienceResultId;
    label: string;
    detail: string;
  };
  summary: string;
  whatWorked: string[];
  whatFailed: string[];
  commentThemes: string[];
  meaningForTalent: string;
  recommendedNextTest: string;
  careerDirection: {
    label: string;
    body: string;
    rationale: string;
    proposalId?: string;
    kind?: string;
    status?: string;
    actionLabel?: string;
  };
  pendingProposals: IdentityProposal[];
  metrics: {
    impressions: number;
    reach: number;
    engagement: number;
    engagementRate: number | null;
    engagementRateLabel: string;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    profileVisits: number;
    followsGained: number;
  };
  createdAt: string | null;
  technicalSource: {
    publishingEventId?: string | null;
    draftId?: string | null;
    reflectionId?: string | null;
    runId?: string | null;
  };
  technicalAudit: unknown;
}

type StrategyLaneId = "star_talent" | "core_talent" | "rising_talent" | "development_bets" | "at_risk" | "paused_retired";

interface StrategyBoardTalent {
  talentId: string;
  displayName: string;
  lane: StrategyLaneId;
  agencyPriority: AgencyPriority;
  momentum: string;
  audiencePull: string;
  identityStrength: string;
  platformFit: string;
  developmentRisk: string;
  recommendedInvestment: string;
  nextMove: string;
  feedbackCount: number;
  pendingCareerDirections: number;
  latestSignal: string;
  technicalAudit: unknown;
}

interface StrategyBoardModel {
  summary: {
    representedTalent: number;
    pushCount: number;
    developmentCount: number;
    riskCount: number;
  };
  lanes: Array<{
    id: StrategyLaneId;
    label: string;
    detail: string;
    talent: StrategyBoardTalent[];
  }>;
  technicalAudit: unknown;
}

interface StudioOpsModel {
  headline: string;
  primaryQuestion: string;
  overviewCards: Array<{ label: string; value: string | number; detail: string }>;
  tabs: Array<{ id: SettingsView; label: string; value: string | number; detail: string }>;
  productionLogSummary: {
    total: number;
    active: number;
    review: number;
    failed: number;
    latestFailure: RunSummary | null;
  };
  providerReadiness: Array<{ label: string; status: string; detail: string }>;
  technicalAudit: {
    api: { ok: boolean; service: string; version?: string; dataDir?: string };
    productionLogIds: string[];
    workflowIds: string[];
    promptRecipeIds: string[];
    assetIds: string[];
  };
}

interface NewFaceDossierStep {
  id: string;
  label: string;
  detail: string;
  status: "ready" | "needs_input" | "review";
}

interface NewFaceDossier {
  talentId: string;
  displayName: string;
  stageLabel: string;
  publicPromise: string;
  marketOpportunity: string;
  identitySeed: string;
  visualDirection: string;
  voiceInteriority: string;
  bestInitialPlatform: string;
  platformFit: string;
  developmentRisk: string;
  recommendedFirstBooking: string;
  directorDecision: string;
  latestBirthRun: RunSummary | null;
  productionLogPath: string | null;
  steps: NewFaceDossierStep[];
}

type BookingStatus = "idea" | "brief_ready" | "treatment_ready" | "in_production" | "ready_for_review" | "completed" | "cancelled";

interface BookingDeskModel {
  id: string;
  talentId: string;
  talentName: string;
  platform: string;
  title: string;
  careerGoal: string;
  bookingIdea: string;
  shootBriefSummary: string;
  creativeTreatmentSummary: string;
  audienceHypothesis: string;
  status: BookingStatus;
  primaryActionLabel: string;
  nextStep: string;
  productionPath: string;
  technicalSource: {
    activityCandidateId?: string;
    contentBriefId?: string;
    promptRecipeId?: string;
    runId?: string | null;
  };
}

type ReviewDecisionType = "portfolio_candidate" | "social_package" | "career_direction" | "studio_attention";

interface ReviewDecisionPacket {
  id: string;
  type: ReviewDecisionType;
  title: string;
  talentId: string | null;
  talentName: string;
  statusLabel: string;
  summary: string;
  recommendation: string;
  why: string[];
  risk: string;
  consequence: string;
  primaryActionLabel: string;
  secondaryActionLabels: string[];
  previewImageAssetId?: string | null;
  previewAlt: string;
  createdAt: string | null;
  priority: number;
  technicalSource: {
    assetId?: string | null;
    draftId?: string | null;
    proposalId?: string | null;
    runId?: string | null;
  };
  technicalAudit: unknown;
}

const rosterLaneModel: Array<{ id: TalentStageId; label: string; detail: string }> = [
  { id: "star_talent", label: "Star Talent", detail: "earned repeated public pull" },
  { id: "core_talent", label: "Core Talent", detail: "reliable agency performers" },
  { id: "rising_talent", label: "Rising Talent", detail: "positive signal to push" },
  { id: "development", label: "Development", detail: "needs shaping or testing" },
  { id: "new_face", label: "New Faces", detail: "scouted or newly born" },
  { id: "at_risk", label: "At Risk", detail: "weak signal or production concern" },
  { id: "paused_retired", label: "Paused / Retired", detail: "not actively booking" }
];

function countFromWorkflowDetail(stage: WorkflowStageSummary | undefined, phrase: string) {
  if (!stage) return 0;
  const pattern = phrase
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\ /g, "\\s+");
  const match = stage.detail.match(new RegExp(`(\\d+)\\s+${pattern}s?\\b`, "i"));
  return match ? Number(match[1]) : 0;
}

function stagePath(stage: WorkflowStageSummary | undefined, fallback: string) {
  return remapLegacyModePath(stage?.primaryActionPath ?? fallback);
}

function productionDeskStatus(run: RunSummary) {
  if (run.status === "waiting_for_provider") return "Waiting on production results";
  if (run.status === "running") return "In production";
  if (run.status === "queued") return "Queued for production";
  return statusLabel(run.status);
}

function productionPathForRun(run: RunSummary) {
  if (run.type === "draft_packaging") return "/review";
  if (run.type === "image_generation" || run.type === "image_analysis") return "/library";
  if (run.type === "feedback_reflection" || run.type === "canon_evolution") return "/insights";
  if (run.type === "character_birth") return "/create";
  return "/prompt-studio";
}

function bookingTitleForRun(run: RunSummary) {
  if (run.type === "daily_activity") return "Daily booking in production";
  if (run.type === "prompt_generation") return "Creative treatment being prepared";
  if (run.type === "image_generation") return "Portfolio production underway";
  if (run.type === "image_analysis") return "Portfolio quality review underway";
  if (run.type === "draft_packaging") return "Social package being assembled";
  return humanRunTitle(run);
}

function buildCharacterRunMap(runs: RunSummary[]) {
  return runs.reduce<Map<string, RunSummary[]>>((map, run) => {
    if (!run.character_id) return map;
    const nextRuns = map.get(run.character_id) ?? [];
    nextRuns.push(run);
    map.set(run.character_id, nextRuns);
    return map;
  }, new Map<string, RunSummary[]>());
}

function hasCharacterDetail(character: CharacterSummary | CharacterDetail): character is CharacterDetail {
  return "recentRuns" in character;
}

function talentStageLabel(stage: TalentStageId) {
  return rosterLaneModel.find((lane) => lane.id === stage)?.label ?? stage.replaceAll("_", " ");
}

function agencyPriorityLabel(priority: AgencyPriority) {
  if (priority === "push") return "Push";
  if (priority === "develop") return "Develop";
  if (priority === "test") return "Test";
  if (priority === "pause") return "Pause";
  return "Retire";
}

function visibleSummary(value: string | null | undefined) {
  const normalized = (value ?? "").replace(/\s+/g, " ").trim();
  return normalized || "Positioning is still being shaped.";
}

function judgmentText(character: CharacterSummary | CharacterDetail) {
  if (!hasCharacterDetail(character)) return "";
  return character.feedback.map((item) => [item.operator_judgment, item.qualitative_notes, item.top_comments].filter(Boolean).join(" ")).join(" ");
}

function hasPositiveAudienceSignal(character: CharacterSummary | CharacterDetail) {
  return /\b(strong|positive|promising|worth repeating|on-character|consistent|liked|love|resonated|excellent|repeat)\b/.test(judgmentText(character).toLowerCase());
}

function hasWeakAudienceSignal(character: CharacterSummary | CharacterDetail) {
  return /\b(weak|negative|off-character|inconsistent|drift|reject|poor|pause|failed|not worth)\b/.test(judgmentText(character).toLowerCase());
}

function bestPlatformForTalent(character: CharacterSummary | CharacterDetail) {
  if (!hasCharacterDetail(character)) return "Not proven";
  const feedbackPlatform = character.feedback[0]?.platform;
  const personaPlatform = character.platformPersonas[0]?.platform;
  return platformLabel(feedbackPlatform ?? personaPlatform ?? null);
}

function latestAudienceSignal(character: CharacterSummary | CharacterDetail) {
  if (!hasCharacterDetail(character) || character.feedback.length === 0) {
    return "No audience response logged yet";
  }
  const latest = character.feedback[0];
  if (latest.operator_judgment) return compactInlineText(latest.operator_judgment, 110);
  if (latest.qualitative_notes) return compactInlineText(latest.qualitative_notes, 110);
  return `${platformLabel(latest.platform)} response logged`;
}

function firstFilled(values: Array<string | null | undefined>, fallback: string) {
  return values.map((value) => value?.trim()).find(Boolean) ?? fallback;
}

function labeledLines(items: Array<[string, string | null | undefined]>) {
  return items
    .map(([label, value]) => [label, value?.trim()] as const)
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
}

function hasSavedIdentityComponent(character: CharacterSummary | CharacterDetail, key: "appearance" | "voice" | "platform") {
  if (!hasCharacterDetail(character)) return false;
  if (key === "appearance") return character.appearanceProfiles.length > 0;
  if (key === "voice") return character.voiceGuides.length > 0;
  return character.platformPersonas.length > 0;
}

export function buildNewFaceDossier(character: CharacterSummary | CharacterDetail, allRuns: RunSummary[] = []): NewFaceDossier {
  const providedRuns = allRuns.filter((run) => run.character_id === character.id);
  const detailRuns = hasCharacterDetail(character) ? character.recentRuns : [];
  const providedRunIds = new Set(providedRuns.map((run) => run.id));
  const candidateRuns = [...providedRuns, ...detailRuns.filter((run) => !providedRunIds.has(run.id))];
  const birthRuns = candidateRuns
    .filter((run) => run.type === "character_birth")
    .slice()
    .sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime());
  const latestBirthRun = birthRuns[0] ?? null;
  const career = buildTalentCareerSummary(character, candidateRuns);
  const appearance = hasCharacterDetail(character) ? character.appearanceProfiles[0]?.body : null;
  const voice = hasCharacterDetail(character) ? character.voiceGuides[0]?.body : null;
  const activeConstitution = hasCharacterDetail(character)
    ? character.constitutions.find((item) => item.is_active === 1)?.body ?? character.constitutions[0]?.body
    : null;
  const personaPlatforms = hasCharacterDetail(character) ? character.platformPersonas.map((persona) => platformLabel(persona.platform)) : [];
  const approvedReferenceCount = hasCharacterDetail(character) ? character.referenceImages.filter((image) => image.status === "approved").length : 0;
  const status = character.status.toLowerCase();
  const publicPromise = firstFilled([character.summary, activeConstitution], "Public promise still needs a sharper market reason.");
  const marketOpportunity = visibleSummary(character.summary);
  const visualDirection = firstFilled([appearance], "Look direction needs reference, style language, and drift constraints.");
  const voiceInteriority = firstFilled([voice], "Voice and inner life need emotional tone, values, and public/private contrast.");
  const bestInitialPlatform = personaPlatforms[0] ?? career.bestPlatform;
  const platformFit =
    personaPlatforms.length > 0
      ? personaPlatforms.join(", ")
      : bestInitialPlatform === "Not proven"
        ? "Primary platform still needs selection."
        : bestInitialPlatform;
  const developmentRisk =
    latestBirthRun?.status === "failed"
      ? "High: birth output needs Studio Ops follow-up."
      : !hasSavedIdentityComponent(character, "appearance") || !hasSavedIdentityComponent(character, "voice")
        ? "Medium: visual direction or voice is still thin."
        : approvedReferenceCount === 0
          ? "Medium: no approved reference has been locked."
          : "Low: identity inputs are ready for first booking.";
  const recommendedFirstBooking =
    bestInitialPlatform && bestInitialPlatform !== "Not proven" && bestInitialPlatform !== "Primary platform still needs selection."
      ? `First portfolio test for ${bestInitialPlatform}`
      : "First portfolio test to prove platform fit";
  const directorDecision = status.includes("approved")
    ? "Approved for development"
    : status.includes("rejected")
      ? "Concept rejected"
      : latestBirthRun?.status === "needs_review"
        ? "Director decision needed"
        : status.includes("revision")
          ? "Revise identity"
          : "Needs scouting approval";

  return {
    talentId: character.id,
    displayName: career.displayName,
    stageLabel: career.stage === "new_face" ? "New Face" : talentStageLabel(career.stage),
    publicPromise: compactInlineText(publicPromise, 180),
    marketOpportunity: compactInlineText(marketOpportunity, 180),
    identitySeed: compactInlineText(activeConstitution ?? marketOpportunity, 180),
    visualDirection: compactInlineText(visualDirection, 180),
    voiceInteriority: compactInlineText(voiceInteriority, 180),
    bestInitialPlatform,
    platformFit,
    developmentRisk,
    recommendedFirstBooking,
    directorDecision,
    latestBirthRun,
    productionLogPath: latestBirthRun ? `/runs/${latestBirthRun.id}` : null,
    steps: [
      { id: "market", label: "Market Opportunity", detail: marketOpportunity, status: character.summary ? "ready" : "needs_input" },
      { id: "seed", label: "Identity Seed", detail: activeConstitution ? "Seed saved to identity bible." : "Seed needs a saved identity pass.", status: activeConstitution ? "ready" : "needs_input" },
      { id: "look", label: "Look Direction", detail: visualDirection, status: hasSavedIdentityComponent(character, "appearance") ? "ready" : "needs_input" },
      { id: "voice", label: "Voice and Inner Life", detail: voiceInteriority, status: hasSavedIdentityComponent(character, "voice") ? "ready" : "needs_input" },
      { id: "platform", label: "Platform Fit", detail: platformFit, status: hasSavedIdentityComponent(character, "platform") ? "ready" : "needs_input" },
      { id: "portfolio", label: "First Portfolio Test", detail: recommendedFirstBooking, status: latestBirthRun ? "review" : "needs_input" },
      { id: "dossier", label: "New Face Dossier", detail: directorDecision, status: latestBirthRun?.status === "needs_review" ? "review" : "ready" }
    ]
  };
}

function treatmentScene(recipe: PromptRecipe | null) {
  if (!recipe?.final_prompt) return "";
  return recipe.final_prompt.match(/SCENE\s*\n([\s\S]*?)\n\nPLATFORM/)?.[1]?.trim() ?? "";
}

function briefAudienceHypothesis(brief: ContentBrief | null | undefined) {
  const desiredOutputs = brief?.desired_outputs ?? "";
  const match = desiredOutputs.match(/Audience hypothesis:\s*([\s\S]*?)(?:\n|$)/i);
  return match?.[1]?.trim() ?? "";
}

function deriveAudienceHypothesis(
  character: CharacterSummary,
  candidate: ActivityCandidate | null | undefined,
  brief: ContentBrief | null | undefined,
  platform: string
) {
  const savedHypothesis = briefAudienceHypothesis(brief);
  if (savedHypothesis) return savedHypothesis;
  const displayName = displayModelName(character.name);
  const pillar = brief?.content_pillar || candidate?.activity_type || "process";
  const hook = brief?.visual_direction || candidate?.visual_motif || candidate?.title || "the next creative assignment";
  const targetPlatform = brief?.platform_targets || candidate?.platform_fit?.split(",")[0]?.trim() || platform;
  return `This booking tests whether ${displayName}'s audience responds to ${pillar} content built around ${hook} on ${targetPlatform}.`;
}

export function buildBookingDeskModel({
  character,
  candidate,
  brief,
  recipe,
  platform
}: {
  character: CharacterSummary;
  candidate?: ActivityCandidate | null;
  brief?: ContentBrief | null;
  recipe?: PromptRecipe | null;
  platform: string;
}): BookingDeskModel {
  const talentName = displayModelName(character.name);
  const targetPlatform = brief?.platform_targets || candidate?.platform_fit?.split(",")[0]?.trim() || platform;
  const bookingIdea = candidate
    ? `${candidate.title}: ${compactInlineText(candidate.body, 140)}`
    : "No booking idea selected yet.";
  const shootBriefSummary = brief
    ? compactInlineText([brief.goal, brief.visual_direction, brief.caption_angle].filter(Boolean).join(" "), 180)
    : "Choose a booking idea and create a shoot brief.";
  const creativeTreatmentSummary = recipe
    ? compactInlineText(treatmentScene(recipe) || "Identity, look, shoot brief, and production settings are assembled.", 180)
    : "Prepare a creative treatment after the shoot brief.";
  const status: BookingStatus = recipe ? "treatment_ready" : brief ? "brief_ready" : candidate ? "idea" : "idea";
  const primaryActionLabel = recipe ? "Start Production" : brief ? "Prepare Creative Treatment" : candidate ? "Create Shoot Brief" : "Propose Booking Ideas";
  const nextStep = recipe
    ? "Start production and send the candidate shot into Portfolio review."
    : brief
      ? "Prepare the creative treatment from the selected shoot brief."
      : candidate
        ? "Turn the selected booking idea into a shoot brief."
        : "Propose booking ideas for the selected talent.";

  return {
    id: recipe?.id ?? brief?.id ?? candidate?.id ?? `booking_${character.id}`,
    talentId: character.id,
    talentName,
    platform: targetPlatform,
    title: candidate?.title ?? "Next booking",
    careerGoal: brief?.goal ?? `Book next work for ${talentName}.`,
    bookingIdea,
    shootBriefSummary,
    creativeTreatmentSummary,
    audienceHypothesis: deriveAudienceHypothesis(character, candidate, brief, targetPlatform),
    status,
    primaryActionLabel,
    nextStep,
    productionPath: `/assets?characterId=${encodeURIComponent(character.id)}&status=raw_generation`,
    technicalSource: {
      activityCandidateId: candidate?.id,
      contentBriefId: brief?.id,
      promptRecipeId: recipe?.id,
      runId: recipe?.run_id ?? undefined
    }
  };
}

function careerEventTitle(run: RunSummary) {
  if (run.type === "character_birth") return "Born as New Face";
  if (run.type === "daily_activity") return "Booked daily work";
  if (run.type === "prompt_generation") return "Creative treatment prepared";
  if (run.type === "image_generation") return "Production created candidate shots";
  if (run.type === "image_analysis") return "Portfolio quality review completed";
  if (run.type === "draft_packaging") return "Social package prepared";
  if (run.type === "feedback_reflection") return "Audience debrief completed";
  if (run.type === "canon_evolution") return "Career story updated";
  return runTypeLabel(run.type);
}

function careerEventOutcome(run: RunSummary) {
  if (run.status === "needs_review") return "Director decision needed";
  if (run.status === "failed") return "Studio Ops follow-up needed";
  if (run.status === "completed") return "Completed";
  if (["queued", "running", "waiting_for_provider"].includes(run.status)) return productionDeskStatus(run);
  return statusLabel(run.status);
}

export function buildTalentCareerSummary(character: CharacterSummary | CharacterDetail, allRuns: RunSummary[] = []): TalentCareerSummary {
  const runs = hasCharacterDetail(character) ? character.recentRuns : allRuns.filter((run) => run.character_id === character.id);
  const status = character.status.toLowerCase();
  const pendingDecisionCount = hasCharacterDetail(character)
    ? character.identityProposals.filter((proposal) => proposal.status === "proposed").length
    : runs.filter((run) => run.status === "needs_review").length;
  const hasBirthRun = runs.some((run) => run.type === "character_birth");
  const hasWorkingActivity = runs.some((run) => ["daily_activity", "image_generation", "image_analysis", "draft_packaging"].includes(run.type));
  const hasFailedProduction = runs.some((run) => run.status === "failed");
  const detailHasMinimalSetup = hasCharacterDetail(character)
    ? character.constitutions.length === 0 || character.appearanceProfiles.length === 0 || character.voiceGuides.length === 0
    : !hasBirthRun;
  const positiveSignal = hasPositiveAudienceSignal(character);
  const weakSignal = hasWeakAudienceSignal(character);
  const feedbackCount = hasCharacterDetail(character) ? character.feedback.length : 0;
  const reflectionCount = hasCharacterDetail(character) ? character.reflections.length : 0;
  let stage: TalentStageId = "development";

  if (status.includes("retired") || status.includes("paused") || status.includes("archived")) {
    stage = "paused_retired";
  } else if (weakSignal || hasFailedProduction || status.includes("rejected")) {
    stage = "at_risk";
  } else if (positiveSignal && feedbackCount >= 3 && reflectionCount >= 1) {
    stage = "star_talent";
  } else if ((positiveSignal && feedbackCount >= 2) || status.includes("reflection_complete")) {
    stage = "core_talent";
  } else if (positiveSignal || status.includes("published") || status.includes("feedback")) {
    stage = "rising_talent";
  } else if (pendingDecisionCount > 0 || hasWorkingActivity || status.includes("approved") || status.includes("draft")) {
    stage = "development";
  } else if (detailHasMinimalSetup) {
    stage = "new_face";
  }

  const agencyPriority: AgencyPriority =
    stage === "star_talent" || stage === "core_talent" || stage === "rising_talent"
      ? "push"
      : stage === "paused_retired"
        ? "pause"
        : stage === "at_risk"
          ? "test"
          : "develop";
  const developmentRisk: TalentCareerSummary["developmentRisk"] =
    stage === "at_risk" ? "high" : detailHasMinimalSetup ? "medium" : stage === "paused_retired" ? "unknown" : "low";
  const identityStability =
    hasCharacterDetail(character)
      ? character.constitutions.length && character.appearanceProfiles.length && character.voiceGuides.length
        ? "Stable enough to book"
        : "Needs identity work"
      : hasBirthRun
        ? "Birth activity exists"
        : "Needs birth/development";
  const momentum =
    stage === "star_talent"
      ? "Repeated public pull"
      : stage === "core_talent"
        ? "Reliable audience signal"
        : stage === "rising_talent"
          ? "Promising audience signal"
          : stage === "at_risk"
            ? "Needs correction"
            : hasWorkingActivity
              ? "Work in development"
              : "Not enough signal";
  const nextRecommendedMove =
    pendingDecisionCount > 0
      ? "Review Career Direction"
      : stage === "new_face"
        ? "Approve New Face"
        : stage === "at_risk"
          ? "Review Development Risk"
          : stage === "paused_retired"
            ? "Reassess Agency Priority"
            : stage === "development"
              ? "Book Next Test"
              : "Book Next Work";

  return {
    talentId: character.id,
    displayName: displayModelName(character.name),
    stage,
    agencyPriority,
    shortPositioning: visibleSummary(character.summary),
    bestPlatform: bestPlatformForTalent(character),
    momentum,
    identityStability,
    developmentRisk,
    nextRecommendedMove,
    pendingDecisionCount,
    latestAudienceSignal: latestAudienceSignal(character),
    updatedAt: character.updated_at
  };
}

export function buildRosterLanes(characters: CharacterSummary[], runs: RunSummary[]) {
  const summaries = characters.map((character) => buildTalentCareerSummary(character, runs));
  return rosterLaneModel.map((lane) => ({
    ...lane,
    talent: summaries.filter((summary) => summary.stage === lane.id)
  }));
}

const audienceResultCopy: Record<AudienceResultId, { label: string; detail: string }> = {
  strong: { label: "Strong", detail: "Public response is clear enough to repeat and invest in." },
  promising: { label: "Promising", detail: "The signal is positive but needs one more confirming test." },
  mixed: { label: "Mixed", detail: "The response has usable learning and unresolved risk." },
  weak: { label: "Weak", detail: "The signal needs correction before more agency attention." },
  unknown: { label: "Unknown", detail: "There is not enough public response to make a career call." }
};

const strategyLaneModel: Array<{ id: StrategyLaneId; label: string; detail: string }> = [
  { id: "star_talent", label: "Star Talent", detail: "repeat public pull and highest agency attention" },
  { id: "core_talent", label: "Core Talent", detail: "reliable performers worth steady booking" },
  { id: "rising_talent", label: "Rising Talent", detail: "fresh signal that deserves a push" },
  { id: "development_bets", label: "Development Bets", detail: "identity, platform, or first-audience tests still forming" },
  { id: "at_risk", label: "At Risk", detail: "weak response, identity drift, or production concern" },
  { id: "paused_retired", label: "Paused / Retired", detail: "not actively receiving agency attention" }
];

function uniqueCompact(items: Array<string | null | undefined>, fallback: string, maxLength = 150) {
  const seen = new Set<string>();
  const compacted = items
    .map((item) => compactInlineText(item, maxLength))
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  return compacted.length ? compacted : [fallback];
}

function feedbackEngagement(feedback: SocialFeedback) {
  return feedback.likes + feedback.comments + feedback.shares + feedback.saves;
}

function feedbackEngagementRate(feedback: SocialFeedback) {
  if (!feedback.reach) return null;
  return Math.round((feedbackEngagement(feedback) / feedback.reach) * 1000) / 10;
}

function audienceJudgmentCorpus(feedback: SocialFeedback) {
  return [feedback.operator_judgment, feedback.qualitative_notes, feedback.top_comments].filter(Boolean).join(" ").toLowerCase();
}

function audienceResultForFeedback(feedback: SocialFeedback): AudienceResultId {
  const corpus = audienceJudgmentCorpus(feedback);
  const positive = /\b(strong|positive|promising|worth repeating|on-character|consistent|liked|love|resonated|excellent|repeat|clear|useful)\b/.test(corpus);
  const negative = /\b(weak|negative|off-character|inconsistent|drift|reject|poor|pause|failed|not worth|unclear|confusing)\b/.test(corpus);
  const rate = feedbackEngagementRate(feedback);
  const hasPublicData = feedback.impressions + feedback.reach + feedback.likes + feedback.comments + feedback.shares + feedback.saves + feedback.follows_gained > 0;
  if (!hasPublicData && !corpus) return "unknown";
  if (positive && negative) return "mixed";
  if (negative && (rate === null || rate < 4 || corpus.includes("off-character") || corpus.includes("drift"))) return "weak";
  if ((rate !== null && rate >= 8) || feedback.follows_gained >= 4 || feedback.saves >= 18) return "strong";
  if (positive && (feedback.follows_gained > 0 || feedback.saves > 0 || feedback.comments > 0)) return "promising";
  if (positive || (rate !== null && rate >= 3) || feedback.follows_gained > 0 || feedback.saves > 0) return "promising";
  if (negative || (rate !== null && rate < 1 && feedback.reach > 0)) return "weak";
  if (feedbackEngagement(feedback) > 0) return "mixed";
  return "unknown";
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function reflectionPayload(reflection: ReflectionEntry | null | undefined) {
  return isObjectRecord(reflection?.reflection) ? reflection.reflection : {};
}

function reflectionField(reflection: ReflectionEntry | null | undefined, key: string, label: string) {
  const payload = reflectionPayload(reflection);
  const value = payload[key];
  if (typeof value === "string" && value.trim()) return value.trim().replace(/^Mock analysis:\s*/i, "");
  const line = reflection?.body
    ?.split("\n")
    .find((entry) => entry.toLowerCase().startsWith(`${label.toLowerCase()}:`));
  return line?.replace(new RegExp(`^${label}:\\s*`, "i"), "").trim().replace(/^Mock analysis:\s*/i, "") ?? "";
}

function matchingReflection(character: CharacterDetail, feedback: SocialFeedback) {
  return (
    character.reflections.find((reflection) => reflection.social_feedback_id === feedback.id) ??
    character.reflections.find((reflection) => reflection.draft_id === feedback.draft_id) ??
    null
  );
}

function proposalActionLabel(proposal: IdentityProposal) {
  if (proposal.kind === "memory") return "Approve Memory Update";
  if (proposal.kind === "canon") return "Add to Canon";
  if (proposal.kind === "constitution_patch") return "Approve Identity Bible Update";
  return "Approve Career Update";
}

function proposalDirectionLabel(proposal: IdentityProposal | null) {
  if (!proposal) return "No career direction proposed";
  if (proposal.kind === "memory") return "Memory update proposed";
  if (proposal.kind === "canon") return "Canon update proposed";
  if (proposal.kind === "constitution_patch") return "Identity Bible update proposed";
  return `${proposalKindLabel(proposal.kind)} proposed`;
}

function commentThemeLines(feedback: SocialFeedback) {
  const topComments = (feedback.top_comments ?? "")
    .split(/\n|;|•/)
    .map((comment) => comment.replace(/^["'\s-]+|["'\s.]+$/g, "").trim())
    .filter(Boolean)
    .slice(0, 3);
  const qualitative = feedback.qualitative_notes ? [feedback.qualitative_notes] : [];
  return uniqueCompact([...topComments, ...qualitative], "No comment theme recorded yet.", 120);
}

function buildAudienceDebrief(character: CharacterDetail, feedback: SocialFeedback): AudienceDebriefModel {
  const talentName = displayModelName(character.name);
  const reflection = matchingReflection(character, feedback);
  const resultId = audienceResultForFeedback(feedback);
  const result = audienceResultCopy[resultId];
  const pendingProposals = character.identityProposals.filter((proposal) =>
    proposal.status === "proposed" &&
    (proposal.source_reflection_id === reflection?.id || (reflection?.run_id && proposal.run_id === reflection.run_id))
  );
  const primaryProposal = pendingProposals[0] ?? character.identityProposals.find((proposal) => proposal.source_reflection_id === reflection?.id) ?? null;
  const rate = feedbackEngagementRate(feedback);
  const engagement = feedbackEngagement(feedback);
  const workedFromReflection = reflectionField(reflection, "whatWorked", "Worked");
  const repeatFromReflection = reflectionField(reflection, "repeat", "Repeat");
  const offCharacter = reflectionField(reflection, "offCharacter", "Off-character");
  const avoid = reflectionField(reflection, "avoid", "Avoid");
  const nextActivity = reflectionField(reflection, "suggestedNextActivity", "Next");
  const proposedMemory = reflectionField(reflection, "proposedMemory", "Memory");
  const proposedCanon = reflectionField(reflection, "proposedCanon", "Canon");
  const hasLowDiscussion = feedback.reach > 0 && feedback.comments === 0;
  const hasLowSaveSignal = feedback.reach > 0 && feedback.saves === 0;
  const metricSummary = rate === null ? `${engagement} total engagements` : `${engagement} engagements at ${rate.toFixed(1)}%`;
  const summary = `${result.label} audience response on ${platformLabel(feedback.platform)} for ${talentName}. ${metricSummary}; ${feedback.follows_gained} follows gained.`;

  return {
    id: `audience:${feedback.id}`,
    feedbackId: feedback.id,
    talentId: character.id,
    talentName,
    platform: platformLabel(feedback.platform),
    result: { id: resultId, ...result },
    summary,
    whatWorked: uniqueCompact(
      [
        workedFromReflection,
        feedback.saves > 0 ? `${feedback.saves} saves suggest this had repeat or reference value.` : null,
        feedback.follows_gained > 0 ? `${feedback.follows_gained} follows gained point to audience pull beyond the post.` : null,
        feedback.comments > 0 ? `${feedback.comments} comments gave the operator usable qualitative signal.` : null,
        repeatFromReflection,
        resultId === "strong" ? "The response is strong enough to repeat the premise with small variation." : null
      ],
      "The audience response was logged, but the winning element needs a clearer pattern."
    ),
    whatFailed: uniqueCompact(
      [
        offCharacter && !/^no major off-character signal/i.test(offCharacter) ? offCharacter : null,
        avoid,
        hasLowDiscussion ? "Discussion was light, so the next test should ask for a clearer audience reaction." : null,
        hasLowSaveSignal ? "Save behavior was not proven on this post." : null,
        resultId === "weak" ? "The response is not strong enough to justify more agency attention without a corrective test." : null
      ],
      resultId === "strong" || resultId === "promising" ? "No major failure signal was logged." : "Not enough public data to isolate a failure yet."
    ),
    commentThemes: commentThemeLines(feedback),
    meaningForTalent: compactInlineText(
      proposedMemory ||
        feedback.qualitative_notes ||
        feedback.operator_judgment ||
        (resultId === "weak"
          ? `${talentName} needs a narrower follow-up before the agency treats this direction as proven.`
          : `${talentName} has an audience signal that should guide the next public test.`),
      220
    ),
    recommendedNextTest: compactInlineText(
      nextActivity ||
        (feedback.saves > feedback.shares
          ? "Create a saveable behind-the-scenes ritual."
          : feedback.comments > 0
            ? "Repeat the premise with a sharper caption question."
            : "Run one focused follow-up post before changing identity direction."),
      180
    ),
    careerDirection: {
      label: proposalDirectionLabel(primaryProposal),
      body: compactInlineText(primaryProposal?.body ?? proposedCanon ?? proposedMemory ?? "No memory, canon, or Identity Bible update is proposed from this signal yet.", 220),
      rationale: compactInlineText(primaryProposal?.rationale ?? "Career evolution stays review-gated until the director approves a proposal.", 180),
      proposalId: primaryProposal?.id,
      kind: primaryProposal?.kind,
      status: primaryProposal?.status,
      actionLabel: primaryProposal ? proposalActionLabel(primaryProposal) : undefined
    },
    pendingProposals,
    metrics: {
      impressions: feedback.impressions,
      reach: feedback.reach,
      engagement,
      engagementRate: rate,
      engagementRateLabel: rate === null ? "No reach logged" : `${rate.toFixed(1)}%`,
      likes: feedback.likes,
      comments: feedback.comments,
      shares: feedback.shares,
      saves: feedback.saves,
      profileVisits: feedback.profile_visits,
      followsGained: feedback.follows_gained
    },
    createdAt: feedback.created_at ?? feedback.updated_at ?? null,
    technicalSource: {
      publishingEventId: feedback.publishing_event_id,
      draftId: feedback.draft_id,
      reflectionId: reflection?.id,
      runId: reflection?.run_id
    },
    technicalAudit: {
      feedback,
      reflection,
      proposals: character.identityProposals.filter((proposal) => proposal.source_reflection_id === reflection?.id)
    }
  };
}

export function buildAudienceDebriefModels(characters: CharacterDetail[]) {
  return characters
    .flatMap((character) => character.feedback.map((feedback) => buildAudienceDebrief(character, feedback)))
    .sort((left, right) => new Date(right.createdAt ?? 0).getTime() - new Date(left.createdAt ?? 0).getTime());
}

function strategyLaneForCareer(career: TalentCareerSummary): StrategyLaneId {
  if (career.stage === "star_talent") return "star_talent";
  if (career.stage === "core_talent") return "core_talent";
  if (career.stage === "rising_talent") return "rising_talent";
  if (career.stage === "at_risk") return "at_risk";
  if (career.stage === "paused_retired") return "paused_retired";
  return "development_bets";
}

function recommendedInvestmentFor(career: TalentCareerSummary) {
  if (career.agencyPriority === "push") return "Push next booking";
  if (career.agencyPriority === "develop") return "Develop before public push";
  if (career.agencyPriority === "test") return "Run one corrective test";
  if (career.agencyPriority === "pause") return "Pause active booking";
  return "Retire or archive";
}

function audiencePullForCharacter(character: CharacterSummary | CharacterDetail) {
  if (!hasCharacterDetail(character) || character.feedback.length === 0) return "Unproven";
  const results = character.feedback.map(audienceResultForFeedback);
  const strongCount = results.filter((result) => result === "strong").length;
  const positiveCount = results.filter((result) => result === "strong" || result === "promising").length;
  const weakCount = results.filter((result) => result === "weak").length;
  if (strongCount >= 2) return "Repeated public pull";
  if (positiveCount >= 2) return "Reliable public pull";
  if (positiveCount === 1) return "Early positive pull";
  if (weakCount > 0) return "Weak public response";
  return "Mixed or unproven";
}

export function buildStrategyBoardModel(characters: Array<CharacterSummary | CharacterDetail>, runs: RunSummary[] = []): StrategyBoardModel {
  const talent = characters.map((character) => {
    const career = buildTalentCareerSummary(character, runs);
    const lane = strategyLaneForCareer(career);
    const feedbackCount = hasCharacterDetail(character) ? character.feedback.length : 0;
    const pendingCareerDirections = hasCharacterDetail(character) ? character.identityProposals.filter((proposal) => proposal.status === "proposed").length : career.pendingDecisionCount;
    return {
      talentId: character.id,
      displayName: career.displayName,
      lane,
      agencyPriority: career.agencyPriority,
      momentum: career.momentum,
      audiencePull: audiencePullForCharacter(character),
      identityStrength: career.identityStability,
      platformFit: career.bestPlatform,
      developmentRisk: career.developmentRisk === "unknown" ? "Unknown" : `${career.developmentRisk[0].toUpperCase()}${career.developmentRisk.slice(1)}`,
      recommendedInvestment: recommendedInvestmentFor(career),
      nextMove: career.nextRecommendedMove,
      feedbackCount,
      pendingCareerDirections,
      latestSignal: career.latestAudienceSignal,
      technicalAudit: {
        stage: career.stage,
        priority: career.agencyPriority,
        feedbackCount,
        pendingCareerDirections
      }
    };
  });
  const priorityOrder: Record<AgencyPriority, number> = { push: 0, develop: 1, test: 2, pause: 3, retire: 4 };
  const sortedTalent = talent.sort((left, right) => {
    const priorityDelta = priorityOrder[left.agencyPriority] - priorityOrder[right.agencyPriority];
    if (priorityDelta !== 0) return priorityDelta;
    return right.feedbackCount - left.feedbackCount;
  });
  const lanes = strategyLaneModel.map((lane) => ({
    ...lane,
    talent: sortedTalent.filter((item) => item.lane === lane.id)
  }));
  return {
    summary: {
      representedTalent: talent.length,
      pushCount: talent.filter((item) => item.agencyPriority === "push").length,
      developmentCount: talent.filter((item) => item.lane === "development_bets").length,
      riskCount: talent.filter((item) => item.lane === "at_risk").length
    },
    lanes,
    technicalAudit: {
      lanes: lanes.map((lane) => ({ id: lane.id, count: lane.talent.length }))
    }
  };
}

export function buildStudioOpsModel({
  data,
  settings,
  automationSettings,
  automationStatus,
  workflows,
  promptRecipes,
  assets
}: {
  data: AppData;
  settings: ProviderSettings;
  automationSettings: AutomationSettings;
  automationStatus: AutomationStatus | null;
  workflows: ComfyWorkflow[];
  promptRecipes: PromptRecipe[];
  assets: ImageAsset[];
}): StudioOpsModel {
  const activeRuns = data.runs.filter((run) => runMatchesStatus(run, "active"));
  const reviewRuns = data.runs.filter((run) => run.status === "needs_review");
  const failedRuns = data.runs.filter((run) => run.status === "failed");
  const activeWorkflows = workflows.filter((workflow) => workflow.status === "active" && !workflow.validation_error);
  const configuredProviderCount = [
    settings.hasHermesApiKey,
    settings.comfyuiCloudReady,
    settings.hasOpenaiApiKey,
    settings.hasWavespeedApiKey
  ].filter(Boolean).length;
  const latestFailure = failedRuns
    .slice()
    .sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime())[0] ?? null;
  const providerReadiness = [
    { label: "Mock providers", status: settings.mockProviders ? "Active" : "Disabled", detail: settings.mockProviders ? "Local fallback is available." : "Live provider routing is enabled." },
    { label: "Hermes", status: settings.hasHermesApiKey ? "Key saved" : "No key", detail: settings.defaultAnalysisProvider === "hermes" || settings.defaultImageGenerationProvider === "hermes" ? "Selected in routing." : "Available when selected." },
    { label: "ComfyUI Cloud", status: settings.comfyuiCloudReady ? "Ready" : settings.hasComfyuiCloudApiKey ? "Needs workflow" : "No key", detail: `${activeWorkflows.length} active workflow${activeWorkflows.length === 1 ? "" : "s"}.` },
    { label: "OpenAI Images", status: settings.hasOpenaiApiKey ? "Key saved" : "No key", detail: settings.defaultImageGenerationProvider === "openai" ? "Selected for image production." : "Available when selected." },
    { label: "WaveSpeed AI", status: settings.hasWavespeedApiKey ? "Key saved" : "No key", detail: settings.defaultImageGenerationProvider === "wavespeed" ? "Selected for image production." : "Available when selected." }
  ];
  const tabs: StudioOpsModel["tabs"] = [
    { id: "overview", label: "Overview", value: data.health?.ok ? "OK" : "Check", detail: "Health + readiness" },
    { id: "logs", label: "Production Logs", value: data.runs.length, detail: `${activeRuns.length + reviewRuns.length} active/review` },
    { id: "providers", label: "Providers", value: settings.mockProviders ? "Mock" : "Live", detail: `${configuredProviderCount} ready` },
    { id: "workflows", label: "Workflow Engines", value: workflows.length, detail: `${activeWorkflows.length} active` },
    { id: "automation", label: "Automation", value: automationStatus?.schedulerEnabled ? "On" : "Off", detail: `${automationStatus?.runsNeedingReview.length ?? 0} review gates` },
    { id: "manual", label: "Console", value: data.characters.length, detail: "Manual dispatch" },
    { id: "audit", label: "Technical Audit", value: "IDs", detail: "Raw state + storage" }
  ];

  return {
    headline: settings.mockProviders ? "Mock providers active" : "Live providers active",
    primaryQuestion: "What did the machine do, and is the studio configured correctly?",
    overviewCards: [
      { label: "API health", value: data.health?.ok ? "Online" : "Offline", detail: data.health?.service ?? "Local API" },
      { label: "Provider readiness", value: settings.mockProviders ? "Mock" : configuredProviderCount, detail: settings.mockProviders ? "Local fallback active" : `${configuredProviderCount} provider${configuredProviderCount === 1 ? "" : "s"} ready` },
      { label: "Scheduler", value: automationStatus?.schedulerEnabled ? "On" : "Off", detail: automationStatus?.nextRunAt ? formatDate(automationStatus.nextRunAt) : "Manual dispatch" },
      { label: "Production attention", value: reviewRuns.length + failedRuns.length, detail: `${reviewRuns.length} review, ${failedRuns.length} failed` }
    ],
    tabs,
    productionLogSummary: {
      total: data.runs.length,
      active: activeRuns.length,
      review: reviewRuns.length,
      failed: failedRuns.length,
      latestFailure
    },
    providerReadiness,
    technicalAudit: {
      api: {
        ok: Boolean(data.health?.ok),
        service: data.health?.service ?? "unknown",
        version: data.health?.version,
        dataDir: data.health?.dataDir
      },
      productionLogIds: data.runs.map((run) => run.id),
      workflowIds: workflows.map((workflow) => workflow.id),
      promptRecipeIds: promptRecipes.map((recipe) => recipe.id),
      assetIds: assets.map((asset) => asset.id)
    }
  };
}

export function buildDirectorDeskModel(data: AppData, error: string | null = null): DirectorDeskModel {
  const activeRuns = data.runs.filter((run) => ["queued", "running", "waiting_for_provider"].includes(run.status));
  const reviewRuns = data.runs.filter((run) => run.status === "needs_review");
  const failedRuns = data.runs.filter((run) => run.status === "failed");
  const reviewStage = data.workflowSummary.find((stage) => stage.id === "review");
  const productionStage = data.workflowSummary.find((stage) => stage.id === "production");
  const publishingStage = data.workflowSummary.find((stage) => stage.id === "publishing");
  const feedbackStage = data.workflowSummary.find((stage) => stage.id === "feedback");
  const birthStage = data.workflowSummary.find((stage) => stage.id === "birth");
  const characterRunMap = buildCharacterRunMap(data.runs);
  const characterRunIds = new Set(data.runs.filter((run) => run.character_id).map((run) => run.character_id));
  const setupCharacters = data.characters.filter((character) => characterNeedsSetup(character, characterRunIds));
  const characterNames = new Map(data.characters.map((character) => [character.id, displayModelName(character.name)]));
  const reviewDraftCount = countFromWorkflowDetail(reviewStage, "draft");
  const careerDirectionCount = countFromWorkflowDetail(reviewStage, "identity proposal");
  const reviewRunCount = countFromWorkflowDetail(reviewStage, "run") || reviewRuns.length;
  const birthReviewCount = reviewRuns.filter((run) => run.type === "character_birth").length;
  const portfolioCandidateCount = productionStage?.status === "attention" ? productionStage.count : 0;
  const publishingReadyCount = publishingStage?.status === "attention" ? publishingStage.count : 0;
  const audienceAttentionCount = feedbackStage?.status === "attention" ? feedbackStage.count : 0;
  const blockedStageCount = data.workflowSummary
    .filter((stage) => stage.status === "blocked")
    .reduce((total, stage) => total + Math.max(stage.count, 1), 0);
  const studioAttentionCount = failedRuns.length + blockedStageCount;

  const todayDecisions: DirectorDeskItem[] = [
    {
      id: "talent-approval",
      title: "talent items need approval",
      detail: birthReviewCount
        ? "New Face output is waiting for a director decision."
        : "Roster profiles need development before the agency can book them.",
      count: birthReviewCount + setupCharacters.length,
      path: birthReviewCount ? "/create" : "/talent",
      actionLabel: birthReviewCount ? "Open Scouting" : "Open Roster",
      priority: 1
    },
    {
      id: "social-package-review",
      title: "social packages need approval",
      detail: "Review Desk has caption, disclosure, or package decisions waiting.",
      count: reviewDraftCount,
      path: stagePath(reviewStage, "/review"),
      actionLabel: "Open Review Desk",
      priority: 2
    },
    {
      id: "production-review",
      title: "production decisions need approval",
      detail: "Production output is waiting for a director go/no-go.",
      count: Math.max(0, reviewRunCount - birthReviewCount),
      path: "/runs?status=needs_review",
      actionLabel: "Open Production Logs",
      priority: 3
    },
    {
      id: "publishing-ready",
      title: "social packages ready for publishing",
      detail: "Publishing has approved work waiting for manual placement or follow-up.",
      count: publishingReadyCount,
      path: stagePath(publishingStage, "/calendar"),
      actionLabel: "Open Publishing",
      priority: 4
    },
    {
      id: "audience-debrief",
      title: "audience responses need debrief",
      detail: feedbackStage?.detail ?? "Audience response needs to be logged or interpreted.",
      count: audienceAttentionCount,
      path: stagePath(feedbackStage, "/insights"),
      actionLabel: "Open Audience",
      priority: 5
    },
    {
      id: "career-direction",
      title: "career direction proposals waiting",
      detail: "Audience-led memory, canon, or identity updates need director approval.",
      count: careerDirectionCount,
      path: "/review",
      actionLabel: "Open Review Desk",
      priority: 6
    },
    {
      id: "portfolio-review",
      title: "portfolio candidates need review",
      detail: productionStage?.detail ?? "Candidate shots need director review.",
      count: portfolioCandidateCount,
      path: stagePath(productionStage, "/library"),
      actionLabel: "Open Portfolio",
      priority: 7
    },
    {
      id: "studio-attention",
      title: "Studio Ops items need attention",
      detail: "Failed or blocked production needs a technical follow-up outside the director desk.",
      count: studioAttentionCount,
      path: "/settings",
      actionLabel: "Open Studio Ops",
      priority: 8
    }
  ]
    .filter((item) => (item.count ?? 0) > 0)
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

  const starWatch = data.characters
    .map<DirectorDeskItem>((character) => {
      const runs = characterRunMap.get(character.id) ?? [];
      const latestRun = runs[0];
      const hasFailedProduction = runs.some((run) => run.status === "failed");
      const hasCareerDecision = runs.some((run) => run.status === "needs_review" && ["feedback_reflection", "canon_evolution"].includes(run.type));
      const hasWorkingActivity = runs.some((run) => ["daily_activity", "image_generation", "draft_packaging"].includes(run.type));
      const needsDevelopment = setupCharacters.some((item) => item.id === character.id);
      const name = displayModelName(character.name);
      if (hasFailedProduction) {
        return {
          id: `watch-${character.id}`,
          title: "At-risk talent",
          detail: `${name} has production work that needs Studio Ops attention.`,
          path: `/characters/${character.id}`,
          actionLabel: "Open Talent Profile",
          priority: 1
        };
      }
      if (hasCareerDecision) {
        return {
          id: `watch-${character.id}`,
          title: "Career direction waiting",
          detail: `${name} has an audience-led decision ready for review.`,
          path: `/characters/${character.id}`,
          actionLabel: "Open Talent Profile",
          priority: 2
        };
      }
      if (needsDevelopment) {
        return {
          id: `watch-${character.id}`,
          title: "New Face needs development",
          detail: `${name} needs identity, bookings, or early portfolio work.`,
          path: `/characters/${character.id}`,
          actionLabel: "Open Talent Profile",
          priority: 3
        };
      }
      if (hasWorkingActivity) {
        return {
          id: `watch-${character.id}`,
          title: "Working talent",
          detail: `${name} has recent agency work${latestRun ? `: ${runTypeLabel(latestRun.type).toLowerCase()}.` : "."}`,
          path: `/characters/${character.id}`,
          actionLabel: "Open Talent Profile",
          priority: 4
        };
      }
      return {
        id: `watch-${character.id}`,
        title: "Development watch",
        detail: `${name} is represented but needs more public signal before star ranking.`,
        path: `/characters/${character.id}`,
        actionLabel: "Open Talent Profile",
        priority: 5
      };
    })
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
    .slice(0, 4);

  const todaysBookings = [
    ...activeRuns.slice(0, 3).map<DirectorDeskItem>((run) => {
      const talentName = run.character_id ? characterNames.get(run.character_id) ?? "Selected talent" : "Unassigned talent";
      return {
        id: `booking-${run.id}`,
        title: bookingTitleForRun(run),
        detail: `${talentName} · ${productionDeskStatus(run)}`,
        path: productionPathForRun(run),
        actionLabel: "Open work area",
        priority: 1
      };
    }),
    ...(data.automationStatus?.nextRunAt
      ? [{
          id: "booking-next-window",
          title: "Next supervised booking window",
          detail: `${formatTime(data.automationStatus.nextRunAt)} · ${(data.automationStatus.settings.defaultPlatforms ?? []).map(platformLabel).join(", ") || "Platforms not selected"}`,
          path: "/prompt-studio",
          actionLabel: "Open Bookings",
          priority: 2
        }]
      : [])
  ].slice(0, 4);

  const audienceSignals: DirectorDeskItem[] = [];
  if (feedbackStage?.status === "attention") {
    audienceSignals.push({
      id: "audience-attention",
      title: feedbackStage.primaryActionLabel === "Run reflection" ? "Audience debrief ready" : "Audience response needs logging",
      detail: agencyFacingCountDetail(feedbackStage.detail),
      path: stagePath(feedbackStage, "/insights"),
      actionLabel: feedbackStage.primaryActionLabel === "Run reflection" ? "Debrief Response" : "Log Response",
      count: feedbackStage.count,
      priority: 1
    });
  } else if (feedbackStage?.status === "complete") {
    audienceSignals.push({
      id: "audience-learning",
      title: "Audience learning available",
      detail: "Recent response has already fed reflection or career direction.",
      path: "/insights",
      actionLabel: "Open Audience",
      priority: 2
    });
  }
  const audienceReviewRuns = reviewRuns.filter((run) => ["feedback_reflection", "canon_evolution"].includes(run.type));
  if (audienceReviewRuns.length) {
    audienceSignals.push({
      id: "audience-career-review",
      title: "Audience-led career update waiting",
      detail: `${pluralize(audienceReviewRuns.length, "debrief")} need director approval in the Review Desk.`,
      path: "/review",
      actionLabel: "Open Review Desk",
      count: audienceReviewRuns.length,
      priority: 3
    });
  }

  const publishingFollowUp: DirectorDeskItem[] = [];
  if (publishingStage?.status === "attention") {
    publishingFollowUp.push({
      id: "publishing-ready",
      title: "Packages ready to place",
      detail: publishingStage.detail,
      path: stagePath(publishingStage, "/calendar"),
      actionLabel: "Open Publishing",
      count: publishingStage.count,
      priority: 1
    });
  } else if (publishingStage?.count) {
    publishingFollowUp.push({
      id: "publishing-ledger",
      title: "Live placement ledger has activity",
      detail: publishingStage.detail,
      path: "/calendar",
      actionLabel: "Open Publishing",
      count: publishingStage.count,
      priority: 2
    });
  }
  if (feedbackStage?.status === "attention" && feedbackStage.detail.includes("published event")) {
    publishingFollowUp.push({
      id: "publishing-response-due",
      title: "Live posts need audience response",
      detail: "Publishing follow-up is not closed until response is logged.",
      path: stagePath(feedbackStage, "/insights"),
      actionLabel: "Open Audience",
      count: feedbackStage.count,
      priority: 3
    });
  }

  const schedulerState = data.automationStatus?.schedulerEnabled
    ? data.automationStatus.nextRunAt
      ? `Next booking window ${formatTime(data.automationStatus.nextRunAt)}`
      : "Schedule enabled"
    : "Schedule paused";
  const studioNeedsAttention = Boolean(error) || !data.health?.ok || failedRuns.length > 0 || blockedStageCount > 0;
  return {
    todayDecisions,
    starWatch,
    todaysBookings,
    audienceSignals: audienceSignals.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0)).slice(0, 3),
    publishingFollowUp: publishingFollowUp.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0)).slice(0, 3),
    primaryAction: {
      label: "Review Today's Decisions",
      path: "/review"
    },
    studioOpsHealth: {
      summary: studioNeedsAttention ? "Studio Ops: needs attention" : "Studio Ops: healthy",
      detail: studioNeedsAttention
        ? "Open Studio Ops for failed production, local API, or schedule follow-up."
        : "Technical details are available when needed.",
      apiStatus: data.health?.ok && !error ? "API online" : "API needs attention",
      engineStatus: "Production setup visible in Studio Ops",
      schedulerState,
      activeProductions: activeRuns.length,
      failedProductions: failedRuns.length
    }
  };
}

function outputRecommendation(draft: Draft | null, variant: PlatformVariant | null) {
  if (!draft) return "Select an output to review.";
  const analysis = draft.asset?.latestAnalysis;
  const recommendedAction = analysis?.recommended_action?.toLowerCase() ?? "";
  if (draft.status === "approved") return "Ready to export for publishing.";
  if (draft.status === "exported") return "Ready to record manual publishing.";
  if (draft.status === "published") return "Published and ready for feedback.";
  if (draft.status === "rejected") return "Rejected. Start a revised output from Create or Library.";
  if (recommendedAction.includes("reject") || recommendedAction.includes("regenerate") || (analysis?.quality_issues.length ?? 0) > 0) {
    return "Request revision before approval.";
  }
  if (variant?.caption && variant.caption.length < 80) return "Approve with minor caption edit.";
  return "Approve after a quick caption pass.";
}

function outputReviewReasons(draft: Draft | null, variant: PlatformVariant | null) {
  if (!draft) return [];
  const analysis = draft.asset?.latestAnalysis;
  const reasons: string[] = [];
  if (analysis?.identity_match) {
    reasons.push(`${analysis.identity_match} character style`);
  } else {
    reasons.push("Character fit is ready for human judgment");
  }
  if (analysis?.quality_issues.length) {
    reasons.push(`Visual issue to check: ${analysis.quality_issues[0]}`);
  } else {
    reasons.push("No obvious visual artifacts flagged");
  }
  if (variant?.platform && analysis?.platform_fit.includes(variant.platform)) {
    reasons.push(`Good fit for ${platformLabel(variant.platform)}`);
  } else if (variant?.platform) {
    reasons.push(`Review fit for ${platformLabel(variant.platform)}`);
  } else {
    reasons.push("Platform fit should be confirmed");
  }
  if (variant?.caption && variant.caption.length < 80) {
    reasons.push("Caption tone may need more specificity");
  } else if (variant?.caption) {
    reasons.push("Caption is present for final edit");
  } else {
    reasons.push("Caption needs to be written");
  }
  return reasons;
}

function outputReviewHappened(draft: Draft | null, variant: PlatformVariant | null) {
  if (!draft) return "Select an output to review.";
  const variantCount = draft.variants?.length ?? 0;
  const assetPhrase = draft.asset ? "an image asset" : "a copy-only output";
  const variantPhrase = variantCount === 1 ? "1 platform variant" : `${variantCount} platform variants`;
  const platformPhrase = variant ? ` for ${platformLabel(variant.platform)}` : "";
  return `The system prepared ${assetPhrase}${variantCount ? ` with ${variantPhrase}` : ""}${platformPhrase}.`;
}

function outputDecisionPrompt(draft: Draft | null) {
  if (!draft) return "Choose an output before deciding.";
  if (draft.status === "needs_review") return "Approve, request revision, reject, or edit the caption.";
  if (draft.status === "approved") return "Export the package or edit copy before export.";
  if (draft.status === "exported") return "Record manual publishing once the post is live.";
  if (draft.status === "published") return "No approval is needed. Monitor feedback when it arrives.";
  if (draft.status === "rejected") return "Decide whether to create a revised output.";
  return "Choose the next workflow action.";
}

function outputNextStep(draft: Draft | null, hasExport: boolean, publishEvent: PublishingEvent | undefined) {
  if (!draft) return "Selected outputs show their next workflow step here.";
  if (publishEvent || draft.status === "published") return "Audience response and learnings move to Audience.";
  if (draft.status === "exported" || hasExport) return "Publishing ledger captures the final URL and notes.";
  if (draft.status === "approved") return "Export creates a local publishing package for Schedule.";
  if (draft.status === "rejected") return "Rejected outputs stay available in Review history.";
  return "Approved assets move to Schedule.";
}

function outputDebugPayload(draft: Draft, variant: PlatformVariant | null) {
  return {
    draftId: draft.id,
    runId: draft.run_id,
    assetId: draft.asset_id,
    promptRecipeId: draft.prompt_recipe_id,
    contentBriefId: draft.content_brief_id,
    assetProvider: draft.asset?.provider,
    assetPrompt: draft.asset?.original_prompt,
    assetNegativePrompt: draft.asset?.negative_prompt,
    assetStatus: draft.asset?.status,
    assetRunId: draft.asset?.run_id,
    analysis: draft.asset?.latestAnalysis,
    selectedVariant: variant,
    packages: draft.packages,
    publishingEvents: draft.publishingEvents
  };
}

function talentNameMap(characters: Array<CharacterSummary | CharacterDetail>) {
  return new Map(characters.map((character) => [character.id, displayModelName(character.name)]));
}

function talentNameFromMap(names: Map<string, string>, talentId: string | null | undefined) {
  return talentId ? names.get(talentId) ?? "Selected talent" : "Studio";
}

function reviewTypeLabel(type: ReviewDecisionType) {
  if (type === "portfolio_candidate") return "Portfolio";
  if (type === "social_package") return "Social Package";
  if (type === "career_direction") return "Career Direction";
  return "Studio Attention";
}

function proposalKindLabel(kind: string) {
  if (kind === "constitution_patch") return "Identity Bible";
  if (kind === "canon") return "Canon";
  if (kind === "memory") return "Memory";
  return kind.replaceAll("_", " ");
}

function portfolioRecommendation(asset: ImageAsset) {
  const analysis = asset.latestAnalysis;
  const recommendedAction = analysis?.recommended_action?.toLowerCase() ?? "";
  if (!analysis) return "Run quality review before approving this shot.";
  if (recommendedAction.includes("reject") || recommendedAction.includes("regenerate") || analysis.quality_issues.length > 0) {
    return "Request revision before publishing.";
  }
  if (recommendedAction.includes("reference")) return "Add to portfolio as an identity anchor.";
  return "Approve for publishing.";
}

function portfolioReasons(asset: ImageAsset) {
  const analysis = asset.latestAnalysis;
  if (!analysis) {
    return [
      "Candidate shot exists but identity, quality, and platform fit have not been reviewed.",
      "A quality review will turn the raw production output into a director decision.",
      "The shot stays out of publishing until the review gate is complete."
    ];
  }
  const reasons = [
    analysis.identity_match ? `Identity read: ${analysis.identity_match}.` : "Identity fit is ready for director judgment.",
    analysis.identity_notes ? compactInlineText(analysis.identity_notes, 140) : "No identity drift note was flagged.",
    analysis.platform_fit.length ? `Best platform fit: ${analysis.platform_fit.map(platformLabel).join(", ")}.` : "Platform fit needs director judgment."
  ];
  if (analysis.quality_issues.length) {
    reasons.push(`Quality issue to resolve: ${analysis.quality_issues[0]}.`);
  } else {
    reasons.push("No major quality issue was flagged.");
  }
  return reasons;
}

function portfolioRisk(asset: ImageAsset) {
  const analysis = asset.latestAnalysis;
  if (!analysis) return "Identity and quality risk are unknown until review runs.";
  if (analysis.quality_issues.length) return `Medium: ${analysis.quality_issues[0]}.`;
  if (analysis.identity_score < 0.7) return "Medium: identity match may be too weak for public use.";
  return "Low. Keep caption and placement aligned with the current booking.";
}

function socialPackageRisk(draft: Draft, variant: PlatformVariant | null) {
  const analysis = draft.asset?.latestAnalysis;
  if (analysis?.quality_issues.length) return `Medium: ${analysis.quality_issues[0]}.`;
  if (!variant?.caption) return "Medium: platform copy is missing.";
  if (!variant.disclosure_text) return "Medium: disclosure should be checked before placement.";
  if (variant.caption.length < 80) return "Low: caption may need more personality.";
  return "Low. Final placement still requires manual publishing.";
}

function socialPackagePrimaryAction(draft: Draft) {
  if (draft.status === "approved") return "Prepare Placement Package";
  if (draft.status === "exported") return "Mark Live";
  return "Approve Package";
}

export function buildReviewDecisionPackets({
  characters,
  drafts,
  assets,
  runs
}: {
  characters: Array<CharacterSummary | CharacterDetail>;
  drafts: Draft[];
  assets: ImageAsset[];
  runs: RunSummary[];
}): ReviewDecisionPacket[] {
  const names = talentNameMap(characters);
  const representedRunIds = new Set<string>();
  drafts.forEach((draft) => {
    if (draft.run_id) representedRunIds.add(draft.run_id);
    if (draft.asset?.run_id) representedRunIds.add(draft.asset.run_id);
  });
  assets.forEach((asset) => {
    if (asset.run_id) representedRunIds.add(asset.run_id);
  });

  const portfolioPackets = assets
    .filter((asset) => ["raw_generation", "candidate"].includes(asset.status))
    .map<ReviewDecisionPacket>((asset) => {
      const talentName = talentNameFromMap(names, asset.character_id);
      const analyzed = Boolean(asset.latestAnalysis);
      return {
        id: `portfolio:${asset.id}`,
        type: "portfolio_candidate",
        title: `Candidate portfolio shot for ${talentName}`,
        talentId: asset.character_id,
        talentName,
        statusLabel: assetStatusLabel(asset.status),
        summary: asset.latestAnalysis?.summary ?? "Production created a candidate shot that needs a director portfolio decision.",
        recommendation: portfolioRecommendation(asset),
        why: portfolioReasons(asset),
        risk: portfolioRisk(asset),
        consequence: analyzed
          ? "Approval makes the shot eligible for portfolio use and social packaging; rejection keeps it out of the talent's book."
          : "Quality review will add identity, quality, and platform-fit notes before approval.",
        primaryActionLabel: analyzed ? "Approve for Publishing" : "Review Quality",
        secondaryActionLabels: analyzed ? ["Add to Portfolio", "Request Revision", "Reject"] : ["Open Portfolio"],
        previewImageAssetId: asset.id,
        previewAlt: safeAssetAltText(asset.latestAnalysis?.alt_text, `Candidate portfolio shot for ${talentName}`),
        createdAt: asset.created_at,
        priority: analyzed ? 20 : 24,
        technicalSource: {
          assetId: asset.id,
          runId: asset.run_id,
          proposalId: null,
          draftId: null
        },
        technicalAudit: {
          asset,
          analysis: asset.latestAnalysis
        }
      };
    });

  const socialPackets = drafts
    .filter((draft) => ["needs_review", "approved", "exported"].includes(draft.status))
    .filter((draft) => !(draft.publishingEvents ?? []).some((event) => event.status === "published" || event.published_at))
    .map<ReviewDecisionPacket>((draft) => {
      const variant = draft.variants?.[0] ?? null;
      const talentName = talentNameFromMap(names, draft.character_id);
      const hasExport = Boolean(draft.packages?.length);
      return {
        id: `social:${draft.id}`,
        type: "social_package",
        title: `Social package for ${talentName} — ${draft.title}`,
        talentId: draft.character_id,
        talentName,
        statusLabel: draft.status.replaceAll("_", " "),
        summary: draft.summary ?? outputReviewHappened(draft, variant),
        recommendation: outputRecommendation(draft, variant),
        why: outputReviewReasons(draft, variant),
        risk: socialPackageRisk(draft, variant),
        consequence: outputNextStep(draft, hasExport, undefined),
        primaryActionLabel: socialPackagePrimaryAction(draft),
        secondaryActionLabels: draft.status === "needs_review" ? ["Edit Copy", "Request Revision", "Reject"] : ["Edit Copy", "Open Publishing"],
        previewImageAssetId: draft.asset?.id,
        previewAlt: safeAssetAltText(draft.asset?.latestAnalysis?.alt_text, draft.title),
        createdAt: draft.created_at,
        priority: draft.status === "needs_review" ? 10 : draft.status === "approved" ? 12 : 14,
        technicalSource: {
          draftId: draft.id,
          assetId: draft.asset_id,
          runId: draft.run_id,
          proposalId: null
        },
        technicalAudit: outputDebugPayload(draft, variant)
      };
    });

  const careerPackets = characters.flatMap<ReviewDecisionPacket>((character) => {
    if (!hasCharacterDetail(character)) return [];
    return character.identityProposals
      .filter((proposal) => proposal.status === "proposed")
      .map<ReviewDecisionPacket>((proposal) => {
        const talentName = displayModelName(character.name);
        const riskLevel = proposal.risk_level || "unknown";
        return {
          id: `career:${proposal.id}`,
          type: "career_direction",
          title: `Career direction proposal for ${talentName}`,
          talentId: character.id,
          talentName,
          statusLabel: `${proposalKindLabel(proposal.kind)} proposed`,
          summary: compactInlineText(proposal.body, 180) || "A career direction update needs director approval.",
          recommendation: riskLevel === "high" ? "Review carefully before accepting this career update." : "Approve this career update.",
          why: [
            proposal.rationale ? compactInlineText(proposal.rationale, 160) : "Audience learning produced a proposed identity or career update.",
            `This would update ${proposalKindLabel(proposal.kind).toLowerCase()} for future bookings.`,
            "The change remains gated until the director approves it."
          ],
          risk: riskLevel === "low" ? "Low. Keep future bookings varied so the talent does not become repetitive." : `${proposalKindLabel(proposal.kind)} risk is ${riskLevel}.`,
          consequence: "Approval teaches future bookings and audience interpretation; rejection leaves the current talent direction unchanged.",
          primaryActionLabel: "Approve Career Update",
          secondaryActionLabels: ["Reject"],
          previewImageAssetId: null,
          previewAlt: `Career direction proposal for ${talentName}`,
          createdAt: null,
          priority: 30,
          technicalSource: {
            proposalId: proposal.id,
            runId: proposal.run_id ?? proposal.source_run_id ?? null,
            assetId: null,
            draftId: null
          },
          technicalAudit: {
            proposal,
            characterId: character.id
          }
        };
      });
  });

  const studioPackets = runs
    .filter((run) => run.status === "needs_review" && !representedRunIds.has(run.id))
    .map<ReviewDecisionPacket>((run) => {
      const talentName = talentNameFromMap(names, run.character_id);
      return {
        id: `studio:${run.id}`,
        type: "studio_attention",
        title: "Production job needs attention",
        talentId: run.character_id,
        talentName,
        statusLabel: "Needs review",
        summary: `${runTypeLabel(run.type)} paused before the next agency step.`,
        recommendation: run.error ? "Open Studio Ops before continuing." : "Open the production log and decide the next manual step.",
        why: [
          "The job is paused at a human-visible review gate.",
          run.error ? "The job reported an execution error." : "The machine output needs interpretation before the agency flow continues.",
          `This work is connected to ${talentName}.`
        ],
        risk: "The queue may stay blocked until this production job is resolved.",
        consequence: "Opening the log exposes the full trace so the operator can recover, retry, or move the work forward.",
        primaryActionLabel: "Open Production Log",
        secondaryActionLabels: ["Open Studio Ops"],
        previewImageAssetId: null,
        previewAlt: "Production job needs attention",
        createdAt: run.updated_at,
        priority: 40,
        technicalSource: {
          runId: run.id,
          assetId: null,
          draftId: null,
          proposalId: null
        },
        technicalAudit: { run }
      };
    });

  return [...socialPackets, ...portfolioPackets, ...careerPackets, ...studioPackets].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
}

function nextWorkflowStage(stageId: WorkflowStageId) {
  const index = workflowStageModel.findIndex((stage) => stage.id === stageId);
  return workflowStageModel[index + 1] ?? workflowStageModel[0];
}

function StageHandoff({
  data,
  stageId,
  navigate
}: {
  data: AppData;
  stageId: WorkflowStageId;
  navigate: (path: string) => void;
}) {
  const stage = getWorkflowStage(data, stageId);
  const nextStage = nextWorkflowStage(stageId);
  if (!stage) return null;
  const currentStatus = "status" in stage ? stage.status : "ready";
  const currentDetail = "detail" in stage ? stage.detail : "Ready";
  const primaryActionPath = "primaryActionPath" in stage ? stage.primaryActionPath : stage.path;
  const primaryActionLabel = "primaryActionLabel" in stage ? stage.primaryActionLabel : `Open ${stage.label}`;
  const presentation = agencyFacingStagePresentation(stageId, currentDetail, primaryActionLabel, primaryActionPath);
  return (
    <section className={`stage-handoff stage-handoff-${currentStatus}`} aria-label={`${stage.label} workflow handoff`}>
      <div>
        <span>Current stage</span>
        <strong>{stage.label}</strong>
        <p>{presentation.detail}</p>
      </div>
      <div>
        <span>Next</span>
        <strong>{nextStage?.label ?? "Heartbeat"}</strong>
        <p>{nextStage?.detail ?? "Return to the command center"}</p>
      </div>
      <div className="stage-handoff-actions">
        <em>{currentStatus}</em>
        <button className="primary-action" type="button" onClick={() => navigate(presentation.primaryActionPath)}>
          {presentation.primaryActionLabel}
        </button>
        {nextStage && nextStage.path !== presentation.primaryActionPath && (
          <button type="button" onClick={() => navigate(nextStage.path)}>
            Continue
          </button>
        )}
      </div>
    </section>
  );
}

function runQuery(status = "all", type = "all") {
  const params = new URLSearchParams();
  if (status !== "all") {
    params.set("status", status);
  }
  if (type !== "all") {
    params.set("type", type);
  }
  const query = params.toString();
  return query ? `/runs?${query}` : "/runs";
}

function readRunFilters() {
  const params = new URLSearchParams(window.location.search);
  return {
    status: params.get("status") ?? "all",
    type: params.get("type") ?? "all"
  };
}

function runMatchesStatus(run: RunSummary, filter: string) {
  if (filter === "all") {
    return true;
  }
  if (filter === "active") {
    return run.status === "running" || run.status === "waiting_for_provider";
  }
  return run.status === filter;
}

function runFilterLabel(filter: string) {
  if (filter === "all") {
    return "all statuses";
  }
  if (filter === "active") {
    return "active jobs";
  }
  return statusLabel(filter);
}

function StatusChoiceGroup({
  label,
  currentStatus,
  options,
  pendingValue,
  onSelect
}: {
  label: string;
  currentStatus: string;
  options: Array<{ value: string; label: string; detail: string }>;
  pendingValue: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="status-choice-group" role="group" aria-label={label}>
      {options.map((option) => {
        const selected = option.value === currentStatus;
        const pending = option.value === pendingValue;
        const helper = selected ? "Current" : pending ? "Saving" : option.detail;
        return (
          <button
            aria-disabled={selected || Boolean(pendingValue)}
            aria-label={`${option.label}: ${helper}`}
            aria-pressed={selected}
            className={`status-choice${selected ? " is-selected" : ""}${pending ? " is-pending" : ""}`}
            key={option.value}
            type="button"
            onClick={() => {
              if (!selected && !pendingValue) {
                onSelect(option.value);
              }
            }}
          >
            <span>
              {selected && <CheckCircle aria-hidden size={14} weight="fill" />}
              <strong>{option.label}</strong>
            </span>
            <small>{helper}</small>
          </button>
        );
      })}
    </div>
  );
}

function JsonDetails({ value }: { value: unknown }) {
  return (
    <details className="raw-details">
      <summary>Technical audit</summary>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </details>
  );
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(payload.error ?? `Request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

async function patchJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(payload.error ?? `Request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function AppShell({
  children,
  data,
  error,
  path,
  navigate
}: {
  children: ReactNode;
  data: AppData;
  error: string | null;
  path: string;
  navigate: (path: string) => void;
}) {
  const apiStatusLabel = data.health?.ok ? "Studio Ops online" : error ? "Studio Ops offline" : "Checking Studio Ops";
  const handleInternalLink = (event: MouseEvent<HTMLAnchorElement>, nextPath: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    navigate(nextPath);
  };

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const activeNavItem = document.querySelector(".nav-list a[aria-current='page']");
      const inline = window.matchMedia("(max-width: 900px)").matches ? "start" : "nearest";
      activeNavItem?.scrollIntoView({ block: "nearest", inline });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [path]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#workspace">
        Skip to workspace
      </a>
      <aside className="sidebar" aria-label="Primary navigation">
        <a className="brand" href="/" onClick={(event) => handleInternalLink(event, "/")} aria-label="Virtual Agency Studio home">
          <div className="brand-mark" aria-hidden="true" />
          <div className="brand-copy">
            <strong>Virtual Agency Studio</strong>
            <span>Virtual talent agency</span>
          </div>
        </a>

        <div className="rail-section-label">Agency</div>
        <nav className="nav-list">
          {navItems.map((item) => {
            const active = workModeActive(path, item.id);
            const badge =
              item.id === "review" && data.automationStatus?.runsNeedingReview.length
                ? data.automationStatus.runsNeedingReview.length
                : null;
            return (
              <a
                aria-current={active ? "page" : undefined}
                className={active ? "active" : ""}
                href={item.path}
                key={item.label}
                onClick={(event) => handleInternalLink(event, item.path)}
              >
                <SystemIcon icon={item.icon} weight={active ? "bold" : "regular"} />
                <span className="nav-copy">
                  <strong>{item.label}</strong>
                  <small>{item.detail}</small>
                </span>
                {badge ? <span className="nav-badge">{badge}</span> : null}
              </a>
            );
          })}
        </nav>

        <div className="rail-footer">
          <span className="operator-mark">VA</span>
          <span>Agency Director</span>
          <strong>Director</strong>
        </div>
        <div className="rail-system">
          <span>Studio Ops</span>
          <strong><Command aria-hidden="true" size={14} weight="regular" /> Health <i aria-hidden="true" /></strong>
        </div>
      </aside>

      <main className="workspace" id="workspace" tabIndex={-1}>
        <div className="workspace-chrome">
          <div className="workspace-status-strip" aria-label="Studio Ops health">
            <span><Circle aria-hidden="true" size={7} weight="fill" />Studio Ops Health</span>
          </div>
          <div className="workspace-clock">
            <strong>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
            <span>{new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
          <div className={data.health?.ok ? "health online" : "health"} aria-label={apiStatusLabel}>
            <span aria-hidden="true" />
          </div>
        </div>
        <nav className="studio-flow" aria-label="Agency workflow">
          {workModeSteps.map((step, index) => {
            const active = workModeActive(path, step.id);
            const summary = stageSummaryForMode(data, step.id);
            const StepIcon = step.icon;
            return (
              <a
                aria-current={active ? "step" : undefined}
                className={active ? "active" : ""}
                href={step.path}
                key={step.label}
                onClick={(event) => handleInternalLink(event, step.path)}
              >
                <span className="flow-mark">
                  <StepIcon aria-hidden={true} size={18} weight={active ? "bold" : "regular"} />
                  <em>{String(index + 1).padStart(2, "0")}</em>
                </span>
                <strong>{step.label}</strong>
                <small>{summary ? `${summary.count} · ${summary.status}` : step.detail}</small>
              </a>
            );
          })}
        </nav>
        {children}
      </main>
    </div>
  );
}

function HeartbeatDashboard({
  data,
  loading,
  error,
  navigate
}: {
  data: AppData;
  loading: boolean;
  error: string | null;
  navigate: (path: string) => void;
}) {
  const desk = buildDirectorDeskModel(data, error);

  return (
    <>
      <header className="topbar page-heading">
        <div>
          <span className="eyebrow">Studio</span>
          <h1>Director's Desk</h1>
          <p>Start with approvals, follow-up, and talent signals that need a director decision today.</p>
        </div>
      </header>

      {loading && <div className="notice">Loading agency desk.</div>}
      {error && <div className="notice error">{error}</div>}

      <section className="priority-board command-router director-priority-board" aria-label="Today in Virtual Agency Studio">
        <article className="review-command today-router director-decisions">
          <span>Today's Decisions</span>
          {desk.todayDecisions.length === 0 ? (
            <EmptyState
              title="The desk is clear."
              body="No talent, publishing, or audience decisions need attention right now. Scout a New Face, open Roster, or prepare a Booking when you want to create new work."
            />
          ) : (
            <div className="director-decision-list">
              {desk.todayDecisions.map((decision) => (
                <button className="director-decision-row" key={decision.id} type="button" onClick={() => navigate(decision.path)}>
                  <strong>{decision.count}</strong>
                  <span>
                    <b>{decision.title}</b>
                    <small>{decision.detail}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
          <div className="review-command-actions">
            <button className="primary-action" type="button" onClick={() => navigate(desk.primaryAction.path)}>
              {desk.primaryAction.label}
            </button>
          </div>
        </article>

        <article className="settings-preview director-watch">
          <div className="section-heading">
            <h2>Star Watch</h2>
            <button type="button" onClick={() => navigate("/talent")}>Open Roster</button>
          </div>
          <DirectorDeskList
            items={desk.starWatch}
            emptyTitle="No stars yet."
            emptyBody="Publish work and log audience response to see which talent earns more agency attention."
            navigate={navigate}
          />
        </article>
      </section>

      <section className="command-detail-grid director-desk-grid">
        <article className="machine-room director-bookings">
          <div className="section-heading">
            <h2>Today's Bookings</h2>
            <button type="button" onClick={() => navigate("/prompt-studio")}>Open Bookings</button>
          </div>
          <DirectorDeskList
            items={desk.todaysBookings}
            emptyTitle="No bookings are active today."
            emptyBody="Prepare a booking idea or start production from a creative treatment when a talent is ready for the next assignment."
            navigate={navigate}
          />
        </article>

        <div className="command-side-stack">
          <article className="settings-preview director-audience">
            <div className="section-heading">
              <h2>Audience Signals</h2>
              <button type="button" onClick={() => navigate("/insights")}>Open Audience</button>
            </div>
            <DirectorDeskList
              items={desk.audienceSignals}
              emptyTitle="No audience signal is waiting."
              emptyBody="Publish work and log audience response to learn what the public responds to."
              navigate={navigate}
            />
          </article>

          <article className="settings-preview director-publishing">
            <div className="section-heading">
              <h2>Publishing Follow-up</h2>
              <button type="button" onClick={() => navigate("/calendar")}>Open Publishing</button>
            </div>
            <DirectorDeskList
              items={desk.publishingFollowUp}
              emptyTitle="No publishing follow-up."
              emptyBody="Approved packages and live posts will appear here when they need placement or response."
              navigate={navigate}
            />
          </article>

          <details className="studio-ops-health">
            <summary>
              <span>{desk.studioOpsHealth.summary}</span>
              <strong>{desk.studioOpsHealth.activeProductions ? `${desk.studioOpsHealth.activeProductions} active` : "Details"}</strong>
            </summary>
            <p>{desk.studioOpsHealth.detail}</p>
            <dl>
              <div><dt>API</dt><dd>{desk.studioOpsHealth.apiStatus}</dd></div>
              <div><dt>Production setup</dt><dd>{desk.studioOpsHealth.engineStatus}</dd></div>
              <div><dt>Schedule</dt><dd>{desk.studioOpsHealth.schedulerState}</dd></div>
              <div><dt>Failed production</dt><dd>{pluralize(desk.studioOpsHealth.failedProductions, "item")}</dd></div>
            </dl>
            <button type="button" onClick={() => navigate("/settings")}>Open Studio Ops</button>
          </details>
        </div>
      </section>
    </>
  );
}

function DirectorDeskList({
  items,
  emptyTitle,
  emptyBody,
  navigate
}: {
  items: DirectorDeskItem[];
  emptyTitle: string;
  emptyBody: string;
  navigate: (path: string) => void;
}) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} body={emptyBody} />;
  }

  return (
    <div className="director-section-list">
      {items.map((item) => (
        <button className="director-section-row" key={item.id} type="button" onClick={() => navigate(item.path)}>
          <span>
            <strong>{item.title}</strong>
            <small>{item.detail}</small>
          </span>
          <em>{item.count !== undefined ? item.count : item.actionLabel}</em>
        </button>
      ))}
    </div>
  );
}

function CreateModePage({
  data,
  loading,
  error,
  navigate
}: {
  data: AppData;
  loading: boolean;
  error: string | null;
  navigate: (path: string) => void;
}) {
  const [selectedCharacterId, setSelectedCharacterId] = useState("");
  const [localCharacter, setLocalCharacter] = useState<CharacterDetail | null>(null);
  const [localBirthRun, setLocalBirthRun] = useState<RunSummary | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [intakeStep, setIntakeStep] = useState(0);
  const [name, setName] = useState("");
  const [marketOpportunity, setMarketOpportunity] = useState("");
  const [audiencePlatform, setAudiencePlatform] = useState("");
  const [differentiator, setDifferentiator] = useState("");
  const [publicArchetype, setPublicArchetype] = useState("");
  const [emotionalTone, setEmotionalTone] = useState("");
  const [lifeTexture, setLifeTexture] = useState("");
  const [uniquenessHook, setUniquenessHook] = useState("");
  const [initialSummary, setInitialSummary] = useState("");
  const [visualIdentity, setVisualIdentity] = useState("");
  const [styleLanguage, setStyleLanguage] = useState("");
  const [referenceConstraints, setReferenceConstraints] = useState("");
  const [avoidNotes, setAvoidNotes] = useState("");
  const [consistencyNotes, setConsistencyNotes] = useState("");
  const [voiceGuide, setVoiceGuide] = useState("");
  const [emotionalDepth, setEmotionalDepth] = useState("");
  const [recurringTensions, setRecurringTensions] = useState("");
  const [values, setValues] = useState("");
  const [publicPrivateContrast, setPublicPrivateContrast] = useState("");
  const [primaryPlatform, setPrimaryPlatform] = useState("Instagram");
  const [secondaryPlatforms, setSecondaryPlatforms] = useState("");
  const [contentStrengths, setContentStrengths] = useState("");
  const [publicAppeal, setPublicAppeal] = useState("");
  const [portfolioTest, setPortfolioTest] = useState("");
  const [driftRisk, setDriftRisk] = useState("");
  const platformOptions = ["Instagram", "TikTok", "Threads", "YouTube", "X", "Blog"];
  const scopedCharacters = useMemo(() => {
    if (!localCharacter) return data.characters;
    const withoutLocal = data.characters.filter((character) => character.id !== localCharacter.id);
    return [localCharacter, ...withoutLocal];
  }, [data.characters, localCharacter]);
  const selectedCharacter =
    scopedCharacters.find((character) => character.id === selectedCharacterId) ??
    scopedCharacters[0] ??
    null;
  const selectedRuns = useMemo(() => {
    if (!selectedCharacter) return [];
    const runs = data.runs.filter((run) => run.character_id === selectedCharacter.id);
    if (localBirthRun?.character_id === selectedCharacter.id && !runs.some((run) => run.id === localBirthRun.id)) {
      return [localBirthRun, ...runs];
    }
    return runs;
  }, [data.runs, localBirthRun, selectedCharacter]);
  const dossier = selectedCharacter ? buildNewFaceDossier(selectedCharacter, selectedRuns) : null;
  const birthRuns = data.runs.filter((run) => run.type === "character_birth");
  const birthReviewCount = birthRuns.filter((run) => run.status === "needs_review").length + (localBirthRun?.status === "needs_review" ? 1 : 0);
  const approvedNewFaces = scopedCharacters.filter((character) => character.status.toLowerCase().includes("approved")).length;
  const intakeReady = Boolean(name.trim() && (marketOpportunity.trim() || initialSummary.trim() || uniquenessHook.trim()));
  const latestBirthRun = dossier?.latestBirthRun ?? null;
  const intakeStepTitle = newFaceIntakeSteps[intakeStep] ?? newFaceIntakeSteps[0];

  useEffect(() => {
    if (selectedCharacterId && scopedCharacters.some((character) => character.id === selectedCharacterId)) {
      return;
    }
    setSelectedCharacterId(scopedCharacters[0]?.id ?? "");
  }, [scopedCharacters, selectedCharacterId]);

  async function createNewFace() {
    if (!name.trim()) return;
    setPendingAction("create");
    setFormError(null);
    setMessage(null);
    try {
      const summary = [
        initialSummary.trim(),
        marketOpportunity.trim() ? `Market opportunity: ${marketOpportunity.trim()}` : "",
        differentiator.trim() ? `Different from roster: ${differentiator.trim()}` : "",
        uniquenessHook.trim() ? `Hook: ${uniquenessHook.trim()}` : ""
      ].filter(Boolean).join("\n\n");
      const created = await postJson<{ character: CharacterDetail }>("/api/characters", {
        name,
        summary: summary || null,
        status: "idea"
      });
      let character = created.character;
      const saveDetail = async (path: string, body: unknown) => {
        const payload = await postJson<{ character?: CharacterDetail }>(path, body);
        if (payload.character) {
          character = payload.character;
        }
      };
      const constitutionBody = labeledLines([
        ["Public archetype", publicArchetype],
        ["Emotional tone", emotionalTone],
        ["Life texture", lifeTexture],
        ["Uniqueness hook", uniquenessHook],
        ["Initial summary", initialSummary],
        ["Market opportunity", marketOpportunity],
        ["Audience or platform", audiencePlatform],
        ["Different from existing talent", differentiator],
        ["First portfolio test", portfolioTest],
        ["Identity drift risk", driftRisk]
      ]);
      if (constitutionBody) {
        await saveDetail(`/api/characters/${character.id}/constitutions`, {
          body: constitutionBody,
          changeReason: "Initial scouting intake.",
          markActive: true
        });
      }
      const appearanceBody = labeledLines([
        ["Visual identity", visualIdentity],
        ["Style language", styleLanguage],
        ["Reference constraints", referenceConstraints],
        ["Avoid", avoidNotes],
        ["Identity consistency notes", consistencyNotes]
      ]);
      if (appearanceBody) {
        await saveDetail(`/api/characters/${character.id}/appearance`, { body: appearanceBody });
      }
      const voiceBody = labeledLines([
        ["Voice guide", voiceGuide],
        ["Emotional depth", emotionalDepth],
        ["Recurring tensions", recurringTensions],
        ["Values", values],
        ["Public/private contrast", publicPrivateContrast]
      ]);
      if (voiceBody) {
        await saveDetail(`/api/characters/${character.id}/voice`, { body: voiceBody });
      }
      const personaBody = labeledLines([
        ["Primary platform", primaryPlatform],
        ["Secondary platforms", secondaryPlatforms],
        ["Content strengths", contentStrengths],
        ["Public appeal hypothesis", publicAppeal]
      ]);
      if (personaBody) {
        await saveDetail(`/api/characters/${character.id}/personas`, { platform: primaryPlatform, body: personaBody });
      }
      setLocalCharacter(character);
      setSelectedCharacterId(character.id);
      setLocalBirthRun(null);
      setMessage("New Face Dossier created. The director can approve, revise, reject, or run Birth Dossier review.");
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : "Unable to scout New Face.");
    } finally {
      setPendingAction(null);
    }
  }

  async function startBirthDossier() {
    if (!selectedCharacter) return;
    setPendingAction("birth");
    setFormError(null);
    setMessage(null);
    try {
      const payload = await postJson<RunDetailPayload>(`/api/characters/${selectedCharacter.id}/birth-run`, {});
      setLocalBirthRun(payload.run);
      setMessage("Birth Dossier is ready for director review. The Production Log is available as the secondary trace.");
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : "Unable to run Birth Dossier.");
    } finally {
      setPendingAction(null);
    }
  }

  async function decideNewFace(status: "approved" | "needs_revision" | "rejected") {
    if (!selectedCharacter) return;
    setPendingAction(status);
    setFormError(null);
    setMessage(null);
    try {
      const payload = await patchJson<{ character: CharacterDetail }>(`/api/characters/${selectedCharacter.id}`, { status });
      setLocalCharacter(payload.character);
      setSelectedCharacterId(payload.character.id);
      setMessage(status === "approved" ? "New Face approved for development." : status === "rejected" ? "Concept rejected." : "Identity marked for revision.");
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : "Unable to save director decision.");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <>
      <header className="topbar page-heading">
        <div>
          <span className="eyebrow">New faces</span>
          <h1>Scouting</h1>
          <p>Evaluate a new identity before adding it to the agency roster.</p>
        </div>
      </header>

      {loading && <div className="notice">Loading scouting context.</div>}
      {error && <div className="notice error">{error}</div>}
      {formError && <div className="notice error">{formError}</div>}
      {message && <div className="notice">{message}</div>}
      <StageHandoff data={data} stageId="birth" navigate={navigate} />

      <section className="scouting-command" aria-label="Scouting overview">
        <article>
          <span>New Face Intake</span>
          <strong>{scopedCharacters.length}</strong>
          <p>{scopedCharacters.length === 1 ? "identity in scouting" : "identities in scouting"}</p>
        </article>
        <article>
          <span>Birth Dossiers</span>
          <strong>{birthRuns.length + (localBirthRun ? 1 : 0)}</strong>
          <p>{birthReviewCount ? `${birthReviewCount} need director decision` : "production logs linked"}</p>
        </article>
        <article>
          <span>Approved</span>
          <strong>{approvedNewFaces}</strong>
          <p>ready for development</p>
        </article>
        <button className="primary-action" type="button" onClick={() => navigate("/talent")}>Open Roster</button>
      </section>

      <section className="scouting-workbench">
        <article className="machine-room new-face-intake">
          <div className="section-heading">
            <h2>Guided Intake</h2>
            <span>{intakeReady ? "Ready" : "Draft"}</span>
          </div>
          <div className="scouting-stepper" aria-label="New Face Intake steps">
            {newFaceIntakeSteps.map((step, index) => (
              <button
                className={`${index === intakeStep ? "active" : ""}${index < intakeStep ? " complete" : ""}`}
                key={step}
                type="button"
                aria-current={index === intakeStep ? "step" : undefined}
                onClick={() => setIntakeStep(index)}
              >
                <b>{index + 1}</b>{step}
              </button>
            ))}
          </div>
          <div className="intake-step-status" aria-live="polite">
            <span>Step {intakeStep + 1} of {newFaceIntakeSteps.length}</span>
            <strong>{intakeStepTitle}</strong>
            <p>Your entries are saved while you move between steps.</p>
          </div>
          <div className="form-stack scouting-form">
            {intakeStep === 0 && (
              <fieldset>
                <legend>Market Opportunity</legend>
                <label>What kind of talent is missing?<textarea value={marketOpportunity} onChange={(event) => setMarketOpportunity(event.target.value)} /></label>
                <label>Audience or platform<input value={audiencePlatform} onChange={(event) => setAudiencePlatform(event.target.value)} /></label>
                <label>What makes this identity different?<textarea value={differentiator} onChange={(event) => setDifferentiator(event.target.value)} /></label>
              </fieldset>
            )}
            {intakeStep === 1 && (
              <fieldset>
                <legend>Identity Seed</legend>
                <label>Name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="New Face name" /></label>
                <label>Public archetype<input value={publicArchetype} onChange={(event) => setPublicArchetype(event.target.value)} /></label>
                <label>Emotional tone<input value={emotionalTone} onChange={(event) => setEmotionalTone(event.target.value)} /></label>
                <label>Life texture<input value={lifeTexture} onChange={(event) => setLifeTexture(event.target.value)} /></label>
                <label>Uniqueness hook<input value={uniquenessHook} onChange={(event) => setUniquenessHook(event.target.value)} /></label>
                <label>Initial summary<textarea value={initialSummary} onChange={(event) => setInitialSummary(event.target.value)} /></label>
              </fieldset>
            )}
            {intakeStep === 2 && (
              <fieldset>
                <legend>Look Direction</legend>
                <label>Visual identity<textarea value={visualIdentity} onChange={(event) => setVisualIdentity(event.target.value)} /></label>
                <label>Style language<input value={styleLanguage} onChange={(event) => setStyleLanguage(event.target.value)} /></label>
                <label>Reference constraints<textarea value={referenceConstraints} onChange={(event) => setReferenceConstraints(event.target.value)} /></label>
                <label>What to avoid<textarea value={avoidNotes} onChange={(event) => setAvoidNotes(event.target.value)} /></label>
                <label>Identity consistency notes<textarea value={consistencyNotes} onChange={(event) => setConsistencyNotes(event.target.value)} /></label>
              </fieldset>
            )}
            {intakeStep === 3 && (
              <fieldset>
                <legend>Voice and Inner Life</legend>
                <label>Voice guide<textarea value={voiceGuide} onChange={(event) => setVoiceGuide(event.target.value)} /></label>
                <label>Emotional depth<textarea value={emotionalDepth} onChange={(event) => setEmotionalDepth(event.target.value)} /></label>
                <label>Recurring tensions<textarea value={recurringTensions} onChange={(event) => setRecurringTensions(event.target.value)} /></label>
                <label>Values<input value={values} onChange={(event) => setValues(event.target.value)} /></label>
                <label>Public/private contrast<textarea value={publicPrivateContrast} onChange={(event) => setPublicPrivateContrast(event.target.value)} /></label>
              </fieldset>
            )}
            {intakeStep === 4 && (
              <fieldset>
                <legend>Platform Fit</legend>
                <label>Primary platform<select value={primaryPlatform} onChange={(event) => setPrimaryPlatform(event.target.value)}>{platformOptions.map((platform) => <option key={platform} value={platform}>{platform}</option>)}</select></label>
                <label>Secondary platforms<input value={secondaryPlatforms} onChange={(event) => setSecondaryPlatforms(event.target.value)} /></label>
                <label>Content strengths<textarea value={contentStrengths} onChange={(event) => setContentStrengths(event.target.value)} /></label>
                <label>Public appeal hypothesis<textarea value={publicAppeal} onChange={(event) => setPublicAppeal(event.target.value)} /></label>
              </fieldset>
            )}
            {intakeStep === 5 && (
              <fieldset>
                <legend>First Portfolio Test</legend>
                <label>Recommended test<textarea value={portfolioTest} onChange={(event) => setPortfolioTest(event.target.value)} /></label>
                <label>Identity drift risk<textarea value={driftRisk} onChange={(event) => setDriftRisk(event.target.value)} /></label>
              </fieldset>
            )}
            {intakeStep === 6 && (
              <section className="intake-review" aria-label="New Face Dossier review">
                <div><span>Name</span><strong>{name.trim() || "Add a name in Identity Seed"}</strong></div>
                <div><span>Market opportunity</span><strong>{marketOpportunity.trim() || "Add a market opportunity"}</strong></div>
                <div><span>Public promise</span><strong>{initialSummary.trim() || uniquenessHook.trim() || "Add an initial summary or uniqueness hook"}</strong></div>
                <div><span>Platform</span><strong>{primaryPlatform}</strong></div>
                <div><span>First portfolio test</span><strong>{portfolioTest.trim() || "Not set yet"}</strong></div>
                <p>{intakeReady ? "The dossier has the minimum identity promise needed for director review." : "Add a name plus a market opportunity, initial summary, or uniqueness hook before creating the dossier."}</p>
              </section>
            )}
            <div className="intake-step-actions">
              <button type="button" onClick={() => setIntakeStep((current) => Math.max(0, current - 1))} disabled={intakeStep === 0}>Previous</button>
              {intakeStep < newFaceIntakeSteps.length - 1 ? (
                <button className="primary-action" type="button" onClick={() => setIntakeStep((current) => Math.min(newFaceIntakeSteps.length - 1, current + 1))}>Next: {newFaceIntakeSteps[intakeStep + 1]}</button>
              ) : (
                <button className="primary-action" type="button" onClick={createNewFace} disabled={pendingAction !== null || !intakeReady}>
                  {pendingAction === "create" ? "Creating Dossier" : "Create New Face Dossier"}
                </button>
              )}
            </div>
          </div>
        </article>

        <div className="command-side-stack scouting-side">
          <article className="settings-preview scouting-candidates">
            <div className="section-heading">
              <h2>New Face Candidates</h2>
              <span>{scopedCharacters.length}</span>
            </div>
            {scopedCharacters.length === 0 ? (
              <EmptyState title="No New Face candidates yet" body="Use intake to scout the first identity." />
            ) : (
              <div className="director-section-list">
                {scopedCharacters.slice(0, 8).map((character) => {
                  const candidateDossier = buildNewFaceDossier(character, character.id === selectedCharacter?.id ? selectedRuns : data.runs);
                  return (
                    <button
                      className={`director-section-row${selectedCharacter?.id === character.id ? " is-selected" : ""}`}
                      key={character.id}
                      type="button"
                      onClick={() => setSelectedCharacterId(character.id)}
                    >
                      <span>
                        <strong>{candidateDossier.displayName}</strong>
                        <small>{candidateDossier.publicPromise}</small>
                      </span>
                      <em>{candidateDossier.directorDecision}</em>
                    </button>
                  );
                })}
              </div>
            )}
          </article>

          <article className="settings-preview new-face-dossier">
            <div className="section-heading">
              <h2>New Face Dossier</h2>
              {dossier && <span>{dossier.stageLabel}</span>}
            </div>
            {dossier ? (
              <>
                <div className="dossier-hero">
                  <div className="casting-mark"><span>{modelInitials(dossier.displayName)}</span></div>
                  <div>
                    <span className="eyebrow">Director review</span>
                    <h2>{dossier.displayName}</h2>
                    <p>{dossier.publicPromise}</p>
                  </div>
                </div>
                <dl className="new-face-fields">
                  <div><dt>Name</dt><dd>{dossier.displayName}</dd></div>
                  <div><dt>Stage</dt><dd>{dossier.stageLabel}</dd></div>
                  <div><dt>Public promise</dt><dd>{dossier.publicPromise}</dd></div>
                  <div><dt>Visual direction</dt><dd>{dossier.visualDirection}</dd></div>
                  <div><dt>Voice/interiority</dt><dd>{dossier.voiceInteriority}</dd></div>
                  <div><dt>Best initial platform</dt><dd>{dossier.bestInitialPlatform}</dd></div>
                  <div><dt>Development risk</dt><dd>{dossier.developmentRisk}</dd></div>
                  <div><dt>Recommended first booking</dt><dd>{dossier.recommendedFirstBooking}</dd></div>
                </dl>
                <div className="director-decision-panel">
                  <span>Director decision</span>
                  <strong>{dossier.directorDecision}</strong>
                  <div className="review-command-actions">
                    <button className="primary-action" type="button" onClick={() => decideNewFace("approved")} disabled={pendingAction !== null}>Approve New Face</button>
                    <button type="button" onClick={() => decideNewFace("needs_revision")} disabled={pendingAction !== null}>Revise Identity</button>
                    <button type="button" onClick={() => decideNewFace("rejected")} disabled={pendingAction !== null}>Reject Concept</button>
                  </div>
                </div>
                <details className="production-log-link">
                  <summary><span>Birth Dossier</span><strong>{latestBirthRun ? statusLabel(latestBirthRun.status) : "Not run"}</strong></summary>
                  <p>{latestBirthRun ? "Birth output is available for traceability while the dossier remains the primary review surface." : "Run Birth Dossier when the identity promise is ready for a director check."}</p>
                  <div className="review-command-actions">
                    <button className="primary-action" type="button" onClick={startBirthDossier} disabled={pendingAction !== null || !selectedCharacter}>
                      {pendingAction === "birth" ? "Running Birth Dossier" : latestBirthRun ? "Run Birth Dossier Again" : "Run Birth Dossier"}
                    </button>
                    <button type="button" onClick={() => navigate(dossier.productionLogPath ?? "/runs?status=needs_review")} disabled={!dossier.productionLogPath}>
                      View Production Log
                    </button>
                  </div>
                </details>
              </>
            ) : (
              <EmptyState title="No dossier selected" body="Scout or select a New Face to review." />
            )}
          </article>
        </div>
      </section>

      {dossier && (
        <section className="machine-room dossier-step-review">
          <div className="section-heading">
            <h2>Scouting Review</h2>
            <button type="button" onClick={() => navigate(dossier.productionLogPath ?? "/runs")}>Open Production Logs</button>
          </div>
          <div className="dossier-step-grid">
            {dossier.steps.map((step) => (
              <article key={step.id} className={`dossier-step-card is-${step.status}`}>
                <span>{step.label}</span>
                <strong>{step.status === "ready" ? "Ready" : step.status === "review" ? "Review" : "Needs input"}</strong>
                <p>{step.detail}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function RunsPage({
  data,
  loading,
  error,
  navigate
}: {
  data: AppData;
  loading: boolean;
  error: string | null;
  navigate: (path: string) => void;
}) {
  const [statusFilter, setStatusFilter] = useState(() => readRunFilters().status);
  const [typeFilter, setTypeFilter] = useState(() => readRunFilters().type);
  const [showFullRunQueue, setShowFullRunQueue] = useState(false);
  const types = Array.from(new Set(data.runs.map((run) => run.type))).sort();
  const statuses = Array.from(new Set(data.runs.map((run) => run.status))).sort();
  const filterActive = statusFilter !== "all" || typeFilter !== "all";
  const reviewRun = data.automationStatus?.runsNeedingReview[0] ?? data.runs.find((run) => run.status === "needs_review") ?? null;
  const activeRun = data.runs.find((run) => runMatchesStatus(run, "active")) ?? null;
  const runQuickFilters = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "needs_review", label: "Review" },
    { value: "completed", label: "Complete" },
    { value: "failed", label: "Failed" }
  ];

  useEffect(() => {
    const syncFilters = () => {
      const next = readRunFilters();
      setStatusFilter(next.status);
      setTypeFilter(next.type);
    };
    window.addEventListener("popstate", syncFilters);
    syncFilters();
    return () => window.removeEventListener("popstate", syncFilters);
  }, []);

  function applyRunFilters(nextStatus: string, nextType: string) {
    setStatusFilter(nextStatus);
    setTypeFilter(nextType);
    setShowFullRunQueue(false);
    navigate(runQuery(nextStatus, nextType));
  }

  const filteredRuns = data.runs.filter((run) => {
    return runMatchesStatus(run, statusFilter) && (typeFilter === "all" || run.type === typeFilter);
  });
  const visibleRunLimit = 18;
  const queueRuns = showFullRunQueue || filterActive ? filteredRuns : filteredRuns.slice(0, visibleRunLimit);
  const hiddenRunCount = filteredRuns.length - queueRuns.length;
  const runMatrixStatuses = ["active", "needs_review", "completed", "failed"];
  const runTypeRows = types.map((type) => ({
    type,
    counts: runMatrixStatuses.map((status) => ({
      status,
      count: data.runs.filter((run) => run.type === type && runMatchesStatus(run, status)).length
    })),
    total: data.runs.filter((run) => run.type === type).length
  }));
  const selectedRun = reviewRun ?? activeRun ?? queueRuns[0] ?? data.runs[0] ?? null;
  const selectedCharacter = selectedRun ? data.characters.find((item) => item.id === selectedRun.character_id) : null;
  const actionRequiredCount = data.runs.filter((run) => run.status === "needs_review" || run.status === "failed").length;

  return (
    <>
      <header className="topbar page-heading">
        <div>
          <span className="eyebrow">Studio Ops</span>
          <h1>Production Logs</h1>
        </div>
      </header>

      {loading && <div className="notice">Loading production logs.</div>}
      {error && <div className="notice error">{error}</div>}

      <section className="timeline-control-layout" aria-label="Timeline control desk">
        <div className="timeline-main-column">
          <section className="timeline-desk">
            <article className="route-matrix-panel">
              <div className="section-heading"><h2>Production matrix</h2></div>
              <table className="route-matrix timeline-matrix">
                <thead>
                  <tr>
                    <th>Pipeline</th>
                    <th>Active</th>
                    <th>Review</th>
                    <th>Complete</th>
                    <th>Failed</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {runTypeRows.map((row) => (
                    <tr key={row.type}>
                      <td>{runTypeLabel(row.type)}</td>
                      {row.counts.map((count) => <td key={count.status}>{count.count}</td>)}
                      <td>{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
            <article className="desk-overview-panel">
              <div className="section-heading"><h2>Signal</h2></div>
              <div className="desk-stat-row" aria-label="Production log summary">
                <span><strong>{activeRun ? 1 : 0}</strong><small>Active</small></span>
                <span><strong>{data.runs.filter((run) => run.status === "needs_review").length}</strong><small>Review</small></span>
                <span className="alert"><strong>{actionRequiredCount}</strong><small>Action</small></span>
              </div>
              <dl className="desk-next-window">
                <div>
                  <dt>Current log</dt>
                  <dd>{selectedRun ? shortRunId(selectedRun.id) : "None"}</dd>
                </div>
                <div>
                  <dt>Latest state</dt>
                  <dd>{selectedRun ? statusLabel(selectedRun.status) : "Clear"}</dd>
                </div>
              </dl>
            </article>
            <article className="run-dossier-panel timeline-focus-panel">
              <div className="dossier-heading">
                <span>Production dossier</span>
              </div>
              {!selectedRun ? <EmptyState title="No production log selected" body="Studio traces appear here after work starts." /> : (
                <div className="run-dossier">
                  <div className="dossier-platform-row">
                    <span className="platform-mark platform-mark-system"><ClockCounterClockwise aria-hidden="true" size={16} weight="regular" /></span>
                    <strong>{runTypeLabel(selectedRun.type)}</strong>
                    <em>{statusLabel(selectedRun.status)}</em>
                  </div>
                  <h2>{selectedRun.title}</h2>
                  <p>{currentStep(selectedRun)}</p>
                  <dl className="profile-facts run-facts">
                    <div><dt>Log</dt><dd>{shortRunId(selectedRun.id)}</dd></div>
                    <div><dt>Talent</dt><dd>{selectedCharacter?.name ?? "Unassigned"}</dd></div>
                    <div><dt>Started</dt><dd>{formatDate(selectedRun.created_at)}</dd></div>
                    <div><dt>Status</dt><dd>{statusLabel(selectedRun.status)}</dd></div>
                  </dl>
                  <div className="draft-primary-actions dossier-actions">
                    <button className="primary-action" type="button" onClick={() => navigate(`/runs/${selectedRun.id}`)}>Open Production Log</button>
                    {selectedRun.character_id && <button type="button" onClick={() => navigate(`/characters/${selectedRun.character_id}`)}>Open dossier</button>}
                  </div>
                </div>
              )}
            </article>
          </section>

          <section className="run-lane" aria-label="Production log status filters">
            {runQuickFilters.map((item) => {
              const count = item.value === "all" ? data.runs.length : data.runs.filter((run) => runMatchesStatus(run, item.value)).length;
              return (
                <button className={statusFilter === item.value ? "active" : ""} key={item.value} type="button" onClick={() => applyRunFilters(item.value, typeFilter)}>
                  <strong>{count}</strong>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </section>

          <section className="filters" aria-label="Production log filters">
            <div className="filter-summary" aria-live="polite">
              <strong>{filteredRuns.length}</strong>
              <span>{runFilterLabel(statusFilter)} · {typeFilter === "all" ? "all types" : runTypeLabel(typeFilter)}</span>
            </div>
            <label>
              Status
              <select value={statusFilter} onChange={(event) => applyRunFilters(event.target.value, typeFilter)}>
                <option value="all">All statuses</option>
                <option value="active">Active provider/queue</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Type
              <select value={typeFilter} onChange={(event) => applyRunFilters(statusFilter, event.target.value)}>
                <option value="all">All types</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {runTypeLabel(type)}
                  </option>
                ))}
              </select>
            </label>
            {filterActive && (
              <button className="filter-clear" type="button" onClick={() => applyRunFilters("all", "all")}>
                Clear filters
              </button>
            )}
          </section>

          {filteredRuns.length === 0 ? (
            <section className="table-panel">
              <EmptyState title="No matching production logs" body="Clear filters or start new work from Studio Ops." />
            </section>
          ) : (
            <>
              <section className="run-card-list" aria-label="Filtered production logs">
                {queueRuns.map((run) => {
                  const character = data.characters.find((item) => item.id === run.character_id);
                  return (
                    <button className="run-mobile-card" key={run.id} onClick={() => navigate(`/runs/${run.id}`)} type="button">
                      <span className={statusClass(run.status)}>{statusLabel(run.status)}</span>
                      <strong>{run.title}</strong>
                      <small>{runTypeLabel(run.type)} · {character?.name ?? "Unassigned"}</small>
                      <p>{currentStep(run)}</p>
                      <em>{formatDate(run.created_at)}</em>
                    </button>
                  );
                })}
              </section>

              <section className="table-panel runs-table-panel">
                <table className="runs-table">
                  <colgroup>
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Production</th>
                      <th>Type</th>
                      <th>State</th>
                      <th>Talent</th>
                      <th>Current step</th>
                      <th>Started</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queueRuns.map((run) => {
                      const character = data.characters.find((item) => item.id === run.character_id);
                      return (
                        <tr key={run.id} onClick={() => navigate(`/runs/${run.id}`)}>
                          <td>
                            <strong>{run.title}</strong>
                            <small>log {shortRunId(run.id)}</small>
                          </td>
                          <td>{runTypeLabel(run.type)}</td>
                          <td>
                            <em className={statusClass(run.status)}>{statusLabel(run.status)}</em>
                          </td>
                          <td>{character?.name ?? "Unassigned"}</td>
                          <td className="run-step-cell"><span>{currentStep(run)}</span></td>
                          <td>{formatDate(run.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>
              {hiddenRunCount > 0 && (
                <div className="run-queue-footer">
                  <span>{hiddenRunCount} older logs hidden</span>
                  <button type="button" onClick={() => setShowFullRunQueue(true)}>Show full history</button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

function RunDetailPage({ runId, navigate }: { runId: string; navigate: (path: string) => void }) {
  const [detail, setDetail] = useState<RunDetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let timeoutId: number | undefined;

    async function load() {
      try {
        const response = await fetch(`${apiBaseUrl()}/api/runs/${runId}`);
        if (!response.ok) {
          throw new Error(response.status === 404 ? "Run not found." : "Unable to load run detail.");
        }
        const payload = (await response.json()) as RunDetailPayload;
        if (active) {
          setDetail(payload);
          setError(null);
          setLoading(false);
        }
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : "Unable to load run detail.");
          setLoading(false);
        }
      } finally {
        if (active) {
          timeoutId = window.setTimeout(load, 3000);
        }
      }
    }

    void load();

    return () => {
      active = false;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [runId]);

  if (loading) {
    return <div className="notice">Loading production log.</div>;
  }

  if (error || !detail) {
    return (
      <div className="notice error">
        {error ?? "Run not found."}
        <button type="button" onClick={() => navigate("/runs")}>
          Back to production logs
        </button>
      </div>
    );
  }

  const { run, events, artifacts, decisions } = detail;
  const latestEvent = events.at(-1);
  const providerJobCount = detail.providerJobs?.length ?? 0;
  const runStats = [
    { label: "Events", value: events.length, detail: latestEvent?.type ?? "None" },
    { label: "Artifacts", value: artifacts.length, detail: artifacts[0]?.label ?? "None" },
    { label: "Providers", value: providerJobCount, detail: detail.providerJobs?.[0]?.provider ?? "None" },
    { label: "Decisions", value: decisions.length, detail: decisions[0]?.decision ?? "None" }
  ];

  return (
    <>
      <header className="topbar page-heading">
        <div>
          <button className="text-button" type="button" onClick={() => navigate("/runs")}>
            Back to production logs
          </button>
          <span className="eyebrow">Studio Ops</span>
          <h1>Production Log</h1>
          <p>{run.title}</p>
        </div>
        <em className={statusClass(run.status)}>{run.status.replaceAll("_", " ")}</em>
      </header>

      <section className="run-command" aria-label="Production log summary">
        <article className="run-hero">
          <span>{runTypeLabel(run.type)}</span>
          <h2>What happened behind the scenes?</h2>
          <p>{currentStep(run, events)}</p>
          <div className="button-stack">
            <button type="button" onClick={() => navigate("/runs")}>All Production Logs</button>
            {run.character_id && <button type="button" onClick={() => navigate(`/characters/${run.character_id}`)}>Talent Profile</button>}
          </div>
        </article>
        <div className="run-stat-grid">
          {runStats.map((card) => (
            <article key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <p>{card.detail}</p>
            </article>
          ))}
        </div>
      </section>

      {run.error && <div className="notice error">{run.error}</div>}

      <section className="detail-grid">
        <article className="machine-room">
          <div className="section-heading">
            <h2>Production Log</h2>
          </div>
          {events.length === 0 ? (
            <EmptyState title="No entries" body="This production job has not emitted staff notes yet." />
          ) : (
            <ol className="timeline">
              {events.map((event) => (
                <li key={event.id}>
                  <div className="timeline-dot" />
                  <div>
                    <time>{formatDate(event.created_at)}</time>
                    <strong>{event.type}</strong>
                    <p>{event.message}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
          {events.length > 0 && (
            <details className="raw-details run-audit-drawer">
              <summary>Technical audit</summary>
              <pre>
                {JSON.stringify(
                  events.map((event) => ({
                    time: event.created_at,
                    type: event.type,
                    message: event.message,
                    payload: event.payload
                  })),
                  null,
                  2
                )}
              </pre>
            </details>
          )}
        </article>

        <aside className="side-stack">
          <article className="settings-preview next-action-panel">
            <div className="section-heading"><h2>Machine State</h2></div>
            <p className="action-copy">{nextAction(run)}</p>
          </article>

          <article className="settings-preview">
            <div className="section-heading">
              <h2>Artifacts</h2>
            </div>
            {artifacts.length === 0 ? (
              <EmptyState title="No artifacts" body="Provider responses and exports will appear here." />
            ) : (
              <div className="compact-list">
                {artifacts.map((artifact) => (
                  <div key={artifact.id}>
                    <strong>{artifact.label}</strong>
                    <small>{artifact.kind}</small>
                    <JsonDetails value={artifact.artifact} />
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="settings-preview">
            <div className="section-heading">
              <h2>Production Engine Logs</h2>
            </div>
            {!detail.providerJobs?.length ? (
              <EmptyState title="No engine calls" body="Production engine calls will appear here after generation or analysis jobs." />
            ) : (
              <div className="compact-list">
                {detail.providerJobs.map((job) => (
                  <div key={job.id}>
                    <strong>{job.attempt_index ? `#${job.attempt_index} · ` : ""}{job.provider} · {job.status}</strong>
                    <small>{job.route_tier ?? "unrouted"}{job.fallback_reason ? ` · fallback: ${job.fallback_reason}` : ""}</small>
                    <JsonDetails value={{ routeReason: job.route_reason, request: job.request, response: job.response }} />
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="settings-preview">
            <div className="section-heading">
              <h2>Decisions</h2>
            </div>
            {decisions.length === 0 ? (
              <EmptyState title="No decisions" body="Human and queue decisions will appear here." />
            ) : (
              <div className="compact-list">
                {decisions.map((decision) => (
                  <div key={decision.id}>
                    <strong>{decision.decision}</strong>
                    <small>{decision.rationale ?? "No rationale recorded"}</small>
                  </div>
                ))}
              </div>
            )}
          </article>
        </aside>
      </section>
    </>
  );
}

function CharactersPage({
  data,
  loading,
  error,
  navigate
}: {
  data: AppData;
  loading: boolean;
  error: string | null;
  navigate: (path: string) => void;
}) {
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [query, setQuery] = useState("");
  const [laneFilter, setLaneFilter] = useState<"all" | TalentStageId>("all");
  const [selectedCharacterId, setSelectedCharacterId] = useState(() => readCharacterRouteState().selected);
  const [rosterProfiles, setRosterProfiles] = useState<Map<string, CharacterDetail>>(() => new Map());
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const normalizedQuery = query.trim().toLowerCase();
  const rosterLanes = useMemo(() => buildRosterLanes(data.characters, data.runs), [data.characters, data.runs]);
  const careerSummaries = useMemo(
    () => new Map(rosterLanes.flatMap((lane) => lane.talent).map((career) => [career.talentId, career])),
    [rosterLanes]
  );
  const filteredCharacters = useMemo(
    () =>
      data.characters.filter((character) => {
        const career = careerSummaries.get(character.id);
        const matchesLane = laneFilter === "all" || career?.stage === laneFilter;
        const matchesQuery =
          !normalizedQuery ||
          [character.name, character.summary ?? "", career?.shortPositioning ?? "", career ? talentStageLabel(career.stage) : ""].some((value) =>
            value.toLowerCase().includes(normalizedQuery)
          );
        return matchesLane && matchesQuery;
      }),
    [careerSummaries, data.characters, laneFilter, normalizedQuery]
  );
  const selectedCharacter =
    filteredCharacters.find((character) => character.id === selectedCharacterId) ??
    data.characters.find((character) => character.id === selectedCharacterId) ??
    filteredCharacters[0] ??
    data.characters[0] ??
    null;
  const selectedCareer = selectedCharacter ? careerSummaries.get(selectedCharacter.id) ?? buildTalentCareerSummary(selectedCharacter, data.runs) : null;
  const selectedProfileReference = selectedCharacter
    ? profileReferenceImage(rosterProfiles.get(selectedCharacter.id)?.referenceImages ?? [])
    : null;
  const selectedRun = selectedCharacter ? data.runs.find((run) => run.character_id === selectedCharacter.id) ?? null : null;
  const activeRunCount = data.runs.filter(
    (run) => run.character_id && !["completed", "failed", "cancelled"].includes(run.status)
  ).length;
  const reviewRunCount = data.runs.filter((run) => run.status === "needs_review" && run.character_id).length;
  const pushTalentCount = rosterLanes
    .filter((lane) => ["star_talent", "core_talent", "rising_talent"].includes(lane.id))
    .reduce((total, lane) => total + lane.talent.length, 0);
  const characterIdsKey = data.characters.map((character) => character.id).join("|");

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      data.characters.map(async (character) => {
        try {
          const response = await fetch(`${apiBaseUrl()}/api/characters/${character.id}`);
          if (!response.ok) return null;
          const payload = (await response.json()) as { character: CharacterDetail };
          return payload.character;
        } catch {
          return null;
        }
      })
    ).then((profiles) => {
      if (cancelled) return;
      setRosterProfiles(new Map(profiles.filter((profile): profile is CharacterDetail => Boolean(profile)).map((profile) => [profile.id, profile])));
    });
    return () => {
      cancelled = true;
    };
  }, [characterIdsKey]);

  useEffect(() => {
    if (selectedCharacterId && data.characters.some((character) => character.id === selectedCharacterId)) {
      return;
    }
    const fallbackId = data.characters[0]?.id ?? "";
    setSelectedCharacterId(fallbackId);
    replaceRouteQuery("/talent", { selected: fallbackId || null });
  }, [data.characters, selectedCharacterId]);

  useEffect(() => {
    if (filteredCharacters.length === 0 || filteredCharacters.some((character) => character.id === selectedCharacterId)) {
      return;
    }
    setSelectedCharacterId(filteredCharacters[0].id);
    replaceRouteQuery("/talent", { selected: filteredCharacters[0].id });
  }, [filteredCharacters, selectedCharacterId]);

  async function createCharacter() {
    setCreating(true);
    setFormError(null);
    try {
      const payload = await postJson<{ character: CharacterDetail }>("/api/characters", {
        name,
        summary,
        status: "idea"
      });
      navigate(`/characters/${payload.character.id}`);
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : "Unable to create character.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <header className="topbar page-heading">
        <div>
          <span className="eyebrow">Represented talent</span>
          <h1>Roster</h1>
        </div>
      </header>

      {loading && <div className="notice">Loading roster.</div>}
      {error && <div className="notice error">{error}</div>}
      <StageHandoff data={data} stageId="birth" navigate={navigate} />

      <section className="roster-command roster-command--casting" aria-label="Talent roster command">
        <article>
          <span>Represented</span>
          <strong>{data.characters.length}</strong>
          <p>talent</p>
        </article>
        <article>
          <span>Push list</span>
          <strong>{pushTalentCount}</strong>
          <p>rising or core</p>
        </article>
        <article>
          <span>Decisions</span>
          <strong>{reviewRunCount}</strong>
          <p>{activeRunCount ? `${activeRunCount} active bookings` : "no active bookings"}</p>
        </article>
        <label className="roster-search">
          <span>Search</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, stage, positioning" />
        </label>
      </section>

      <section className="character-status-lanes roster-lane-filter" aria-label="Roster lanes">
        {[{ id: "all" as const, label: "All", detail: "full agency roster", talent: data.characters }, ...rosterLanes].map((lane) => (
          <button
            className={laneFilter === lane.id ? "active" : ""}
            key={lane.id}
            type="button"
            onClick={() => setLaneFilter(lane.id)}
          >
            <span>{lane.label}</span>
            <strong>{lane.talent.length}</strong>
            <small>{"detail" in lane ? lane.detail : "all represented talent"}</small>
          </button>
        ))}
      </section>

      <section className="character-layout">
        <article className="machine-room casting-roster">
          <div className="section-heading">
            <h2>Talent</h2>
            <span>{filteredCharacters.length}</span>
          </div>
          {data.characters.length === 0 ? (
            <EmptyState title="No talent in the roster yet" body="Scout the first New Face to begin building the agency." />
          ) : filteredCharacters.length === 0 ? (
            <EmptyState title="No matches" body="Clear search to see the full roster." />
          ) : (
            <div className="character-grid">
              {filteredCharacters.map((character) => {
                const selected = selectedCharacter?.id === character.id;
                const career = careerSummaries.get(character.id) ?? buildTalentCareerSummary(character, data.runs);
                const profileReference = profileReferenceImage(rosterProfiles.get(character.id)?.referenceImages ?? []);
                return (
                  <button
                    aria-pressed={selected}
                    className={`character-card${selected ? " is-selected" : ""}`}
                    key={character.id}
                    type="button"
                    onClick={() => {
                      setSelectedCharacterId(character.id);
                      replaceRouteQuery("/talent", { selected: character.id });
                    }}
                  >
                    <div className="thumb">
                      {profileReference ? (
                        <img
                          src={`${apiBaseUrl()}/api/characters/${character.id}/reference-images/${profileReference.id}/file`}
                          alt={`${career.displayName} profile reference`}
                        />
                      ) : modelInitials(character.name)}
                    </div>
                    <div>
                      <strong>{career.displayName}</strong>
                      <em className="talent-stage-pill">{talentStageLabel(career.stage)}</em>
                      <p>{career.shortPositioning}</p>
                      <small>{career.bestPlatform} · {career.momentum} · {career.nextRecommendedMove}</small>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </article>

        <aside className="settings-preview casting-panel">
          <div className="section-heading">
            <h2>Selected</h2>
            {selectedCareer && <span>{talentStageLabel(selectedCareer.stage)}</span>}
          </div>
          {selectedCharacter && selectedCareer ? (
            <div className="casting-selected">
              <div className="casting-mark">
                {selectedProfileReference ? (
                  <img
                    src={`${apiBaseUrl()}/api/characters/${selectedCharacter.id}/reference-images/${selectedProfileReference.id}/file`}
                    alt={`${selectedCareer.displayName} profile reference`}
                  />
                ) : (
                  <span>{modelInitials(selectedCharacter.name)}</span>
                )}
              </div>
              <div>
                <span className="eyebrow">Talent file</span>
                <h2>{selectedCareer.displayName}</h2>
                <p>{selectedCareer.shortPositioning}</p>
              </div>
              <div className="casting-facts">
                <div>
                  <span>Stage</span>
                  <strong>{talentStageLabel(selectedCareer.stage)}</strong>
                </div>
                <div>
                  <span>Priority</span>
                  <strong>{agencyPriorityLabel(selectedCareer.agencyPriority)}</strong>
                </div>
                <div>
                  <span>Best platform</span>
                  <strong>{selectedCareer.bestPlatform}</strong>
                </div>
                <div>
                  <span>Momentum</span>
                  <strong>{selectedCareer.momentum}</strong>
                </div>
              </div>
              <button className="casting-run" type="button" onClick={() => navigate(`/characters/${selectedCharacter.id}`)}>
                <span>Next recommended move</span>
                <strong>{selectedCareer.nextRecommendedMove}</strong>
                <small>{selectedCareer.latestAudienceSignal}</small>
              </button>
              <div className="casting-actions">
                <button className="primary-action" type="button" onClick={() => navigate(`/characters/${selectedCharacter.id}`)}>
                  Open Talent Profile
                </button>
                <button className="text-button" type="button" onClick={() => navigate(selectedRun ? `/runs/${selectedRun.id}` : runQuery("needs_review"))}>
                  Production Logs
                </button>
              </div>
            </div>
          ) : (
            <EmptyState title="No talent selected" body="Scout or select a represented identity." />
          )}

          <details className="editor-drawer roster-create" open={data.characters.length === 0}>
            <summary>Scout New Talent</summary>
            <div className="form-stack">
              <label>
                Name
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Talent name" />
              </label>
              <label>
                Summary
                <textarea value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Short identity summary" />
              </label>
              {formError && <div className="notice error">{formError}</div>}
              <button className="primary-action" type="button" onClick={createCharacter} disabled={creating || !name.trim()}>
                {creating ? "Scouting" : "Scout New Talent"}
              </button>
            </div>
          </details>
        </aside>
      </section>
    </>
  );
}

function CharacterProfilePage({ characterId, data, navigate }: { characterId: string; data: AppData; navigate: (path: string) => void }) {
  const [character, setCharacter] = useState<CharacterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [constitution, setConstitution] = useState("");
  const [constitutionReason, setConstitutionReason] = useState("");
  const [canonTitle, setCanonTitle] = useState("");
  const [canonBody, setCanonBody] = useState("");
  const [memoryBody, setMemoryBody] = useState("");
  const [appearanceBody, setAppearanceBody] = useState("");
  const [voiceBody, setVoiceBody] = useState("");
  const [personaPlatform, setPersonaPlatform] = useState("Instagram");
  const [personaBody, setPersonaBody] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  async function load() {
    try {
      const response = await fetch(`${apiBaseUrl()}/api/characters/${characterId}`);
      if (!response.ok) {
        throw new Error(response.status === 404 ? "Talent not found." : "Unable to load talent profile.");
      }
      const payload = (await response.json()) as { character: CharacterDetail };
      setCharacter(payload.character);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load talent profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [characterId]);

  async function submit<T>(path: string, body: unknown, success: string) {
    setMessage(null);
    setError(null);
    try {
      const payload = await postJson<T & { character?: CharacterDetail }>(path, body);
      if (payload.character) {
        setCharacter(payload.character);
      } else {
        await load();
      }
      setMessage(success);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Request failed.");
    }
  }

  async function submitAction<T>(actionKey: string, path: string, body: unknown, success: string) {
    setPendingAction(actionKey);
    try {
      await submit<T>(path, body, success);
    } finally {
      setPendingAction(null);
    }
  }

  async function uploadReference(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
      reader.onerror = () => reject(new Error("Unable to read reference image."));
      reader.readAsDataURL(file);
    });
    await submit(`/api/characters/${characterId}/reference-images`, {
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      base64,
      status: "experimental"
    }, "Reference image uploaded.");
  }

  async function startBirthRun() {
    const payload = await postJson<RunDetailPayload>(`/api/characters/${characterId}/birth-run`, {});
    navigate(`/runs/${payload.run.id}`);
  }

  async function reviewProposal(proposal: IdentityProposal, status: "approved" | "rejected") {
    if (proposal.kind === "constitution_patch" && status === "approved" && !constitutionReason.trim()) {
      setError("Constitution proposal approval requires a change reason.");
      return;
    }
    await submitAction(`proposal:${proposal.id}:${status}`, `/api/identity-proposals/${proposal.id}/review`, {
      status,
      constitutionChangeReason: proposal.kind === "constitution_patch" ? constitutionReason : undefined
    }, `Proposal ${status}.`);
  }

  if (loading) {
    return <div className="notice">Loading talent profile.</div>;
  }
  if (error && !character) {
    return <div className="notice error">{error}</div>;
  }
  if (!character) {
    return <div className="notice error">Talent not found.</div>;
  }

  const activeConstitution = character.constitutions.find((item) => item.is_active === 1) ?? character.constitutions[0];
  const profileReference =
    character.referenceImages.find((item) => item.status === "approved") ?? character.referenceImages[0] ?? null;
  const pendingCareerProposals = character.identityProposals.filter((proposal) => proposal.status === "proposed");
  const pendingProposals = pendingCareerProposals.length;
  const approvedCanon = character.canon.filter((item) => item.status === "approved").length;
  const latestRun = character.recentRuns[0] ?? null;
  const displayName = displayModelName(character.name);
  const displayCopy = (value: string | null | undefined) => (value ?? "").replaceAll(character.name, displayName);
  const careerSummary = buildTalentCareerSummary(character);
  const profilePrimaryActionLabel = pendingProposals
    ? "Review Career Direction"
    : careerSummary.stage === "new_face"
      ? "Approve New Face"
      : "Book Next Work";
  const profilePrimaryAction = () => {
    if (pendingProposals) {
      document.getElementById("director-approvals")?.scrollIntoView({ block: "start" });
    } else if (careerSummary.stage === "new_face") {
      void startBirthRun();
    } else {
      navigate("/prompt-studio");
    }
  };
  const identityStats = [
    { label: "Stage", value: talentStageLabel(careerSummary.stage), detail: "career state" },
    { label: "Priority", value: agencyPriorityLabel(careerSummary.agencyPriority), detail: "agency investment" },
    { label: "Platform", value: careerSummary.bestPlatform, detail: "best current fit" },
    { label: "Momentum", value: careerSummary.momentum, detail: careerSummary.latestAudienceSignal }
  ];
  const referenceStatusOptions = [
    { value: "approved", label: "Approved", detail: "Use as profile source" },
    { value: "experimental", label: "Experimental", detail: "Keep in testing" },
    { value: "rejected", label: "Rejected", detail: "Remove from canon" }
  ];
  const reviewStatusOptions = [
    { value: "approved", label: "Approve", detail: "Accept this item" },
    { value: "rejected", label: "Reject", detail: "Decline this item" }
  ];

  return (
    <>
      <header className="topbar page-heading">
        <div>
          <button className="text-button" type="button" onClick={() => navigate("/talent")}>
            Back to Roster
          </button>
          <span className="eyebrow">Talent Profile</span>
          <h1>{displayName}</h1>
        </div>
      </header>

      {error && <div className="notice error">{error}</div>}
      {message && <div className="notice">{message}</div>}
      <StageHandoff data={data} stageId={pendingProposals ? "feedback" : "birth"} navigate={navigate} />

      <section className="character-dossier-shell" aria-label="Talent profile">
        <aside className="model-dossier-panel">
          <div className="identity-portrait dossier-portrait">
            {profileReference ? (
              <img
                src={`${apiBaseUrl()}/api/characters/${character.id}/reference-images/${profileReference.id}/file`}
                alt={`${displayName} profile reference`}
              />
            ) : (
              <span>{modelInitials(character.name)}</span>
            )}
          </div>
          <div className="dossier-title-block">
            <span>Talent Profile</span>
            <h2>{displayName}</h2>
            <p>{careerSummary.shortPositioning}</p>
          </div>
          <div className="button-stack">
            <button className="primary-action" type="button" onClick={profilePrimaryAction}>{profilePrimaryActionLabel}</button>
            <button type="button" onClick={() => navigate("/insights")}>Open Audience Response</button>
            <button type="button" onClick={() => navigate(latestRun ? `/runs/${latestRun.id}` : "/runs")}>Production Logs</button>
          </div>
          <div className="identity-stat-grid dossier-stat-grid">
            {identityStats.map((card) => (
              <article key={card.label}>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <p>{card.detail}</p>
              </article>
            ))}
          </div>
          <dl className="profile-facts dossier-facts">
            <div><dt>Identity stability</dt><dd>{careerSummary.identityStability}</dd></div>
            <div><dt>Development risk</dt><dd>{careerSummary.developmentRisk}</dd></div>
            <div><dt>Director approvals</dt><dd>{pendingProposals ? `${pendingProposals} waiting` : "Clear"}</dd></div>
            <div><dt>Reference</dt><dd>{profileReference ? profileReference.status.replaceAll("_", " ") : "None"}</dd></div>
            {displayName !== character.name && <div><dt>Record</dt><dd>{character.name.replace(displayName, "").trim()}</dd></div>}
          </dl>
        </aside>

        <section className="dossier-workbench">
          <section className="profile-command talent-profile-command" aria-label="Talent career command">
            <article className="identity-hero talent-comp-card">
              <div className="identity-portrait">
                {profileReference ? (
                  <img
                    src={`${apiBaseUrl()}/api/characters/${character.id}/reference-images/${profileReference.id}/file`}
                    alt={`${displayName} approved reference`}
                  />
                ) : (
                  <span>{modelInitials(character.name)}</span>
                )}
              </div>
              <div>
                <span>Comp Card</span>
                <h2>{displayName}</h2>
                <p>{careerSummary.shortPositioning}</p>
                <dl className="profile-facts compact-profile-facts">
                  <div><dt>Stage</dt><dd>{talentStageLabel(careerSummary.stage)}</dd></div>
                  <div><dt>Agency priority</dt><dd>{agencyPriorityLabel(careerSummary.agencyPriority)}</dd></div>
                  <div><dt>Best platform</dt><dd>{careerSummary.bestPlatform}</dd></div>
                  <div><dt>Identity stability</dt><dd>{careerSummary.identityStability}</dd></div>
                </dl>
              </div>
            </article>

            <article className="settings-preview talent-next-move">
              <div className="section-heading"><h2>Next Recommended Move</h2></div>
              <strong>{careerSummary.nextRecommendedMove}</strong>
              <p>{careerSummary.latestAudienceSignal}</p>
              <div className="button-stack">
                <button className="primary-action" type="button" onClick={profilePrimaryAction}>{profilePrimaryActionLabel}</button>
                <button type="button" onClick={() => navigate("/prompt-studio")}>Open Bookings</button>
              </div>
            </article>
          </section>

          <section className="dossier-zone talent-career-summary" aria-label="Talent career summary">
            <div className="dossier-zone-heading">
              <span>01</span>
              <h2>Career Summary</h2>
            </div>
            <article className="settings-preview">
              <div className="section-heading"><h2>Career State</h2></div>
              <dl>
                <div><dt>Momentum</dt><dd>{careerSummary.momentum}</dd></div>
                <div><dt>Audience signal</dt><dd>{careerSummary.latestAudienceSignal}</dd></div>
                <div><dt>Development risk</dt><dd>{careerSummary.developmentRisk}</dd></div>
                <div><dt>Pending decisions</dt><dd>{pluralize(careerSummary.pendingDecisionCount, "approval")}</dd></div>
              </dl>
            </article>
            <article className="settings-preview">
              <div className="section-heading"><h2>Development Notes</h2></div>
              <p className="action-copy">{activeConstitution ? compactInlineText(activeConstitution.body, 220) : "No active constitution yet. Create the first identity bible entry before pushing this talent."}</p>
              <p className="action-copy">{approvedCanon ? `${approvedCanon} approved canon note${approvedCanon === 1 ? "" : "s"} support the public story.` : "No approved canon yet."}</p>
            </article>
          </section>

          <section className="dossier-zone portfolio-approval-zone" id="director-approvals" aria-label="Director approvals and portfolio">
            <div className="dossier-zone-heading">
              <span>02</span>
              <h2>Director Approvals</h2>
            </div>
            <article className="settings-preview">
              <div className="section-heading"><h2>Career Direction Proposals</h2></div>
              {pendingCareerProposals.length === 0 ? <EmptyState title="No career direction waiting" body="Audience-led memory, canon, and identity proposals will appear here for director approval." /> : (
                <div className="compact-list director-approval-list">
                  {pendingCareerProposals.map((proposal) => (
                    <div key={proposal.id}>
                      <strong>{proposal.kind.replaceAll("_", " ")} proposal</strong>
                      <small>Risk: {proposal.risk_level}</small>
                      <p>{displayCopy(proposal.body)}</p>
                      {proposal.rationale && <p>{displayCopy(proposal.rationale)}</p>}
                      <StatusChoiceGroup
                        currentStatus={proposal.status}
                        label={`${proposal.kind} career direction review status`}
                        options={reviewStatusOptions}
                        pendingValue={pendingAction?.startsWith(`proposal:${proposal.id}:`) ? pendingAction.split(":").at(-1) ?? null : null}
                        onSelect={(status) => reviewProposal(proposal, status as "approved" | "rejected")}
                      />
                    </div>
                  ))}
                </div>
              )}
            </article>
            <article className="settings-preview">
              <div className="section-heading"><h2>Portfolio Highlights</h2></div>
              {character.referenceImages.length === 0 ? (
                <EmptyState title="No portfolio anchors" body="Approve reference images or portfolio shots to anchor this talent's book." />
              ) : (
                <div className="reference-board portfolio-highlight-board">
                  {character.referenceImages.slice(0, 4).map((item) => (
                    <div key={item.id}>
                      <img src={`${apiBaseUrl()}/api/characters/${character.id}/reference-images/${item.id}/file`} alt={`${displayName} portfolio highlight`} />
                      <span>
                        <strong>{item.status === "approved" ? "Approved reference" : "Reference under review"}</strong>
                        <small>{item.original_name}</small>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>

          <details className="identity-bible-shell">
            <summary>
              <span>Identity Bible</span>
              <strong>{activeConstitution ? `Constitution v${activeConstitution.version}` : "Needs foundation"}</strong>
            </summary>
            <div className="identity-bible-grid">
          <section className="dossier-zone dossier-zone--identity" aria-label="Identity law">
            <div className="dossier-zone-heading">
              <span>01</span>
              <h2>Identity law</h2>
            </div>
            <EditorSection
              title="Constitution"
              fields={
                <>
                  <textarea value={constitution} onChange={(event) => setConstitution(event.target.value)} placeholder="Sacred identity constitution" />
                  <input value={constitutionReason} onChange={(event) => setConstitutionReason(event.target.value)} placeholder="Required change reason" />
                </>
              }
              actionLabel="Create version"
              onSubmit={() =>
                submit(`/api/characters/${characterId}/constitutions`, { body: constitution, changeReason: constitutionReason }, "Constitution version created.")
              }
            >
              <div className="compact-list">
                {character.constitutions.map((item) => (
                  <div key={item.id}>
                    <strong>Version {item.version}{item.is_active ? " · active" : ""}</strong>
                    <small>{item.change_reason ?? "No reason recorded"}</small>
                    <p>{item.body}</p>
                    {!item.is_active && (
                      <button
                        className="text-button"
                        type="button"
                        onClick={() => submit(`/api/characters/${characterId}/constitutions/${item.id}/activate`, {}, "Active constitution changed.")}
                      >
                        Mark active
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </EditorSection>

            <article className="settings-preview">
              <div className="section-heading"><h2>Career Direction Archive</h2></div>
              {character.identityProposals.length === 0 ? <EmptyState title="No proposals" body="No pending identity changes." /> : (
                <div className="compact-list">
                  {character.identityProposals.map((proposal) => (
                    <div key={proposal.id}>
                      <strong>{proposal.kind} · {proposal.status} · {proposal.risk_level}</strong>
                      <small>{displayCopy(proposal.rationale)}</small>
                      <p>{displayCopy(proposal.body)}</p>
                      {proposal.status === "proposed" && (
                        <StatusChoiceGroup
                          currentStatus={proposal.status}
                          label={`${proposal.kind} review status`}
                          options={reviewStatusOptions}
                          pendingValue={pendingAction?.startsWith(`proposal:${proposal.id}:`) ? pendingAction.split(":").at(-1) ?? null : null}
                          onSelect={(status) => reviewProposal(proposal, status as "approved" | "rejected")}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>

          <section className="dossier-zone" aria-label="Look and reference">
            <div className="dossier-zone-heading">
              <span>02</span>
              <h2>Look</h2>
            </div>
            <EditorSection
              title="Appearance Bible"
              fields={<textarea value={appearanceBody} onChange={(event) => setAppearanceBody(event.target.value)} placeholder="Face, hair, wardrobe, palette, motifs, negatives, forbidden drift" />}
              actionLabel="Save appearance"
              onSubmit={() => submit(`/api/characters/${characterId}/appearance`, { body: appearanceBody }, "Appearance bible saved.")}
            >
              <EntryList entries={character.appearanceProfiles.map((item) => ({ id: item.id, title: formatDate(item.created_at), body: item.body }))} />
            </EditorSection>

            <article className="settings-preview">
              <div className="section-heading"><h2>Reference Images</h2></div>
              <details className="editor-drawer">
                <summary>Upload reference</summary>
                <div className="form-stack">
                  <input type="file" accept="image/*" onChange={uploadReference} />
                </div>
              </details>
              {character.referenceImages.length === 0 ? (
                <EmptyState title="No references" body="Upload a local image to attach it to this character." />
              ) : (
                <div className="reference-board">
                  {character.referenceImages.map((item) => (
                    <div key={item.id}>
                      <img src={`${apiBaseUrl()}/api/characters/${character.id}/reference-images/${item.id}/file`} alt={`${displayName} reference ${item.status}`} />
                      <span>
                        <strong>{item.original_name}</strong>
                        <small>{item.status.replaceAll("_", " ")} · {formatBytes(item.size_bytes)}</small>
                      </span>
                      <StatusChoiceGroup
                        currentStatus={item.status}
                        label={`${item.original_name} reference status`}
                        options={referenceStatusOptions}
                        pendingValue={pendingAction?.startsWith(`reference:${item.id}:`) ? pendingAction.split(":").at(-1) ?? null : null}
                        onSelect={(status) =>
                          submitAction(`reference:${item.id}:${status}`, `/api/characters/${characterId}/reference-images/${item.id}/status`, { status }, `Reference marked ${status}.`)
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>

          <section className="dossier-zone" aria-label="Voice and platforms">
            <div className="dossier-zone-heading">
              <span>03</span>
              <h2>Voice</h2>
            </div>
            <EditorSection
              title="Voice Guide"
              fields={<textarea value={voiceBody} onChange={(event) => setVoiceBody(event.target.value)} placeholder="Tone, caption style, emoji policy, slang rules, taboo phrases" />}
              actionLabel="Save voice"
              onSubmit={() => submit(`/api/characters/${characterId}/voice`, { body: voiceBody }, "Voice guide saved.")}
            >
              <EntryList entries={character.voiceGuides.map((item) => ({ id: item.id, title: formatDate(item.created_at), body: item.body }))} />
            </EditorSection>

            <EditorSection
              title="Platform Personas"
              fields={
                <>
                  <select value={personaPlatform} onChange={(event) => setPersonaPlatform(event.target.value)}>
                    {["Instagram", "TikTok", "Threads", "Generic"].map((platform) => <option key={platform}>{platform}</option>)}
                  </select>
                  <textarea value={personaBody} onChange={(event) => setPersonaBody(event.target.value)} placeholder="Platform-specific persona rules" />
                </>
              }
              actionLabel="Save persona"
              onSubmit={() => submit(`/api/characters/${characterId}/personas`, { platform: personaPlatform, body: personaBody }, "Platform persona saved.")}
            >
              <EntryList entries={character.platformPersonas.map((item) => ({ id: item.id, title: platformLabel(item.platform), body: item.body }))} />
            </EditorSection>
          </section>

          <section className="dossier-zone" aria-label="Memory and canon">
            <div className="dossier-zone-heading">
              <span>04</span>
              <h2>Memory</h2>
            </div>
            <EditorSection
              title="Canon"
              fields={
                <>
                  <input value={canonTitle} onChange={(event) => setCanonTitle(event.target.value)} placeholder="Canon title" />
                  <textarea value={canonBody} onChange={(event) => setCanonBody(event.target.value)} placeholder="Canon body" />
                </>
              }
              actionLabel="Propose canon"
              onSubmit={() => submit(`/api/characters/${characterId}/canon`, { title: canonTitle, body: canonBody }, "Canon entry proposed.")}
            >
              {character.canon.length === 0 ? (
                <EmptyState title="No canon yet" body="Add an entry when ready." />
              ) : (
                <div className="compact-list">
                  {character.canon.map((item) => (
                    <div key={item.id}>
                      <strong>{item.title} · {item.status}</strong>
                      <small>{item.body}</small>
                      <StatusChoiceGroup
                        currentStatus={item.status}
                        label={`${item.title} canon status`}
                        options={reviewStatusOptions}
                        pendingValue={pendingAction?.startsWith(`canon:${item.id}:`) ? pendingAction.split(":").at(-1) ?? null : null}
                        onSelect={(status) =>
                          submitAction(`canon:${item.id}:${status}`, `/api/characters/${characterId}/canon/${item.id}/status`, { status }, `Canon ${status}.`)
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </EditorSection>

            <EditorSection
              title="Memory"
              fields={<textarea value={memoryBody} onChange={(event) => setMemoryBody(event.target.value)} placeholder="Memory entry" />}
              actionLabel="Add memory"
              onSubmit={() => submit(`/api/characters/${characterId}/memory`, { body: memoryBody, sourceType: "manual" }, "Memory entry added.")}
            >
              <EntryList entries={character.memory.map((item) => ({ id: item.id, title: `${item.source_type} · confidence ${item.confidence}`, body: item.body }))} />
            </EditorSection>
          </section>

            </div>
          </details>

          <section className="dossier-zone" aria-label="Evidence and response">
            <div className="dossier-zone-heading">
              <span>03</span>
              <h2>Evidence</h2>
            </div>
            <article className="settings-preview">
              <div className="section-heading"><h2>Audience Response</h2></div>
              {character.feedback.length === 0 ? <EmptyState title="No audience response yet" body="Log audience response from Publishing." /> : (
                <div className="compact-list">
                  {character.feedback.map((item) => (
                    <div key={item.id}>
                      <strong><span className={`platform-inline ${platformClass(item.platform)}`}>{platformIcon(item.platform, 14)}{platformLabel(item.platform)}</span> · {item.likes} likes · {item.comments} comments</strong>
                      <small>{item.published_url ?? "No URL"}</small>
                      <p>{item.qualitative_notes ?? item.operator_judgment}</p>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="settings-preview">
              <div className="section-heading"><h2>Audience Debriefs</h2></div>
              {character.reflections.length === 0 ? <EmptyState title="No audience debriefs" body="Debrief audience response after a placement." /> : (
                <div className="compact-list">
                  {character.reflections.map((item) => (
                    <div key={item.id}>
                      <strong>{item.summary}</strong>
                      <small>{item.body}</small>
                      {item.run_id && <button className="text-button" type="button" onClick={() => navigate(`/runs/${item.run_id}`)}>Open Production Log</button>}
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="settings-preview">
              <div className="section-heading">
                <h2>Career Timeline</h2>
                <button type="button" onClick={() => navigate(latestRun ? `/runs/${latestRun.id}` : "/runs")}>Production Logs</button>
              </div>
              {character.recentRuns.length === 0 ? (
                <EmptyState title="No career events yet" body="Scouting, bookings, portfolio review, publishing, and audience response will build this timeline." />
              ) : (
                <div className="run-stack career-timeline-list">
                  {character.recentRuns.map((run) => (
                    <button className="run-row" key={run.id} type="button" onClick={() => navigate(`/runs/${run.id}`)}>
                      <span><strong>{careerEventTitle(run)}</strong><small>{formatDate(run.updated_at)} · {careerEventOutcome(run)}</small></span>
                      <em>Log</em>
                    </button>
                  ))}
                </div>
              )}
            </article>
          </section>
        </section>
      </section>
    </>
  );
}

function EditorSection({
  title,
  fields,
  actionLabel,
  onSubmit,
  children
}: {
  title: string;
  fields: ReactNode;
  actionLabel: string;
  onSubmit: () => void;
  children: ReactNode;
}) {
  return (
    <article className="settings-preview">
      <div className="section-heading"><h2>{title}</h2></div>
      {children}
      <details className="editor-drawer">
        <summary>{actionLabel}</summary>
        <div className="form-stack">
          {fields}
          <button className="primary-action" type="button" onClick={onSubmit}>{actionLabel}</button>
        </div>
      </details>
    </article>
  );
}

function EntryList({ entries }: { entries: Array<{ id: string; title: string; body: string }> }) {
  if (entries.length === 0) {
    return <EmptyState title="Nothing recorded" body="Add an entry when ready." />;
  }
  return (
    <div className="compact-list">
      {entries.map((entry) => (
        <div key={entry.id}>
          <strong>{entry.title}</strong>
          <small>{entry.body}</small>
        </div>
      ))}
    </div>
  );
}

function PromptStudioPage({ data, navigate }: { data: AppData; navigate: (path: string) => void }) {
  const [characterId, setCharacterId] = useState(data.characters[0]?.id ?? "");
  const [candidates, setCandidates] = useState<ActivityCandidate[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [briefs, setBriefs] = useState<ContentBrief[]>([]);
  const [selectedBriefId, setSelectedBriefId] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [scene, setScene] = useState("A quiet studio reset with tactile props and visible process notes.");
  const [goal, setGoal] = useState("Show a daily ritual while preserving synthetic identity transparency.");
  const [contentPillar, setContentPillar] = useState("process");
  const [audienceHypothesis, setAudienceHypothesis] = useState("This booking tests whether the audience responds to quiet ritual/process content.");
  const [recipe, setRecipe] = useState<PromptRecipe | null>(null);
  const [startingProduction, setStartingProduction] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedCharacter = data.characters.find((character) => character.id === characterId) ?? data.characters[0] ?? null;
  const selectedCandidate = candidates.find((candidate) => candidate.id === selectedCandidateId) ?? candidates[0] ?? null;
  const selectedBrief = briefs.find((brief) => brief.id === selectedBriefId) ?? briefs[0] ?? null;
  const selectedCandidateExplicit = candidates.find((candidate) => candidate.id === selectedCandidateId) ?? null;
  const bookingModel = selectedCharacter ? buildBookingDeskModel({
    character: selectedCharacter,
    candidate: selectedCandidateExplicit ?? selectedCandidate,
    brief: selectedBrief,
    recipe,
    platform
  }) : null;
  const conceptStats = [
    { label: "Booking Ideas", value: candidates.length, detail: selectedCandidate?.status ?? "None" },
    { label: "Shoot Briefs", value: briefs.length, detail: selectedBrief?.platform_targets ?? platform },
    { label: "Treatment", value: recipe ? "Ready" : "None", detail: recipe ? "Production ready" : "Prepare" },
    { label: "Platform", value: bookingModel?.platform ?? platform, detail: platform === "Instagram" ? "4:5 frame" : "9:16 frame" }
  ];
  const canCreateBrief = Boolean(characterId && selectedCandidateId);
  const canComposeRecipe = Boolean(characterId && selectedBriefId);
  const productionPath = bookingModel?.productionPath ?? `/assets?characterId=${encodeURIComponent(characterId)}&status=raw_generation`;
  const selectedBriefSource = selectedBrief?.activity_candidate_id
    ? candidates.find((candidate) => candidate.id === selectedBrief.activity_candidate_id)
    : null;
  const recipeScene = treatmentScene(recipe);
  const planningSteps = [
    {
      number: "01",
      title: "Choose booking idea",
      state: selectedCandidateExplicit ? "Selected" : candidates.length ? "Pick one" : "Needed",
      body: selectedCandidateExplicit
        ? `${selectedCandidateExplicit.title}: ${selectedCandidateExplicit.visual_motif ?? selectedCandidateExplicit.body}`
        : "Propose booking ideas, then choose the one that should become a shoot."
    },
    {
      number: "02",
      title: "Create shoot brief",
      state: selectedBrief ? "Brief ready" : "Needed",
      body: selectedBrief
        ? `${selectedBrief.platform_targets ?? platform} · ${selectedBrief.visual_direction ?? "No visual direction"}`
        : "The shoot brief locks the selected booking idea into platform, goal, visual direction, and caption angle."
    },
    {
      number: "03",
      title: "Prepare creative treatment",
      state: recipe ? "Treatment ready" : "Needed",
      body: recipe
        ? compactInlineText(recipeScene || recipe.final_prompt || "", 110)
        : "The creative treatment assembles identity rules, appearance, selected brief, and production settings."
    }
  ];

  function applyCandidateToComposer(candidate: ActivityCandidate) {
    const nextPlatform = candidate.platform_fit?.split(",")[0]?.trim() || platform;
    setPlatform(nextPlatform);
    setScene(`${candidate.title}: ${candidate.body}${candidate.location_fiction ? ` Location: ${candidate.location_fiction}.` : ""}${candidate.visual_motif ? ` Visual motif: ${candidate.visual_motif}.` : ""}`);
    setGoal(`Turn ${candidate.title.toLowerCase()} into an audience-facing ${nextPlatform} post that stays faithful to ${selectedCharacter?.name ?? "the character"}.`);
    setContentPillar(candidate.activity_type ?? "process");
    if (selectedCharacter) {
      setAudienceHypothesis(deriveAudienceHypothesis(selectedCharacter, candidate, null, nextPlatform));
    }
    setRecipe(null);
  }

  function selectBriefForRecipe(brief: ContentBrief) {
    setSelectedBriefId(brief.id);
    setPlatform(brief.platform_targets ?? platform);
    setScene(brief.visual_direction ?? scene);
    setGoal(brief.goal ?? goal);
    setContentPillar(brief.content_pillar ?? contentPillar);
    if (selectedCharacter) {
      const sourceCandidate = brief.activity_candidate_id ? candidates.find((candidate) => candidate.id === brief.activity_candidate_id) : selectedCandidate;
      setAudienceHypothesis(deriveAudienceHypothesis(selectedCharacter, sourceCandidate, brief, brief.platform_targets ?? platform));
    }
    setRecipe(null);
    setMessage("Shoot brief selected for creative treatment.");
  }

  useEffect(() => {
    if (!characterId && data.characters[0]) setCharacterId(data.characters[0].id);
  }, [characterId, data.characters]);

  async function refreshPlanning(nextCharacterId = characterId) {
    if (!nextCharacterId) return;
    const [candidateResponse, briefResponse] = await Promise.all([
      fetch(`${apiBaseUrl()}/api/activity-candidates?characterId=${nextCharacterId}`),
      fetch(`${apiBaseUrl()}/api/content-briefs?characterId=${nextCharacterId}`)
    ]);
    const candidatePayload = (await candidateResponse.json()) as { candidates: ActivityCandidate[] };
    const briefPayload = (await briefResponse.json()) as { briefs: ContentBrief[] };
    setCandidates(candidatePayload.candidates);
    setBriefs(briefPayload.briefs);
    setSelectedCandidateId(candidatePayload.candidates.find((item) => item.status === "selected")?.id ?? candidatePayload.candidates[0]?.id ?? "");
    setSelectedBriefId(briefPayload.briefs[0]?.id ?? "");
  }

  useEffect(() => {
    refreshPlanning().catch(() => undefined);
  }, [characterId]);

  async function generateActivities() {
    setError(null); setMessage(null);
    try {
      const payload = await postJson<{ run: RunSummary; candidates: ActivityCandidate[] }>(`/api/characters/${characterId}/activity-runs`, {});
      setCandidates(payload.candidates);
      setSelectedCandidateId(payload.candidates[0]?.id ?? "");
      if (payload.candidates[0]) applyCandidateToComposer(payload.candidates[0]);
      setMessage("Booking ideas proposed.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to propose booking ideas.");
    }
  }

  async function selectActivity(candidateId: string) {
    const candidate = candidates.find((item) => item.id === candidateId);
    if (candidate) applyCandidateToComposer(candidate);
    await postJson(`/api/activity-candidates/${candidateId}/select`, { status: "selected" });
    await refreshPlanning();
    setSelectedCandidateId(candidateId);
    setSelectedBriefId("");
    setMessage("Booking idea selected. Create a shoot brief next.");
  }

  async function createBrief() {
    setError(null); setMessage(null);
    try {
      const candidate = candidates.find((item) => item.id === selectedCandidateId);
      const payload = await postJson<{ brief: ContentBrief }>("/api/content-briefs", {
        characterId,
        activityCandidateId: selectedCandidateId || null,
        goal,
        platformTargets: platform,
        contentPillar,
        visualDirection: candidate?.visual_motif ?? scene,
        captionAngle: `Process-aware caption for ${candidate?.title ?? "the selected booking"}.`,
        disclosureFlags: "synthetic media disclosure",
        desiredOutputs: `Audience hypothesis: ${audienceHypothesis}\nImage prompt and caption variants`
      });
      await refreshPlanning();
      setSelectedBriefId(payload.brief.id);
      setRecipe(null);
      setMessage("Shoot brief created from the selected booking idea. Prepare the creative treatment next.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create brief.");
    }
  }

  async function composePrompt() {
    setError(null); setMessage(null);
    try {
      const payload = await postJson<{ recipe: PromptRecipe }>("/api/prompt-recipes/compose", {
        characterId,
        contentBriefId: selectedBriefId || null,
        platform: selectedBrief?.platform_targets || platform,
        scene: selectedBrief?.visual_direction || selectedCandidate?.visual_motif || scene,
        generationSettings: { aspectRatio: platform === "Instagram" ? "4:5" : "9:16" }
      });
      setRecipe(payload.recipe);
      setMessage("Creative treatment prepared. Start production when the assignment is ready.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to prepare creative treatment.");
    }
  }

  async function startProduction() {
    if (!recipe) return;
    setStartingProduction(true);
    setError(null);
    setMessage(null);
    try {
      await postJson(`/api/prompt-recipes/${recipe.id}/generate-image`, {});
      setMessage("Production started. Candidate shots will appear in Portfolio for review.");
      navigate(productionPath);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to start production.");
    } finally {
      setStartingProduction(false);
    }
  }

  if (!selectedCharacter) {
    return (
      <>
        <header className="topbar page-heading">
          <div>
            <span className="eyebrow">Booking desk</span>
            <h1>Booking Desk</h1>
          </div>
        </header>
        <section className="concept-command" aria-label="Concept command">
          <article className="concept-hero">
            <span>First run</span>
            <h2>No character</h2>
            <p>Scout talent before preparing creative treatments.</p>
            <div className="button-stack">
              <button className="primary-action" type="button" onClick={() => navigate("/talent")}>Open Roster</button>
            </div>
          </article>
          <div className="concept-stat-grid">
            <article><span>Ideas</span><strong>0</strong><p>Waiting</p></article>
            <article><span>Briefs</span><strong>0</strong><p>Waiting</p></article>
            <article><span>Treatment</span><strong>None</strong><p>Waiting</p></article>
            <article><span>Frame</span><strong>None</strong><p>Waiting</p></article>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <header className="topbar page-heading">
        <div>
          <span className="eyebrow">Creative assignments</span>
          <h1>Booking Desk</h1>
          <p>Plan the next piece of work for represented talent, then send the treatment into production.</p>
        </div>
      </header>
      {message && <div className="notice">{message}</div>}
      {error && <div className="notice error">{error}</div>}
      <section className="concept-command booking-command" aria-label="Booking assignment">
        <article className="concept-hero booking-hero">
          <span>Selected talent</span>
          <h2>{bookingModel?.talentName}</h2>
          <p>{bookingModel?.nextStep}</p>
          <div className="button-stack">
            <button className={!recipe && !selectedBrief && !selectedCandidateExplicit ? "primary-action" : ""} type="button" onClick={generateActivities} disabled={!characterId}>Propose Booking Ideas</button>
            <button className={!recipe && !selectedBrief && selectedCandidateExplicit ? "primary-action" : ""} type="button" onClick={createBrief} disabled={!canCreateBrief}>Create Shoot Brief</button>
            <button className={!recipe && selectedBrief ? "primary-action" : ""} type="button" onClick={composePrompt} disabled={!canComposeRecipe}>Prepare Creative Treatment</button>
            <button className={recipe ? "primary-action" : ""} type="button" onClick={startProduction} disabled={!recipe || startingProduction}>{startingProduction ? "Starting Production" : "Start Production"}</button>
          </div>
        </article>
        <div className="concept-stat-grid">
          {conceptStats.map((card) => (
            <article key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <p>{card.detail}</p>
            </article>
          ))}
        </div>
      </section>

      {bookingModel && (
        <section className="booking-assignment-panel" aria-label="Current booking assignment">
          <article>
            <span>Talent</span>
            <strong>{bookingModel.talentName}</strong>
            <p>{bookingModel.careerGoal}</p>
          </article>
          <article>
            <span>Platform</span>
            <strong>{bookingModel.platform}</strong>
            <p>{bookingModel.audienceHypothesis}</p>
          </article>
          <article>
            <span>Booking Idea</span>
            <strong>{bookingModel.title}</strong>
            <p>{bookingModel.bookingIdea}</p>
          </article>
          <article>
            <span>Shoot Brief</span>
            <strong>{selectedBrief ? "Ready" : "Needed"}</strong>
            <p>{bookingModel.shootBriefSummary}</p>
          </article>
          <article>
            <span>Creative Treatment</span>
            <strong>{recipe ? "Ready" : "Needed"}</strong>
            <p>{bookingModel.creativeTreatmentSummary}</p>
          </article>
        </section>
      )}

      <section className="prompt-flow-panel booking-flow-panel" aria-label="Booking Desk workflow">
        {planningSteps.map((step) => (
          <article key={step.number} className={step.state.includes("ready") || step.state === "Selected" ? "prompt-flow-step complete" : "prompt-flow-step"}>
            <span>{step.number}</span>
            <div>
              <strong>{step.title}</strong>
              <em>{step.state}</em>
              <p>{step.body}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="prompt-studio-grid booking-desk-grid">
        <article className="settings-preview booking-inputs">
          <div className="section-heading"><h2>Shoot Brief Inputs</h2><span>{selectedCandidateExplicit ? "Synced from booking idea" : "Manual"}</span></div>
          <div className="form-stack">
            <label>Talent<select value={characterId} onChange={(event) => setCharacterId(event.target.value)}>{data.characters.map((character) => <option key={character.id} value={character.id}>{displayModelName(character.name)}</option>)}</select></label>
            <label>Platform<select value={platform} onChange={(event) => setPlatform(event.target.value)}>{["Instagram", "TikTok", "Threads", "Generic"].map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Booking idea / visual setup<textarea value={scene} onChange={(event) => setScene(event.target.value)} /></label>
            <label>Career goal<textarea value={goal} onChange={(event) => setGoal(event.target.value)} /></label>
            <label>Audience hypothesis<textarea value={audienceHypothesis} onChange={(event) => setAudienceHypothesis(event.target.value)} /></label>
            <label>Content strength<input value={contentPillar} onChange={(event) => setContentPillar(event.target.value)} /></label>
          </div>
        </article>
        <article className="settings-preview">
          <div className="section-heading"><h2>Booking Ideas</h2><span>{selectedCandidateExplicit ? "One selected" : "Choose booking"}</span></div>
          {candidates.length === 0 ? <EmptyState title="No booking ideas" body="Propose booking ideas to start planning." /> : (
            <div className="compact-list prompt-choice-list">
              {candidates.map((candidate) => {
                const selected = candidate.id === selectedCandidateId;
                return (
                  <button className={`prompt-choice${selected ? " selected" : ""}`} key={candidate.id} type="button" onClick={() => selectActivity(candidate.id)}>
                    <span>
                      <strong>{candidate.title}</strong>
                      <small>{candidate.body}</small>
                      <small>{candidate.platform_fit || "Platform fit not set"} · {candidate.visual_motif || "Visual motif open"} · {candidate.location_fiction || "Location open"}</small>
                    </span>
                    <em className={selected ? "status-pill completed" : "status-pill queued"}>{selected ? "chosen" : candidate.status}</em>
                  </button>
                );
              })}
            </div>
          )}
        </article>
        <article className="settings-preview">
          <div className="section-heading"><h2>Shoot Brief</h2><span>{selectedBrief ? "Feeds treatment" : "Create next"}</span></div>
          {briefs.length === 0 ? <EmptyState title="No shoot briefs" body="Create a shoot brief from a selected booking idea." /> : (
            <div className="compact-list">
              {briefs.map((brief) => (
                <button className={`run-row${selectedBriefId === brief.id ? " selected" : ""}`} key={brief.id} type="button" onClick={() => selectBriefForRecipe(brief)}>
                  <span>
                    <strong>{brief.goal}</strong>
                    <small>{brief.platform_targets} · {brief.content_pillar} · {brief.visual_direction}</small>
                    {brief.activity_candidate_id && <small>From: {candidates.find((candidate) => candidate.id === brief.activity_candidate_id)?.title ?? "booking idea"}</small>}
                  </span>
                  {selectedBriefId === brief.id && <em className="status-pill completed">selected</em>}
                </button>
              ))}
            </div>
          )}
        </article>
        <article className="settings-preview">
          <div className="section-heading"><h2>Creative Treatment</h2><span>{recipe ? "Ready" : "Not prepared"}</span></div>
          {!recipe ? (
            <EmptyState title="No creative treatment" body={selectedBrief ? "Prepare a creative treatment to assemble identity, look, booking idea, and production settings." : "Select or create a shoot brief before preparing a creative treatment."} />
          ) : (
            <div className="prompt-preview recipe-output booking-treatment">
              <strong>Production scene</strong>
              <p>{recipeScene || "No scene block found."}</p>
              <strong>Audience hypothesis</strong>
              <p>{bookingModel?.audienceHypothesis}</p>
              <div className="inline-actions">
                <button className="primary-action" type="button" onClick={startProduction} disabled={startingProduction}>{startingProduction ? "Starting Production" : "Start Production"}</button>
              </div>
              <details className="technical-treatment-audit">
                <summary>Technical treatment audit</summary>
                <div className="compact-list">
                  <div><strong>Booking idea</strong><small>{selectedBriefSource?.title ?? selectedCandidate?.title ?? "Not linked"}</small></div>
                  <div><strong>Shoot brief</strong><small>{selectedBrief?.goal ?? recipe.content_brief_id ?? "None"}</small></div>
                  <div><strong>Treatment ID</strong><small>{recipe.id}</small></div>
                  <div><strong>Identity bible</strong><small>{recipe.constitution_version_id ?? "None"}</small></div>
                  <div><strong>Appearance</strong><small>{recipe.appearance_profile_id ?? "None"}</small></div>
                </div>
                <strong>Treatment source</strong>
                <pre>{recipe.final_prompt}</pre>
                <strong>Negative prompt</strong>
                <pre>{recipe.negative_prompt}</pre>
              </details>
            </div>
          )}
        </article>
      </section>
    </>
  );
}

function AssetLibraryPage({ data, navigate }: { data: AppData; navigate: (path: string) => void }) {
  const [characterId, setCharacterId] = useState(() => readAssetRouteState().characterId);
  const [statusFilter, setStatusFilter] = useState(() => readAssetRouteState().status);
  const [platformFit, setPlatformFit] = useState(() => readAssetRouteState().platformFit);
  const [assetQuery, setAssetQuery] = useState("");
  const [assets, setAssets] = useState<ImageAsset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [selectedAnalyses, setSelectedAnalyses] = useState<AssetAnalysis[]>([]);
  const [recipes, setRecipes] = useState<PromptRecipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [providerSettings, setProviderSettings] = useState<ProviderSettings | null>(null);
  const [comfyWorkflows, setComfyWorkflows] = useState<ComfyWorkflow[]>([]);
  const [providerOverride, setProviderOverride] = useState("auto");
  const [contentTierOverride, setContentTierOverride] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [reviewReason, setReviewReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [assetReviewPending, setAssetReviewPending] = useState<string | null>(null);

  function filterAssetsForView(items: ImageAsset[], nextStatus = statusFilter, nextPlatform = platformFit, nextQuery = assetQuery) {
    const normalizedQuery = nextQuery.trim().toLowerCase();
    return items.filter((asset) => {
      const statusMatches = !nextStatus || asset.status === nextStatus;
      const platformMatches = !nextPlatform || asset.latestAnalysis?.platform_fit.includes(nextPlatform);
      const queryMatches =
        !normalizedQuery ||
        [
          asset.status,
          asset.provider ?? "",
          asset.original_prompt,
          asset.latestAnalysis?.identity_match ?? "",
          asset.latestAnalysis?.recommended_action ?? "",
          asset.latestAnalysis?.platform_fit.join(" ") ?? ""
        ].some((value) => String(value ?? "").toLowerCase().includes(normalizedQuery));
      return statusMatches && platformMatches && queryMatches;
    });
  }

  const visibleAssets = filterAssetsForView(assets);
  const selectedAsset = visibleAssets.find((asset) => asset.id === selectedAssetId) ?? visibleAssets[0] ?? null;
  const selectedRecipe = recipes.find((recipe) => recipe.id === selectedRecipeId) ?? recipes[0] ?? null;
  const activeImageRun = data.runs.find((run) => run.type === "image_generation" && ["queued", "running", "waiting_for_provider"].includes(run.status));
  const generationInProgress = generatingImage || Boolean(activeImageRun);
  const analyzedCount = assets.filter((asset) => asset.latestAnalysis).length;
  const approvedCount = assets.filter((asset) => asset.status === "approved_post_asset" || asset.status === "approved_reference").length;
  const selectedAnalysis = selectedAsset?.latestAnalysis ?? null;
  const assetStats = [
    { label: "Visible", value: visibleAssets.length, detail: visibleAssets.length === assets.length ? "All assets" : `${assets.length} total` },
    { label: "Analyzed", value: analyzedCount, detail: assets.length ? `${Math.round((analyzedCount / assets.length) * 100)}%` : "0%" },
    { label: "Approved", value: approvedCount, detail: "Review gate" },
    { label: "Selected", value: selectedAsset ? assetStatusLabel(selectedAsset.status) : "None", detail: selectedAsset ? "Current shot" : "Default setup" }
  ];

  const activeComfyWorkflows = comfyWorkflows.filter((workflow) => workflow.status === "active" && !workflow.validation_error);
  const engineOptions = [
    {
      value: "auto",
      label: "Default studio setup",
      detail: providerSettings
        ? "Uses Studio Ops defaults with safety fallback"
        : "Uses configured studio defaults",
      ready: true
    },
    {
      value: "hermes",
      label: "Hermes",
      detail: providerSettings?.hermesImageGenerationPath
        ? "Image setup saved in Studio Ops"
        : "Finish image setup in Studio Ops",
      ready: Boolean(providerSettings?.hasHermesApiKey && providerSettings.hermesImageGenerationPath)
    },
    {
      value: "openai",
      label: "OpenAI Images",
      detail: providerSettings
        ? "Image setup saved in Studio Ops"
        : "Finish image setup in Studio Ops",
      ready: Boolean(providerSettings?.hasOpenaiApiKey)
    },
    {
      value: "comfyui-cloud",
      label: "ComfyUI Cloud",
      detail: activeComfyWorkflows.length
        ? `${activeComfyWorkflows.length} studio workflow${activeComfyWorkflows.length === 1 ? "" : "s"} ready`
        : "Needs Studio Ops workflow",
      ready: Boolean(providerSettings?.comfyuiCloudReady)
    },
    {
      value: "wavespeed",
      label: "WaveSpeed AI",
      detail: providerSettings?.wavespeedImageGenerationPath ? "Image setup saved in Studio Ops" : "Finish image setup in Studio Ops",
      ready: Boolean(providerSettings?.hasWavespeedApiKey)
    },
    {
      value: "mock",
      label: "Mock",
      detail: "Local test production, no external service",
      ready: true
    }
  ];
  const selectedEngine = engineOptions.find((engine) => engine.value === providerOverride) ?? engineOptions[0];

  async function loadAssets(next: { characterId?: string; status?: string; platformFit?: string; query?: string } = {}) {
    const params = new URLSearchParams();
    const nextCharacterId = next.characterId ?? characterId;
    const nextStatus = next.status ?? statusFilter;
    const nextPlatform = next.platformFit ?? platformFit;
    const nextQuery = next.query ?? assetQuery;
    if (nextCharacterId) params.set("characterId", nextCharacterId);
    const response = await fetch(`${apiBaseUrl()}/api/assets${params.size ? `?${params}` : ""}`);
    if (!response.ok) throw new Error("Unable to load assets.");
    const payload = (await response.json()) as { assets: ImageAsset[] };
    setAssets(payload.assets);
    const nextVisibleAssets = filterAssetsForView(payload.assets, nextStatus, nextPlatform, nextQuery);
    setSelectedAssetId((current) => (nextVisibleAssets.some((asset) => asset.id === current) ? current : nextVisibleAssets[0]?.id ?? ""));
  }

  async function loadRecipes(nextCharacterId = characterId) {
    const params = new URLSearchParams();
    if (nextCharacterId) params.set("characterId", nextCharacterId);
    const response = await fetch(`${apiBaseUrl()}/api/prompt-recipes${params.size ? `?${params}` : ""}`);
    if (!response.ok) throw new Error("Unable to load prompt recipes.");
    const payload = (await response.json()) as { recipes: PromptRecipe[] };
    setRecipes(payload.recipes);
    setSelectedRecipeId((current) => (payload.recipes.some((recipe) => recipe.id === current) ? current : payload.recipes[0]?.id ?? ""));
  }

  async function loadGenerationOptions() {
    const [providerResponse, workflowResponse] = await Promise.all([
      fetch(`${apiBaseUrl()}/api/settings/providers`),
      fetch(`${apiBaseUrl()}/api/settings/comfy-workflows`)
    ]);
    if (!providerResponse.ok || !workflowResponse.ok) throw new Error("Unable to load generation engines.");
    const providerPayload = (await providerResponse.json()) as { settings: ProviderSettings };
    const workflowPayload = (await workflowResponse.json()) as { workflows: ComfyWorkflow[] };
    setProviderSettings(providerPayload.settings);
    setComfyWorkflows(workflowPayload.workflows);
  }

  async function loadSelectedDetail(assetId: string) {
    if (!assetId) {
      setSelectedAnalyses([]);
      return;
    }
    const response = await fetch(`${apiBaseUrl()}/api/assets/${assetId}`);
    if (!response.ok) throw new Error("Unable to load asset detail.");
    const payload = (await response.json()) as { asset: ImageAsset; analyses: AssetAnalysis[] };
    setSelectedAnalyses(payload.analyses);
  }

  useEffect(() => {
    loadAssets().catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load assets."));
    loadRecipes().catch(() => undefined);
    loadGenerationOptions().catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load generation engines."));
  }, []);

  useEffect(() => {
    loadSelectedDetail(selectedAssetId).catch(() => undefined);
  }, [selectedAssetId]);

  async function changeCharacter(nextCharacterId: string) {
    setCharacterId(nextCharacterId);
    replaceRouteQuery("/assets", { characterId: nextCharacterId || null });
    setError(null);
    try {
      await Promise.all([loadAssets({ characterId: nextCharacterId }), loadRecipes(nextCharacterId)]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to apply character filter.");
    }
  }

  function applyFilters(nextStatus = statusFilter, nextPlatform = platformFit) {
    setStatusFilter(nextStatus);
    setPlatformFit(nextPlatform);
    replaceRouteQuery("/assets", { status: nextStatus || null, platformFit: nextPlatform || null });
    setError(null);
    const nextVisibleAssets = filterAssetsForView(assets, nextStatus, nextPlatform);
    setSelectedAssetId((current) => (nextVisibleAssets.some((asset) => asset.id === current) ? current : nextVisibleAssets[0]?.id ?? ""));
  }

  function applyAssetSearch(nextQuery: string) {
    setAssetQuery(nextQuery);
    setError(null);
    const nextVisibleAssets = filterAssetsForView(assets, statusFilter, platformFit, nextQuery);
    setSelectedAssetId((current) => (nextVisibleAssets.some((asset) => asset.id === current) ? current : nextVisibleAssets[0]?.id ?? ""));
  }

  async function clearAssetFilters() {
    setCharacterId("");
    setStatusFilter("");
    setPlatformFit("");
    setAssetQuery("");
    setError(null);
    replaceRouteQuery("/assets", { characterId: null, status: null, platformFit: null });
    try {
      await loadAssets({ characterId: "", status: "", platformFit: "", query: "" });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to clear filters.");
    }
  }

  async function generateImage() {
    if (!selectedRecipeId || generationInProgress) return;
    if (!selectedEngine.ready) {
      setError(`${selectedEngine.label} is not ready. Open Studio Ops to finish setup before starting production.`);
      return;
    }
      if (providerOverride !== "auto" && !overrideReason.trim()) {
        setError("Manual setup changes require a note so the production log explains the choice.");
        return;
      }
      setError(null);
      setGeneratingImage(true);
      setMessage(`Production started with ${selectedEngine.label}. Waiting for the portfolio shot.`);
      try {
        const payload = await postJson<{ run: RunSummary; asset?: ImageAsset }>(`/api/prompt-recipes/${selectedRecipeId}/generate-image`, {
          providerOverride,
          overrideReason: overrideReason.trim() || undefined,
          contentTierOverride: contentTierOverride || undefined
        });
        setMessage(`Production ${payload.run.status}. ${payload.asset ? "Portfolio shot stored locally." : "Check Production Logs for setup details."}`);
        await loadAssets({ status: "", platformFit: "", query: "" });
        if (payload.asset) {
          setStatusFilter("");
          setPlatformFit("");
          setAssetQuery("");
          replaceRouteQuery("/assets", { status: null, platformFit: null });
          setSelectedAssetId(payload.asset.id);
        }
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to generate image.");
      } finally {
        setGeneratingImage(false);
      }
  }

  async function analyzeAsset(assetId: string) {
    setError(null); setMessage(null);
    try {
      await postJson(`/api/assets/${assetId}/analyze`, {});
      setMessage("Quality review stored.");
      await loadAssets();
      await loadSelectedDetail(assetId);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to analyze asset.");
    }
  }

  async function reviewAsset(assetId: string, status: string) {
    setError(null); setMessage(null);
    setAssetReviewPending(status);
    try {
      await postJson(`/api/assets/${assetId}/review`, { status, reason: reviewReason || "Manual review from Portfolio." });
      setMessage(`Asset marked ${status}.`);
      await loadAssets();
      await loadSelectedDetail(assetId);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to review asset.");
    } finally {
      setAssetReviewPending(null);
    }
  }

  async function createDraftFromAsset(assetId: string) {
    setError(null); setMessage(null);
    try {
      await postJson<{ run: RunSummary; draft: Draft }>(`/api/assets/${assetId}/create-draft`, {});
      setMessage("Social package created.");
      navigate("/review?type=social_package");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create draft package.");
    }
  }

  async function regenerateAsset(assetId: string) {
    setError(null); setMessage(null);
    try {
      const payload = await postJson<{ asset: ImageAsset }>(`/api/assets/${assetId}/regenerate`, {});
      setMessage("Regenerated image from suggested fixes.");
      await loadAssets();
      setSelectedAssetId(payload.asset.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to regenerate asset.");
    }
  }

  function chooseGenerationEngine(engine: { value: string; label: string; ready: boolean }) {
    if (!engine.ready && engine.value !== "auto") {
      setError(`${engine.label} is not ready. Open Studio Ops to finish setup.`);
      return;
    }
    setError(null);
    setProviderOverride(engine.value);
    if (engine.value === "auto") {
      setOverrideReason("");
    } else if (!overrideReason.trim()) {
      setOverrideReason(`Operator selected ${engine.label} for this generation.`);
    }
  }

  const assetStatusOptions = ["", "raw_generation", "candidate", "approved_reference", "approved_post_asset", "rejected_identity_drift", "rejected_quality", "rejected_policy", "published", "archived"];
  const platformOptions = ["", "Instagram", "TikTok", "Threads"];
  const assetQuickLanes = [
    { label: "All", status: "", count: assets.length },
    { label: "Raw", status: "raw_generation", count: assets.filter((asset) => asset.status === "raw_generation").length },
    { label: "Candidate", status: "candidate", count: assets.filter((asset) => asset.status === "candidate").length },
    { label: "Post", status: "approved_post_asset", count: assets.filter((asset) => asset.status === "approved_post_asset").length },
    { label: "Reference", status: "approved_reference", count: assets.filter((asset) => asset.status === "approved_reference").length },
    { label: "Published", status: "published", count: assets.filter((asset) => asset.status === "published").length }
  ];
  const assetRecipeLabel = (recipe: PromptRecipe) => `${formatDate(recipe.created_at)} · ${compactInlineText(recipe.final_prompt, 48) || recipe.id.replace("prompt_recipe_", "recipe ")}`;
  const activeFilterCount = [characterId, statusFilter, platformFit, assetQuery.trim()].filter(Boolean).length;

  return (
    <>
      <header className="topbar page-heading">
        <div>
          <h1>Portfolio</h1>
        </div>
      </header>
      {message && <div className="notice">{message}</div>}
      {error && <div className="notice error">{error}</div>}
      <StageHandoff data={data} stageId="production" navigate={navigate} />
      <section className="asset-command" aria-label="Asset command">
        <article className="asset-hero">
          <span>Production setup</span>
          <h2>{selectedRecipe ? compactInlineText(selectedRecipe.final_prompt, 28) || selectedRecipe.id.replace("prompt_recipe_", "treatment ").slice(0, 15) : "No treatment"}</h2>
          <p>{generationInProgress ? `${selectedEngine.label} running` : selectedRecipe ? `${selectedEngine.label} selected` : "Select a creative treatment and studio setup."}</p>
          <div className="button-stack">
            <button type="button" onClick={() => navigate("/prompt-studio")}>Booking Desk</button>
            <button className="primary-action" type="button" onClick={generateImage} disabled={!selectedRecipeId || generationInProgress}>
              {generationInProgress ? "In production" : "Start Production"}
            </button>
          </div>
          {generationInProgress && (
            <div className="activity-notice" role="status" aria-live="polite">
              <span />
              <strong>{activeImageRun ? activeImageRun.status.replaceAll("_", " ") : "starting"}</strong>
              <small>{activeImageRun ? `Log ${shortRunId(activeImageRun.id)}` : "Submitting request"}</small>
            </div>
          )}
        </article>
        <div className="asset-stat-grid">
          {assetStats.map((card) => (
            <article key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <p>{card.detail}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="asset-generation-panel" aria-label="Production setup">
        <article className="settings-preview generation-recipe-panel">
          <div className="section-heading">
            <h2>Production setup</h2>
            <span>{selectedEngine.label}</span>
          </div>
          <div className="form-stack">
            <label>Creative treatment<select value={selectedRecipeId} onChange={(event) => setSelectedRecipeId(event.target.value)}>{recipes.length === 0 && <option value="">No treatments</option>}{recipes.map((recipe) => <option key={recipe.id} value={recipe.id}>{assetRecipeLabel(recipe)}</option>)}</select></label>
            <label>Content tier<select value={contentTierOverride} onChange={(event) => setContentTierOverride(event.target.value)}><option value="">Auto classify</option><option value="sfw_standard">SFW standard</option><option value="sfw_sensitive">SFW sensitive</option><option value="mature_adult">Mature adult</option><option value="blocked_or_uncertain">Blocked or uncertain</option></select></label>
            {providerOverride !== "auto" && <label>Manual setup note<textarea value={overrideReason} onChange={(event) => setOverrideReason(event.target.value)} placeholder="Required when changing the default setup" /></label>}
          </div>
        </article>
        <article className="settings-preview generation-engine-panel">
          <div className="section-heading">
            <h2>Studio setup</h2>
            <button type="button" onClick={() => navigate("/settings")}>Open Studio Ops</button>
          </div>
          <div className="generation-engine-summary">
            <span>Routing</span>
            <strong>{providerOverride === "auto" ? "Default studio setup" : "Manual studio setup"}</strong>
            <small>{selectedEngine.ready ? "Ready for production" : "Setup needs attention in Studio Ops"}</small>
          </div>
          <details className="asset-route-drawer generation-engine-drawer">
            <summary>Change production engine</summary>
            <div className="generation-engine-grid" role="list" aria-label="Production setup choices">
              {engineOptions.map((engine) => (
                <button
                  key={engine.value}
                  className={providerOverride === engine.value ? "selected" : ""}
                  type="button"
                  onClick={() => chooseGenerationEngine(engine)}
                  aria-pressed={providerOverride === engine.value}
                >
                  <span>{engine.label}</span>
                  <strong>{engine.ready ? "Ready" : "Setup needed"}</strong>
                  <small>{engine.detail}</small>
                </button>
              ))}
            </div>
            <p className="generation-engine-note">The default follows Studio Ops routing. Manual changes are recorded in the production log with the operator note.</p>
          </details>
        </article>
      </section>
      <section className="asset-workbench">
        <article className="settings-preview asset-controls">
          <div className="asset-filter-heading">
            <h2>Portfolio controls</h2>
            <span>{activeFilterCount ? `${activeFilterCount} active` : "All shots"}</span>
            <button type="button" onClick={() => { void clearAssetFilters(); }} disabled={!activeFilterCount}>Reset</button>
          </div>
          <div className="form-stack asset-filter-grid">
            <label>Search<input type="search" value={assetQuery} onChange={(event) => applyAssetSearch(event.target.value)} placeholder="Talent, treatment, status" /></label>
            <label>Talent<select value={characterId} onChange={(event) => changeCharacter(event.target.value)}><option value="">All talent</option>{data.characters.map((character) => <option key={character.id} value={character.id}>{displayModelName(character.name)}</option>)}</select></label>
            <label>Status<select value={statusFilter} onChange={(event) => applyFilters(event.target.value, platformFit)}>{assetStatusOptions.map((item) => <option key={item} value={item}>{item ? item.replaceAll("_", " ") : "All states"}</option>)}</select></label>
            <label>Platform fit<select value={platformFit} onChange={(event) => applyFilters(statusFilter, event.target.value)}>{platformOptions.map((item) => <option key={item} value={item}>{item || "Any platform"}</option>)}</select></label>
          </div>
        </article>
        <article className="settings-preview asset-grid-panel">
          <div className="section-heading"><h2>Portfolio Shots</h2><span>{visibleAssets.length}/{assets.length}</span></div>
          <div className="asset-lane" aria-label="Asset status lanes">
            {assetQuickLanes.map((lane) => (
              <button key={lane.label} className={statusFilter === lane.status ? "selected" : ""} type="button" onClick={() => applyFilters(lane.status, platformFit)}>
                <span>{lane.label}</span>
                <strong>{lane.count}</strong>
              </button>
            ))}
          </div>
          {assets.length === 0 ? <EmptyState title="No portfolio shots yet" body="Prepare a creative treatment, then start the first production." /> : visibleAssets.length === 0 ? <EmptyState title="No matching shots" body="Change filters or start a new production." /> : (
            <div className="asset-grid">
              {visibleAssets.map((asset) => (
                <button key={asset.id} className={`asset-card ${selectedAsset?.id === asset.id ? "selected" : ""}`} type="button" onClick={() => setSelectedAssetId(asset.id)}>
                  <img src={`${apiBaseUrl()}/api/assets/${asset.id}/file`} alt={safeAssetAltText(asset.latestAnalysis?.alt_text, `Portfolio shot from ${formatDate(asset.created_at)}`)} />
                  <span><strong>{assetStatusLabel(asset.status)}</strong><small>{formatDate(asset.created_at)}</small></span>
                  {asset.latestAnalysis && <em>{asset.latestAnalysis.identity_match} · {asset.latestAnalysis.identity_score}</em>}
                </button>
              ))}
            </div>
          )}
        </article>
        <article className="settings-preview asset-detail-panel">
          <div className="section-heading"><h2>Portfolio Review</h2></div>
          {!selectedAsset ? <EmptyState title="No portfolio shot selected" body="Select or produce a shot to inspect it." /> : (
            <div className="asset-detail">
              <img src={`${apiBaseUrl()}/api/assets/${selectedAsset.id}/file`} alt={safeAssetAltText(selectedAsset.latestAnalysis?.alt_text, "Selected portfolio shot")} />
              <div className="score-row">
                <span className={statusClass(selectedAsset.status)}>{assetStatusLabel(selectedAsset.status)}</span>
                <span>{formatDate(selectedAsset.created_at)}</span>
              </div>
              {selectedAsset.latestAnalysis ? (
                <div className="analysis-panel">
                  <div className="score-grid">
                    <span><strong>{selectedAsset.latestAnalysis.identity_score}</strong><small>Identity</small></span>
                    <span><strong>{selectedAsset.latestAnalysis.quality_score}</strong><small>Quality</small></span>
                    <span><strong>{selectedAsset.latestAnalysis.story_fit_score}</strong><small>Story fit</small></span>
                  </div>
                  <p>{selectedAsset.latestAnalysis.identity_notes}</p>
                  <strong>Quality issues</strong>
                  <ul>{selectedAsset.latestAnalysis.quality_issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
                  <strong>Suggested fixes</strong>
                  <ul>{selectedAsset.latestAnalysis.suggested_prompt_fixes.map((fix) => <li key={fix}>{fix}</li>)}</ul>
                  <small>Platform fit: {selectedAsset.latestAnalysis.platform_fit.join(", ") || "Not scored"}</small>
                  <small>Recommended: {selectedAsset.latestAnalysis.recommended_action}</small>
                </div>
              ) : <EmptyState title="No quality review" body="Review this shot to see identity, quality, and platform-fit scores." />}
              <div className="asset-review-command">
                <button className={!selectedAnalysis ? "primary-action" : ""} type="button" onClick={() => analyzeAsset(selectedAsset.id)}>
                  {selectedAnalysis ? "Review Quality Again" : "Review Quality"}
                </button>
                <button className={selectedAnalysis ? "primary-action" : ""} type="button" onClick={() => reviewAsset(selectedAsset.id, "approved_post_asset")} disabled={Boolean(assetReviewPending)} aria-busy={assetReviewPending === "approved_post_asset"}>
                  {assetReviewPending === "approved_post_asset" ? "Approving" : selectedAsset.status === "approved_post_asset" ? "Approved for publishing" : "Approve for Publishing"}
                </button>
                <button type="button" onClick={() => createDraftFromAsset(selectedAsset.id)} disabled={selectedAsset.status !== "approved_post_asset" || Boolean(assetReviewPending)}>Create Social Package</button>
                <button type="button" onClick={() => regenerateAsset(selectedAsset.id)} disabled={!selectedAsset.prompt_recipe_id}>Regenerate</button>
              </div>
              <details className="editor-drawer asset-decision-drawer">
                <summary>Decision note and alternates</summary>
                <label>Review reason<textarea value={reviewReason} onChange={(event) => setReviewReason(event.target.value)} placeholder="Optional review note" /></label>
                <div className="button-stack">
                  <button type="button" onClick={() => reviewAsset(selectedAsset.id, "approved_reference")} disabled={Boolean(assetReviewPending)} aria-busy={assetReviewPending === "approved_reference"}>{assetReviewPending === "approved_reference" ? "Approving" : "Approve reference"}</button>
                  <button type="button" onClick={() => reviewAsset(selectedAsset.id, "rejected_identity_drift")} disabled={Boolean(assetReviewPending)} aria-busy={assetReviewPending === "rejected_identity_drift"}>{assetReviewPending === "rejected_identity_drift" ? "Rejecting" : "Reject identity drift"}</button>
                  <button type="button" onClick={() => reviewAsset(selectedAsset.id, "rejected_quality")} disabled={Boolean(assetReviewPending)} aria-busy={assetReviewPending === "rejected_quality"}>{assetReviewPending === "rejected_quality" ? "Rejecting" : "Reject quality"}</button>
                </div>
              </details>
              <details className="raw-details">
                <summary>Creative treatment source</summary>
                <pre>{selectedAsset.original_prompt}</pre>
              </details>
              {selectedAnalyses.length > 1 && <small>{selectedAnalyses.length} analyses stored for this asset.</small>}
            </div>
          )}
        </article>
      </section>
    </>
  );
}

function DraftReviewDesk({ data, navigate }: { data: AppData; navigate: (path: string) => void }) {
  const [queueFilter, setQueueFilter] = useState<ReviewDecisionType | "all">(() => {
    const reviewType = readReviewRouteState().type;
    return readDraftRouteState().status ? "social_package" : reviewType;
  });
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [assets, setAssets] = useState<ImageAsset[]>([]);
  const [characterDetails, setCharacterDetails] = useState<CharacterDetail[]>([]);
  const [selectedDecisionId, setSelectedDecisionId] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [variantDraft, setVariantDraft] = useState({
    caption: "",
    hashtags: "",
    altText: "",
    disclosureText: "",
    notes: "",
    aiGenerated: false,
    paidPartnership: false,
    brandContent: false
  });
  const [publishUrl, setPublishUrl] = useState("");
  const [publishNotes, setPublishNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draftActionPending, setDraftActionPending] = useState<string | null>(null);
  const [copyEditorOpen, setCopyEditorOpen] = useState(false);
  const [reviewReason, setReviewReason] = useState("");
  const packetCharacters = characterDetails.length ? characterDetails : data.characters;
  const decisionPackets = buildReviewDecisionPackets({
    characters: packetCharacters,
    drafts,
    assets,
    runs: data.runs
  });
  const filteredDecisionPackets = queueFilter === "all" ? decisionPackets : decisionPackets.filter((packet) => packet.type === queueFilter);
  const selectedDecision = filteredDecisionPackets.find((packet) => packet.id === selectedDecisionId) ?? filteredDecisionPackets[0] ?? null;
  const selectedDraft = selectedDecision?.technicalSource.draftId ? drafts.find((draft) => draft.id === selectedDecision.technicalSource.draftId) ?? null : null;
  const selectedAsset = selectedDecision?.technicalSource.assetId ? assets.find((asset) => asset.id === selectedDecision.technicalSource.assetId) ?? selectedDraft?.asset ?? null : null;
  const selectedRun = selectedDecision?.technicalSource.runId ? data.runs.find((run) => run.id === selectedDecision.technicalSource.runId) ?? null : null;
  const selectedProposal = selectedDecision?.technicalSource.proposalId
    ? characterDetails.flatMap((character) => character.identityProposals).find((proposal) => proposal.id === selectedDecision.technicalSource.proposalId) ?? null
    : null;
  const selectedVariant = selectedDraft?.variants?.find((variant) => variant.platform === selectedPlatform) ?? selectedDraft?.variants?.[0] ?? null;
  const variantDirty = Boolean(
    selectedVariant &&
      (variantDraft.caption !== selectedVariant.caption ||
        variantDraft.hashtags !== (selectedVariant.hashtags ?? "") ||
        variantDraft.altText !== (selectedVariant.alt_text ?? "") ||
        variantDraft.disclosureText !== (selectedVariant.disclosure_text ?? "") ||
        variantDraft.notes !== (selectedVariant.notes ?? "") ||
        variantDraft.aiGenerated !== Boolean(selectedVariant.ai_generated_flag) ||
        variantDraft.paidPartnership !== Boolean(selectedVariant.paid_partnership_flag) ||
        variantDraft.brandContent !== Boolean(selectedVariant.brand_content_flag))
	  );

  useEffect(() => {
    if (selectedDraft?.variants?.length && !selectedDraft.variants.some((variant) => variant.platform === selectedPlatform)) {
      setSelectedPlatform(selectedDraft.variants[0].platform);
      return;
    }
    if (!selectedVariant) {
      setVariantDraft({
        caption: "",
        hashtags: "",
        altText: "",
        disclosureText: "",
        notes: "",
        aiGenerated: false,
        paidPartnership: false,
        brandContent: false
      });
      return;
    }
    setVariantDraft({
      caption: selectedVariant.caption,
      hashtags: selectedVariant.hashtags ?? "",
      altText: selectedVariant.alt_text ?? "",
      disclosureText: selectedVariant.disclosure_text ?? "",
      notes: selectedVariant.notes ?? "",
      aiGenerated: Boolean(selectedVariant.ai_generated_flag),
      paidPartnership: Boolean(selectedVariant.paid_partnership_flag),
      brandContent: Boolean(selectedVariant.brand_content_flag)
    });
  }, [selectedVariant?.id]);

  async function loadReviewData() {
    const characterIds = data.characters.map((character) => character.id);
    const [draftResponse, assetResponse, detailResponses] = await Promise.all([
      fetch(`${apiBaseUrl()}/api/drafts`),
      fetch(`${apiBaseUrl()}/api/assets`),
      Promise.all(characterIds.map((id) => fetch(`${apiBaseUrl()}/api/characters/${id}`)))
    ]);
    if (!draftResponse.ok || !assetResponse.ok || detailResponses.some((response) => !response.ok)) {
      throw new Error("Unable to load Review Desk decisions.");
    }
    const [draftPayload, assetPayload, detailPayloads] = await Promise.all([
      draftResponse.json() as Promise<{ drafts: Draft[] }>,
      assetResponse.json() as Promise<{ assets: ImageAsset[] }>,
      Promise.all(detailResponses.map((response) => response.json() as Promise<{ character: CharacterDetail }>))
    ]);
    const nextCharacterDetails = detailPayloads.map((payload) => payload.character);
    const nextPackets = buildReviewDecisionPackets({
      characters: nextCharacterDetails.length ? nextCharacterDetails : data.characters,
      drafts: draftPayload.drafts,
      assets: assetPayload.assets,
      runs: data.runs
    });
    setDrafts(draftPayload.drafts);
    setAssets(assetPayload.assets);
    setCharacterDetails(nextCharacterDetails);
    setSelectedDecisionId((current) => {
      const nextVisible = queueFilter === "all" ? nextPackets : nextPackets.filter((packet) => packet.type === queueFilter);
      return nextVisible.some((packet) => packet.id === current) ? current : nextVisible[0]?.id ?? "";
    });
  }

  const characterIdsKey = data.characters.map((character) => character.id).join("|");
  const runReviewKey = data.runs.map((run) => `${run.id}:${run.status}:${run.updated_at}`).join("|");

  useEffect(() => {
    loadReviewData().catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load Review Desk decisions."));
  }, [characterIdsKey, runReviewKey, queueFilter]);

  async function updateVariant(patch: Partial<PlatformVariant>) {
    if (!selectedVariant) return;
    setError(null); setMessage(null);
    try {
      await patchJson(`/api/platform-variants/${selectedVariant.id}`, patch);
      setMessage("Platform copy saved.");
      await loadReviewData();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save variant.");
    }
  }

  async function saveVariantCopy() {
    if (!selectedVariant) return;
    await updateVariant({
      caption: variantDraft.caption,
      hashtags: variantDraft.hashtags,
      alt_text: variantDraft.altText,
      disclosure_text: variantDraft.disclosureText,
      notes: variantDraft.notes,
      ai_generated_flag: variantDraft.aiGenerated ? 1 : 0,
      paid_partnership_flag: variantDraft.paidPartnership ? 1 : 0,
      brand_content_flag: variantDraft.brandContent ? 1 : 0
    });
  }

  async function reviewDraftPacket(draft: Draft, statusValue: string, reason = "Manual Review Desk action.", successMessage?: string, pendingKey = statusValue) {
    setError(null); setMessage(null);
    setDraftActionPending(pendingKey);
    try {
      await patchJson(`/api/drafts/${draft.id}`, { status: statusValue, reason });
      setMessage(successMessage ?? `Social package marked ${statusValue.replaceAll("_", " ")}.`);
      await loadReviewData();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to review social package.");
    } finally {
      setDraftActionPending(null);
    }
  }

  async function exportDraftPacket(draft: Draft) {
    setError(null); setMessage(null);
    setDraftActionPending("export");
    try {
      await postJson<{ package: PublishingPackage }>(`/api/drafts/${draft.id}/export`, {});
      setMessage("Placement package prepared.");
      await loadReviewData();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to prepare placement package.");
    } finally {
      setDraftActionPending(null);
    }
  }

  async function publishDraftPacket(draft: Draft, variant: PlatformVariant | null) {
    if (!variant) return;
    setError(null); setMessage(null);
    setDraftActionPending("publish");
    try {
      await postJson(`/api/drafts/${draft.id}/publish`, {
        platform: variant.platform,
        liveUrl: publishUrl || null,
        notes: publishNotes || "Manual publishing ledger update."
      });
      setMessage("Publishing ledger updated.");
      setPublishUrl("");
      setPublishNotes("");
      await loadReviewData();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to mark published.");
    } finally {
      setDraftActionPending(null);
    }
  }

  async function analyzeAssetPacket(asset: ImageAsset) {
    setError(null); setMessage(null);
    setDraftActionPending("quality");
    try {
      await postJson(`/api/assets/${asset.id}/analyze`, {});
      setMessage("Quality review added to the decision packet.");
      await loadReviewData();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to review portfolio shot quality.");
    } finally {
      setDraftActionPending(null);
    }
  }

  async function reviewAssetPacket(asset: ImageAsset, statusValue: string, successMessage: string) {
    setError(null); setMessage(null);
    setDraftActionPending(statusValue);
    try {
      await postJson(`/api/assets/${asset.id}/review`, { status: statusValue, reason: reviewReason || `Review Desk marked shot ${statusValue.replaceAll("_", " ")}.` });
      setMessage(successMessage);
      await loadReviewData();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to review portfolio shot.");
    } finally {
      setDraftActionPending(null);
    }
  }

  async function requestAssetRevision(asset: ImageAsset) {
    setError(null); setMessage(null);
    setDraftActionPending("revision");
    try {
      if (asset.prompt_recipe_id) {
        await postJson<{ asset: ImageAsset }>(`/api/assets/${asset.id}/regenerate`, {});
        setMessage("Revision requested. A new candidate shot was generated from treatment fixes.");
      } else {
        await postJson(`/api/assets/${asset.id}/review`, { status: "rejected_quality", reason: reviewReason || "Revision requested from Review Desk." });
        setMessage("Revision requested. Shot kept out of the portfolio queue.");
      }
      await loadReviewData();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to request revision.");
    } finally {
      setDraftActionPending(null);
    }
  }

  async function reviewCareerProposal(statusValue: "approved" | "rejected") {
    if (!selectedProposal) return;
    setError(null); setMessage(null);
    setDraftActionPending(`proposal:${statusValue}`);
    try {
      await postJson(`/api/identity-proposals/${selectedProposal.id}/review`, {
        status: statusValue,
        constitutionChangeReason: selectedProposal.kind === "constitution_patch" ? "Approved from Review Desk." : undefined
      });
      setMessage(statusValue === "approved" ? "Career update approved." : "Career update rejected.");
      await loadReviewData();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to review career update.");
    } finally {
      setDraftActionPending(null);
    }
  }

  async function handlePrimaryDecision() {
    if (!selectedDecision) return;
    if (selectedDecision.type === "portfolio_candidate" && selectedAsset) {
      if (!selectedAsset.latestAnalysis) {
        await analyzeAssetPacket(selectedAsset);
        return;
      }
      await reviewAssetPacket(selectedAsset, "approved_post_asset", "Portfolio shot approved for publishing.");
      return;
    }
    if (selectedDecision.type === "social_package" && selectedDraft) {
      if (selectedDraft.status === "approved") {
        await exportDraftPacket(selectedDraft);
        return;
      }
      if (selectedDraft.status === "exported") {
        await publishDraftPacket(selectedDraft, selectedVariant);
        return;
      }
      await reviewDraftPacket(selectedDraft, "approved", "Approved from Review Desk.", "Social package approved.", "approved");
      return;
    }
    if (selectedDecision.type === "career_direction") {
      await reviewCareerProposal("approved");
      return;
    }
    if (selectedDecision.type === "studio_attention" && selectedRun) {
      navigate(`/runs/${selectedRun.id}`);
    }
  }

  const decisionCounts: Array<{ type: ReviewDecisionType | "all"; label: string; detail: string; count: number }> = [
    { type: "all", label: "Decision Queue", detail: "all director actions", count: decisionPackets.length },
    { type: "portfolio_candidate", label: "Portfolio", detail: "candidate shots", count: decisionPackets.filter((packet) => packet.type === "portfolio_candidate").length },
    { type: "social_package", label: "Social Packages", detail: "approval and placement", count: decisionPackets.filter((packet) => packet.type === "social_package").length },
    { type: "career_direction", label: "Career Updates", detail: "identity learning", count: decisionPackets.filter((packet) => packet.type === "career_direction").length },
    { type: "studio_attention", label: "Studio Attention", detail: "production gates", count: decisionPackets.filter((packet) => packet.type === "studio_attention").length }
  ];

  return (
    <>
      <header className="topbar page-heading"><div><h1>Review Desk</h1></div></header>
      {message && <div className="notice">{message}</div>}
      {error && <div className="notice error">{error}</div>}
      <StageHandoff data={data} stageId="review" navigate={navigate} />
      <section className="review-queue-overview decision-filter-row" aria-label="Decision queue filters">
        {decisionCounts.map((queue) => (
          <button
            className={queueFilter === queue.type ? "active" : ""}
            key={queue.type}
            type="button"
            onClick={() => {
              setQueueFilter(queue.type);
              replaceRouteQuery("/review", { type: queue.type === "all" ? null : queue.type });
            }}
          >
            <span>{queue.label}</span>
            <strong>{queue.count}</strong>
            <small>{queue.detail}</small>
          </button>
        ))}
      </section>
      <section className="review-decision-workbench">
        <article className="settings-preview decision-queue-panel">
          <div className="section-heading"><h2>Decision Queue</h2><span>{filteredDecisionPackets.length}</span></div>
          {filteredDecisionPackets.length === 0 ? (
            <div className="review-clear-state">
              <EmptyState title="Nothing needs approval" body="The Review Desk is clear." />
              <div className="button-stack">
                <button type="button" onClick={() => navigate("/talent")}>Open Roster</button>
                <button className="primary-action" type="button" onClick={() => navigate("/prompt-studio")}>Book New Work</button>
              </div>
            </div>
          ) : (
            <div className="compact-list decision-list">
              {filteredDecisionPackets.map((packet) => (
                <button key={packet.id} className={`run-row${selectedDecision?.id === packet.id ? " selected" : ""}`} type="button" onClick={() => setSelectedDecisionId(packet.id)}>
                  <span>
                    <strong>{packet.title}</strong>
                    <small>{reviewTypeLabel(packet.type)} · {packet.statusLabel}</small>
                  </span>
                  {packet.previewImageAssetId ? (
                    <img src={`${apiBaseUrl()}/api/assets/${packet.previewImageAssetId}/file`} alt={packet.previewAlt} />
                  ) : (
                    <em>{packet.talentName}</em>
                  )}
                </button>
              ))}
            </div>
          )}
        </article>
        <article className="settings-preview draft-detail-panel output-review-panel selected-decision-panel">
          <div className="section-heading"><h2>Selected Decision</h2></div>
          {!selectedDecision ? <EmptyState title="No decision selected" body="The Review Desk is clear." /> : (
            <div className="asset-detail output-review-detail">
              <div className="score-row">
                <span className={statusClass(selectedDecision.type)}>{reviewTypeLabel(selectedDecision.type)}</span>
                <span>{selectedDecision.talentName}</span>
              </div>
              <div className="decision-packet-heading">
                <span>What is this?</span>
                <h2>{selectedDecision.title}</h2>
                <p>{selectedDecision.summary}</p>
              </div>
              <div className="review-packet-item review-packet-recommendation review-lead-recommendation">
                <span>Recommendation</span>
                <strong>{selectedDecision.recommendation}</strong>
              </div>
              <div className="draft-primary-actions review-actions" aria-label="Director actions">
                <button className="primary-action" type="button" onClick={handlePrimaryDecision} disabled={Boolean(draftActionPending)} aria-busy={draftActionPending === "approved" || draftActionPending === "quality" || draftActionPending === "export" || draftActionPending === "publish" || draftActionPending === "proposal:approved"}>
                  {draftActionPending ? "Working" : selectedDecision.primaryActionLabel}
                </button>
                {selectedDecision.type === "portfolio_candidate" && selectedAsset?.latestAnalysis && (
                  <>
                    <button type="button" onClick={() => reviewAssetPacket(selectedAsset, "approved_reference", "Portfolio shot added as an identity anchor.")} disabled={Boolean(draftActionPending)}>Add to Portfolio</button>
                    <button type="button" onClick={() => requestAssetRevision(selectedAsset)} disabled={Boolean(draftActionPending)}>Request Revision</button>
                    <button type="button" onClick={() => reviewAssetPacket(selectedAsset, "rejected_quality", "Portfolio shot rejected.")} disabled={Boolean(draftActionPending)}>Reject</button>
                  </>
                )}
                {selectedDecision.type === "portfolio_candidate" && selectedAsset && !selectedAsset.latestAnalysis && (
                  <button type="button" onClick={() => navigate("/library")}>Open Portfolio</button>
                )}
                {selectedDecision.type === "social_package" && selectedDraft && (
                  <>
                    <button type="button" onClick={() => setCopyEditorOpen(true)}>Edit Copy</button>
                    {selectedDraft.status === "needs_review" && <button type="button" onClick={() => reviewDraftPacket(selectedDraft, "rejected", "Revision requested from Review Desk.", "Revision requested.", "revision")} disabled={Boolean(draftActionPending)}>Request Revision</button>}
                    {selectedDraft.status === "needs_review" && <button type="button" onClick={() => reviewDraftPacket(selectedDraft, "rejected", "Rejected from Review Desk.", "Social package rejected.", "rejected")} disabled={Boolean(draftActionPending)}>Reject</button>}
                    {selectedDraft.status !== "needs_review" && <button type="button" onClick={() => navigate("/calendar")}>Open Publishing</button>}
                  </>
                )}
                {selectedDecision.type === "career_direction" && (
                  <button type="button" onClick={() => reviewCareerProposal("rejected")} disabled={Boolean(draftActionPending)}>Reject</button>
                )}
                {selectedDecision.type === "studio_attention" && (
                  <button type="button" onClick={() => navigate("/settings")}>Open Studio Ops</button>
                )}
              </div>
              <div className="review-decision-packet decision-packet-grid">
                <div className="review-packet-item review-packet-reasons">
                  <span>Why</span>
                  <ul>
                    {selectedDecision.why.map((reason) => <li key={reason}>{reason}</li>)}
                  </ul>
                </div>
                <div className="review-packet-item">
                  <span>Risk</span>
                  <p>{selectedDecision.risk}</p>
                </div>
                <div className="review-packet-item">
                  <span>What happens next</span>
                  <p>{selectedDecision.consequence}</p>
                </div>
              </div>
              {selectedDecision.previewImageAssetId ? (
                <figure className="review-preview-figure">
                  <img className="review-asset-preview" src={`${apiBaseUrl()}/api/assets/${selectedDecision.previewImageAssetId}/file`} alt={selectedDecision.previewAlt} />
                  <figcaption>Candidate preview</figcaption>
                </figure>
              ) : (
                <div className="decision-text-preview">
                  <span>{reviewTypeLabel(selectedDecision.type)}</span>
                  <strong>{selectedDecision.statusLabel}</strong>
                  <p>{selectedDecision.summary}</p>
                </div>
              )}
              {selectedDecision.type === "portfolio_candidate" && selectedAsset && (
                <details className="editor-drawer asset-decision-drawer">
                  <summary>Decision note</summary>
                  <label>Review reason<textarea value={reviewReason} onChange={(event) => setReviewReason(event.target.value)} placeholder="Optional note for the review log" /></label>
                </details>
              )}
              {selectedDecision.type === "social_package" && selectedDraft && (
                <details className="editor-drawer draft-variant-drawer" open={copyEditorOpen} onToggle={(event) => setCopyEditorOpen(event.currentTarget.open)}>
                  <summary>Caption and platform copy</summary>
                  <div className="tab-row">{selectedDraft.variants?.map((variant) => (
                    <button key={variant.id} type="button" className={variant.platform === selectedPlatform ? "selected" : ""} onClick={() => setSelectedPlatform(variant.platform)}>
                      <span className={`platform-inline ${platformClass(variant.platform)}`}>{platformIcon(variant.platform, 14)}{platformLabel(variant.platform)}</span>
                    </button>
                  ))}</div>
                  {selectedVariant && <div className="form-stack">
                    <label>Caption<textarea value={variantDraft.caption} onChange={(event) => setVariantDraft({ ...variantDraft, caption: event.target.value })} /></label>
                    <label>Hashtags<input value={variantDraft.hashtags} onChange={(event) => setVariantDraft({ ...variantDraft, hashtags: event.target.value })} /></label>
                    <label>Alt text<textarea value={variantDraft.altText} onChange={(event) => setVariantDraft({ ...variantDraft, altText: event.target.value })} /></label>
                    <label>Disclosure<textarea value={variantDraft.disclosureText} onChange={(event) => setVariantDraft({ ...variantDraft, disclosureText: event.target.value })} /></label>
                    <label>Readiness notes<textarea value={variantDraft.notes} onChange={(event) => setVariantDraft({ ...variantDraft, notes: event.target.value })} /></label>
                    <label className="checkbox-row"><input type="checkbox" checked={variantDraft.aiGenerated} onChange={(event) => setVariantDraft({ ...variantDraft, aiGenerated: event.target.checked })} /> AI-generated</label>
                    <label className="checkbox-row"><input type="checkbox" checked={variantDraft.paidPartnership} onChange={(event) => setVariantDraft({ ...variantDraft, paidPartnership: event.target.checked })} /> Paid partnership</label>
                    <label className="checkbox-row"><input type="checkbox" checked={variantDraft.brandContent} onChange={(event) => setVariantDraft({ ...variantDraft, brandContent: event.target.checked })} /> Brand content</label>
                    <div className="form-footer">
                      <span>{variantDirty ? "Unsaved" : "Saved"}</span>
                      <button className="primary-action" type="button" onClick={saveVariantCopy} disabled={!variantDirty}>Save platform copy</button>
                    </div>
                  </div>}
                </details>
              )}
              {selectedDecision.type === "social_package" && selectedDraft && (
                <details className="editor-drawer draft-publish-drawer">
                  <summary>Live placement ledger</summary>
                  <div className="form-stack">
                    <label>Live URL<input value={publishUrl} onChange={(event) => setPublishUrl(event.target.value)} placeholder="https://..." /></label>
                    <label>Publishing notes<input value={publishNotes} onChange={(event) => setPublishNotes(event.target.value)} /></label>
                    <button type="button" onClick={() => publishDraftPacket(selectedDraft, selectedVariant)} disabled={Boolean(draftActionPending)} aria-busy={draftActionPending === "publish"}>{draftActionPending === "publish" ? "Marking live" : "Mark Live"}</button>
                  </div>
                  {selectedDraft.packages && selectedDraft.packages.length > 0 && <div className="compact-list"><div><strong>Latest placement package</strong><small>{selectedDraft.packages[0].files.join(", ")}</small></div></div>}
                </details>
              )}
              <details className="raw-details review-debug-drawer">
                <summary>Technical audit</summary>
                <pre>{JSON.stringify(selectedDecision.technicalAudit, null, 2)}</pre>
              </details>
            </div>
          )}
        </article>
      </section>
    </>
  );
}

function CalendarLedgerPage({ data, navigate }: { data: AppData; navigate: (path: string) => void }) {
  const [events, setEvents] = useState<PublishingEvent[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [dossierOpen, setDossierOpen] = useState(true);
  const [latestFeedbackId, setLatestFeedbackId] = useState("");
  const [selectedBucket, setSelectedBucket] = useState(() => readCalendarRouteState().bucket);
  const [feedbackForm, setFeedbackForm] = useState({
    impressions: "1200",
    reach: "900",
    likes: "80",
    comments: "12",
    shares: "7",
    saves: "18",
    profileVisits: "20",
    followsGained: "4",
    qualitativeNotes: "Audience liked the transparent studio-process framing.",
    topComments: "Love the process; feels consistent.",
    operatorJudgment: "On-character and worth repeating."
  });
  useEffect(() => {
    Promise.all([
      fetch(`${apiBaseUrl()}/api/publishing-events`),
      fetch(`${apiBaseUrl()}/api/drafts`)
    ])
      .then(async ([eventResponse, draftResponse]) => {
        if (!eventResponse.ok || !draftResponse.ok) throw new Error("Unable to load publishing desk.");
        const eventPayload = (await eventResponse.json()) as { events: PublishingEvent[] };
        const draftPayload = (await draftResponse.json()) as { drafts: Draft[] };
        return { events: eventPayload.events, drafts: draftPayload.drafts };
      })
      .then((payload) => {
        setEvents(payload.events);
        setDrafts(payload.drafts);
        setSelectedEventId((current) => current || payload.events[0]?.id || "");
        setDossierOpen(Boolean(payload.events.length));
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load publishing desk."));
  }, []);
  const updateFeedback = (key: keyof typeof feedbackForm, value: string) => setFeedbackForm({ ...feedbackForm, [key]: value });
  async function submitFeedback() {
    const targetEventId = selectedEvent?.id ?? selectedEventId;
    if (!targetEventId) return;
    setError(null); setMessage(null);
    try {
      const payload = await postJson<{ feedback: SocialFeedback }>(`/api/publishing-events/${targetEventId}/feedback`, {
        impressions: Number(feedbackForm.impressions),
        reach: Number(feedbackForm.reach),
        likes: Number(feedbackForm.likes),
        comments: Number(feedbackForm.comments),
        shares: Number(feedbackForm.shares),
        saves: Number(feedbackForm.saves),
        profileVisits: Number(feedbackForm.profileVisits),
        followsGained: Number(feedbackForm.followsGained),
        qualitativeNotes: feedbackForm.qualitativeNotes,
        topComments: feedbackForm.topComments,
        operatorJudgment: feedbackForm.operatorJudgment
      });
      setLatestFeedbackId(payload.feedback.id);
      setMessage("Audience response logged.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to log feedback.");
    }
  }
  async function runReflection() {
    if (!latestFeedbackId) return;
    setError(null); setMessage(null);
    try {
      const payload = await postJson<{ run: RunSummary }>(`/api/feedback/${latestFeedbackId}/reflection-run`, {});
      setMessage("Audience debrief started.");
      window.history.pushState({}, "", `/runs/${payload.run.id}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to run reflection.");
    }
  }
  const buckets = ["planned", "draft_ready", "exported", "published", "needs_feedback"];
  const matchingEventsForBucket = (bucket: string) =>
    events.filter((event) => event.status === bucket || (bucket === "published" && event.published_at));
  const filteredEvents = selectedBucket === "all" ? events : matchingEventsForBucket(selectedBucket);
  const publishedEvents = matchingEventsForBucket("published");
  const statusColumns = ["planned", "draft_ready", "exported", "published", "needs_feedback"];
  const statusColumnLabels: Record<string, string> = {
    planned: "Plan",
    draft_ready: "Draft",
    exported: "Package",
    published: "Live",
    needs_feedback: "Due"
  };
  const platformRows = Array.from(new Set(["instagram", "tiktok", "youtube", "x", "blog", ...events.map((event) => event.platform || "unknown")])).map((platform) => ({
    platform,
    counts: statusColumns.map((status) => ({
      status,
      count: matchingEventsForBucket(status).filter((event) => (event.platform || "unknown") === platform).length
    })),
    total: events.filter((event) => (event.platform || "unknown") === platform).length
  }));
  const responseDueCount = matchingEventsForBucket("needs_feedback").length + (publishedEvents.length && !latestFeedbackId ? 1 : 0);
  const boardEvents = filteredEvents.slice(0, 8);
  const selectedEvent = dossierOpen
    ? filteredEvents.find((event) => event.id === selectedEventId) ??
      filteredEvents[0] ??
      events.find((event) => event.id === selectedEventId) ??
      null
    : null;
  const latestPublished = publishedEvents[0] ?? null;
  const selectedDraft = drafts.find((draft) => draft.id === selectedEvent?.draft_id) ?? drafts[0] ?? null;
  const selectedVariant = selectedDraft?.variants?.find((variant) => variant.platform === selectedEvent?.platform) ?? selectedDraft?.variants?.[0] ?? null;
  const selectedAsset = selectedDraft?.asset ?? null;
  const characterNames = new Map(data.characters.map((character) => [character.id, displayModelName(character.name)]));
  const selectedTalentName = selectedDraft?.character_id ? characterNames.get(selectedDraft.character_id) ?? "Unassigned talent" : "Unassigned talent";
  const selectedPlacementTitle = agencyFacingPackageTitle(selectedDraft?.title, selectedTalentName);
  const selectedPlacementCaption = selectedVariant?.caption && selectedDraft?.title
    ? selectedVariant.caption.replace(selectedDraft.title, selectedPlacementTitle)
    : selectedVariant?.caption;
  const dossierImageUrl = selectedAsset?.id ? `${apiBaseUrl()}/api/assets/${selectedAsset.id}/file` : "";
  const reviewDrafts = drafts.filter((draft) => ["needs_review", "draft_ready", "packaged"].includes(draft.status)).slice(0, 4);
  const recentRows = drafts.slice(0, 4);
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const weekDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
  const weekDays = weekDates.map((date) => date.toLocaleDateString([], { weekday: "short", day: "2-digit" }));
  const weekLabel = `${weekDates[0].toLocaleDateString([], { month: "short", day: "numeric" })} - ${weekDates[6].toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`;
  const timeSlots = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];
  const scheduleItems = [
    ...events.map((event, index) => ({
      id: event.id,
      eventId: event.id,
      platform: event.platform || "post",
      title: event.live_url ? "Live post" : "Ledger entry",
      detail: event.status.replaceAll("_", " "),
      tone: event.platform || "post",
      dayIndex: index % weekDays.length,
      slotIndex: (index * 2 + 1) % timeSlots.length
    })),
    ...drafts.map((draft, index) => ({
      id: draft.id,
      eventId: null,
      platform: draft.variants?.[0]?.platform ?? "draft",
      title: agencyFacingPackageTitle(draft.title, characterNames.get(draft.character_id)),
      detail: draft.status.replaceAll("_", " "),
      tone: draft.variants?.[0]?.platform ?? "draft",
      dayIndex: (index + 1) % weekDays.length,
      slotIndex: (index * 2) % timeSlots.length
    }))
  ];
  const selectedEventIndex = selectedEvent ? events.findIndex((event) => event.id === selectedEvent.id) : -1;
  const canLogResponse = selectedEvent?.status === "published" || selectedEvent?.status === "needs_feedback";
  const goToEvent = (direction: -1 | 1) => {
    if (!events.length) return;
    const nextIndex = selectedEventIndex < 0 ? 0 : (selectedEventIndex + direction + events.length) % events.length;
    setSelectedEventId(events[nextIndex]?.id ?? "");
    setDossierOpen(true);
  };
  const selectCurrentWindow = () => {
    setSelectedEventId(events[0]?.id ?? "");
    setDossierOpen(Boolean(events.length));
  };
  return (
    <>
      <header className="topbar page-heading calendar-topbar">
        <div>
          <h1>Publishing</h1>
        </div>
      </header>
      {message && <div className="notice">{message}</div>}
      {error && <div className="notice error">{error}</div>}
      <StageHandoff data={data} stageId="publishing" navigate={navigate} />
      <section className="status-lane publishing-bucket-lane" aria-label="Publishing buckets">
        <button className={selectedBucket === "all" ? "active" : ""} type="button" onClick={() => { setSelectedBucket("all"); replaceRouteQuery("/calendar", { bucket: null }); }}>
          <strong>{events.length}</strong>
          <span>All events</span>
        </button>
        {statusColumns.map((bucket) => (
          <button className={selectedBucket === bucket ? "active" : ""} key={bucket} type="button" onClick={() => { setSelectedBucket(bucket); replaceRouteQuery("/calendar", { bucket }); }}>
            <strong>{matchingEventsForBucket(bucket).length}</strong>
            <span>{statusColumnLabels[bucket]}</span>
          </button>
        ))}
      </section>
      <section className="calendar-agency-layout">
        <div className="calendar-main-column">
          <section className="publishing-desk" aria-label="Publishing control desk">
            <article className="route-matrix-panel">
              <div className="section-heading">
                <h2>Route matrix</h2>
              </div>
              <table className="route-matrix">
                <thead>
                  <tr>
                    <th>Platform</th>
                    {statusColumns.map((status) => <th key={status}>{statusColumnLabels[status]}</th>)}
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {platformRows.map((row) => (
                    <tr key={row.platform}>
                      <td>
                        <span className="platform-cell">
                          <span className={`platform-mark ${platformClass(row.platform)}`}>{platformIcon(row.platform)}</span>
                          <span>{platformLabel(row.platform)}</span>
                        </span>
                      </td>
                      {row.counts.map((count) => <td key={count.status}>{count.count}</td>)}
                      <td>{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
            <article className="desk-overview-panel">
              <div className="section-heading">
                <h2>Today - overview</h2>
              </div>
              <div className="desk-stat-row" aria-label="Publishing desk summary">
                <span><strong>{drafts.filter((draft) => draft.status === "packaged").length}</strong><small>Scheduled</small></span>
                <span><strong>{reviewDrafts.length}</strong><small>Due for review</small></span>
                <span className="alert"><strong>{responseDueCount}</strong><small>Action required</small></span>
              </div>
              <dl className="desk-next-window">
                <div>
                  <dt>Next window</dt>
                  <dd>14:00 - 16:00</dd>
                </div>
                <div>
                  <dt>Latest post</dt>
                  <dd>{latestPublished ? formatDate(latestPublished.published_at ?? latestPublished.created_at) : "No publication"}</dd>
                </div>
              </dl>
            </article>
          </section>
          <section className="publishing-ledger-calendar" aria-label="Publishing ledger">
            <div className="ledger-calendar-header">
              <span>Publishing calendar</span>
              <strong>{weekLabel}</strong>
              <button type="button" onClick={selectCurrentWindow}>Today</button>
            </div>
            <div className="week-grid">
              <div className="time-head" />
              {weekDays.map((day) => <div className="day-head" key={day}>{day}</div>)}
              {timeSlots.map((slot, slotIndex) => (
                <Fragment key={slot}>
                  <div className="time-cell">{slot}</div>
                  {weekDays.map((day, dayIndex) => {
                    const item = scheduleItems.find((candidate) => candidate.slotIndex === slotIndex && candidate.dayIndex === dayIndex);
                    return (
                      <div className="ledger-cell" key={`${slot}-${day}`}>
                        {item && (
                          <button
                            className={`ledger-post ledger-post-${item.tone.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                            type="button"
                            onClick={() => {
                              if (item.eventId) {
                                setSelectedEventId(item.eventId);
                                setDossierOpen(true);
                              } else {
                                navigate("/drafts");
                              }
                            }}
                          >
                            <span className="platform-cell">
                              <span className={`platform-mark ${platformClass(item.platform)}`}>{platformIcon(item.platform, 14)}</span>
                              <span>{platformLabel(item.platform)}</span>
                            </span>
                            <strong>{item.title}</strong>
                            <small>{item.detail}</small>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </section>
          <section className="review-queue-strip" aria-label="Review list">
            <div className="section-heading">
              <h2>Review Desk ({reviewDrafts.length})</h2>
              <button type="button" onClick={() => navigate("/drafts")}>View all</button>
            </div>
            <div className="review-card-row">
              {reviewDrafts.length === 0 ? <EmptyState title="Review list clear" body="No draft needs review." /> : reviewDrafts.map((draft, index) => (
                <button className="review-mini-card" key={draft.id} type="button" onClick={() => navigate("/drafts")}>
                  {draft.asset?.id ? <img src={`${apiBaseUrl()}/api/assets/${draft.asset.id}/file`} alt="" /> : <span aria-hidden="true" />}
                  <strong><span className={`platform-inline ${platformClass(draft.variants?.[0]?.platform)}`}>{platformIcon(draft.variants?.[0]?.platform, 14)}{platformLabel(draft.variants?.[0]?.platform)}</span></strong>
                  <small>{agencyFacingPackageTitle(draft.title, characterNames.get(draft.character_id))}</small>
                  <span className="review-due">Due: Today, {String(10 + index * 2).padStart(2, "0")}:00</span>
                  <em>{draft.status === "needs_review" ? "Review" : draft.status.replaceAll("_", " ")}</em>
                </button>
              ))}
            </div>
          </section>
          <details className="recent-runs-table publication-technical-audit">
            <summary>
              <span>Technical audit</span>
              <strong>Recent production activity</strong>
            </summary>
            <div className="section-heading">
              <h2>Recent production activity</h2>
            </div>
            <table>
              <thead><tr><th>Source</th><th>Status</th><th>Talent</th><th>Pipeline</th><th>Trigger</th><th>Started</th><th>Duration</th><th /></tr></thead>
              <tbody>
                {recentRows.map((draft, index) => (
                  <tr key={draft.id}>
                    <td>{shortRunId(draft.run_id ?? draft.id)}</td>
                    <td>{draft.status.replaceAll("_", " ")}</td>
                    <td>{shortRunId(draft.character_id)}</td>
                    <td>{draft.variants?.[0]?.post_format ?? "Content cycle"}</td>
                    <td>{index % 2 === 0 ? "Schedule" : "Manual"}</td>
                    <td>{formatDate(draft.created_at)}</td>
                    <td>00:0{index + 1}:4{index}</td>
                    <td>
                      {draft.run_id ? (
                        <button className="row-action" type="button" aria-label={`Open production log ${shortRunId(draft.run_id)}`} onClick={() => navigate(`/runs/${draft.run_id}`)}><Command aria-hidden="true" size={16} weight="regular" /></button>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </div>
        <aside className="publication-dossier-panel">
          <div className="dossier-heading">
            <span>Publication dossier</span>
            <div className="dossier-heading-actions">
              <button type="button" aria-label="Previous publication" onClick={() => goToEvent(-1)}><CaretLeft aria-hidden="true" size={16} weight="bold" /></button>
              <button type="button" aria-label="Next publication" onClick={() => goToEvent(1)}><CaretRight aria-hidden="true" size={16} weight="bold" /></button>
              <button type="button" aria-label="Close dossier" onClick={() => setDossierOpen(false)}><XIcon aria-hidden="true" size={16} weight="bold" /></button>
            </div>
          </div>
          {!selectedEvent ? <EmptyState title="No event selected" body="Select a publication event to log response." /> : (
            <div className="calendar-dossier">
              <div className="dossier-platform-row">
                <span className={`platform-mark ${platformClass(selectedEvent.platform)}`}>{platformIcon(selectedEvent.platform)}</span>
                <strong>{platformLabel(selectedEvent.platform)} Post</strong>
                <em>{selectedEvent.status.replaceAll("_", " ")}</em>
              </div>
              <div className={selectedAsset?.mime_type?.includes("svg") ? "dossier-media dossier-media-generated" : "dossier-media"}>
                {dossierImageUrl ? <img src={dossierImageUrl} alt={safeAssetAltText(selectedVariant?.alt_text, selectedPlacementTitle)} /> : <span>VA</span>}
              </div>
              <h2>{selectedDraft ? selectedPlacementTitle : selectedEvent.live_url ? "Live post" : "Ledger entry"}</h2>
              <p>{selectedPlacementCaption ?? selectedEvent.notes ?? "No notes recorded."}</p>
              <dl className="profile-facts calendar-facts">
                <div><dt>Talent</dt><dd>{selectedTalentName}</dd></div>
                <div><dt>Format</dt><dd>{(selectedVariant?.post_format ?? "single image").replaceAll("_", " ")}</dd></div>
                <div><dt>Tags</dt><dd>{selectedVariant?.hashtags ?? "None"}</dd></div>
                <div><dt>Status</dt><dd>{selectedEvent.status.replaceAll("_", " ")}</dd></div>
              </dl>
              <div className="approval-stack">
                <div><span className="approval-dot done" /><strong>Content Review</strong><small>{formatDate(selectedEvent.created_at)}</small></div>
                <div><span className="approval-dot" /><strong>Brand Review</strong><small>Pending</small></div>
                <div><span className="approval-dot" /><strong>Publish Approval</strong><small>Pending</small></div>
              </div>
              <div className="draft-primary-actions dossier-actions">
              <button className="primary-action" type="button" onClick={canLogResponse ? submitFeedback : () => navigate("/drafts")} disabled={!selectedEvent.id}>
                  {canLogResponse ? "Log Audience Response" : "Open Review Desk"}
                </button>
                {canLogResponse && <button type="button" onClick={() => navigate(`/feedback?eventId=${selectedEvent.id}`)}>Open Audience Response</button>}
                <button type="button" onClick={runReflection} disabled={!latestFeedbackId}>Debrief Audience Response</button>
              </div>
              <details className="raw-details publication-dossier-audit">
                <summary>Technical audit</summary>
                <dl className="profile-facts calendar-facts">
                  <div><dt>Source log</dt><dd>{shortRunId(selectedDraft?.run_id ?? selectedEvent.draft_id)}</dd></div>
                  <div><dt>Draft</dt><dd>{shortRunId(selectedEvent.draft_id)}</dd></div>
                </dl>
              </details>
            </div>
          )}
        </aside>
      </section>
    </>
  );
}

function FeedbackPage({ data, navigate, title = "Audience" }: { data: AppData; navigate: (path: string) => void; title?: string }) {
  const [events, setEvents] = useState<PublishingEvent[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [characterDetails, setCharacterDetails] = useState<CharacterDetail[]>([]);
  const [selectedEventId, setSelectedEventId] = useState(() => readFeedbackRouteState().eventId);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState("");
  const [latestFeedbackId, setLatestFeedbackId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState<string | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({
    impressions: "1200",
    reach: "900",
    likes: "80",
    comments: "12",
    shares: "7",
    saves: "18",
    profileVisits: "20",
    followsGained: "4",
    qualitativeNotes: "Audience response stayed aligned with the character premise.",
    topComments: "Consistent, useful, and visually clear.",
    operatorJudgment: "Repeat this direction with tighter variation."
  });
  const characterIdsKey = data.characters.map((character) => character.id).sort().join(",");

  async function loadAudienceData() {
    const [eventResponse, draftResponse] = await Promise.all([
      fetch(`${apiBaseUrl()}/api/publishing-events`),
      fetch(`${apiBaseUrl()}/api/drafts`)
    ]);
    if (!eventResponse.ok || !draftResponse.ok) throw new Error("Unable to load Audience.");
    const [eventPayload, draftPayload] = await Promise.all([
      eventResponse.json() as Promise<{ events: PublishingEvent[] }>,
      draftResponse.json() as Promise<{ drafts: Draft[] }>
    ]);
    const detailIds = Array.from(new Set([...data.characters.map((character) => character.id), ...draftPayload.drafts.map((draft) => draft.character_id)].filter(Boolean)));
    const detailPayloads = await Promise.all(
      detailIds.map(async (id) => {
        const response = await fetch(`${apiBaseUrl()}/api/characters/${id}`);
        if (!response.ok) throw new Error("Unable to load Audience talent details.");
        return response.json() as Promise<{ character: CharacterDetail }>;
      })
    );
    setEvents(eventPayload.events);
    setDrafts(draftPayload.drafts);
    setCharacterDetails(detailPayloads.map((payload) => payload.character));
    const dueEvent =
      eventPayload.events.find((event) => event.status === "needs_feedback") ??
      eventPayload.events.find((event) => event.status === "published" || event.published_at) ??
      eventPayload.events[0];
    setSelectedEventId((current) => current || dueEvent?.id || "");
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [eventResponse, draftResponse] = await Promise.all([
          fetch(`${apiBaseUrl()}/api/publishing-events`),
          fetch(`${apiBaseUrl()}/api/drafts`)
        ]);
        if (!eventResponse.ok || !draftResponse.ok) throw new Error("Unable to load Audience.");
        const [eventPayload, draftPayload] = await Promise.all([
          eventResponse.json() as Promise<{ events: PublishingEvent[] }>,
          draftResponse.json() as Promise<{ drafts: Draft[] }>
        ]);
        const detailIds = Array.from(new Set([...data.characters.map((character) => character.id), ...draftPayload.drafts.map((draft) => draft.character_id)].filter(Boolean)));
        const detailPayloads = await Promise.all(
          detailIds.map(async (id) => {
            const response = await fetch(`${apiBaseUrl()}/api/characters/${id}`);
            if (!response.ok) throw new Error("Unable to load Audience talent details.");
            return response.json() as Promise<{ character: CharacterDetail }>;
          })
        );
        if (!active) return;
        setEvents(eventPayload.events);
        setDrafts(draftPayload.drafts);
        setCharacterDetails(detailPayloads.map((payload) => payload.character));
        const dueEvent =
          eventPayload.events.find((event) => event.status === "needs_feedback") ??
          eventPayload.events.find((event) => event.status === "published" || event.published_at) ??
          eventPayload.events[0];
        setSelectedEventId((current) => current || dueEvent?.id || "");
        setError(null);
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : "Unable to load Audience.");
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [characterIdsKey]);

  const updateFeedback = (key: keyof typeof feedbackForm, value: string) => setFeedbackForm({ ...feedbackForm, [key]: value });
  const charactersById = useMemo(() => new Map(characterDetails.map((character) => [character.id, character])), [characterDetails]);
  const audienceDebriefs = useMemo(() => buildAudienceDebriefModels(characterDetails), [characterDetails]);
  const strategyBoard = useMemo(
    () => buildStrategyBoardModel(characterDetails.length ? characterDetails : data.characters, data.runs),
    [characterDetails, data.characters, data.runs]
  );
  const feedbackEvents = events.filter((event) => event.status === "needs_feedback" || event.status === "published" || Boolean(event.published_at));
  const selectedEvent =
    feedbackEvents.find((event) => event.id === selectedEventId) ??
    events.find((event) => event.id === selectedEventId) ??
    feedbackEvents[0] ??
    null;
  const selectedDebrief =
    audienceDebriefs.find((debrief) => debrief.feedbackId === selectedFeedbackId) ??
    audienceDebriefs.find((debrief) => debrief.technicalSource.publishingEventId === selectedEventId) ??
    audienceDebriefs[0] ??
    null;
  const selectedDraft = drafts.find((draft) => draft.id === selectedEvent?.draft_id) ?? null;
  const selectedVariant = selectedDraft?.variants?.find((variant) => variant.platform === selectedEvent?.platform) ?? selectedDraft?.variants?.[0] ?? null;
  const selectedAsset = selectedDraft?.asset ?? null;
  const selectedCharacter =
    (selectedDraft?.character_id ? charactersById.get(selectedDraft.character_id) : null) ??
    data.characters.find((character) => character.id === selectedDraft?.character_id) ??
    null;
  const selectedDebriefHasReflection = Boolean(selectedDebrief?.technicalSource.reflectionId);
  const debriefFeedbackId = latestFeedbackId || (!selectedDebriefHasReflection ? selectedDebrief?.feedbackId ?? "" : "");
  const pendingCareerDirectionCount = characterDetails.reduce((count, character) => count + character.identityProposals.filter((proposal) => proposal.status === "proposed").length, 0);
  const topStrategyTalent = strategyBoard.lanes.find((lane) => lane.talent.length)?.talent[0] ?? null;

  function chooseEvent(eventId: string) {
    setSelectedEventId(eventId);
    setSelectedFeedbackId("");
    replaceRouteQuery("/insights", { eventId });
  }

  function chooseDebrief(debrief: AudienceDebriefModel) {
    setSelectedFeedbackId(debrief.feedbackId);
    if (debrief.technicalSource.publishingEventId) {
      setSelectedEventId(debrief.technicalSource.publishingEventId);
      replaceRouteQuery("/insights", { eventId: debrief.technicalSource.publishingEventId });
    }
  }

  async function submitFeedback() {
    if (!selectedEvent) return;
    setError(null);
    setMessage(null);
    try {
      const payload = await postJson<{ feedback: SocialFeedback }>(`/api/publishing-events/${selectedEvent.id}/feedback`, {
        impressions: Number(feedbackForm.impressions),
        reach: Number(feedbackForm.reach),
        likes: Number(feedbackForm.likes),
        comments: Number(feedbackForm.comments),
        shares: Number(feedbackForm.shares),
        saves: Number(feedbackForm.saves),
        profileVisits: Number(feedbackForm.profileVisits),
        followsGained: Number(feedbackForm.followsGained),
        qualitativeNotes: feedbackForm.qualitativeNotes,
        topComments: feedbackForm.topComments,
        operatorJudgment: feedbackForm.operatorJudgment
      });
      setLatestFeedbackId(payload.feedback.id);
      setSelectedFeedbackId(payload.feedback.id);
      setMessage("Audience response logged. Review the debrief or run the career-direction pass.");
      await loadAudienceData();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to log feedback.");
    }
  }

  async function runReflection() {
    if (!debriefFeedbackId) return;
    setError(null);
    setMessage(null);
    setActionPending(`reflection:${debriefFeedbackId}`);
    try {
      await postJson<{ run: RunSummary; reflection: ReflectionEntry; proposals: IdentityProposal[] }>(`/api/feedback/${debriefFeedbackId}/reflection-run`, {});
      setLatestFeedbackId("");
      setSelectedFeedbackId(debriefFeedbackId);
      setMessage("Audience debrief created. Career Direction proposals are ready for director review.");
      await loadAudienceData();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to run reflection.");
    } finally {
      setActionPending(null);
    }
  }

  async function reviewAudienceProposal(proposal: IdentityProposal, status: "approved" | "rejected") {
    setError(null);
    setMessage(null);
    setActionPending(`proposal:${proposal.id}:${status}`);
    try {
      await postJson(`/api/identity-proposals/${proposal.id}/review`, {
        status,
        constitutionChangeReason: proposal.kind === "constitution_patch" && status === "approved" ? "Approved from Audience Debrief." : undefined
      });
      setMessage(status === "approved" ? "Career direction approved." : "Audience signal ignored.");
      await loadAudienceData();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to review career direction.");
    } finally {
      setActionPending(null);
    }
  }

  return (
    <>
      <header className="topbar page-heading">
        <div>
          <h1>{title}</h1>
          <p>What did the public tell us about this talent?</p>
        </div>
      </header>
      {message && <div className="notice">{message}</div>}
      {error && <div className="notice error">{error}</div>}
      <StageHandoff data={data} stageId="feedback" navigate={navigate} />
      <section className="feedback-command audience-command" aria-label="Audience command">
        <article>
          <span>Audience result</span>
          <strong>{selectedDebrief?.result.label ?? "Unknown"}</strong>
          <p>{selectedDebrief?.summary ?? "No audience response has been logged yet."}</p>
        </article>
        <article>
          <span>Career direction</span>
          <strong>{pendingCareerDirectionCount}</strong>
          <p>{pendingCareerDirectionCount === 1 ? "proposal waiting for director review" : "proposals waiting for director review"}</p>
        </article>
        <article>
          <span>Strategy board</span>
          <strong>{topStrategyTalent?.displayName ?? "No leader"}</strong>
          <p>{topStrategyTalent ? `${agencyPriorityLabel(topStrategyTalent.agencyPriority)} · ${topStrategyTalent.recommendedInvestment}` : "Publish and log response to rank talent."}</p>
        </article>
      </section>
      <section className="feedback-workbench audience-workbench">
        <aside className="audience-side-stack">
          <article className="settings-preview feedback-queue audience-debrief-queue">
            <div className="section-heading"><h2>Audience Debriefs</h2><span>{audienceDebriefs.length}</span></div>
            {audienceDebriefs.length === 0 ? (
              <EmptyState title="No debriefs yet" body="Log public response from a live placement to create the first Audience Debrief." />
            ) : (
              <div className="compact-list">
                {audienceDebriefs.map((debrief) => (
                  <button className={`run-row${selectedDebrief?.feedbackId === debrief.feedbackId ? " selected" : ""}`} key={debrief.feedbackId} type="button" onClick={() => chooseDebrief(debrief)}>
                    <span>
                      <strong>{debrief.talentName}</strong>
                      <small>{debrief.platform} · {debrief.metrics.engagementRateLabel}</small>
                    </span>
                    <em className={`audience-result-pill ${debrief.result.id}`}>{debrief.result.label}</em>
                  </button>
                ))}
              </div>
            )}
          </article>

          <article className="settings-preview feedback-queue">
            <div className="section-heading"><h2>Live Placements</h2><span>{feedbackEvents.length}</span></div>
            {feedbackEvents.length === 0 ? (
              <EmptyState title="No live placements" body="Mark a social package live from Publishing before logging audience response." />
            ) : (
              <div className="compact-list">
                {feedbackEvents.map((event) => (
                  <button className={`run-row${selectedEvent?.id === event.id ? " selected" : ""}`} key={event.id} type="button" onClick={() => chooseEvent(event.id)}>
                    <span>
                      <strong>{platformLabel(event.platform)} · {event.status.replaceAll("_", " ")}</strong>
                      <small>{formatDate(event.published_at ?? event.created_at)}</small>
                    </span>
                    <em className={statusClass(event.status)}>{event.status.replaceAll("_", " ")}</em>
                  </button>
                ))}
              </div>
            )}
          </article>
        </aside>

        <article className="settings-preview audience-debrief-panel">
          <div className="section-heading">
            <h2>Audience Debrief</h2>
            <button type="button" onClick={runReflection} disabled={!debriefFeedbackId || actionPending === `reflection:${debriefFeedbackId}`}>
              Debrief Audience Response
            </button>
          </div>
          {!selectedDebrief ? (
            <EmptyState title="No public response yet" body="Log audience response from a live placement to see what worked, what failed, and what should change next." />
          ) : (
            <div className="audience-debrief-body">
              <div className="audience-result-card">
                <span className={`audience-result-pill ${selectedDebrief.result.id}`}>{selectedDebrief.result.label}</span>
                <div>
                  <h2>{selectedDebrief.talentName}</h2>
                  <p>{selectedDebrief.summary}</p>
                </div>
              </div>
              <div className="audience-debrief-grid">
                <section>
                  <span>What worked</span>
                  <ul>{selectedDebrief.whatWorked.map((item) => <li key={item}>{item}</li>)}</ul>
                </section>
                <section>
                  <span>What failed</span>
                  <ul>{selectedDebrief.whatFailed.map((item) => <li key={item}>{item}</li>)}</ul>
                </section>
                <section>
                  <span>Comment themes</span>
                  <ul>{selectedDebrief.commentThemes.map((item) => <li key={item}>{item}</li>)}</ul>
                </section>
                <section>
                  <span>Recommended next test</span>
                  <p>{selectedDebrief.recommendedNextTest}</p>
                </section>
              </div>
              <section className="audience-career-direction">
                <div>
                  <span>Meaning for talent</span>
                  <p>{selectedDebrief.meaningForTalent}</p>
                </div>
                <div>
                  <span>Career Direction</span>
                  <strong>{selectedDebrief.careerDirection.label}</strong>
                  <p>{selectedDebrief.careerDirection.body}</p>
                  <small>{selectedDebrief.careerDirection.rationale}</small>
                </div>
                {selectedDebrief.pendingProposals.length > 0 && (
                  <div className="audience-proposal-actions">
                    {selectedDebrief.pendingProposals.map((proposal) => (
                      <div key={proposal.id}>
                        <strong>{proposalDirectionLabel(proposal)}</strong>
                        <p>{compactInlineText(proposal.body, 180)}</p>
                        <div className="draft-primary-actions">
                          <button
                            className="primary-action"
                            type="button"
                            onClick={() => reviewAudienceProposal(proposal, "approved")}
                            disabled={Boolean(actionPending)}
                          >
                            {proposalActionLabel(proposal)}
                          </button>
                          <button type="button" onClick={() => reviewAudienceProposal(proposal, "rejected")} disabled={Boolean(actionPending)}>
                            Ignore Signal
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
              <details className="raw-details audience-metrics-detail">
                <summary>Metrics detail</summary>
                <dl className="metrics-detail-grid">
                  <div><dt>Impressions</dt><dd>{selectedDebrief.metrics.impressions}</dd></div>
                  <div><dt>Reach</dt><dd>{selectedDebrief.metrics.reach}</dd></div>
                  <div><dt>Engagement</dt><dd>{selectedDebrief.metrics.engagement}</dd></div>
                  <div><dt>Engagement rate</dt><dd>{selectedDebrief.metrics.engagementRateLabel}</dd></div>
                  <div><dt>Likes</dt><dd>{selectedDebrief.metrics.likes}</dd></div>
                  <div><dt>Comments</dt><dd>{selectedDebrief.metrics.comments}</dd></div>
                  <div><dt>Shares</dt><dd>{selectedDebrief.metrics.shares}</dd></div>
                  <div><dt>Saves</dt><dd>{selectedDebrief.metrics.saves}</dd></div>
                  <div><dt>Profile visits</dt><dd>{selectedDebrief.metrics.profileVisits}</dd></div>
                  <div><dt>Follows gained</dt><dd>{selectedDebrief.metrics.followsGained}</dd></div>
                </dl>
              </details>
              <JsonDetails value={selectedDebrief.technicalAudit} />
            </div>
          )}
        </article>
      </section>

      <section className="settings-preview audience-strategy-board">
        <div className="section-heading">
          <h2>Strategy / Star Board</h2>
          <button type="button" onClick={() => navigate("/talent")}>Open Roster</button>
        </div>
        <div className="strategy-summary-grid">
          <article><span>Represented talent</span><strong>{strategyBoard.summary.representedTalent}</strong></article>
          <article><span>Push</span><strong>{strategyBoard.summary.pushCount}</strong></article>
          <article><span>Development bets</span><strong>{strategyBoard.summary.developmentCount}</strong></article>
          <article><span>At risk</span><strong>{strategyBoard.summary.riskCount}</strong></article>
        </div>
        <div className="strategy-lanes">
          {strategyBoard.lanes.map((lane) => (
            <article className={`strategy-lane ${lane.id}`} key={lane.id}>
              <div className="strategy-lane-heading">
                <span>{lane.label}</span>
                <strong>{lane.talent.length}</strong>
                <small>{lane.detail}</small>
              </div>
              {lane.talent.length === 0 ? (
                <p className="strategy-empty">No talent in this lane.</p>
              ) : (
                lane.talent.map((talent) => (
                  <div className="strategy-talent" key={talent.talentId}>
                    <div>
                      <strong>{talent.displayName}</strong>
                      <em>{agencyPriorityLabel(talent.agencyPriority)}</em>
                    </div>
                    <p>{talent.recommendedInvestment}</p>
                    <dl>
                      <div><dt>Momentum</dt><dd>{talent.momentum}</dd></div>
                      <div><dt>Audience pull</dt><dd>{talent.audiencePull}</dd></div>
                      <div><dt>Identity strength</dt><dd>{talent.identityStrength}</dd></div>
                      <div><dt>Platform fit</dt><dd>{talent.platformFit}</dd></div>
                      <div><dt>Development risk</dt><dd>{talent.developmentRisk}</dd></div>
                    </dl>
                    <button type="button" onClick={() => navigate(`/characters/${talent.talentId}`)}>{talent.nextMove}</button>
                  </div>
                ))
              )}
            </article>
          ))}
        </div>
        <details className="raw-details">
          <summary>Strategy derivation</summary>
          <pre>{JSON.stringify(strategyBoard.technicalAudit, null, 2)}</pre>
        </details>
      </section>

      <section className="feedback-workbench audience-log-workbench">
        <article className="settings-preview feedback-dossier audience-log-panel">
          <div className="section-heading"><h2>Log New Response</h2></div>
          {!selectedEvent ? (
            <EmptyState title="No event selected" body="Open Publishing and mark a draft published first." />
          ) : (
            <div className="asset-detail">
              {selectedAsset?.id && <img src={`${apiBaseUrl()}/api/assets/${selectedAsset.id}/file`} alt={safeAssetAltText(selectedVariant?.alt_text, selectedDraft?.title ?? "Published asset")} />}
              <div className="score-row">
                <span className={statusClass(selectedEvent.status)}>{selectedEvent.status.replaceAll("_", " ")}</span>
                <span>{selectedCharacter ? displayModelName(selectedCharacter.name) : "Unknown character"}</span>
              </div>
              <p className="action-copy">{selectedVariant?.caption ?? selectedEvent.notes ?? "No caption recorded."}</p>
              <div className="metric-grid">
                <label>Impressions<input type="number" value={feedbackForm.impressions} onChange={(event) => updateFeedback("impressions", event.target.value)} /></label>
                <label>Reach<input type="number" value={feedbackForm.reach} onChange={(event) => updateFeedback("reach", event.target.value)} /></label>
                <label>Likes<input type="number" value={feedbackForm.likes} onChange={(event) => updateFeedback("likes", event.target.value)} /></label>
                <label>Comments<input type="number" value={feedbackForm.comments} onChange={(event) => updateFeedback("comments", event.target.value)} /></label>
                <label>Shares<input type="number" value={feedbackForm.shares} onChange={(event) => updateFeedback("shares", event.target.value)} /></label>
                <label>Saves<input type="number" value={feedbackForm.saves} onChange={(event) => updateFeedback("saves", event.target.value)} /></label>
                <label>Profile visits<input type="number" value={feedbackForm.profileVisits} onChange={(event) => updateFeedback("profileVisits", event.target.value)} /></label>
                <label>Follows<input type="number" value={feedbackForm.followsGained} onChange={(event) => updateFeedback("followsGained", event.target.value)} /></label>
              </div>
              <div className="form-stack">
                <label>Qualitative notes<textarea value={feedbackForm.qualitativeNotes} onChange={(event) => updateFeedback("qualitativeNotes", event.target.value)} /></label>
                <label>Top comments<textarea value={feedbackForm.topComments} onChange={(event) => updateFeedback("topComments", event.target.value)} /></label>
                <label>Director judgment<textarea value={feedbackForm.operatorJudgment} onChange={(event) => updateFeedback("operatorJudgment", event.target.value)} /></label>
              </div>
              <div className="draft-primary-actions">
                <button className="primary-action" type="button" onClick={submitFeedback}>Log Audience Response</button>
                <button type="button" onClick={runReflection} disabled={!latestFeedbackId}>Debrief Audience Response</button>
                <button type="button" onClick={() => navigate(selectedCharacter ? `/characters/${selectedCharacter.id}` : "/talent")}>Career Direction</button>
              </div>
            </div>
          )}
        </article>
      </section>
    </>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <>
      <header className="topbar page-heading">
        <div>
          <h1>{title}</h1>
        </div>
      </header>
      <EmptyState title={`${title} is not ready`} body="Follow the build pack." />
    </>
  );
}

const helpWorkflow = [
  {
    label: "Director's Desk",
    path: "/",
    intent: "Start here when you are unsure what needs attention.",
    operatorAction: "Check today's decisions, active production, review-ready work, and blocked studio jobs."
  },
  {
    label: "Scouting",
    path: "/create",
    intent: "Scout New Faces and open new agency work.",
    operatorAction: "Choose the kind of talent or work to start before dropping into a detailed tool."
  },
  {
    label: "Bookings",
    path: "/prompt-studio",
    intent: "Plan creative assignments for represented talent.",
    operatorAction: "Propose booking ideas, create shoot briefs, and prepare creative treatments."
  },
  {
    label: "Review Desk",
    path: "/review",
    intent: "Judge prepared work before it moves forward.",
    operatorAction: "Approve, revise, or reject work that is waiting on director approval."
  },
  {
    label: "Publishing",
    path: "/calendar",
    intent: "Plan placements and record what went live.",
    operatorAction: "Inspect planned placements, packages, and manual publishing state."
  },
  {
    label: "Portfolio",
    path: "/library",
    intent: "Find candidate shots, references, and approved work.",
    operatorAction: "Browse talent, portfolio shots, references, and production-ready material."
  },
  {
    label: "Roster",
    path: "/talent",
    intent: "Manage represented talent and identity decisions.",
    operatorAction: "Review talent setup, appearance, voice, public story, lived experience, and proposals."
  },
  {
    label: "Audience",
    path: "/insights",
    intent: "Understand public response and iteration history.",
    operatorAction: "Log audience response, launch audience debriefs, and inspect what the studio learned."
  }
];

const helpSupport = [
  ["Studio Ops", "Configure provider routing, studio schedule, workflow engines, and production logs."],
  ["Talent detail pages", "Edit identity bible, references, voice, lived experience, and proposals after entering Roster."],
  ["Production Log detail", "Trace RunEvents, provider jobs, artifacts, decisions, and failures without changing publishing state."]
];

function HelpPage({ navigate }: { navigate: (path: string) => void }) {
  return (
    <>
      <header className="topbar page-heading">
        <div>
          <p className="eyebrow">Agency guide</p>
          <h1>How Virtual Agency Studio works</h1>
          <p>VAS is a local-first operating desk for scouting, developing, booking, reviewing, publishing, and evolving virtual talent.</p>
        </div>
      </header>

      <section className="help-shell">
        <article className="help-intro">
          <div>
            <span>Core idea</span>
            <h2>One character moves through a repeatable production cycle.</h2>
            <p>
              The system is not a generic dashboard. It is an agency workflow for scouting talent, producing portfolio shots,
              reviewing social packages, publishing manually, logging audience response, and using that response to propose career evolution.
            </p>
          </div>
          <div className="help-quick-start">
            <span>First session</span>
            <ol>
              <li>Start in Scouting when a new face or new agency work should begin.</li>
              <li>Use Director's Desk to see current decisions and anything needing attention.</li>
              <li>Use Review Desk to approve, revise, or reject prepared work.</li>
              <li>Use Publishing to plan or record manual placements.</li>
              <li>Use Audience to log response and review what the studio learned.</li>
            </ol>
          </div>
        </article>

        <section className="help-principles" aria-label="Agency principles">
          <article>
            <span>01</span>
            <strong>Production logs are the audit trail</strong>
            <p>Every automated action should create readable RunEvents so the director can inspect what happened and why.</p>
          </article>
          <article>
            <span>02</span>
            <strong>Publication stays manual</strong>
            <p>VAS prepares packages and ledger entries, but the director decides when and where something goes live.</p>
          </article>
          <article>
            <span>03</span>
            <strong>Identity changes are gated</strong>
            <p>Public story, lived experience, and Identity Bible changes are proposals until the director approves them.</p>
          </article>
        </section>

        <section className="help-workflow" aria-label="VAS workflow stages">
          <div className="section-heading">
            <span>Workflow</span>
            <h2>The agency cycle</h2>
          </div>
          <div className="help-stage-list">
            {helpWorkflow.map((stage, index) => (
              <article key={stage.label}>
                <div className="help-stage-index">{String(index + 1).padStart(2, "0")}</div>
                <div>
                  <h3>{stage.label}</h3>
                  <p>{stage.intent}</p>
                  <small>{stage.operatorAction}</small>
                </div>
                <button type="button" onClick={() => navigate(stage.path)}>
                  Open
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="help-reference-grid">
          <article>
            <div className="section-heading">
              <span>Support tools</span>
              <h2>Where the extra nav items fit</h2>
            </div>
            <dl>
              {helpSupport.map(([term, description]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{description}</dd>
                </div>
              ))}
            </dl>
          </article>
          <article>
            <div className="section-heading">
              <span>Status language</span>
              <h2>How to read blockers</h2>
            </div>
            <dl>
              <div>
                <dt>Attention</dt>
                <dd>Something needs a director decision, usually a review gate, social package, portfolio shot, or audience item.</dd>
              </div>
              <div>
                <dt>Ready</dt>
                <dd>The stage has enough input to proceed, but it is not urgent.</dd>
              </div>
              <div>
                <dt>Blocked</dt>
                <dd>An earlier stage must be completed before this stage can produce useful work.</dd>
              </div>
              <div>
                <dt>Complete</dt>
                <dd>The stage has produced usable output for the current cycle.</dd>
              </div>
            </dl>
          </article>
        </section>
      </section>
    </>
  );
}

function SettingsPage({ data, navigate }: { data: AppData; navigate: (path: string) => void }) {
  const [settings, setSettings] = useState<ProviderSettings | null>(null);
  const [savedSettings, setSavedSettings] = useState<ProviderSettings | null>(null);
  const [automationSettings, setAutomationSettings] = useState<AutomationSettings | null>(null);
  const [savedAutomationSettings, setSavedAutomationSettings] = useState<AutomationSettings | null>(null);
  const [automationStatus, setAutomationStatus] = useState<AutomationStatus | null>(null);
  const [characters, setCharacters] = useState<CharacterSummary[]>([]);
  const [manualRecipes, setManualRecipes] = useState<PromptRecipe[]>([]);
  const [manualAssets, setManualAssets] = useState<ImageAsset[]>([]);
  const [manualCharacterId, setManualCharacterId] = useState("");
  const [manualPromptRecipeId, setManualPromptRecipeId] = useState("");
  const [manualAssetId, setManualAssetId] = useState("");
  const [hermesApiKey, setHermesApiKey] = useState("");
  const [comfyuiCloudApiKey, setComfyuiCloudApiKey] = useState("");
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [wavespeedApiKey, setWavespeedApiKey] = useState("");
  const [workflows, setWorkflows] = useState<ComfyWorkflow[]>([]);
  const [workflowForm, setWorkflowForm] = useState({
    id: "",
    name: "",
    workflowText: "{}",
    positivePromptNode: "",
    positivePromptInput: "text",
    negativePromptNode: "",
    negativePromptInput: "text",
    seedNode: "",
    seedInput: "seed",
    referenceImageNode: "",
    referenceImageInput: "image",
    outputNodeIds: "",
    defaultForTiers: "sfw_standard"
  });
  const [settingsView, setSettingsView] = useState<SettingsView>("overview");
  const [workflowEditorOpen, setWorkflowEditorOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [providerResponse, automationResponse, workflowResponse, recipesResponse, assetsResponse] = await Promise.all([
      fetch(`${apiBaseUrl()}/api/settings/providers`),
      fetch(`${apiBaseUrl()}/api/settings/automation`),
      fetch(`${apiBaseUrl()}/api/settings/comfy-workflows`),
      fetch(`${apiBaseUrl()}/api/prompt-recipes`),
      fetch(`${apiBaseUrl()}/api/assets`)
    ]);
    if (!providerResponse.ok || !automationResponse.ok || !workflowResponse.ok || !recipesResponse.ok || !assetsResponse.ok) {
      throw new Error("Unable to load settings.");
    }
    const providerPayload = (await providerResponse.json()) as { settings: ProviderSettings };
    const automationPayload = (await automationResponse.json()) as {
      settings: AutomationSettings;
      status: AutomationStatus;
      characters: CharacterSummary[];
    };
    const workflowPayload = (await workflowResponse.json()) as { workflows: ComfyWorkflow[] };
    const recipesPayload = (await recipesResponse.json()) as { recipes: PromptRecipe[] };
    const assetsPayload = (await assetsResponse.json()) as { assets: ImageAsset[] };
    const initialCharacterId = automationPayload.settings.defaultCharacterIds[0] || automationPayload.characters[0]?.id || "";
    const selectedCharacterId = manualCharacterId || initialCharacterId;
    const firstRecipe = recipesPayload.recipes.find((recipe) => !selectedCharacterId || recipe.character_id === selectedCharacterId);
    const firstAsset = assetsPayload.assets.find((asset) => !selectedCharacterId || asset.character_id === selectedCharacterId);
    setSettings(providerPayload.settings);
    setSavedSettings(providerPayload.settings);
    setAutomationSettings(automationPayload.settings);
    setSavedAutomationSettings(automationPayload.settings);
    setAutomationStatus(automationPayload.status);
    setCharacters(automationPayload.characters);
    setWorkflows(workflowPayload.workflows);
    setManualRecipes(recipesPayload.recipes);
    setManualAssets(assetsPayload.assets);
    setManualCharacterId((current) => current || initialCharacterId);
    setManualPromptRecipeId((current) => current || firstRecipe?.id || "");
    setManualAssetId((current) => current || firstAsset?.id || "");
  }

  useEffect(() => {
    load().catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load provider settings."));
  }, []);

  useEffect(() => {
    if (!manualCharacterId) return;
    const characterRecipes = manualRecipes.filter((recipe) => recipe.character_id === manualCharacterId);
    if (characterRecipes.length === 0) {
      setManualPromptRecipeId("");
    } else if (!characterRecipes.some((recipe) => recipe.id === manualPromptRecipeId)) {
      setManualPromptRecipeId(characterRecipes[0].id);
    }
    const characterAssets = manualAssets.filter((asset) => asset.character_id === manualCharacterId);
    if (characterAssets.length === 0) {
      setManualAssetId("");
    } else if (!characterAssets.some((asset) => asset.id === manualAssetId)) {
      setManualAssetId(characterAssets[0].id);
    }
  }, [manualAssets, manualAssetId, manualCharacterId, manualPromptRecipeId, manualRecipes]);

  async function save() {
    if (!settings) return;
    setError(null);
    setMessage(null);
    try {
      const payload = await patchJson<{ settings: ProviderSettings }>("/api/settings/providers", {
        ...settings,
        ...(hermesApiKey ? { hermesApiKey } : {}),
        ...(comfyuiCloudApiKey ? { comfyuiCloudApiKey } : {}),
        ...(openaiApiKey ? { openaiApiKey } : {}),
        ...(wavespeedApiKey ? { wavespeedApiKey } : {})
      });
      setSettings(payload.settings);
      setSavedSettings(payload.settings);
      setHermesApiKey("");
      setComfyuiCloudApiKey("");
      setOpenaiApiKey("");
      setWavespeedApiKey("");
      setMessage("Provider settings saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save provider settings.");
    }
  }

  async function testProvider(capability: "image_generation" | "image_analysis") {
    if (routingDirty) {
      setError("Save routing before testing providers.");
      return;
    }
    setError(null);
    setMessage(null);
    try {
      const result = await postJson<{ ok: boolean; runId?: string; error?: string }>("/api/settings/providers/test", { capability });
      if (result.ok) {
        setMessage(`${capability.replace("_", " ")} provider test passed.`);
      } else {
        setError(result.error ?? "Provider test failed.");
      }
      if (result.runId) navigate(`/runs/${result.runId}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Provider test failed.");
    }
  }

  function workflowPayloadFromForm() {
    return {
      name: workflowForm.name.trim(),
      workflow: JSON.parse(workflowForm.workflowText || "{}") as Record<string, unknown>,
      positivePromptNode: workflowForm.positivePromptNode.trim(),
      positivePromptInput: workflowForm.positivePromptInput.trim(),
      negativePromptNode: workflowForm.negativePromptNode.trim(),
      negativePromptInput: workflowForm.negativePromptInput.trim(),
      seedNode: workflowForm.seedNode.trim(),
      seedInput: workflowForm.seedInput.trim(),
      referenceImageNode: workflowForm.referenceImageNode.trim(),
      referenceImageInput: workflowForm.referenceImageInput.trim(),
      outputNodeIds: workflowForm.outputNodeIds.split(",").map((item) => item.trim()).filter(Boolean),
      defaultForTiers: workflowForm.defaultForTiers.split(",").map((item) => item.trim()).filter(Boolean)
    };
  }

  function editWorkflow(workflow: ComfyWorkflow) {
    setWorkflowForm({
      id: workflow.id,
      name: workflow.name,
      workflowText: JSON.stringify(workflow.workflow, null, 2),
      positivePromptNode: workflow.positive_prompt_node ?? "",
      positivePromptInput: workflow.positive_prompt_input ?? "text",
      negativePromptNode: workflow.negative_prompt_node ?? "",
      negativePromptInput: workflow.negative_prompt_input ?? "text",
      seedNode: workflow.seed_node ?? "",
      seedInput: workflow.seed_input ?? "seed",
      referenceImageNode: workflow.reference_image_node ?? "",
      referenceImageInput: workflow.reference_image_input ?? "image",
      outputNodeIds: workflow.output_node_ids.join(", "),
      defaultForTiers: workflow.default_for_tiers.join(", ") || "sfw_standard"
    });
    setWorkflowEditorOpen(true);
    setSettingsView("workflows");
  }

  function resetWorkflowForm() {
    setWorkflowForm({
      id: "",
      name: "",
      workflowText: "{}",
      positivePromptNode: "",
      positivePromptInput: "text",
      negativePromptNode: "",
      negativePromptInput: "text",
      seedNode: "",
      seedInput: "seed",
      referenceImageNode: "",
      referenceImageInput: "image",
      outputNodeIds: "",
      defaultForTiers: "sfw_standard"
    });
    setWorkflowEditorOpen(true);
    setSettingsView("workflows");
  }

  async function saveWorkflow() {
    setError(null);
    setMessage(null);
    try {
      const payload = workflowPayloadFromForm();
      if (!payload.name) throw new Error("Workflow name is required.");
      const response = workflowForm.id
        ? await patchJson<{ workflow: ComfyWorkflow; validation: { valid: boolean; error: string | null } }>(`/api/settings/comfy-workflows/${workflowForm.id}`, payload)
        : await postJson<{ workflow: ComfyWorkflow; validation: { valid: boolean; error: string | null } }>("/api/settings/comfy-workflows", payload);
      setMessage(response.validation.valid ? "Comfy workflow saved." : `Workflow saved as invalid: ${response.validation.error}`);
      await load();
      editWorkflow(response.workflow);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save Comfy workflow.");
    }
  }

  async function validateWorkflow(workflowId: string) {
    setError(null);
    setMessage(null);
    try {
      const payload = await postJson<{ workflow: ComfyWorkflow; validation: { valid: boolean; error: string | null } }>(`/api/settings/comfy-workflows/${workflowId}/validate`, {});
      setMessage(payload.validation.valid ? "Workflow validated." : `Workflow invalid: ${payload.validation.error}`);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to validate workflow.");
    }
  }

  async function activateWorkflow(workflowId: string, tier: string) {
    setError(null);
    setMessage(null);
    try {
      await postJson<{ workflow: ComfyWorkflow }>(`/api/settings/comfy-workflows/${workflowId}/activate`, { tier });
      setMessage(`Workflow activated for ${tier.replaceAll("_", " ")}.`);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to activate workflow.");
    }
  }

  async function testWorkflow(workflowId: string) {
    setError(null);
    setMessage(null);
    try {
      const payload = await postJson<{ ok: boolean; runId: string; error?: string }>(`/api/settings/comfy-workflows/${workflowId}/test`, {});
      if (payload.ok) setMessage("Comfy workflow test passed.");
      else setError(payload.error ?? "Comfy workflow test failed.");
      navigate(`/runs/${payload.runId}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Comfy workflow test failed.");
    }
  }

  if (!settings || !automationSettings) {
    return <div className={error ? "notice error" : "notice"}>{error ?? "Loading settings."}</div>;
  }

  const update = (patch: Partial<ProviderSettings>) => setSettings({ ...settings, ...patch });
  const updateAutomation = (patch: Partial<AutomationSettings>) => setAutomationSettings({ ...automationSettings, ...patch });
  const routingDirty = Boolean(
    savedSettings &&
      (JSON.stringify(settings) !== JSON.stringify(savedSettings) ||
        hermesApiKey ||
        comfyuiCloudApiKey ||
        openaiApiKey ||
        wavespeedApiKey)
  );
  const automationDirty = Boolean(savedAutomationSettings && JSON.stringify(automationSettings) !== JSON.stringify(savedAutomationSettings));
  const resetRouting = () => {
    if (!savedSettings) return;
    setSettings(savedSettings);
    setHermesApiKey("");
    setComfyuiCloudApiKey("");
    setOpenaiApiKey("");
    setWavespeedApiKey("");
    setMessage("Routing edits reset.");
  };
  const resetAutomation = () => {
    if (!savedAutomationSettings) return;
    setAutomationSettings(savedAutomationSettings);
    setMessage("Automation edits reset.");
  };
  const selectedCharacters = new Set(automationSettings.defaultCharacterIds);
  const toggleDefaultCharacter = (characterId: string) => {
    const next = new Set(selectedCharacters);
    if (next.has(characterId)) next.delete(characterId);
    else next.add(characterId);
    updateAutomation({ defaultCharacterIds: Array.from(next) });
  };
  const defaultPlatformsText = automationSettings.defaultPlatforms.join(", ");
  const configuredProviderCount = [
    settings.hasHermesApiKey,
    settings.comfyuiCloudReady,
    settings.hasOpenaiApiKey,
    settings.hasWavespeedApiKey
  ].filter(Boolean).length;
  const imageProviderNeedsComfyWorkflow =
    !settings.mockProviders && settings.defaultImageGenerationProvider === "comfyui-cloud" && !settings.comfyuiCloudReady;
  const studioOps = buildStudioOpsModel({
    data,
    settings,
    automationSettings,
    automationStatus,
    workflows,
    promptRecipes: manualRecipes,
    assets: manualAssets
  });
  const selectedDefaultCharacterNames = characters
    .filter((character) => selectedCharacters.has(character.id))
    .map((character) => displayModelName(character.name))
    .join(", ");
  const selectedManualCharacter = characters.find((character) => character.id === manualCharacterId);
  const characterManualRecipes = manualRecipes.filter((recipe) => recipe.character_id === manualCharacterId);
  const characterManualAssets = manualAssets.filter((asset) => asset.character_id === manualCharacterId);
  const selectedManualRecipe = characterManualRecipes.find((recipe) => recipe.id === manualPromptRecipeId);
  const selectedManualAsset = characterManualAssets.find((asset) => asset.id === manualAssetId);
  const packageAssetLabel = selectedManualAsset?.status === "candidate" ? "Approve + Create Package" : "Create Social Package";
  const recipeLabel = (recipe: PromptRecipe) => `${formatDate(recipe.created_at)} · ${compactInlineText(recipe.final_prompt, 54) || recipe.id.replace("prompt_recipe_", "recipe ")}`;
  const assetLabel = (asset: ImageAsset) => `${formatDate(asset.created_at)} · ${asset.status.replaceAll("_", " ")} · ${asset.provider ?? "local"}`;
  const activeWorkflow = workflows.find((workflow) => workflow.id === workflowForm.id);
  const settingsTabs = studioOps.tabs.map((tab) => (
    tab.id === "workflows" && activeWorkflow ? { ...tab, detail: activeWorkflow.name } : tab
  ));
  const recentProductionLogs = data.runs
    .slice()
    .sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime())
    .slice(0, 8);

  async function saveAutomation() {
    setError(null);
    setMessage(null);
    try {
      const payload = await patchJson<{ settings: AutomationSettings; status: AutomationStatus; characters: CharacterSummary[] }>("/api/settings/automation", automationSettings);
      setAutomationSettings(payload.settings);
      setSavedAutomationSettings(payload.settings);
      setAutomationStatus(payload.status);
      setCharacters(payload.characters);
      setMessage("Automation settings saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save automation settings.");
    }
  }

  async function runDailyNow() {
    if (!manualCharacterId || !automationSettings) return;
    setError(null);
    setMessage(null);
    try {
      const payload = await postJson<{ run: RunSummary }>("/api/automation/daily-runs", {
        characterId: manualCharacterId,
        autoSelectTopActivity: automationSettings.autoSelectTopActivity,
        requireReviewBeforeDraft: automationSettings.requireReviewBeforeDraft,
        maxImagesPerRun: automationSettings.maxImagesPerRun
      });
      setMessage("Today's booking work started.");
      navigate(`/runs/${payload.run.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to run daily automation.");
    }
  }

  async function generateActivityCandidates() {
    if (!manualCharacterId) return;
    setError(null);
    setMessage(null);
    try {
      const payload = await postJson<{ run: RunSummary }>(`/api/automation/characters/${manualCharacterId}/activity-candidates`, {});
      setMessage("Booking ideas proposed.");
      navigate(`/runs/${payload.run.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to generate activity candidates.");
    }
  }

  async function generateImageCandidates() {
    if (!manualPromptRecipeId.trim() || !automationSettings) return;
    setError(null);
    setMessage(null);
    try {
      const payload = await postJson<{ results: Array<{ run: RunSummary }> }>(`/api/automation/prompt-recipes/${manualPromptRecipeId.trim()}/generate-images`, {
        count: automationSettings.maxImagesPerRun
      });
      const firstRunId = payload.results.find((result) => result.run)?.run.id;
      setMessage("Production candidates started.");
      if (firstRunId) navigate(`/runs/${firstRunId}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to generate image candidates.");
    }
  }

  async function generateIdentityAngleBatch() {
    if (!manualPromptRecipeId.trim() || !automationSettings) return;
    setError(null);
    setMessage(null);
    const promptSuffixes = [
      "front-facing headshot, neutral expression, even daylight",
      "three-quarter left portrait, same face, natural expression",
      "three-quarter right portrait, same face, natural expression",
      "profile portrait, same face, clean background"
    ].slice(0, automationSettings.maxImagesPerRun).map((suffix) => `\n\n${suffix}`);
    try {
      const payload = await postJson<{ results: Array<{ run: RunSummary }> }>(`/api/automation/prompt-recipes/${manualPromptRecipeId.trim()}/generate-images`, {
        promptSuffixes
      });
      const firstRunId = payload.results.find((result) => result.run)?.run.id;
      setMessage("Identity-angle production candidates started.");
      if (firstRunId) navigate(`/runs/${firstRunId}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to generate identity angle candidates.");
    }
  }

  async function analyzeLatestCandidates() {
    if (!manualCharacterId) return;
    setError(null);
    setMessage(null);
    try {
      const payload = await postJson<{ analyzed: Array<{ run: RunSummary }> }>(`/api/automation/characters/${manualCharacterId}/analyze-latest`, {});
      const firstRunId = payload.analyzed.find((result) => result.run)?.run.id;
      setMessage("Latest candidates analyzed.");
      if (firstRunId) navigate(`/runs/${firstRunId}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to analyze latest candidates.");
    }
  }

  async function packageAsset() {
    if (!manualAssetId.trim()) return;
    setError(null);
    setMessage(null);
    try {
      const payload = await postJson<{ run: RunSummary }>(`/api/automation/assets/${manualAssetId.trim()}/package`, {});
      setMessage("Social package created.");
      navigate(`/runs/${payload.run.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to package asset.");
    }
  }

  return (
    <>
      <header className="topbar page-heading">
        <div>
          <span className="eyebrow">Studio operations</span>
          <h1>Studio Ops</h1>
          <p>Production logs, engines, studio schedule, routing, workflow engines, and technical audit tools.</p>
        </div>
      </header>
      {message && <div className="notice">{message}</div>}
      {error && <div className="notice error">{error}</div>}
      <section className="ops-console" aria-label="Local operating summary">
        <article className="ops-hero">
          <span>Studio operations</span>
          <h2>{studioOps.headline}</h2>
          <p>{studioOps.primaryQuestion}</p>
          <div className="button-stack">
            <button className="primary-action" type="button" onClick={() => setSettingsView("logs")}>Open Production Logs</button>
            <button type="button" onClick={() => navigate("/runs")}>Open Full Index</button>
          </div>
        </article>
        <div className="ops-stat-grid">
          {studioOps.overviewCards.map((card) => (
            <article key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <p>{card.detail}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="settings-switcher" aria-label="Studio Ops sections">
        {settingsTabs.map((tabItem) => (
          <button
            key={tabItem.id}
            type="button"
            className={settingsView === tabItem.id ? "selected" : ""}
            onClick={() => setSettingsView(tabItem.id)}
          >
            <span>{tabItem.label}</span>
            <strong>{tabItem.value}</strong>
            <small>{tabItem.detail}</small>
          </button>
        ))}
      </section>
      {settingsView === "overview" && (
        <section className="settings-grid settings-workbench studio-ops-overview">
          <article className="settings-preview settings-primary-panel">
            <div className="section-heading"><h2>Overview</h2><span>{data.health?.ok ? "Online" : "Check"}</span></div>
            <dl>
              <div><dt>API</dt><dd>{studioOps.technicalAudit.api.service} · {studioOps.technicalAudit.api.ok ? "online" : "offline"}</dd></div>
              <div><dt>Local storage</dt><dd>{studioOps.technicalAudit.api.dataDir ?? "Not reported"}</dd></div>
              <div><dt>Provider mode</dt><dd>{settings.mockProviders ? "Mock providers" : "Live provider routing"}</dd></div>
              <div><dt>Recent failure</dt><dd>{studioOps.productionLogSummary.latestFailure ? studioOps.productionLogSummary.latestFailure.title : "None"}</dd></div>
            </dl>
          </article>
          <article className="settings-preview ops-domain-panel">
            <div className="section-heading"><h2>Technical Areas</h2></div>
            <div className="ops-domain-grid">
              {settingsTabs.filter((tab) => tab.id !== "overview").map((tab) => (
                <button key={tab.id} type="button" onClick={() => setSettingsView(tab.id)}>
                  <span>{tab.label}</span>
                  <strong>{tab.value}</strong>
                  <small>{tab.detail}</small>
                </button>
              ))}
            </div>
          </article>
          <article className="settings-preview provider-readiness-panel">
            <div className="section-heading"><h2>Provider Readiness</h2><span>{configuredProviderCount}</span></div>
            <div className="compact-list">
              {studioOps.providerReadiness.map((provider) => (
                <div key={provider.label}>
                  <strong>{provider.label}</strong>
                  <small>{provider.status} · {provider.detail}</small>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}
      {settingsView === "logs" && (
        <section className="settings-grid settings-workbench studio-ops-logs">
          <article className="settings-preview settings-primary-panel">
            <div className="section-heading"><h2>Production Logs</h2><span>{studioOps.productionLogSummary.total}</span></div>
            <dl>
              <div><dt>Active</dt><dd>{studioOps.productionLogSummary.active}</dd></div>
              <div><dt>Review gates</dt><dd>{studioOps.productionLogSummary.review}</dd></div>
              <div><dt>Failed</dt><dd>{studioOps.productionLogSummary.failed}</dd></div>
              <div><dt>Full index</dt><dd><button type="button" onClick={() => navigate("/runs")}>Open Production Log Index</button></dd></div>
            </dl>
          </article>
          <article className="settings-preview ops-log-ledger">
            <div className="section-heading"><h2>Recent Logs</h2><button type="button" onClick={() => navigate("/runs")}>Open all</button></div>
            {recentProductionLogs.length === 0 ? (
              <EmptyState title="No production logs" body="Production logs will appear after studio work starts." />
            ) : (
              <div className="ops-log-table">
                {recentProductionLogs.map((run) => (
                  <button key={run.id} type="button" onClick={() => navigate(`/runs/${run.id}`)}>
                    <span><strong>{run.title}</strong><small>{runTypeLabel(run.type)} · {formatDate(run.updated_at)}</small></span>
                    <em className={statusClass(run.status)}>{statusLabel(run.status)}</em>
                  </button>
                ))}
              </div>
            )}
          </article>
        </section>
      )}
      {settingsView === "providers" && (
        <section className="settings-grid settings-workbench routing-workbench">
          <article className="settings-preview settings-primary-panel">
            <div className="section-heading"><h2>Providers + Routing</h2><span>{routingDirty ? "Unsaved" : "Saved"}</span></div>
            <div className="form-stack">
              <label className="checkbox-row">
                <input type="checkbox" checked={settings.mockProviders} onChange={(event) => update({ mockProviders: event.target.checked })} />
                Mock mode
              </label>
              <label>
                Image
                <select value={settings.defaultImageGenerationProvider} onChange={(event) => update({ defaultImageGenerationProvider: event.target.value })}>
                  <option value="mock">Mock</option>
                  <option value="openai">OpenAI</option>
                  <option value="hermes">Hermes</option>
                  <option value="comfyui-cloud">ComfyUI Cloud</option>
                  <option value="wavespeed">WaveSpeed AI</option>
                </select>
              </label>
              <label>
                Analysis
                <select value={settings.defaultAnalysisProvider} onChange={(event) => update({ defaultAnalysisProvider: event.target.value })}>
                  <option value="mock">Mock</option>
                  <option value="hermes">Hermes</option>
                </select>
              </label>
              <div className="settings-action-grid">
                <button className="primary-action" type="button" onClick={save} disabled={!routingDirty}>{routingDirty ? "Save routing" : "Routing saved"}</button>
                <button type="button" onClick={resetRouting} disabled={!routingDirty}>Reset</button>
                <button type="button" onClick={() => testProvider("image_generation")} disabled={routingDirty || imageProviderNeedsComfyWorkflow}>Test Production</button>
                <button type="button" onClick={() => testProvider("image_analysis")} disabled={routingDirty}>Test Quality Review</button>
              </div>
            </div>
          </article>
          <article className="settings-preview provider-matrix">
            <div className="section-heading"><h2>Provider Settings</h2><span>{configuredProviderCount}</span></div>
            <details className="provider-drawer">
              <summary><span>Hermes</span><strong>{settings.hasHermesApiKey ? "Key saved" : "No key"}</strong></summary>
              <div className="form-stack">
                <label>Base URL<input value={settings.hermesBaseUrl} onChange={(event) => update({ hermesBaseUrl: event.target.value })} /></label>
                <label>Generation path<input value={settings.hermesImageGenerationPath} onChange={(event) => update({ hermesImageGenerationPath: event.target.value })} /></label>
                <label>Analysis path<input value={settings.hermesImageAnalysisPath} onChange={(event) => update({ hermesImageAnalysisPath: event.target.value })} /></label>
                <label>API key<input type="password" value={hermesApiKey} onChange={(event) => setHermesApiKey(event.target.value)} placeholder={settings.hasHermesApiKey ? "Saved key hidden" : "Optional"} /></label>
              </div>
            </details>
            <details className="provider-drawer">
              <summary><span>ComfyUI Cloud</span><strong>{settings.comfyuiCloudReady ? "Ready" : settings.hasComfyuiCloudApiKey ? "Needs workflow" : "No key"}</strong></summary>
              <div className="form-stack">
                <label>Base URL<input value={settings.comfyuiCloudBaseUrl} onChange={(event) => update({ comfyuiCloudBaseUrl: event.target.value })} /></label>
                <label>Generation path<input value={settings.comfyuiCloudGenerationPath} onChange={(event) => update({ comfyuiCloudGenerationPath: event.target.value })} /></label>
                <label>API key<input type="password" value={comfyuiCloudApiKey} onChange={(event) => setComfyuiCloudApiKey(event.target.value)} placeholder={settings.hasComfyuiCloudApiKey ? "Saved key hidden" : "Optional"} /></label>
              </div>
            </details>
            <details className="provider-drawer">
              <summary><span>OpenAI Images</span><strong>{settings.hasOpenaiApiKey ? "Key saved" : "No key"}</strong></summary>
              <div className="form-stack">
                <label>Base URL<input value={settings.openaiBaseUrl} onChange={(event) => update({ openaiBaseUrl: event.target.value })} /></label>
                <div className="metric-grid">
                  <label>Model<input value={settings.openaiImageModel} onChange={(event) => update({ openaiImageModel: event.target.value })} /></label>
                  <label>Size<input value={settings.openaiImageSize} onChange={(event) => update({ openaiImageSize: event.target.value })} /></label>
                  <label>Quality<input value={settings.openaiImageQuality} onChange={(event) => update({ openaiImageQuality: event.target.value })} /></label>
                  <label>Format<select value={settings.openaiImageOutputFormat} onChange={(event) => update({ openaiImageOutputFormat: event.target.value })}><option value="png">PNG</option><option value="jpeg">JPEG</option><option value="webp">WebP</option></select></label>
                </div>
                <label>Moderation<select value={settings.openaiImageModeration} onChange={(event) => update({ openaiImageModeration: event.target.value as "auto" | "low" })}><option value="low">Low</option><option value="auto">Auto</option></select></label>
                <label>API key<input type="password" value={openaiApiKey} onChange={(event) => setOpenaiApiKey(event.target.value)} placeholder={settings.hasOpenaiApiKey ? "Saved key hidden" : "Optional"} /></label>
              </div>
            </details>
            <details className="provider-drawer">
              <summary><span>WaveSpeed AI</span><strong>{settings.hasWavespeedApiKey ? "Key saved" : "No key"}</strong></summary>
              <div className="form-stack">
                <label>Base URL<input value={settings.wavespeedBaseUrl} onChange={(event) => update({ wavespeedBaseUrl: event.target.value })} /></label>
                <label>Generation path<input value={settings.wavespeedImageGenerationPath} onChange={(event) => update({ wavespeedImageGenerationPath: event.target.value })} /></label>
                <label>API key<input type="password" value={wavespeedApiKey} onChange={(event) => setWavespeedApiKey(event.target.value)} placeholder={settings.hasWavespeedApiKey ? "Saved key hidden" : "Required"} /></label>
              </div>
            </details>
          </article>
        </section>
      )}
      {settingsView === "workflows" && (
        <section className="settings-grid settings-workbench workflow-workbench">
          <article className="settings-preview workflow-ledger-panel">
            <div className="section-heading"><h2>Comfy workflows</h2><span>{workflows.length}</span></div>
            {workflows.length === 0 ? (
              <EmptyState title="No workflows" body="Add a Comfy workflow when ready." />
            ) : (
              <div className="workflow-ledger">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className={workflow.id === workflowForm.id ? "workflow-card selected" : "workflow-card"}>
                    <div>
                      <strong>{workflow.name}</strong>
                      <small>{workflow.status} · {workflow.default_for_tiers.join(", ") || "unassigned"}{workflow.validation_error ? ` · ${workflow.validation_error}` : ""}</small>
                    </div>
                    <div className="inline-actions">
                      <button type="button" onClick={() => editWorkflow(workflow)}>Edit</button>
                      <button type="button" onClick={() => validateWorkflow(workflow.id)}>Validate</button>
                      <button type="button" onClick={() => activateWorkflow(workflow.id, "sfw_standard")}>SFW</button>
                      <button type="button" onClick={() => activateWorkflow(workflow.id, "sfw_sensitive")}>Sensitive</button>
                      <button type="button" onClick={() => activateWorkflow(workflow.id, "mature_adult")}>Mature</button>
                      <button type="button" onClick={() => testWorkflow(workflow.id)}>Test</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
          <article className="settings-preview workflow-editor-panel">
            <details
              className="editor-drawer settings-editor"
              open={workflowEditorOpen || workflows.length === 0}
              onToggle={(event) => setWorkflowEditorOpen(event.currentTarget.open)}
            >
              <summary>{workflowForm.id ? "Edit workflow" : "New workflow"}</summary>
              <div className="form-stack">
                <label>Name<input value={workflowForm.name} onChange={(event) => setWorkflowForm({ ...workflowForm, name: event.target.value })} placeholder="Portrait API workflow" /></label>
                <label>Workflow JSON<textarea value={workflowForm.workflowText} onChange={(event) => setWorkflowForm({ ...workflowForm, workflowText: event.target.value })} /></label>
                <div className="metric-grid">
                  <label>Positive node<input value={workflowForm.positivePromptNode} onChange={(event) => setWorkflowForm({ ...workflowForm, positivePromptNode: event.target.value })} /></label>
                  <label>Positive input<input value={workflowForm.positivePromptInput} onChange={(event) => setWorkflowForm({ ...workflowForm, positivePromptInput: event.target.value })} /></label>
                  <label>Negative node<input value={workflowForm.negativePromptNode} onChange={(event) => setWorkflowForm({ ...workflowForm, negativePromptNode: event.target.value })} /></label>
                  <label>Negative input<input value={workflowForm.negativePromptInput} onChange={(event) => setWorkflowForm({ ...workflowForm, negativePromptInput: event.target.value })} /></label>
                  <label>Seed node<input value={workflowForm.seedNode} onChange={(event) => setWorkflowForm({ ...workflowForm, seedNode: event.target.value })} /></label>
                  <label>Seed input<input value={workflowForm.seedInput} onChange={(event) => setWorkflowForm({ ...workflowForm, seedInput: event.target.value })} /></label>
                  <label>Reference node<input value={workflowForm.referenceImageNode} onChange={(event) => setWorkflowForm({ ...workflowForm, referenceImageNode: event.target.value })} /></label>
                  <label>Reference input<input value={workflowForm.referenceImageInput} onChange={(event) => setWorkflowForm({ ...workflowForm, referenceImageInput: event.target.value })} /></label>
                </div>
                <label>Output nodes<input value={workflowForm.outputNodeIds} onChange={(event) => setWorkflowForm({ ...workflowForm, outputNodeIds: event.target.value })} placeholder="comma separated" /></label>
                <label>Default tiers<input value={workflowForm.defaultForTiers} onChange={(event) => setWorkflowForm({ ...workflowForm, defaultForTiers: event.target.value })} /></label>
                <div className="button-stack">
                  <button className="primary-action" type="button" onClick={saveWorkflow}>Save workflow</button>
                  <button type="button" onClick={resetWorkflowForm}>New workflow</button>
                </div>
              </div>
            </details>
            {workflows.length > 0 && !workflowEditorOpen && (
              <button className="primary-action" type="button" onClick={resetWorkflowForm}>Add workflow</button>
            )}
          </article>
        </section>
      )}
      {settingsView === "audit" && (
        <section className="settings-grid settings-workbench studio-ops-audit">
          <article className="settings-preview settings-primary-panel">
            <div className="section-heading"><h2>Technical Audit</h2><span>Raw state</span></div>
            <dl>
              <div><dt>API service</dt><dd>{studioOps.technicalAudit.api.service}</dd></div>
              <div><dt>API version</dt><dd>{studioOps.technicalAudit.api.version ?? "Unknown"}</dd></div>
              <div><dt>Local data directory</dt><dd>{studioOps.technicalAudit.api.dataDir ?? "Not reported"}</dd></div>
              <div><dt>Production log IDs</dt><dd>{studioOps.technicalAudit.productionLogIds.length}</dd></div>
              <div><dt>Workflow IDs</dt><dd>{studioOps.technicalAudit.workflowIds.length}</dd></div>
            </dl>
          </article>
          <article className="settings-preview technical-audit-panel">
            <div className="section-heading"><h2>IDs and Payload Snapshots</h2></div>
            <div className="technical-audit-grid">
              <section>
                <span>Production Log IDs</span>
                <pre>{JSON.stringify(studioOps.technicalAudit.productionLogIds, null, 2)}</pre>
              </section>
              <section>
                <span>Workflow IDs</span>
                <pre>{JSON.stringify(studioOps.technicalAudit.workflowIds, null, 2)}</pre>
              </section>
              <section>
                <span>Prompt Recipe IDs</span>
                <pre>{JSON.stringify(studioOps.technicalAudit.promptRecipeIds, null, 2)}</pre>
              </section>
              <section>
                <span>Asset IDs</span>
                <pre>{JSON.stringify(studioOps.technicalAudit.assetIds, null, 2)}</pre>
              </section>
              <section>
                <span>Provider Settings Snapshot</span>
                <pre>{JSON.stringify(settings, null, 2)}</pre>
              </section>
              <section>
                <span>Automation Status Snapshot</span>
                <pre>{JSON.stringify(automationStatus, null, 2)}</pre>
              </section>
            </div>
          </article>
        </section>
      )}
      {settingsView === "automation" && (
        <section className="settings-grid settings-workbench automation-workbench">
          <article className="settings-preview settings-primary-panel">
            <div className="section-heading"><h2>Scheduler</h2><span>{automationDirty ? "Unsaved" : "Saved"}</span></div>
            <div className="form-stack">
              <label className="checkbox-row">
                <input type="checkbox" checked={automationSettings.enableDailyActivityRuns} onChange={(event) => updateAutomation({ enableDailyActivityRuns: event.target.checked })} />
                Daily booking work
              </label>
              <label>Time<input type="time" value={automationSettings.dailyRunTime} onChange={(event) => updateAutomation({ dailyRunTime: event.target.value })} /></label>
              <label>Platforms<input value={defaultPlatformsText} onChange={(event) => updateAutomation({ defaultPlatforms: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} /></label>
              <div className="metric-grid">
                <label>Image<select value={automationSettings.defaultImageProvider} onChange={(event) => updateAutomation({ defaultImageProvider: event.target.value })}><option value="mock">Mock</option><option value="openai">OpenAI</option><option value="hermes">Hermes</option><option value="comfyui-cloud">ComfyUI Cloud</option><option value="wavespeed">WaveSpeed AI</option></select></label>
                <label>Analysis<select value={automationSettings.defaultAnalysisProvider} onChange={(event) => updateAutomation({ defaultAnalysisProvider: event.target.value })}><option value="mock">Mock</option><option value="hermes">Hermes</option></select></label>
                <label>Images/job<input type="number" min="1" max="4" value={automationSettings.maxImagesPerRun} onChange={(event) => updateAutomation({ maxImagesPerRun: Number(event.target.value) })} /></label>
              </div>
              <div className="settings-action-grid">
                <button className="primary-action" type="button" onClick={saveAutomation} disabled={!automationDirty}>{automationDirty ? "Save automation" : "Automation saved"}</button>
                <button type="button" onClick={resetAutomation} disabled={!automationDirty}>Reset</button>
              </div>
            </div>
          </article>
          <article className="settings-preview">
            <div className="section-heading"><h2>Review rules</h2></div>
            <div className="settings-toggle-grid">
              <label className="checkbox-row"><input type="checkbox" checked={automationSettings.autoSelectTopActivity} onChange={(event) => updateAutomation({ autoSelectTopActivity: event.target.checked })} /> Auto-select activity</label>
              <label className="checkbox-row"><input type="checkbox" checked={automationSettings.requireReviewBeforeDraft} onChange={(event) => updateAutomation({ requireReviewBeforeDraft: event.target.checked })} /> Review before draft</label>
            </div>
            <details className="editor-drawer">
              <summary>Default talent</summary>
              <div className="compact-list">
                {characters.map((character) => (
                  <label className="checkbox-row" key={character.id}>
                    <input type="checkbox" checked={selectedCharacters.has(character.id)} onChange={() => toggleDefaultCharacter(character.id)} />
                    {displayModelName(character.name)}
                  </label>
                ))}
              </div>
            </details>
            <p className="settings-note">{selectedDefaultCharacterNames || "None"}</p>
          </article>
          <article className="settings-preview">
            <div className="section-heading"><h2>Status</h2></div>
            <dl>
              <div><dt>Scheduler</dt><dd>{automationStatus?.schedulerEnabled ? "Enabled" : "Disabled"}</dd></div>
              <div><dt>Next run</dt><dd>{formatDate(automationStatus?.nextRunAt)}</dd></div>
              <div><dt>Last check</dt><dd>{formatDate(automationStatus?.lastSchedulerCheckAt)}</dd></div>
              <div><dt>Review gates</dt><dd>{automationStatus?.runsNeedingReview.length ?? 0}</dd></div>
            </dl>
          </article>
        </section>
      )}
      {settingsView === "manual" && (
        <section className="settings-grid settings-workbench manual-workbench">
          <article className="settings-preview settings-primary-panel">
            <div className="section-heading"><h2>Production Console</h2></div>
            <div className="form-stack">
              <label>Talent<select value={manualCharacterId} onChange={(event) => setManualCharacterId(event.target.value)}>{characters.map((character) => <option key={character.id} value={character.id}>{displayModelName(character.name)}</option>)}</select></label>
              <dl>
                <div><dt>Mode</dt><dd>{selectedManualCharacter?.status ?? "No character"}</dd></div>
                <div><dt>Treatments</dt><dd>{characterManualRecipes.length}</dd></div>
                <div><dt>Shots</dt><dd>{characterManualAssets.length}</dd></div>
              </dl>
              <div className="settings-action-grid manual-actions">
              <button className="primary-action" type="button" onClick={runDailyNow} disabled={!manualCharacterId}>Book Today's Work</button>
                <button type="button" onClick={generateActivityCandidates} disabled={!manualCharacterId}>Propose Booking Ideas</button>
                <button type="button" onClick={analyzeLatestCandidates} disabled={!manualCharacterId}>Review Quality</button>
              </div>
            </div>
          </article>
          <article className="settings-preview">
            <div className="section-heading"><h2>Targeted Production</h2></div>
            <div className="form-stack">
              <label>Creative treatment
                <select value={manualPromptRecipeId} onChange={(event) => setManualPromptRecipeId(event.target.value)} disabled={characterManualRecipes.length === 0}>
                  {characterManualRecipes.length === 0 ? <option value="">No treatments</option> : characterManualRecipes.map((recipe) => <option key={recipe.id} value={recipe.id}>{recipeLabel(recipe)}</option>)}
                </select>
              </label>
              <div className="compact-dossier">
                <span>{selectedManualRecipe?.id.replace("prompt_recipe_", "Treatment ") ?? "No treatment selected"}</span>
                <p>{selectedManualRecipe?.final_prompt?.slice(0, 150) ?? "Prepare in Booking Desk."}</p>
              </div>
              <button type="button" onClick={generateImageCandidates} disabled={!manualPromptRecipeId.trim()}>Start Production</button>
              <button type="button" onClick={generateIdentityAngleBatch} disabled={!manualPromptRecipeId.trim()}>Produce Identity Angles</button>
              <label>Portfolio shot
                <select value={manualAssetId} onChange={(event) => setManualAssetId(event.target.value)} disabled={characterManualAssets.length === 0}>
                  {characterManualAssets.length === 0 ? <option value="">No shots</option> : characterManualAssets.map((asset) => <option key={asset.id} value={asset.id}>{assetLabel(asset)}</option>)}
                </select>
              </label>
              <div className="compact-dossier">
                <span>{selectedManualAsset?.id.replace("asset_", "Shot ") ?? "No shot selected"}</span>
                <p>{selectedManualAsset ? `${selectedManualAsset.status.replaceAll("_", " ")} · ${formatBytes(selectedManualAsset.size_bytes)} · ${selectedManualAsset.latestAnalysis?.recommended_action ?? "No review signal"}` : "Produce or approve a portfolio shot first."}</p>
              </div>
              <button type="button" onClick={packageAsset} disabled={!manualAssetId.trim()}>{packageAssetLabel}</button>
              <details className="raw-details">
                <summary>Advanced IDs</summary>
                <label>Prompt recipe ID<input value={manualPromptRecipeId} onChange={(event) => setManualPromptRecipeId(event.target.value)} placeholder="prompt_recipe_..." /></label>
                <label>Asset ID<input value={manualAssetId} onChange={(event) => setManualAssetId(event.target.value)} placeholder="asset_..." /></label>
              </details>
            </div>
          </article>
        </section>
      )}
    </>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}

export function App() {
  const { path, navigate } = usePath();
  const { data, loading, error } = useAppData();
  const runDetailMatch = path.match(/^\/runs\/([^/]+)$/);
  const characterDetailMatch = path.match(/^\/characters\/([^/]+)$/);

  const content = useMemo(() => {
    if (path === "/") {
      return <HeartbeatDashboard data={data} loading={loading} error={error} navigate={navigate} />;
    }
    if (path === "/create") {
      return <CreateModePage data={data} loading={loading} error={error} navigate={navigate} />;
    }
    if (path === "/runs") {
      return <RunsPage data={data} loading={loading} error={error} navigate={navigate} />;
    }
    if (runDetailMatch) {
      return <RunDetailPage runId={runDetailMatch[1]} navigate={navigate} />;
    }
    if (path === "/characters" || path === "/talent") {
      return <CharactersPage data={data} loading={loading} error={error} navigate={navigate} />;
    }
    if (characterDetailMatch) {
      return <CharacterProfilePage characterId={characterDetailMatch[1]} data={data} navigate={navigate} />;
    }
    if (path === "/settings") {
      return <SettingsPage data={data} navigate={navigate} />;
    }
    if (path === "/prompt-studio") {
      return <PromptStudioPage data={data} navigate={navigate} />;
    }
    if (path === "/assets" || path === "/library") {
      return <AssetLibraryPage data={data} navigate={navigate} />;
    }
    if (path === "/drafts" || path === "/review") {
      return <DraftReviewDesk data={data} navigate={navigate} />;
    }
    if (path === "/calendar") {
      return <CalendarLedgerPage data={data} navigate={navigate} />;
    }
    if (path === "/feedback") {
      return <FeedbackPage data={data} navigate={navigate} title="Audience" />;
    }
    if (path === "/insights") {
      return <FeedbackPage data={data} navigate={navigate} />;
    }
    if (path === "/help") {
      return <HelpPage navigate={navigate} />;
    }
    const item = navItems.find((navItem) => navItem.path === path);
    return <PlaceholderPage title={item?.label ?? "Not Found"} />;
  }, [characterDetailMatch, data, error, loading, navigate, path, runDetailMatch]);

  return (
    <AppShell data={data} error={error} path={path} navigate={navigate}>
      {content}
    </AppShell>
  );
}
