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
  Robot,
  SquaresFour,
  TiktokLogo,
  ThreadsLogo,
  User,
  X as XIcon,
  XLogo
} from "@phosphor-icons/react";
import type { ApiHealth } from "@virtual-agency/shared";

type RunStatus = "queued" | "running" | "waiting_for_provider" | "needs_review" | "completed" | "failed" | "cancelled";
type SettingsView = "routing" | "workflows" | "automation" | "manual";
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
  goal: string | null;
  platform_targets: string | null;
  visual_direction: string | null;
  caption_angle: string | null;
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
}

interface ReflectionEntry {
  id: string;
  run_id: string | null;
  summary: string | null;
  body: string;
}

interface IdentityProposal {
  id: string;
  kind: string;
  body: string;
  rationale: string | null;
  risk_level: string;
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
}

const navItems = [
  { label: "Heartbeat", path: "/", detail: "Studio state", icon: Pulse },
  { label: "Publishing", path: "/calendar", detail: "Ledger", icon: CalendarBlank },
  { label: "Timeline", path: "/runs", detail: "Agent trace", icon: ClockCounterClockwise },
  { label: "Review Desk", path: "/drafts", detail: "Approvals", icon: CheckSquare },
  { label: "Casting", path: "/characters", detail: "Identity", icon: User },
  { label: "Library", path: "/assets", detail: "Media", icon: Image },
  { label: "Prompt Studio", path: "/prompt-studio", detail: "Briefs and recipes", icon: MagicWand },
  { label: "Operations", path: "/settings", detail: "Routing", icon: Gear }
];

const workflowSteps = [
  { label: "Identity", detail: "Character", path: "/characters", icon: User },
  { label: "Concept", detail: "Brief", path: "/prompt-studio", icon: Article },
  { label: "Produce", detail: "Assets", path: "/assets", icon: Image },
  { label: "Approve", detail: "Review", path: "/drafts", icon: CheckCircle },
  { label: "Publish", detail: "Ledger", path: "/calendar", icon: Package },
  { label: "Learn", detail: "Response", path: "/runs?type=feedback_reflection", icon: BookOpen }
];

const runTypeLabels: Record<string, string> = {
  character_birth: "Character Birth",
  daily_activity: "Daily Activity",
  prompt_generation: "Prompt Generation",
  image_generation: "Image Generation",
  image_analysis: "Image Analysis",
  draft_packaging: "Draft Packaging",
  feedback_reflection: "Feedback Reflection",
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
    return "Inspect the error, then retry or cancel from a later processor.";
  }
  if (run.status === "needs_review") {
    return "Review the run events and decide whether to continue in the next workflow phase.";
  }
  if (run.status === "queued") {
    return "Run is queued. Process the next local run when ready.";
  }
  if (run.status === "running" || run.status === "waiting_for_provider") {
    return "Watch the timeline for provider or queue updates.";
  }
  if (run.status === "completed") {
    return "Use artifacts and decisions as source material for the next workflow.";
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
  };

  return { path, navigate };
}

function useAppData() {
  const [data, setData] = useState<AppData>({ health: null, characters: [], runs: [], automationStatus: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let timeoutId: number | undefined;

    async function load() {
      try {
        const [healthResponse, charactersResponse, runsResponse, automationResponse] = await Promise.all([
          fetch(`${apiBaseUrl()}/health`),
          fetch(`${apiBaseUrl()}/api/characters`),
          fetch(`${apiBaseUrl()}/api/runs`),
          fetch(`${apiBaseUrl()}/api/automation/status`)
        ]);

        if (!healthResponse.ok || !charactersResponse.ok || !runsResponse.ok || !automationResponse.ok) {
          throw new Error("One or more local API requests failed.");
        }

        const [health, charactersPayload, runsPayload, automationPayload] = await Promise.all([
          healthResponse.json() as Promise<ApiHealth>,
          charactersResponse.json() as Promise<{ characters: CharacterSummary[] }>,
          runsResponse.json() as Promise<{ runs: RunSummary[] }>,
          automationResponse.json() as Promise<{ status: AutomationStatus }>
        ]);

        if (active) {
          setData({
            health,
            characters: charactersPayload.characters,
            runs: runsPayload.runs,
            automationStatus: automationPayload.status
          });
          setError(null);
          setLoading(false);
        }
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : "Unable to load local machine state.");
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

function workflowStepActive(path: string, stepPath: string) {
  if (stepPath === "/characters") {
    return path.startsWith("/characters");
  }
  if (stepPath === "/prompt-studio") {
    return path === "/prompt-studio";
  }
  if (stepPath === "/assets") {
    return path === "/assets";
  }
  if (stepPath === "/drafts") {
    return path === "/drafts";
  }
  if (stepPath === "/calendar") {
    return path === "/calendar";
  }
  if (stepPath.startsWith("/runs?type=feedback_reflection")) {
    return path.startsWith("/runs") && window.location.search.includes("type=feedback_reflection");
  }
  return false;
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
    return "active runs";
  }
  return statusLabel(filter);
}

function JsonDetails({ value }: { value: unknown }) {
  return (
    <details className="raw-details">
      <summary>Raw details</summary>
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
  const apiStatusLabel = data.health?.ok ? "API online" : error ? "API offline" : "Checking API";
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
            <span>Agentic social studio</span>
          </div>
        </a>

        <div className="rail-section-label">Operations</div>
        <nav className="nav-list">
          {navItems.map((item) => {
            const active = path === item.path || (item.path !== "/" && path.startsWith(`${item.path}/`));
            const badge =
              item.label === "Review Desk" && data.automationStatus?.runsNeedingReview.length
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
          <span>Agency Operator</span>
          <strong>Local Operator</strong>
        </div>
        <div className="rail-system">
          <span>System</span>
          <strong><Robot aria-hidden="true" size={14} weight="regular" /> Health <i aria-hidden="true" /></strong>
        </div>
      </aside>

      <main className="workspace" id="workspace">
        <div className="workspace-chrome">
          <div className="workspace-status-strip" aria-label="System state">
            <span><Circle aria-hidden="true" size={7} weight="fill" />Local mode</span>
            <span><Circle aria-hidden="true" size={7} weight="fill" />LLM</span>
            <span><Circle aria-hidden="true" size={7} weight="fill" />Storage</span>
          </div>
          <div className="workspace-clock">
            <strong>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
            <span>{new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
          <div className={data.health?.ok ? "health online" : "health"} aria-label={apiStatusLabel}>
            <span aria-hidden="true" />
          </div>
        </div>
        <nav className="studio-flow" aria-label="Studio production flow">
          {workflowSteps.map((step, index) => {
            const active = workflowStepActive(path, step.path);
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
                  <StepIcon aria-hidden="true" size={18} weight={active ? "bold" : "regular"} />
                  <em>{String(index + 1).padStart(2, "0")}</em>
                </span>
                <strong>{step.label}</strong>
                <small>{step.detail}</small>
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
  const runs = data.runs;
  const runningRuns = runs.filter((run) => run.status === "running" || run.status === "waiting_for_provider");
  const failedRuns = runs.filter((run) => run.status === "failed");
  const reviewRuns = runs.filter((run) => run.status === "needs_review");
  const completedRuns = runs.filter((run) => run.status === "completed");
  const activeCharacterIds = new Set(runs.filter((run) => run.character_id).map((run) => run.character_id));
  const activeCharacters = data.characters.filter((character) => activeCharacterIds.has(character.id));
  const automationStatus = data.automationStatus;
  const primaryReview = automationStatus?.runsNeedingReview[0] ?? reviewRuns[0] ?? null;

  const cards = [
    { label: "Operations", value: automationStatus?.schedulerEnabled ? "On" : "Off", detail: automationStatus?.schedulerEnabled ? "Armed" : "Dispatch", path: "/settings" },
    { label: "Next Run", value: automationStatus?.nextRunAt ? formatDate(automationStatus.nextRunAt) : "None", detail: automationStatus?.lastTriggeredAt ? `Last ${formatDate(automationStatus.lastTriggeredAt)}` : "Quiet", path: "/settings" },
    { label: "Review Gates", value: reviewRuns.length, detail: primaryReview ? "Decision" : "Clear", path: runQuery("needs_review") },
    { label: "Running", value: runningRuns.length, detail: automationStatus?.currentlyRunning?.title ?? "No active automation", path: runQuery("active") },
    { label: "Failed", value: failedRuns.length, detail: failedRuns[0]?.error ?? "Clear", path: runQuery("failed") },
    { label: "Completed", value: completedRuns.length, detail: completedRuns[0] ? runTypeLabel(completedRuns[0].type) : "None", path: runQuery("completed") },
    {
      label: "Active Cast",
      value: activeCharacters.length,
      detail: "In motion",
      path: "/characters"
    }
  ];
  const dispatchActions = [
    { label: "Identity", value: data.characters.length, detail: "Character files", path: "/characters" },
    { label: "Concept", value: "Brief", detail: "Prompt Studio", path: "/prompt-studio" },
    { label: "Produce", value: "Image", detail: "Library", path: "/assets" },
    { label: "Approve", value: reviewRuns.length, detail: "Gates", path: "/drafts" }
  ];

  return (
    <>
      <header className="topbar page-heading">
        <div>
          <span className="eyebrow">Agentic social studio</span>
          <h1>Agency Heartbeat</h1>
        </div>
      </header>

      {loading && <div className="notice">Loading local machine state.</div>}
      {error && <div className="notice error">{error}</div>}

      <section className="priority-board" aria-label="Priority review queue">
        <article className="review-command">
          <span>Review queue</span>
          <strong>{reviewRuns.length}</strong>
          <p>{primaryReview ? primaryReview.title : "Clear."}</p>
          <div className="review-command-actions">
            <button className="primary-action" type="button" onClick={() => navigate(primaryReview ? `/runs/${primaryReview.id}` : "/runs")}>
              {primaryReview ? "Open review gate" : "Open timeline"}
            </button>
            <button type="button" onClick={() => navigate("/assets")}>Open library</button>
          </div>
        </article>

        <article className="dispatch-board">
          <span>Dispatch</span>
          <div className="dispatch-actions">
            {dispatchActions.map((action) => (
              <button key={action.label} type="button" onClick={() => navigate(action.path)}>
                <strong>{action.value}</strong>
                <span>{action.label}</span>
                <small>{action.detail}</small>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="panel-grid heartbeat-grid" aria-label="Agency status">
        {cards.map((card) => (
          <button className="status-panel" key={card.label} type="button" onClick={() => navigate(card.path)}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <p>{card.detail}</p>
          </button>
        ))}
      </section>

      <section className="content-grid">
        <article className="machine-room">
          <div className="section-heading">
            <h2>Recent Timeline</h2>
            <button type="button" onClick={() => navigate("/runs")}>
              View all
            </button>
          </div>
          {runs.length === 0 ? (
            <EmptyState title="No runs yet" body="Seed data or create a run to see the machine timeline." />
          ) : (
            <div className="run-stack">
              {runs.slice(0, 6).map((run) => (
                <button className="run-row" key={run.id} onClick={() => navigate(`/runs/${run.id}`)} type="button">
                  <span>
                    <strong>{run.title}</strong>
                    <small>{runTypeLabel(run.type)} · updated {formatDate(run.updated_at)}</small>
                  </span>
                  <em className={statusClass(run.status)}>{statusLabel(run.status)}</em>
                </button>
              ))}
            </div>
          )}
        </article>

        <article className="settings-preview">
          <div className="section-heading">
            <h2>Local Guardrails</h2>
          </div>
          <dl>
            <div>
              <dt>API</dt>
              <dd>{data.health ? `${data.health.service} ${data.health.version}` : "Checking"}</dd>
            </div>
            <div>
              <dt>Storage</dt>
              <dd>Local workspace</dd>
            </div>
            <div>
              <dt>Providers</dt>
              <dd>Mock-safe by default</dd>
            </div>
          </dl>
        </article>
      </section>
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
          <span className="eyebrow">Agent timeline</span>
          <h1>Timeline</h1>
        </div>
      </header>

      {loading && <div className="notice">Loading runs.</div>}
      {error && <div className="notice error">{error}</div>}

      <section className="timeline-control-layout" aria-label="Timeline control desk">
        <div className="timeline-main-column">
          <section className="timeline-desk">
            <article className="route-matrix-panel">
              <div className="section-heading"><h2>Run matrix</h2></div>
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
              <div className="desk-stat-row" aria-label="Run desk summary">
                <span><strong>{activeRun ? 1 : 0}</strong><small>Active</small></span>
                <span><strong>{data.runs.filter((run) => run.status === "needs_review").length}</strong><small>Review</small></span>
                <span className="alert"><strong>{actionRequiredCount}</strong><small>Action</small></span>
              </div>
              <dl className="desk-next-window">
                <div>
                  <dt>Current trace</dt>
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
                <span>Run dossier</span>
              </div>
              {!selectedRun ? <EmptyState title="No run selected" body="Runs appear here after automation starts." /> : (
                <div className="run-dossier">
                  <div className="dossier-platform-row">
                    <span className="platform-mark platform-mark-system"><ClockCounterClockwise aria-hidden="true" size={16} weight="regular" /></span>
                    <strong>{runTypeLabel(selectedRun.type)}</strong>
                    <em>{statusLabel(selectedRun.status)}</em>
                  </div>
                  <h2>{selectedRun.title}</h2>
                  <p>{currentStep(selectedRun)}</p>
                  <dl className="profile-facts run-facts">
                    <div><dt>Run</dt><dd>{shortRunId(selectedRun.id)}</dd></div>
                    <div><dt>Character</dt><dd>{selectedCharacter?.name ?? "Unassigned"}</dd></div>
                    <div><dt>Started</dt><dd>{formatDate(selectedRun.created_at)}</dd></div>
                    <div><dt>Status</dt><dd>{statusLabel(selectedRun.status)}</dd></div>
                  </dl>
                  <div className="draft-primary-actions dossier-actions">
                    <button className="primary-action" type="button" onClick={() => navigate(`/runs/${selectedRun.id}`)}>Open trace</button>
                    {selectedRun.character_id && <button type="button" onClick={() => navigate(`/characters/${selectedRun.character_id}`)}>Open dossier</button>}
                  </div>
                </div>
              )}
            </article>
          </section>

          <section className="run-lane" aria-label="Run status filters">
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

          <section className="filters" aria-label="Run filters">
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
              <EmptyState title="No matching runs" body="Clear filters or create a new run from Operations." />
            </section>
          ) : (
            <>
              <section className="run-card-list" aria-label="Filtered runs">
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
                      <th>Run</th>
                      <th>Type</th>
                      <th>State</th>
                      <th>Character</th>
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
                            <small>run {shortRunId(run.id)}</small>
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
                  <span>{hiddenRunCount} older runs hidden</span>
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
    return <div className="notice">Loading run timeline.</div>;
  }

  if (error || !detail) {
    return (
      <div className="notice error">
        {error ?? "Run not found."}
        <button type="button" onClick={() => navigate("/runs")}>
          Back to runs
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
            Back to runs
          </button>
          <span className="eyebrow">Run control</span>
          <h1>{run.title}</h1>
        </div>
        <em className={statusClass(run.status)}>{run.status.replaceAll("_", " ")}</em>
      </header>

      <section className="run-command" aria-label="Run command">
        <article className="run-hero">
          <span>{runTypeLabel(run.type)}</span>
          <h2>{statusLabel(run.status)}</h2>
          <p>{currentStep(run, events)}</p>
          <div className="button-stack">
            {run.character_id && <button type="button" onClick={() => navigate(`/characters/${run.character_id}`)}>Character</button>}
            <button type="button" onClick={() => navigate("/runs")}>All runs</button>
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
            <h2>Progress Timeline</h2>
          </div>
          {events.length === 0 ? (
            <EmptyState title="No events" body="This run has not emitted machine events yet." />
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
              <summary>Audit payloads</summary>
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
            <div className="section-heading"><h2>Next Action</h2></div>
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
              <h2>Provider Jobs</h2>
            </div>
            {!detail.providerJobs?.length ? (
              <EmptyState title="No provider jobs" body="Provider calls will appear here after generation or analysis runs." />
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCharacterId, setSelectedCharacterId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const normalizedQuery = query.trim().toLowerCase();
  const statusCounts = useMemo(() => {
    const counts = new Map<string, number>();
    data.characters.forEach((character) => {
      counts.set(character.status, (counts.get(character.status) ?? 0) + 1);
    });
    return counts;
  }, [data.characters]);
  const statusLanes = useMemo(
    () => [
      { id: "all", label: "All", count: data.characters.length },
      ...Array.from(statusCounts.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([status, count]) => ({ id: status, label: statusLabel(status), count }))
    ],
    [data.characters.length, statusCounts]
  );
  const filteredCharacters = useMemo(
    () =>
      data.characters.filter((character) => {
        const matchesStatus = statusFilter === "all" || character.status === statusFilter;
        const matchesQuery =
          !normalizedQuery ||
          [character.name, character.summary ?? "", character.status].some((value) => value.toLowerCase().includes(normalizedQuery));
        return matchesStatus && matchesQuery;
      }),
    [data.characters, normalizedQuery, statusFilter]
  );
  const selectedCharacter =
    filteredCharacters.find((character) => character.id === selectedCharacterId) ??
    data.characters.find((character) => character.id === selectedCharacterId) ??
    filteredCharacters[0] ??
    data.characters[0] ??
    null;
  const selectedRun = selectedCharacter ? data.runs.find((run) => run.character_id === selectedCharacter.id) ?? null : null;
  const activeRunCount = data.runs.filter(
    (run) => run.character_id && !["completed", "failed", "cancelled"].includes(run.status)
  ).length;
  const reviewRunCount = data.runs.filter((run) => run.status === "needs_review" && run.character_id).length;

  useEffect(() => {
    if (selectedCharacterId && data.characters.some((character) => character.id === selectedCharacterId)) {
      return;
    }
    setSelectedCharacterId(data.characters[0]?.id ?? "");
  }, [data.characters, selectedCharacterId]);

  useEffect(() => {
    if (filteredCharacters.length === 0 || filteredCharacters.some((character) => character.id === selectedCharacterId)) {
      return;
    }
    setSelectedCharacterId(filteredCharacters[0].id);
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
          <span className="eyebrow">Casting desk</span>
          <h1>Casting</h1>
        </div>
      </header>

      {loading && <div className="notice">Loading characters.</div>}
      {error && <div className="notice error">{error}</div>}

      <section className="roster-command roster-command--casting" aria-label="Character roster command">
        <article>
          <span>Cast</span>
          <strong>{data.characters.length}</strong>
          <p>model files</p>
        </article>
        <article>
          <span>Motion</span>
          <strong>{activeRunCount}</strong>
          <p>active runs</p>
        </article>
        <article>
          <span>Review</span>
          <strong>{reviewRunCount}</strong>
          <p>gates</p>
        </article>
        <label className="roster-search">
          <span>Search</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, status, summary" />
        </label>
      </section>

      <section className="character-status-lanes" aria-label="Roster status">
        {statusLanes.map((lane) => (
          <button
            className={statusFilter === lane.id ? "active" : ""}
            key={lane.id}
            type="button"
            onClick={() => setStatusFilter(lane.id)}
          >
            <span>{lane.label}</span>
            <strong>{lane.count}</strong>
          </button>
        ))}
      </section>

      <section className="character-layout">
        <article className="machine-room casting-roster">
          <div className="section-heading">
            <h2>Cast</h2>
            <span>{filteredCharacters.length}</span>
          </div>
          {data.characters.length === 0 ? (
            <EmptyState title="No characters yet" body="Create the first character to begin identity formation." />
          ) : filteredCharacters.length === 0 ? (
            <EmptyState title="No matches" body="Clear search to see the full roster." />
          ) : (
            <div className="character-grid">
              {filteredCharacters.map((character) => {
                const lastRun = data.runs.find((run) => run.character_id === character.id);
                const selected = selectedCharacter?.id === character.id;
                const displayName = displayModelName(character.name);
                return (
                  <button
                    aria-pressed={selected}
                    className={`character-card${selected ? " is-selected" : ""}`}
                    key={character.id}
                    type="button"
                    onClick={() => setSelectedCharacterId(character.id)}
                  >
                    <div className="thumb">{modelInitials(character.name)}</div>
                    <div>
                      <strong>{displayName}</strong>
                      <em className={statusClass(character.status)}>{character.status.replaceAll("_", " ")}</em>
                      <p>{character.summary ?? "No summary yet."}</p>
                      <small>{lastRun ? lastRun.title : "No runs yet"}</small>
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
            {selectedCharacter && <span>{statusLabel(selectedCharacter.status)}</span>}
          </div>
          {selectedCharacter ? (
            <div className="casting-selected">
              <div className="casting-mark">
                <span>{modelInitials(selectedCharacter.name)}</span>
              </div>
              <div>
                <span className="eyebrow">Model file</span>
                <h2>{displayModelName(selectedCharacter.name)}</h2>
                <p>{selectedCharacter.summary ?? "No summary yet."}</p>
              </div>
              <div className="casting-facts">
                <div>
                  <span>Status</span>
                  <strong>{statusLabel(selectedCharacter.status)}</strong>
                </div>
                <div>
                  <span>Updated</span>
                  <strong>{formatDate(selectedCharacter.updated_at)}</strong>
                </div>
                <div>
                  <span>Latest run</span>
                  <strong>{selectedRun ? statusLabel(selectedRun.status) : "None"}</strong>
                </div>
              </div>
              {selectedRun && (
                <button className="casting-run" type="button" onClick={() => navigate(`/runs/${selectedRun.id}`)}>
                  <span>{runTypeLabel(selectedRun.type)}</span>
                  <strong>{selectedRun.title}</strong>
                  <small>{statusLabel(selectedRun.status)}</small>
                </button>
              )}
              <div className="casting-actions">
                <button className="primary-action" type="button" onClick={() => navigate(`/characters/${selectedCharacter.id}`)}>
                  Open profile
                </button>
                <button className="text-button" type="button" onClick={() => navigate(runQuery("needs_review"))}>
                  Review runs
                </button>
              </div>
            </div>
          ) : (
            <EmptyState title="No model selected" body="Create or select a character." />
          )}

          <details className="editor-drawer roster-create" open={data.characters.length === 0}>
            <summary>New character</summary>
            <div className="form-stack">
              <label>
                Name
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Character name" />
              </label>
              <label>
                Summary
                <textarea value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Short identity summary" />
              </label>
              {formError && <div className="notice error">{formError}</div>}
              <button className="primary-action" type="button" onClick={createCharacter} disabled={creating || !name.trim()}>
                {creating ? "Creating" : "Create character"}
              </button>
            </div>
          </details>
        </aside>
      </section>
    </>
  );
}

function CharacterProfilePage({ characterId, navigate }: { characterId: string; navigate: (path: string) => void }) {
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

  async function load() {
    try {
      const response = await fetch(`${apiBaseUrl()}/api/characters/${characterId}`);
      if (!response.ok) {
        throw new Error(response.status === 404 ? "Character not found." : "Unable to load character.");
      }
      const payload = (await response.json()) as { character: CharacterDetail };
      setCharacter(payload.character);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load character.");
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
    await submit(`/api/identity-proposals/${proposal.id}/review`, {
      status,
      constitutionChangeReason: proposal.kind === "constitution_patch" ? constitutionReason : undefined
    }, `Proposal ${status}.`);
  }

  if (loading) {
    return <div className="notice">Loading character profile.</div>;
  }
  if (error && !character) {
    return <div className="notice error">{error}</div>;
  }
  if (!character) {
    return <div className="notice error">Character not found.</div>;
  }

  const activeConstitution = character.constitutions.find((item) => item.is_active === 1) ?? character.constitutions[0];
  const profileReference =
    character.referenceImages.find((item) => item.status === "approved") ?? character.referenceImages[0] ?? null;
  const pendingProposals = character.identityProposals.filter((proposal) => proposal.status === "proposed").length;
  const approvedCanon = character.canon.filter((item) => item.status === "approved").length;
  const latestRun = character.recentRuns[0] ?? null;
  const displayName = displayModelName(character.name);
  const displayCopy = (value: string | null | undefined) => (value ?? "").replaceAll(character.name, displayName);
  const identityStats = [
    { label: "Status", value: character.status.replaceAll("_", " "), detail: "Profile" },
    { label: "Constitution", value: activeConstitution ? `v${activeConstitution.version}` : "None", detail: "Active" },
    { label: "Canon", value: approvedCanon, detail: `${character.canon.length} total` },
    { label: "Signals", value: character.feedback.length + character.reflections.length, detail: `${pendingProposals} pending` }
  ];

  return (
    <>
      <header className="topbar page-heading">
        <div>
          <button className="text-button" type="button" onClick={() => navigate("/characters")}>
            Back to characters
          </button>
          <span className="eyebrow">Identity profile</span>
          <h1>{displayName}</h1>
        </div>
      </header>

      {error && <div className="notice error">{error}</div>}
      {message && <div className="notice">{message}</div>}

      <section className="character-dossier-shell" aria-label="Character dossier">
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
            <span>Model dossier</span>
            <h2>{displayName}</h2>
            <p>{character.summary ?? "No summary yet."}</p>
          </div>
          <div className="button-stack">
            <button className="primary-action" type="button" onClick={startBirthRun}>Birth run</button>
            <button type="button" onClick={() => navigate("/prompt-studio")}>Concept</button>
            <button type="button" onClick={() => navigate(latestRun ? `/runs/${latestRun.id}` : "/runs")}>Timeline</button>
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
            <div><dt>Reference</dt><dd>{profileReference ? profileReference.status.replaceAll("_", " ") : "None"}</dd></div>
            <div><dt>Latest run</dt><dd>{latestRun ? runTypeLabel(latestRun.type) : "None"}</dd></div>
            <div><dt>Review</dt><dd>{pendingProposals ? `${pendingProposals} pending` : "Clear"}</dd></div>
            {displayName !== character.name && <div><dt>Record</dt><dd>{character.name.replace(displayName, "").trim()}</dd></div>}
          </dl>
        </aside>

        <section className="dossier-workbench">
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
              <div className="section-heading"><h2>Identity Proposals</h2></div>
              {character.identityProposals.length === 0 ? <EmptyState title="No proposals" body="No pending identity changes." /> : (
                <div className="compact-list">
                  {character.identityProposals.map((proposal) => (
                    <div key={proposal.id}>
                      <strong>{proposal.kind} · {proposal.status} · {proposal.risk_level}</strong>
                      <small>{displayCopy(proposal.rationale)}</small>
                      <p>{displayCopy(proposal.body)}</p>
                      {proposal.status === "proposed" && (
                        <div className="inline-actions">
                          <button type="button" onClick={() => reviewProposal(proposal, "approved")}>Approve</button>
                          <button type="button" onClick={() => reviewProposal(proposal, "rejected")}>Reject</button>
                        </div>
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
                      <div className="inline-actions">
                        {["approved", "experimental", "rejected"].map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() =>
                              submit(`/api/characters/${characterId}/reference-images/${item.id}/status`, { status }, `Reference marked ${status}.`)
                            }
                          >
                            {status}
                          </button>
                        ))}
                      </div>
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
                      <div className="inline-actions">
                        <button type="button" onClick={() => submit(`/api/characters/${characterId}/canon/${item.id}/status`, { status: "approved" }, "Canon approved.")}>Approve</button>
                        <button type="button" onClick={() => submit(`/api/characters/${characterId}/canon/${item.id}/status`, { status: "rejected" }, "Canon rejected.")}>Reject</button>
                      </div>
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

          <section className="dossier-zone" aria-label="Evidence and response">
            <div className="dossier-zone-heading">
              <span>05</span>
              <h2>Evidence</h2>
            </div>
            <article className="settings-preview">
              <div className="section-heading"><h2>Feedback Loop</h2></div>
              {character.feedback.length === 0 ? <EmptyState title="No feedback yet" body="Log feedback from Publishing." /> : (
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
              <div className="section-heading"><h2>Reflections</h2></div>
              {character.reflections.length === 0 ? <EmptyState title="No reflections" body="Run reflection after response." /> : (
                <div className="compact-list">
                  {character.reflections.map((item) => (
                    <div key={item.id}>
                      <strong>{item.summary}</strong>
                      <small>{item.body}</small>
                      {item.run_id && <button className="text-button" type="button" onClick={() => navigate(`/runs/${item.run_id}`)}>Open run</button>}
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="settings-preview">
              <div className="section-heading"><h2>Recent Timeline</h2></div>
              <div className="run-stack">
                {character.recentRuns.map((run) => (
                  <button className="run-row" key={run.id} type="button" onClick={() => navigate(`/runs/${run.id}`)}>
                    <span><strong>{run.title}</strong><small>{runTypeLabel(run.type)}</small></span>
                    <em className={statusClass(run.status)}>{run.status.replaceAll("_", " ")}</em>
                  </button>
                ))}
              </div>
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
  const [recipe, setRecipe] = useState<PromptRecipe | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedCharacter = data.characters.find((character) => character.id === characterId) ?? data.characters[0] ?? null;
  const selectedCandidate = candidates.find((candidate) => candidate.id === selectedCandidateId) ?? candidates[0] ?? null;
  const selectedBrief = briefs.find((brief) => brief.id === selectedBriefId) ?? briefs[0] ?? null;
  const conceptStats = [
    { label: "Activities", value: candidates.length, detail: selectedCandidate?.status ?? "None" },
    { label: "Briefs", value: briefs.length, detail: selectedBrief?.platform_targets ?? platform },
    { label: "Recipe", value: recipe ? "Ready" : "None", detail: recipe ? "Saved" : "Compose" },
    { label: "Frame", value: platform === "Instagram" ? "4:5" : "9:16", detail: platform }
  ];

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
      setMessage("Activity candidates generated.");
      navigate(`/runs/${payload.run.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to generate activities.");
    }
  }

  async function selectActivity(candidateId: string) {
    await postJson(`/api/activity-candidates/${candidateId}/select`, { status: "selected" });
    await refreshPlanning();
    setSelectedCandidateId(candidateId);
    setMessage("Activity selected.");
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
        captionAngle: `Process-aware caption for ${candidate?.title ?? "the selected activity"}.`,
        disclosureFlags: "synthetic media disclosure",
        desiredOutputs: "image prompt and caption variants"
      });
      await refreshPlanning();
      setSelectedBriefId(payload.brief.id);
      setMessage("Content brief created.");
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
        platform,
        scene,
        generationSettings: { aspectRatio: platform === "Instagram" ? "4:5" : "9:16" }
      });
      setRecipe(payload.recipe);
      setMessage("Prompt recipe composed and saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to compose prompt.");
    }
  }

  if (!selectedCharacter) {
    return (
      <>
        <header className="topbar page-heading">
          <div>
            <span className="eyebrow">Concept workshop</span>
            <h1>Prompt Studio</h1>
          </div>
        </header>
        <section className="concept-command" aria-label="Concept command">
          <article className="concept-hero">
            <span>First run</span>
            <h2>No character</h2>
            <p>Create identity before composing prompts.</p>
            <div className="button-stack">
              <button className="primary-action" type="button" onClick={() => navigate("/characters")}>Open Casting</button>
            </div>
          </article>
          <div className="concept-stat-grid">
            <article><span>Activities</span><strong>0</strong><p>Waiting</p></article>
            <article><span>Briefs</span><strong>0</strong><p>Waiting</p></article>
            <article><span>Recipe</span><strong>None</strong><p>Waiting</p></article>
            <article><span>Frame</span><strong>None</strong><p>Waiting</p></article>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <header className="topbar page-heading"><div><span className="eyebrow">Concept workshop</span><h1>Prompt Studio</h1></div></header>
      {message && <div className="notice">{message}</div>}
      {error && <div className="notice error">{error}</div>}
      <section className="concept-command" aria-label="Concept command">
        <article className="concept-hero">
          <span>Selected character</span>
          <h2>{selectedCharacter?.name ?? "None"}</h2>
          <p>{selectedCandidate?.title ?? "No activity selected"}</p>
          <div className="button-stack">
            <button type="button" onClick={generateActivities} disabled={!characterId}>Activities</button>
            <button type="button" onClick={createBrief} disabled={!characterId}>Brief</button>
            <button className="primary-action" type="button" onClick={composePrompt} disabled={!characterId}>Recipe</button>
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
      <section className="prompt-studio-grid">
        <article className="settings-preview">
          <div className="section-heading"><h2>Compose</h2></div>
          <div className="form-stack">
            <label>Character<select value={characterId} onChange={(event) => setCharacterId(event.target.value)}>{data.characters.map((character) => <option key={character.id} value={character.id}>{displayModelName(character.name)}</option>)}</select></label>
            <label>Platform<select value={platform} onChange={(event) => setPlatform(event.target.value)}>{["Instagram", "TikTok", "Threads", "Generic"].map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Scene / activity<textarea value={scene} onChange={(event) => setScene(event.target.value)} /></label>
            <label>Goal<textarea value={goal} onChange={(event) => setGoal(event.target.value)} /></label>
            <label>Content pillar<input value={contentPillar} onChange={(event) => setContentPillar(event.target.value)} /></label>
          </div>
        </article>
        <article className="settings-preview">
          <div className="section-heading"><h2>Activity Candidates</h2></div>
          {candidates.length === 0 ? <EmptyState title="No candidates" body="Generate activities to start planning." /> : <div className="compact-list">{candidates.map((candidate) => <div key={candidate.id}><strong>{candidate.title} · {candidate.status}</strong><small>{candidate.body}</small><small>{candidate.location_fiction} · {candidate.visual_motif} · identity {candidate.identity_fit_score.toFixed(2)}</small><div className="inline-actions"><button type="button" onClick={() => selectActivity(candidate.id)}>Select</button></div></div>)}</div>}
        </article>
        <article className="settings-preview">
          <div className="section-heading"><h2>Content Briefs</h2></div>
          {briefs.length === 0 ? <EmptyState title="No briefs" body="Create a brief from a selected activity." /> : <div className="compact-list">{briefs.map((brief) => <button className="run-row" key={brief.id} type="button" onClick={() => setSelectedBriefId(brief.id)}><span><strong>{brief.goal}</strong><small>{brief.platform_targets} · {brief.visual_direction}</small></span>{selectedBriefId === brief.id && <em className="status-pill completed">selected</em>}</button>)}</div>}
        </article>
        <article className="settings-preview">
          <div className="section-heading"><h2>Prompt Preview</h2></div>
          {!recipe ? <EmptyState title="No prompt composed" body="Compose a prompt to preview the final assembled recipe." /> : <div className="prompt-preview"><strong>Final prompt</strong><pre>{recipe.final_prompt}</pre><strong>Negative prompt</strong><pre>{recipe.negative_prompt}</pre><small>Constitution: {recipe.constitution_version_id}</small><small>Appearance: {recipe.appearance_profile_id}</small></div>}
        </article>
      </section>
    </>
  );
}

function AssetLibraryPage({ data, navigate }: { data: AppData; navigate: (path: string) => void }) {
  const [characterId, setCharacterId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [platformFit, setPlatformFit] = useState("");
  const [assets, setAssets] = useState<ImageAsset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [selectedAnalyses, setSelectedAnalyses] = useState<AssetAnalysis[]>([]);
  const [recipes, setRecipes] = useState<PromptRecipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [providerOverride, setProviderOverride] = useState("auto");
  const [contentTierOverride, setContentTierOverride] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [reviewReason, setReviewReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);

  function filterAssetsForView(items: ImageAsset[], nextStatus = statusFilter, nextPlatform = platformFit) {
    return items.filter((asset) => {
      const statusMatches = !nextStatus || asset.status === nextStatus;
      const platformMatches = !nextPlatform || asset.latestAnalysis?.platform_fit.includes(nextPlatform);
      return statusMatches && platformMatches;
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
    { label: "Selected", value: selectedAsset ? assetStatusLabel(selectedAsset.status) : "None", detail: selectedAsset?.provider ?? providerOverride }
  ];

  async function loadAssets(next: { characterId?: string; status?: string; platformFit?: string } = {}) {
    const params = new URLSearchParams();
    const nextCharacterId = next.characterId ?? characterId;
    const nextStatus = next.status ?? statusFilter;
    const nextPlatform = next.platformFit ?? platformFit;
    if (nextCharacterId) params.set("characterId", nextCharacterId);
    const response = await fetch(`${apiBaseUrl()}/api/assets${params.size ? `?${params}` : ""}`);
    if (!response.ok) throw new Error("Unable to load assets.");
    const payload = (await response.json()) as { assets: ImageAsset[] };
    setAssets(payload.assets);
    const nextVisibleAssets = filterAssetsForView(payload.assets, nextStatus, nextPlatform);
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
  }, []);

  useEffect(() => {
    loadSelectedDetail(selectedAssetId).catch(() => undefined);
  }, [selectedAssetId]);

  async function changeCharacter(nextCharacterId: string) {
    setCharacterId(nextCharacterId);
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
    setError(null);
    const nextVisibleAssets = filterAssetsForView(assets, nextStatus, nextPlatform);
    setSelectedAssetId((current) => (nextVisibleAssets.some((asset) => asset.id === current) ? current : nextVisibleAssets[0]?.id ?? ""));
  }

  async function generateImage() {
    if (!selectedRecipeId || generationInProgress) return;
    setError(null);
    setGeneratingImage(true);
    setMessage("Image generation started. Waiting for the provider to return an asset.");
    try {
      const payload = await postJson<{ run: RunSummary; asset?: ImageAsset }>(`/api/prompt-recipes/${selectedRecipeId}/generate-image`, {
        providerOverride,
        overrideReason: overrideReason.trim() || undefined,
        contentTierOverride: contentTierOverride || undefined
      });
      setMessage(`Image generation ${payload.run.status}. ${payload.asset ? "Asset stored locally." : "Check Runs for provider details."}`);
      await loadAssets();
      if (payload.asset) {
        setStatusFilter("");
        setPlatformFit("");
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
      setMessage("Image analysis stored.");
      await loadAssets();
      await loadSelectedDetail(assetId);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to analyze asset.");
    }
  }

  async function reviewAsset(assetId: string, status: string) {
    setError(null); setMessage(null);
    try {
      await postJson(`/api/assets/${assetId}/review`, { status, reason: reviewReason || "Manual review from Asset Library." });
      setMessage(`Asset marked ${status}.`);
      await loadAssets();
      await loadSelectedDetail(assetId);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to review asset.");
    }
  }

  async function createDraftFromAsset(assetId: string) {
    setError(null); setMessage(null);
    try {
      await postJson<{ run: RunSummary; draft: Draft }>(`/api/assets/${assetId}/create-draft`, {});
      setMessage("Draft package created.");
      navigate("/drafts");
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

  return (
    <>
      <header className="topbar page-heading">
        <div>
          <span className="eyebrow">Generation floor</span>
          <h1>Library</h1>
        </div>
      </header>
      {message && <div className="notice">{message}</div>}
      {error && <div className="notice error">{error}</div>}
      <section className="asset-command" aria-label="Asset command">
        <article className="asset-hero">
          <span>Route</span>
          <h2>{selectedRecipe ? compactInlineText(selectedRecipe.final_prompt, 28) || selectedRecipe.id.replace("prompt_recipe_", "recipe ").slice(0, 15) : "No recipe"}</h2>
          <p>{generationInProgress ? "Provider running" : selectedAsset ? selectedAsset.status.replaceAll("_", " ") : "No asset selected"}</p>
          <div className="button-stack">
            <button type="button" onClick={() => navigate("/prompt-studio")}>Concept</button>
            <button className="primary-action" type="button" onClick={generateImage} disabled={!selectedRecipeId || generationInProgress}>
              {generationInProgress ? "Generating" : "Generate"}
            </button>
          </div>
          {generationInProgress && (
            <div className="activity-notice" role="status" aria-live="polite">
              <span />
              <strong>{activeImageRun ? activeImageRun.status.replaceAll("_", " ") : "starting"}</strong>
              <small>{activeImageRun ? `Run ${shortRunId(activeImageRun.id)}` : "Submitting request"}</small>
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
      <section className="asset-workbench">
        <article className="settings-preview asset-controls">
          <div className="section-heading"><h2>Filters</h2></div>
          <div className="form-stack">
            <label>Character<select value={characterId} onChange={(event) => changeCharacter(event.target.value)}><option value="">All characters</option>{data.characters.map((character) => <option key={character.id} value={character.id}>{displayModelName(character.name)}</option>)}</select></label>
            <label>Status<select value={statusFilter} onChange={(event) => applyFilters(event.target.value, platformFit)}>{assetStatusOptions.map((item) => <option key={item} value={item}>{item ? item.replaceAll("_", " ") : "All states"}</option>)}</select></label>
            <label>Platform fit<select value={platformFit} onChange={(event) => applyFilters(statusFilter, event.target.value)}>{platformOptions.map((item) => <option key={item} value={item}>{item || "Any platform"}</option>)}</select></label>
            <label>Prompt recipe<select value={selectedRecipeId} onChange={(event) => setSelectedRecipeId(event.target.value)}>{recipes.length === 0 && <option value="">No recipes</option>}{recipes.map((recipe) => <option key={recipe.id} value={recipe.id}>{assetRecipeLabel(recipe)}</option>)}</select></label>
            <details className="editor-drawer asset-route-drawer">
              <summary>Generation routing</summary>
              <div className="form-stack">
                <label>Provider route<select value={providerOverride} onChange={(event) => setProviderOverride(event.target.value)}><option value="auto">Auto router</option><option value="openai">OpenAI</option><option value="comfyui-cloud">ComfyUI Cloud</option><option value="hermes">Hermes</option><option value="wavespeed">WaveSpeed AI</option><option value="mock">Mock</option></select></label>
                <label>Content tier<select value={contentTierOverride} onChange={(event) => setContentTierOverride(event.target.value)}><option value="">Auto classify</option><option value="sfw_standard">SFW standard</option><option value="sfw_sensitive">SFW sensitive</option><option value="mature_adult">Mature adult</option><option value="blocked_or_uncertain">Blocked or uncertain</option></select></label>
                {providerOverride !== "auto" && <label>Override reason<textarea value={overrideReason} onChange={(event) => setOverrideReason(event.target.value)} placeholder="Required for manual provider override" /></label>}
              </div>
            </details>
          </div>
        </article>
        <article className="settings-preview asset-grid-panel">
          <div className="section-heading"><h2>Assets</h2><span>{visibleAssets.length}/{assets.length}</span></div>
          <div className="asset-lane" aria-label="Asset status lanes">
            {assetQuickLanes.map((lane) => (
              <button key={lane.label} className={statusFilter === lane.status ? "selected" : ""} type="button" onClick={() => applyFilters(lane.status, platformFit)}>
                <span>{lane.label}</span>
                <strong>{lane.count}</strong>
              </button>
            ))}
          </div>
          {assets.length === 0 ? <EmptyState title="No assets yet" body="Compose a prompt recipe, then generate the first image." /> : visibleAssets.length === 0 ? <EmptyState title="No matching assets" body="Change filters or generate a new candidate." /> : (
            <div className="asset-grid">
              {visibleAssets.map((asset) => (
                <button key={asset.id} className={`asset-card ${selectedAsset?.id === asset.id ? "selected" : ""}`} type="button" onClick={() => setSelectedAssetId(asset.id)}>
                  <img src={`${apiBaseUrl()}/api/assets/${asset.id}/file`} alt={asset.latestAnalysis?.alt_text ?? asset.kind} />
                  <span><strong>{assetStatusLabel(asset.status)}</strong><small>{asset.provider ?? "unknown provider"} · {formatDate(asset.created_at)}</small></span>
                  {asset.latestAnalysis && <em>{asset.latestAnalysis.identity_match} · {asset.latestAnalysis.identity_score}</em>}
                </button>
              ))}
            </div>
          )}
        </article>
        <article className="settings-preview asset-detail-panel">
          <div className="section-heading"><h2>Review</h2></div>
          {!selectedAsset ? <EmptyState title="No asset selected" body="Select or generate an asset to inspect it." /> : (
            <div className="asset-detail">
              <img src={`${apiBaseUrl()}/api/assets/${selectedAsset.id}/file`} alt={selectedAsset.latestAnalysis?.alt_text ?? "Generated asset"} />
              <div className="score-row">
                <span className={statusClass(selectedAsset.status)}>{assetStatusLabel(selectedAsset.status)}</span>
                <span>{selectedAsset.provider}</span>
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
              ) : <EmptyState title="No analysis" body="Analyze this asset to see identity, quality, and platform-fit scores." />}
              <div className="asset-review-command">
                <button className={!selectedAnalysis ? "primary-action" : ""} type="button" onClick={() => analyzeAsset(selectedAsset.id)}>
                  {selectedAnalysis ? "Re-analyze" : "Analyze"}
                </button>
                <button className={selectedAnalysis ? "primary-action" : ""} type="button" onClick={() => reviewAsset(selectedAsset.id, "approved_post_asset")}>Approve post asset</button>
                <button type="button" onClick={() => createDraftFromAsset(selectedAsset.id)} disabled={selectedAsset.status !== "approved_post_asset"}>Create draft</button>
                <button type="button" onClick={() => regenerateAsset(selectedAsset.id)} disabled={!selectedAsset.prompt_recipe_id}>Regenerate</button>
              </div>
              <details className="editor-drawer asset-decision-drawer">
                <summary>Decision note and alternates</summary>
                <label>Review reason<textarea value={reviewReason} onChange={(event) => setReviewReason(event.target.value)} placeholder="Optional review note" /></label>
                <div className="button-stack">
                  <button type="button" onClick={() => reviewAsset(selectedAsset.id, "approved_reference")}>Approve reference</button>
                  <button type="button" onClick={() => reviewAsset(selectedAsset.id, "rejected_identity_drift")}>Reject identity drift</button>
                  <button type="button" onClick={() => reviewAsset(selectedAsset.id, "rejected_quality")}>Reject quality</button>
                </div>
              </details>
              <details className="raw-details">
                <summary>Prompt</summary>
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
  const [status, setStatus] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [allDrafts, setAllDrafts] = useState<Draft[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState("");
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
  const selectedDraft = drafts.find((draft) => draft.id === selectedDraftId) ?? drafts[0] ?? null;
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

  async function load(nextStatus = status) {
    const params = new URLSearchParams();
    if (nextStatus) params.set("status", nextStatus);
    const [response, allResponse] = await Promise.all([
      fetch(`${apiBaseUrl()}/api/drafts${params.size ? `?${params}` : ""}`),
      params.size ? fetch(`${apiBaseUrl()}/api/drafts`) : null
    ]);
    if (!response.ok || (allResponse && !allResponse.ok)) throw new Error("Unable to load drafts.");
    const payload = (await response.json()) as { drafts: Draft[] };
    const allPayload = allResponse ? ((await allResponse.json()) as { drafts: Draft[] }) : payload;
    setDrafts(payload.drafts);
    setAllDrafts(allPayload.drafts);
    setSelectedDraftId((current) => (payload.drafts.some((draft) => draft.id === current) ? current : payload.drafts[0]?.id ?? ""));
  }

  useEffect(() => {
    load().catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load drafts."));
  }, []);

  async function updateVariant(patch: Partial<PlatformVariant>) {
    if (!selectedVariant) return;
    setError(null); setMessage(null);
    try {
      await patchJson(`/api/platform-variants/${selectedVariant.id}`, patch);
      setMessage("Variant saved.");
      await load();
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

  async function reviewDraft(statusValue: string) {
    if (!selectedDraft) return;
    setError(null); setMessage(null);
    try {
      await patchJson(`/api/drafts/${selectedDraft.id}`, { status: statusValue, reason: "Manual Draft Review Desk action." });
      setMessage(`Draft marked ${statusValue}.`);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to review draft.");
    }
  }

  async function exportDraft() {
    if (!selectedDraft) return;
    setError(null); setMessage(null);
    try {
      await postJson<{ package: PublishingPackage }>(`/api/drafts/${selectedDraft.id}/export`, {});
      setMessage("Export package created.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to export draft.");
    }
  }

  async function publishDraft() {
    if (!selectedDraft || !selectedVariant) return;
    setError(null); setMessage(null);
    try {
      await postJson(`/api/drafts/${selectedDraft.id}/publish`, {
        platform: selectedVariant.platform,
        liveUrl: publishUrl || null,
        notes: publishNotes || "Manual publishing ledger update."
      });
      setMessage("Publishing ledger updated.");
      setPublishUrl("");
      setPublishNotes("");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to mark published.");
    }
  }

  const characterName = (id: string) => {
    const character = data.characters.find((item) => item.id === id);
    return character ? displayModelName(character.name) : "Unknown character";
  };
  const draftStatusOptions = ["needs_review", "approved", "rejected", "exported", "published"];
  const draftCounts = draftStatusOptions.map((value) => ({
    value,
    count: allDrafts.filter((draft) => draft.status === value).length
  }));
  const publishEvent = selectedDraft?.publishingEvents?.find((event) => event.published_at || event.status === "published");
  const hasExport = Boolean(selectedDraft?.packages?.length);
  const draftStage = selectedDraft?.status ?? "";
  const canReviewDraft = draftStage === "needs_review";
  const canExportDraft = draftStage === "approved";
  const canPublishDraft = draftStage === "exported" || hasExport;
  const stageActionLabel = !selectedDraft
    ? "Select draft"
    : canReviewDraft
      ? "Approve or reject"
      : canExportDraft
        ? "Export package"
        : canPublishDraft && !publishEvent
          ? "Ledger publish"
          : "Complete";
  const approvalStages = [
    {
      label: "Review",
      detail: selectedDraft ? selectedDraft.status.replaceAll("_", " ") : "None",
      complete: Boolean(selectedDraft && ["approved", "exported", "published"].includes(selectedDraft.status)),
      active: selectedDraft?.status === "needs_review"
    },
    {
      label: "Variants",
      detail: selectedDraft?.variants?.length ? `${selectedDraft.variants.length} variants` : "None",
      complete: Boolean(selectedDraft?.variants?.length),
      active: selectedDraft?.status === "approved"
    },
    {
      label: "Export",
      detail: hasExport ? "Ready" : "Pending",
      complete: hasExport,
      active: selectedDraft?.status === "exported"
    },
    {
      label: "Publish",
      detail: publishEvent ? "Ledgered" : "Pending",
      complete: Boolean(publishEvent || selectedDraft?.status === "published"),
      active: selectedDraft?.status === "published"
    }
  ];

  return (
    <>
      <header className="topbar page-heading"><div><span className="eyebrow">Approval desk</span><h1>Review Desk</h1></div></header>
      {message && <div className="notice">{message}</div>}
      {error && <div className="notice error">{error}</div>}
      <section className="approval-cockpit" aria-label="Draft approval cockpit">
        <article className="review-command review-command-compact">
          <span>Selected draft</span>
          <strong>{selectedDraft ? selectedDraft.status.replaceAll("_", " ") : "None"}</strong>
          <p>{selectedDraft ? selectedDraft.title : "Select a draft."}</p>
        </article>
        <article className="stage-track">
          {approvalStages.map((stage) => (
            <div className={stage.complete ? "stage-step complete" : stage.active ? "stage-step active" : "stage-step"} key={stage.label}>
              <span aria-hidden="true" />
              <strong>{stage.label}</strong>
              <small>{stage.detail}</small>
            </div>
          ))}
        </article>
      </section>
      <section className="status-lane" aria-label="Draft status filters">
        <button className={!status ? "active" : ""} type="button" onClick={() => { setStatus(""); load("").catch(() => undefined); }}>
          <strong>{allDrafts.length}</strong>
          <span>All drafts</span>
        </button>
        {draftCounts.map((item) => (
          <button className={status === item.value ? "active" : ""} key={item.value} type="button" onClick={() => { setStatus(item.value); load(item.value).catch(() => undefined); }}>
            <strong>{item.count}</strong>
            <span>{item.value.replaceAll("_", " ")}</span>
          </button>
        ))}
      </section>
      <section className="draft-workbench">
        <article className="settings-preview">
          <div className="section-heading"><h2>Drafts</h2><span>{drafts.length}</span></div>
          {drafts.length === 0 ? <EmptyState title="No drafts" body="Approve an asset in the Asset Library, then create a draft package." /> : <div className="compact-list draft-list">{drafts.map((draft) => (
            <button key={draft.id} className={`run-row${selectedDraft?.id === draft.id ? " selected" : ""}`} type="button" onClick={() => setSelectedDraftId(draft.id)}>
              <span><strong>{draft.title}</strong><small>{characterName(draft.character_id)} · {draft.status.replaceAll("_", " ")}</small></span>
              {draft.asset && <img src={`${apiBaseUrl()}/api/assets/${draft.asset.id}/file`} alt={draft.asset.latestAnalysis?.alt_text ?? draft.title} />}
            </button>
          ))}</div>}
        </article>
        <article className="settings-preview draft-detail-panel">
          <div className="section-heading"><h2>Detail</h2></div>
          {!selectedDraft ? <EmptyState title="No draft selected" body="Select a draft to edit variants." /> : (
            <div className="asset-detail">
              <div className="score-row"><span className={statusClass(selectedDraft.status)}>{selectedDraft.status.replaceAll("_", " ")}</span><span>{characterName(selectedDraft.character_id)}</span></div>
              <p className="action-copy">{selectedDraft.summary}</p>
              {selectedDraft.asset?.latestAnalysis && <div className="analysis-panel"><strong>Analysis summary</strong><p>{selectedDraft.asset.latestAnalysis.identity_match} identity match · identity {selectedDraft.asset.latestAnalysis.identity_score} · quality {selectedDraft.asset.latestAnalysis.quality_score}</p></div>}
              <div className="draft-primary-actions" aria-label={stageActionLabel}>
                {canReviewDraft && (
                  <>
                    <button className="primary-action" type="button" onClick={() => reviewDraft("approved")}>Approve</button>
                    <button type="button" onClick={() => reviewDraft("rejected")}>Reject draft</button>
                  </>
                )}
                {canExportDraft && (
                  <>
                    <button className="primary-action" type="button" onClick={exportDraft}>Export package</button>
                    <button type="button" onClick={() => reviewDraft("rejected")}>Reject draft</button>
                  </>
                )}
                {canPublishDraft && !publishEvent && (
                  <button className="primary-action" type="button" onClick={publishDraft}>Mark published</button>
                )}
                {publishEvent && <button type="button" onClick={() => navigate("/calendar")}>Open ledger</button>}
              </div>
              {selectedDraft.asset && <img src={`${apiBaseUrl()}/api/assets/${selectedDraft.asset.id}/file`} alt={selectedDraft.asset.latestAnalysis?.alt_text ?? selectedDraft.title} />}
              <details className="editor-drawer draft-variant-drawer">
                <summary>Platform copy</summary>
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
              <details className="editor-drawer draft-publish-drawer">
                <summary>Publishing ledger</summary>
                <div className="form-stack">
                  <label>Live URL<input value={publishUrl} onChange={(event) => setPublishUrl(event.target.value)} placeholder="https://..." /></label>
                  <label>Publishing notes<input value={publishNotes} onChange={(event) => setPublishNotes(event.target.value)} /></label>
                  <button type="button" onClick={publishDraft}>Mark published</button>
                </div>
                {selectedDraft.packages && selectedDraft.packages.length > 0 && <div className="compact-list"><div><strong>Latest export</strong><small>{selectedDraft.packages[0].files.join(", ")}</small></div></div>}
              </details>
            </div>
          )}
        </article>
      </section>
    </>
  );
}

function CalendarLedgerPage({ navigate }: { navigate: (path: string) => void }) {
  const [events, setEvents] = useState<PublishingEvent[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [latestFeedbackId, setLatestFeedbackId] = useState("");
  const [selectedBucket, setSelectedBucket] = useState("all");
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
      setMessage("Feedback logged.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to log feedback.");
    }
  }
  async function runReflection() {
    if (!latestFeedbackId) return;
    setError(null); setMessage(null);
    try {
      const payload = await postJson<{ run: RunSummary }>(`/api/feedback/${latestFeedbackId}/reflection-run`, {});
      setMessage("Reflection run created.");
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
    exported: "Export",
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
  const selectedEvent =
    filteredEvents.find((event) => event.id === selectedEventId) ??
    filteredEvents[0] ??
    events.find((event) => event.id === selectedEventId) ??
    null;
  const latestPublished = publishedEvents[0] ?? null;
  const selectedDraft = drafts.find((draft) => draft.id === selectedEvent?.draft_id) ?? drafts[0] ?? null;
  const selectedVariant = selectedDraft?.variants?.find((variant) => variant.platform === selectedEvent?.platform) ?? selectedDraft?.variants?.[0] ?? null;
  const selectedAsset = selectedDraft?.asset ?? null;
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
      title: draft.title,
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
    setSelectedEventId(events[nextIndex]?.id ?? null);
  };
  const selectCurrentWindow = () => {
    setSelectedEventId(events[0]?.id ?? null);
  };
  return (
    <>
      <header className="topbar page-heading calendar-topbar">
        <div>
          <h1>Publishing Desk</h1>
          <p>Run control, publishing ledger, and review.</p>
        </div>
      </header>
      {message && <div className="notice">{message}</div>}
      {error && <div className="notice error">{error}</div>}
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
              <span>Publishing ledger</span>
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
                            onClick={() => (item.eventId ? setSelectedEventId(item.eventId) : navigate("/drafts"))}
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
          <section className="review-queue-strip" aria-label="Review queue">
            <div className="section-heading">
              <h2>Review queue ({reviewDrafts.length})</h2>
              <button type="button" onClick={() => navigate("/drafts")}>View all</button>
            </div>
            <div className="review-card-row">
              {reviewDrafts.length === 0 ? <EmptyState title="Queue clear" body="No draft needs review." /> : reviewDrafts.map((draft, index) => (
                <button className="review-mini-card" key={draft.id} type="button" onClick={() => navigate("/drafts")}>
                  {draft.asset?.id ? <img src={`${apiBaseUrl()}/api/assets/${draft.asset.id}/file`} alt="" /> : <span aria-hidden="true" />}
                  <strong><span className={`platform-inline ${platformClass(draft.variants?.[0]?.platform)}`}>{platformIcon(draft.variants?.[0]?.platform, 14)}{platformLabel(draft.variants?.[0]?.platform)}</span></strong>
                  <small>{draft.title}</small>
                  <span className="review-due">Due: Today, {String(10 + index * 2).padStart(2, "0")}:00</span>
                  <em>{draft.status === "needs_review" ? "Review" : draft.status.replaceAll("_", " ")}</em>
                </button>
              ))}
            </div>
          </section>
          <section className="recent-runs-table" aria-label="Recent publishing runs">
            <div className="section-heading">
              <h2>Recent runs</h2>
            </div>
            <table>
              <thead><tr><th>Run ID</th><th>Status</th><th>Character</th><th>Pipeline</th><th>Trigger</th><th>Started</th><th>Duration</th><th /></tr></thead>
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
                    <td><button className="row-action" type="button" aria-label={`Open run ${shortRunId(draft.run_id ?? draft.id)}`}><Command aria-hidden="true" size={16} weight="regular" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
        <aside className="publication-dossier-panel">
          <div className="dossier-heading">
            <span>Publication dossier</span>
            <div className="dossier-heading-actions">
              <button type="button" aria-label="Previous publication" onClick={() => goToEvent(-1)}><CaretLeft aria-hidden="true" size={16} weight="bold" /></button>
              <button type="button" aria-label="Next publication" onClick={() => goToEvent(1)}><CaretRight aria-hidden="true" size={16} weight="bold" /></button>
              <button type="button" aria-label="Close dossier"><XIcon aria-hidden="true" size={16} weight="bold" /></button>
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
                {dossierImageUrl ? <img src={dossierImageUrl} alt={selectedVariant?.alt_text ?? selectedDraft?.title ?? "Publication asset"} /> : <span>VA</span>}
              </div>
              <h2>{selectedDraft?.title ?? (selectedEvent.live_url ? "Live post" : "Ledger entry")}</h2>
              <p>{selectedVariant?.caption ?? selectedEvent.notes ?? "No notes recorded."}</p>
              <dl className="profile-facts calendar-facts">
                <div><dt>Character</dt><dd>{shortRunId(selectedDraft?.character_id)}</dd></div>
                <div><dt>Format</dt><dd>{selectedVariant?.post_format ?? "single image"}</dd></div>
                <div><dt>Tags</dt><dd>{selectedVariant?.hashtags ?? "None"}</dd></div>
                <div><dt>Source run</dt><dd>{shortRunId(selectedDraft?.run_id ?? selectedEvent.draft_id)}</dd></div>
                <div><dt>Status</dt><dd>{selectedEvent.status.replaceAll("_", " ")}</dd></div>
              </dl>
              <div className="approval-stack">
                <div><span className="approval-dot done" /><strong>Content Review</strong><small>{formatDate(selectedEvent.created_at)}</small></div>
                <div><span className="approval-dot" /><strong>Brand Review</strong><small>Pending</small></div>
                <div><span className="approval-dot" /><strong>Publish Approval</strong><small>Pending</small></div>
              </div>
              <div className="draft-primary-actions dossier-actions">
                <button className="primary-action" type="button" onClick={canLogResponse ? submitFeedback : () => navigate("/drafts")} disabled={!selectedEvent.id}>
                  {canLogResponse ? "Log response" : "Open review"}
                </button>
                <button type="button" onClick={runReflection} disabled={!latestFeedbackId}>Run reflection</button>
              </div>
            </div>
          )}
        </aside>
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

function SettingsPage({ navigate }: { navigate: (path: string) => void }) {
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
    outputNodeIds: "",
    defaultForTiers: "sfw_standard"
  });
  const [settingsView, setSettingsView] = useState<SettingsView>("routing");
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
  const opsCards = [
    {
      label: "Provider mode",
      value: settings.mockProviders ? "Mock" : "Live",
      detail: settings.mockProviders ? "Offline" : `${configuredProviderCount} keys`
    },
    {
      label: "Scheduler",
      value: automationStatus?.schedulerEnabled ? "On" : "Off",
      detail: automationStatus?.nextRunAt ? formatDate(automationStatus.nextRunAt) : "Manual"
    },
    {
      label: "Review gates",
      value: automationStatus?.runsNeedingReview.length ?? 0,
      detail: "Pending"
    },
    {
      label: "Default output",
      value: automationSettings.defaultImageProvider,
      detail: `${automationSettings.maxImagesPerRun} image${automationSettings.maxImagesPerRun === 1 ? "" : "s"}`
    }
  ];
  const selectedDefaultCharacterNames = characters
    .filter((character) => selectedCharacters.has(character.id))
    .map((character) => displayModelName(character.name))
    .join(", ");
  const selectedManualCharacter = characters.find((character) => character.id === manualCharacterId);
  const characterManualRecipes = manualRecipes.filter((recipe) => recipe.character_id === manualCharacterId);
  const characterManualAssets = manualAssets.filter((asset) => asset.character_id === manualCharacterId);
  const selectedManualRecipe = characterManualRecipes.find((recipe) => recipe.id === manualPromptRecipeId);
  const selectedManualAsset = characterManualAssets.find((asset) => asset.id === manualAssetId);
  const packageAssetLabel = selectedManualAsset?.status === "candidate" ? "Approve + package" : "Package asset";
  const recipeLabel = (recipe: PromptRecipe) => `${formatDate(recipe.created_at)} · ${compactInlineText(recipe.final_prompt, 54) || recipe.id.replace("prompt_recipe_", "recipe ")}`;
  const assetLabel = (asset: ImageAsset) => `${formatDate(asset.created_at)} · ${asset.status.replaceAll("_", " ")} · ${asset.provider ?? "local"}`;
  const activeWorkflow = workflows.find((workflow) => workflow.id === workflowForm.id);
  const settingsTabs: Array<{ id: SettingsView; label: string; value: string | number; detail: string }> = [
    {
      id: "routing",
      label: "Routing",
      value: settings.mockProviders ? "Mock" : "Live",
      detail: `${configuredProviderCount} key${configuredProviderCount === 1 ? "" : "s"}`
    },
    {
      id: "workflows",
      label: "Workflows",
      value: workflows.length,
      detail: activeWorkflow?.name ?? "Comfy"
    },
    {
      id: "automation",
      label: "Automation",
      value: automationStatus?.schedulerEnabled ? "On" : "Off",
      detail: `${automationStatus?.runsNeedingReview.length ?? 0} review`
    },
    {
      id: "manual",
      label: "Dispatch",
      value: characters.length,
      detail: "Run console"
    }
  ];

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
      setMessage("Daily Activity automation run created.");
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
      setMessage("Activity candidates generated.");
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
      setMessage("Image candidates generated.");
      if (firstRunId) navigate(`/runs/${firstRunId}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to generate image candidates.");
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
      setMessage("Draft package created.");
      navigate(`/runs/${payload.run.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to package asset.");
    }
  }

  return (
    <>
      <header className="topbar page-heading">
        <div>
          <span className="eyebrow">Local controls</span>
          <h1>Operations</h1>
          <p>Provider routing, automation gates, and manual dispatch.</p>
        </div>
      </header>
      {message && <div className="notice">{message}</div>}
      {error && <div className="notice error">{error}</div>}
      <section className="ops-console" aria-label="Local operating summary">
        <article className="ops-hero">
          <span>Studio operations</span>
          <h2>{settings.mockProviders ? "Mock providers active" : "Live providers active"}</h2>
          <p>Routing · gates · runs</p>
          <div className="button-stack">
            <button className="primary-action" type="button" onClick={() => navigate(runQuery("needs_review"))}>Open review gates</button>
            <button type="button" onClick={() => navigate("/runs")}>Open runs</button>
          </div>
        </article>
        <div className="ops-stat-grid">
          {opsCards.map((card) => (
            <article key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <p>{card.detail}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="settings-switcher" aria-label="Settings sections">
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
      {settingsView === "routing" && (
        <section className="settings-grid settings-workbench routing-workbench">
          <article className="settings-preview settings-primary-panel">
            <div className="section-heading"><h2>Provider routing</h2><span>{routingDirty ? "Unsaved" : "Saved"}</span></div>
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
                <button type="button" onClick={() => testProvider("image_generation")} disabled={routingDirty || imageProviderNeedsComfyWorkflow}>Test image</button>
                <button type="button" onClick={() => testProvider("image_analysis")} disabled={routingDirty}>Test analysis</button>
              </div>
            </div>
          </article>
          <article className="settings-preview provider-matrix">
            <div className="section-heading"><h2>Provider keys</h2><span>{configuredProviderCount}</span></div>
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
      {settingsView === "automation" && (
        <section className="settings-grid settings-workbench automation-workbench">
          <article className="settings-preview settings-primary-panel">
            <div className="section-heading"><h2>Scheduler</h2><span>{automationDirty ? "Unsaved" : "Saved"}</span></div>
            <div className="form-stack">
              <label className="checkbox-row">
                <input type="checkbox" checked={automationSettings.enableDailyActivityRuns} onChange={(event) => updateAutomation({ enableDailyActivityRuns: event.target.checked })} />
                Daily runs
              </label>
              <label>Time<input type="time" value={automationSettings.dailyRunTime} onChange={(event) => updateAutomation({ dailyRunTime: event.target.value })} /></label>
              <label>Platforms<input value={defaultPlatformsText} onChange={(event) => updateAutomation({ defaultPlatforms: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} /></label>
              <div className="metric-grid">
                <label>Image<select value={automationSettings.defaultImageProvider} onChange={(event) => updateAutomation({ defaultImageProvider: event.target.value })}><option value="mock">Mock</option><option value="openai">OpenAI</option><option value="hermes">Hermes</option><option value="comfyui-cloud">ComfyUI Cloud</option><option value="wavespeed">WaveSpeed AI</option></select></label>
                <label>Analysis<select value={automationSettings.defaultAnalysisProvider} onChange={(event) => updateAutomation({ defaultAnalysisProvider: event.target.value })}><option value="mock">Mock</option><option value="hermes">Hermes</option></select></label>
                <label>Images/run<input type="number" min="1" max="4" value={automationSettings.maxImagesPerRun} onChange={(event) => updateAutomation({ maxImagesPerRun: Number(event.target.value) })} /></label>
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
              <summary>Default characters</summary>
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
            <div className="section-heading"><h2>Run command</h2></div>
            <div className="form-stack">
              <label>Character<select value={manualCharacterId} onChange={(event) => setManualCharacterId(event.target.value)}>{characters.map((character) => <option key={character.id} value={character.id}>{displayModelName(character.name)}</option>)}</select></label>
              <dl>
                <div><dt>Mode</dt><dd>{selectedManualCharacter?.status ?? "No character"}</dd></div>
                <div><dt>Recipes</dt><dd>{characterManualRecipes.length}</dd></div>
                <div><dt>Assets</dt><dd>{characterManualAssets.length}</dd></div>
              </dl>
              <div className="settings-action-grid manual-actions">
                <button className="primary-action" type="button" onClick={runDailyNow} disabled={!manualCharacterId}>Daily run</button>
                <button type="button" onClick={generateActivityCandidates} disabled={!manualCharacterId}>Activities</button>
                <button type="button" onClick={analyzeLatestCandidates} disabled={!manualCharacterId}>Analyze</button>
              </div>
            </div>
          </article>
          <article className="settings-preview">
            <div className="section-heading"><h2>Targeted runs</h2></div>
            <div className="form-stack">
              <label>Recipe
                <select value={manualPromptRecipeId} onChange={(event) => setManualPromptRecipeId(event.target.value)} disabled={characterManualRecipes.length === 0}>
                  {characterManualRecipes.length === 0 ? <option value="">No recipes</option> : characterManualRecipes.map((recipe) => <option key={recipe.id} value={recipe.id}>{recipeLabel(recipe)}</option>)}
                </select>
              </label>
              <div className="compact-dossier">
                <span>{selectedManualRecipe?.id.replace("prompt_recipe_", "Recipe ") ?? "No recipe selected"}</span>
                <p>{selectedManualRecipe?.final_prompt?.slice(0, 150) ?? "Compose in Prompt Studio."}</p>
              </div>
              <button type="button" onClick={generateImageCandidates} disabled={!manualPromptRecipeId.trim()}>Generate images</button>
              <label>Asset
                <select value={manualAssetId} onChange={(event) => setManualAssetId(event.target.value)} disabled={characterManualAssets.length === 0}>
                  {characterManualAssets.length === 0 ? <option value="">No assets</option> : characterManualAssets.map((asset) => <option key={asset.id} value={asset.id}>{assetLabel(asset)}</option>)}
                </select>
              </label>
              <div className="compact-dossier">
                <span>{selectedManualAsset?.id.replace("asset_", "Asset ") ?? "No asset selected"}</span>
                <p>{selectedManualAsset ? `${selectedManualAsset.status.replaceAll("_", " ")} · ${formatBytes(selectedManualAsset.size_bytes)} · ${selectedManualAsset.latestAnalysis?.recommended_action ?? "No review signal"}` : "Generate or approve an asset first."}</p>
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
    if (path === "/runs") {
      return <RunsPage data={data} loading={loading} error={error} navigate={navigate} />;
    }
    if (runDetailMatch) {
      return <RunDetailPage runId={runDetailMatch[1]} navigate={navigate} />;
    }
    if (path === "/characters") {
      return <CharactersPage data={data} loading={loading} error={error} navigate={navigate} />;
    }
    if (characterDetailMatch) {
      return <CharacterProfilePage characterId={characterDetailMatch[1]} navigate={navigate} />;
    }
    if (path === "/settings") {
      return <SettingsPage navigate={navigate} />;
    }
    if (path === "/prompt-studio") {
      return <PromptStudioPage data={data} navigate={navigate} />;
    }
    if (path === "/assets") {
      return <AssetLibraryPage data={data} navigate={navigate} />;
    }
    if (path === "/drafts") {
      return <DraftReviewDesk data={data} navigate={navigate} />;
    }
    if (path === "/calendar") {
      return <CalendarLedgerPage navigate={navigate} />;
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
