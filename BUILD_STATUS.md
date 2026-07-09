# Virtual Agency Studio Build Status

## Phase Checklist

- [x] Phase 0: Repository audit, architecture decision, AGENTS.md, BUILD_STATUS.md
- [x] Phase 1: Project scaffold and local dev foundation
- [x] Phase 2: Database schema, migrations, seed data, local file storage
- [x] Phase 3: Run/event machine spine
- [x] Phase 4: Agency Heartbeat dashboard and Runs machine-room UI
- [x] Phase 5: Character Registry and Character Birth flow
- [x] Phase 6: Provider abstraction: Hermes, ComfyUI Cloud, mock providers
- [x] Phase 7: Prompt Studio, activity candidates, and content brief generation
- [x] Phase 8: Image generation and Hermes analysis loop
- [x] Phase 9: Draft Review Desk, platform variants, and export packages
- [x] Phase 10: Social feedback, reflection, memory, canon proposals
- [x] Phase 11: Automation scheduler and daily activity cron/manual trigger
- [x] Phase 12: MVP hardening, tests, docs, and demo script

## Current Phase

Phase 12 complete. MVP build package implemented and verified locally. Provider routing hardening implemented and verified.

## UX Refactor Status

- [x] UX Phase 0: Docs and guardrails
- [x] UX Phase 1: Navigation and language refactor
- [x] UX Phase 2: Director's Desk
- [x] UX Phase 3: Roster and Talent Profile
- [x] UX Phase 4: Scouting / Birth
- [x] UX Phase 5: Bookings / Production
- [x] UX Phase 6: Review Desk
- [x] UX Phase 7: Audience and Strategy
- [x] UX Phase 8: Studio Ops containment
- [x] Final UX QA hardening pass

Current UX refactor phase: Phase 8 complete and final QA hardening pass captured. UX refactor rollout is complete through the documented handoff phases.

UX Phase 0 added repo-local guardrails from the handoff package:

- `docs/ux-refactor/UX_PRODUCT_MODEL.md`
- `docs/ux-refactor/UX_COPY_MAP.md`
- `docs/ux-refactor/UX_SCREEN_CONTRACTS.md`
- `docs/ux-refactor/UX_GUARDRAILS.md`

UX Phase 0 verification:

- `git diff --check`
- `npm run typecheck`
- `npm run test`
- `npm run build`

UX Phase 0 outcome:

- Phase 1 completed the runtime navigation and language refactor that remained after the docs-only phase.

UX Phase 1 changed:

- Primary navigation now uses agency-facing labels: Director's Desk, Roster, Scouting, Bookings, Portfolio, Review Desk, Publishing, Audience, Studio Ops, and Guide.
- The `/runs` route remains functional but is demoted into Studio Ops as Production Logs.
- Shell copy now says Virtual talent agency, Agency Director, Director, and Studio Ops Health.
- Key page headings and CTAs now use agency language such as Booking Desk, Start Production, Review Quality, Create Social Package, Prepare Placement Package, Mark Live, and Debrief Audience Response.

UX Phase 1 verification:

- Old shell/nav/CTA phrase search returned no matches for the targeted Phase 1 terms.
- `git diff --check`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run verify:design`

UX Phase 1 known gaps:

- This phase did not redesign layouts or hide existing technical-heavy controls inside Portfolio and Studio Ops.
- Director's Desk structural debt was carried into Phase 2.

UX Phase 2 changed:

- Director's Desk now starts with Today's Decisions, Star Watch, Today's Bookings, Audience Signals, Publishing Follow-up, and collapsed Studio Ops Health.
- Home-screen data is translated through a frontend `buildDirectorDeskModel` read model before rendering director-facing sections.
- The primary CTA is `Review Today's Decisions`.
- Active production, review queues, publishing follow-up, audience response, and career direction are framed as agency decisions instead of default technical status panels.
- Studio Ops details are collapsed by default and expose API, production engine, schedule, and failed-production status only when expanded.

UX Phase 2 verification:

- Targeted stale-copy search returned no matches for the prior home hierarchy and machine/system terms.
- `git diff --check`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run verify:design`
- Runtime smoke: local API `/health`, local API `/api/workflow/summary`, and web `/` returned OK from `npm run dev`.

UX Phase 2 known gaps:

- The Director's Desk still derives some subcounts from existing workflow summary detail text. A future `/api/director/desk` read model should provide structured DirectorDecision records.
- Star Watch uses available run/setup heuristics, not real momentum, audience pull, or development-risk scoring.
- Today's Bookings can identify active or scheduled work, but richer booking purpose/platform summaries should wait for the Bookings phase.

UX Phase 3 changed:

- Roster now uses provisional talent lanes: Star Talent, Core Talent, Rising Talent, Development, New Faces, At Risk, and Paused / Retired.
- Roster cards show stage, positioning, best platform, momentum, latest audience signal, and next recommended move instead of raw status or latest technical run names.
- Talent Profile now starts with a career-facing Comp Card, Stage, Agency Priority, Best Platform, Momentum, Identity Stability, Development Risk, and Next Recommended Move.
- Pending identity proposals are surfaced as Career Direction Proposals under Director Approvals.
- Detailed Constitution, Canon, Memory, Appearance Bible, Voice Guide, Platform Personas, and reference editing are kept in a collapsed Identity Bible section.
- Recent production is translated into a Career Timeline with agency event labels and Production Logs as the traceability escape hatch.

UX Phase 3 verification:

- Targeted stale-copy search returned no matches for the prior roster/profile hierarchy terms.
- `git diff --check`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run verify:design`
- Runtime smoke: local API `/health`, web `/talent`, web `/characters/:id`, and API `/api/characters/:id` returned OK from `npm run dev`.

UX Phase 3 known gaps:

- Roster lane placement is still a frontend heuristic because `/api/characters` does not expose feedback, proposals, assets, or publishing history.
- Talent scoring is intentionally qualitative; future `/api/talent-careers` or `/api/strategy/star-board` read models should provide structured momentum, audience pull, and risk signals.
- Portfolio Highlights currently uses reference images because approved portfolio-shot summaries are not yet exposed on the Talent Profile response.

UX Phase 4 changed:

- Scouting now opens as a guided New Face Intake workflow with Market Opportunity, Identity Seed, Look Direction, Voice and Inner Life, Platform Fit, First Portfolio Test, and New Face Dossier steps.
- Intake uses existing endpoints: new talent summary, initial constitution, appearance, voice, and platform persona records are saved without adding a backend wizard table.
- The selected candidate now renders a director-facing New Face Dossier with public promise, visual direction, voice/interiority, best initial platform, development risk, recommended first booking, and director decision.
- Director decisions now act on the New Face with `Approve New Face`, `Revise Identity`, and `Reject Concept` controls.
- Birth output stays available as a secondary Birth Dossier / Production Log link instead of routing the user straight to the run timeline.
- Added `buildNewFaceDossier` as a frontend read model and covered it with a unit test to keep dossier copy director-facing.

UX Phase 4 verification:

- Targeted stale-copy search returned no matches for the prior Scouting router hierarchy terms.
- `git diff --check`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run verify:design`
- Runtime smoke: local API `/health`, local API `/api/characters`, web `/create`, and web `/talent` returned OK from `npm run dev`.

UX Phase 4 known gaps:

- Reference image upload still lives in the Talent Profile Identity Bible; the Scouting page captures reference constraints and drift risk but does not yet upload a file inline.
- The New Face Dossier is a frontend read model derived from existing character/run records. A future backend read endpoint should provide structured scouting dossier data.
- Birth Run artifacts are still stored as technical run artifacts; Phase 4 changes their placement and language, not the underlying artifact schema.

UX Phase 5 changed:

- Booking Desk now centers the agency chain: Booking Idea, Shoot Brief, Creative Treatment, and Production.
- Added `buildBookingDeskModel` to translate existing activity candidates, content briefs, and prompt recipes into an assignment-facing Booking model.
- Added a visible Audience Hypothesis field and persists it into existing shoot brief output text without adding a backend table.
- Removed the automatic jump to Production Logs after proposing booking ideas; the operator remains in the Booking Desk flow.
- `Start Production` is now the primary action once a creative treatment is ready and calls the existing image-generation endpoint before routing candidate shots into Portfolio.
- Full treatment source, negative prompt, treatment ID, identity IDs, and lineage are collapsed under `Technical treatment audit`.

UX Phase 5 verification:

- Targeted stale-copy search returned no Booking Desk matches for prior Prompt Studio labels: Generate activities, Activity Candidate, Content brief, Compose recipe, Prompt recipe, Generate image, Final prompt, and Prompt lineage.
- `git diff --check`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run verify:design`
- Runtime smoke: local API `/health`, local API `/api/characters`, and web `/prompt-studio` returned OK from `npm run dev`.

UX Phase 5 known gaps:

- The Booking model is still a frontend read model over activity candidates, content briefs, and prompt recipes. A future `/api/bookings` endpoint should provide structured assignment status.
- Audience hypothesis is stored in existing brief output text for this pass; it should become a first-class field before Audience Response evaluation depends on it.
- Production setup selection remains in Portfolio, while provider/routing details remain in Studio Ops and Production Logs; Booking Desk starts production with default routing.

UX Phase 6 changed:

- Review Desk now renders a unified Decision Queue rather than a social-package-only workbench.
- Added `buildReviewDecisionPackets` to translate candidate portfolio shots, social packages, proposed career updates, and unrepresented review-gated production jobs into director-facing decision packets.
- Each selected packet answers: what this is, recommendation, why, risk, what happens next, and director actions.
- Portfolio decisions can run quality review, approve for publishing, add to portfolio, request revision, or reject through the existing asset endpoints.
- Social-package decisions can approve, request revision, reject, edit platform copy, prepare placement packages, or mark live through the existing draft and publishing endpoints.
- Career direction proposals can be approved or rejected from Review Desk through the existing identity proposal endpoint.
- Raw prompts, provider details, IDs, route/source records, and JSON remain available only under collapsed `Technical audit`.

UX Phase 6 verification:

- Added a focused Review Desk read-model test confirming packet types, required decision fields, action labels, and default technical-source containment.
- `npm --workspace @virtual-agency/web run test`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run verify:design`
- `git diff --check`
- Targeted stale-copy search found no default Review Desk matches for the prior draft-only review labels or uncollapsed technical labels; remaining matches were the test assertion and Studio Ops help text.
- Runtime smoke: local API `/health`, `/api/drafts`, `/api/assets`, `/api/characters`, `/api/characters/:id`, and web `/review` returned OK from `npm run dev`.

UX Phase 6 known gaps:

- Review Desk still computes decision packets in the frontend. A future `/api/director-decisions` or `/api/review-queue` endpoint should provide this as a structured backend read model.
- Studio attention packets can open the production log, but there is not yet a director-facing recover/retry action outside Studio Ops.
- Revision requests for social packages still map to the existing rejected status because the backend has no separate `needs_revision` draft state.

UX Phase 7 changed:

- Audience now centers `Audience Debrief` before metric entry, answering what worked, what failed, comment themes, meaning for talent, recommended next test, and Career Direction.
- Added `buildAudienceDebriefModels` to translate existing `SocialFeedback`, feedback reflections, and identity proposals into director-facing debriefs.
- Audience feedback reflection now keeps the operator on the Audience screen and reloads debrief/proposal data instead of routing into the production log.
- Career Direction proposal actions are available from the selected debrief: `Approve Memory Update`, `Add to Canon`, Identity Bible approval, and `Ignore Signal`.
- Raw feedback records, reflection payloads, IDs, and derivation details are contained under collapsed `Metrics detail`, `Technical audit`, and `Strategy derivation`.
- Added `Strategy / Star Board` with Star Talent, Core Talent, Rising Talent, Development Bets, At Risk, and Paused / Retired lanes.
- Added `buildStrategyBoardModel` to rank represented talent by momentum, audience pull, identity strength, platform fit, development risk, agency priority, and recommended investment.
- The response logging form remains available as a secondary `Log New Response` panel for live placements.

UX Phase 7 verification:

- Added focused read-model tests for Audience Debrief wording/proposal linking and Strategy / Star Board lane assignment.
- `npm --workspace @virtual-agency/web run test`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run verify:design`
- `git diff --check`
- Targeted containment search confirmed Audience defaults now expose debrief/strategy labels while raw metric/detail/source surfaces remain behind collapsed sections.
- Runtime smoke: local API `/health`, `/api/publishing-events`, `/api/characters`, `/api/characters/:id`, and web `/insights` returned OK from `npm run dev`.

UX Phase 7 known gaps:

- Audience Debrief and Strategy / Star Board are still frontend read models. A future `/api/audience-debriefs` and `/api/strategy/star-board` should provide backend-owned ranking and debrief records.
- Strategy lane placement intentionally uses transparent heuristics over available feedback/reflection/proposal data, not statistically normalized performance scoring.
- Audience response is still manually logged from published events; there is no platform API ingestion or historical baseline calculation yet.

UX Phase 8 changed:

- Studio Ops now has an explicit technical workbench model with Overview, Production Logs, Providers, Workflow Engines, Automation, Console, and Technical Audit sections.
- Added `buildStudioOpsModel` to translate health, provider settings, automation status, workflows, prompt recipes, assets, and runs into a bounded Studio Ops read model.
- `/settings` now answers the Studio Ops question: `What did the machine do, and is the studio configured correctly?`
- Production Logs are available as the Studio Ops run index and recent-log ledger; `/runs/:id` is relabeled as `Production Log` with the detail question `What happened behind the scenes?`
- Provider routing, scheduler controls, workflow engines, manual dispatch, raw IDs, settings snapshots, and automation snapshots are contained inside Studio Ops tabs rather than normal agency workflow surfaces.
- Added responsive layouts for the Studio Ops overview, production log ledger, and technical audit panels.

UX Phase 8 verification:

- Added a focused Studio Ops read-model test confirming tab labels, production log counts, provider readiness, and technical audit IDs.
- `npm --workspace @virtual-agency/web run test`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run verify:design`
- `git diff --check`
- Targeted containment search found no stale `settingsView === "routing"`, `opsCards`, `Run Detail`, `Provider Jobs`, `Run list`, or `Production engine keys` matches. Remaining technical ID matches are Studio Ops audit, Production Log detail, schema fields, prior status history, or test fixtures.
- Runtime smoke: local API `/health`, `/api/settings/providers`, `/api/settings/automation`, and `/api/runs` returned OK; web `/settings`, `/runs`, and `/runs/:id` returned OK from `npm run dev`.
- Hydrated browser smoke: `/settings` rendered Studio Ops hero copy, Production Logs, Providers, Workflow Engines, Automation, Console, and Technical Audit sections.
- Ports `4317` and `5173` were clear after stopping the dev server.

UX Phase 8 known gaps:

- Studio Ops is still a frontend aggregation over existing API endpoints. A future `/api/studio-ops` read endpoint should provide the same technical model from the backend.
- Production Log detail still exposes provider jobs, event payloads, and artifact internals by design; this is acceptable inside Studio Ops but should remain secondary from agency screens.
- Standalone Playwright is not installed in the repo. Hydrated browser verification covered `/settings`; `/runs/:id` was verified through route smoke and source inspection.

Final UX QA hardening changed:

- Captured final route screenshots under `docs/ux-refactor/final-qa-audit/screenshots` and summarized findings in `docs/ux-refactor/final-qa-audit/README.md`.
- Fixed Booking Desk desktop horizontal overflow by making the assignment grid use flexible equal-width columns.
- Fixed mobile nav label clipping by widening mobile nav items.
- Hardened Director's Desk and Portfolio copy so default agency-facing screens say production setup/studio setup instead of route/provider-engine language.
- Hardened Portfolio cards and generated asset alt text so provider names, raw asset IDs, and mock-generated alt text do not leak into the default agency-facing or assistive-technology surface.

Final UX QA hardening verification:

- In-app browser screenshot audit covered `/`, `/talent`, `/characters/:id`, `/create`, `/prompt-studio`, `/library`, `/review`, `/calendar`, `/insights`, `/settings`, `/runs`, `/runs/:id`, plus mobile `/` and `/settings`.
- Refreshed `/` and `/library` screenshots with local Chrome headless directly into `docs/ux-refactor/final-qa-audit/screenshots` after the last Portfolio copy and alt-text hardening patch.
- Post-fix DOM checks showed no horizontal overflow or clipped text on Booking Desk desktop, Director's Desk mobile, and Studio Ops mobile.
- Visible text leak checks for Review Desk, Audience Strategy, and Portfolio found no default raw run IDs, prompt recipe IDs, provider jobs, route tiers, raw JSON, workflow JSON, or payload wording after the hardening patch.
- `npm --workspace @virtual-agency/web run test`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run verify:design`
- `git diff --check`
- `sips -g pixelWidth -g pixelHeight docs/ux-refactor/final-qa-audit/screenshots/*.png`
- Ports `4317` and `5173` were clear after stopping the dev server.

Final UX QA hardening known gaps:

- Generated publishing package names can still include UUID-like suffixes; treat this as data/content naming debt for a later publishing-package naming pass.
- Long full-page mobile screenshots from the in-app browser preview can appear cropped in the chat image viewer even when DOM overflow checks pass. Use direct browser capture review for pixel-perfect mobile signoff.
- Two refreshed desktop screenshots are Chrome headless viewport captures (`1286 x 900`) instead of the earlier full-page in-app browser captures so the final visual evidence matches the last hardening patch without writing through a stale external Playwright output root.
- This pass did not claim full WCAG compliance; it focused on rendered layout, language boundaries, visible technical leakage, and route-level workflow clarity.

## What Changed

- Audited the repository and confirmed it is a new/empty app repo with only the supplied build package.
- Created `AGENTS.md` with local project conventions, planned commands, and product guardrails.
- Created `ARCHITECTURE_DECISION.md` with the stack decision and Phase 1 structure.
- Created this status tracker with all MVP phases.
- Created the TypeScript npm workspace with `apps/api`, `apps/web`, `packages/shared`, and `packages/providers`.
- Added Fastify API endpoints for `GET /health` and `GET /api/version`.
- Added the Vite React app shell with sidebar navigation, Agency Heartbeat dashboard, Settings preview, and live API health display.
- Added shared Zod schemas for API health, run status, and character status.
- Added provider interfaces plus mock image generation and mock image analysis providers.
- Added local data directories, `.env.example`, README setup instructions, and root scripts.
- Added SQLite support through Node's built-in `node:sqlite` module.
- Added explicit migration statements for the MVP tables listed in the build pack.
- Added local storage helpers for `data/assets` and `data/exports`.
- Added seed command with one demo character, constitution, appearance profile, voice guide, platform personas, canon, memory, and completed demo run with events.
- Added API endpoints for listing characters, runs, run details, and run events.
- Added database initialization and seed tests.
- Added shared run type and run event type schemas.
- Added backend run services for `createRun`, `appendRunEvent`, `updateRunStatus`, `attachRunArtifact`, `recordRunDecision`, `failRun`, `completeRun`, and `cancelRun`.
- Added a simple in-process queue abstraction with `enqueueRun` and `processNext`.
- Added API endpoints for creating runs, processing the next queued run, and cancelling runs.
- Expanded run detail responses to include events, artifacts, and decisions.
- Added tests for run creation, queue processing, cancellation, and API create/process behavior.
- Replaced the placeholder web dashboard with live API-backed polling for health, characters, and runs.
- Added Agency Heartbeat cards for running runs, failed runs, runs needing review, recent completed runs, active characters, and draft review placeholder.
- Added `/runs` page with status/type filters and a run table showing character, status, current step, started time, and completed time.
- Added `/runs/:id` detail page with run summary, status pill, progress timeline, event list, artifacts, errors/warnings, decisions, and next recommended action.
- Kept raw event/artifact payloads behind expandable details.
- Added loading, empty, and error states.
- Added character create/edit API endpoints and profile detail payloads.
- Added Constitution versioning with required change reasons and active-version selection.
- Added Canon entries with proposed/approved/rejected states and approval/rejection actions.
- Added Memory entries with source type, source run ID, confidence, and importance metadata.
- Added Appearance Bible, Voice Guide, Platform Persona, and Reference Image APIs.
- Added local reference image upload via base64 API payloads into `data/assets`.
- Added deterministic Character Birth Run service that loads identity context, emits `context.loaded`, attaches birth summary and prompt core artifacts, and ends in `needs_review`.
- Added `/characters` roster/create UI and `/characters/:id` profile editor with all Phase 5 sections.
- Added UI actions for starting a Character Birth Run, activating constitution versions, approving/rejecting canon, and marking reference image status.
- Expanded `packages/providers` with normalized image generation, image analysis, creative text, and provider job status types.
- Implemented mock image generation, mock image analysis, and mock creative text providers for offline demos.
- Implemented configurable Hermes image generation and image analysis adapters without hardcoded endpoint assumptions.
- Implemented configurable ComfyUI Cloud image generation adapter with workflow payload support.
- Added provider settings persistence and redacted settings responses.
- Added provider settings API: `GET /api/settings/providers`, `PATCH /api/settings/providers`, `POST /api/settings/providers/test`.
- Wired provider tests into `ProviderJobs` and `RunEvents` with `provider.requested`, `provider.completed`, and `provider.failed` events.
- Added provider jobs to run detail responses and UI.
- Added `/settings` UI for mock mode, default providers, endpoint paths, saved-key indicators, and provider test actions.
- Added Activity Candidate persistence with location fiction, activity type, visual motif, platform fit, identity fit, campaign fit, freshness, and selected/rejected state.
- Added Content Brief persistence with optional campaign/activity lineage, goals, platform targets, content pillar, visual direction, caption angle, disclosure flags, and desired outputs.
- Added Prompt Recipe persistence with content brief, active constitution, appearance profile, assembled final prompt, negative prompt, generation settings, and lineage metadata.
- Added deterministic activity generation service that creates five candidates, emits `context.loaded` and `activity.proposed` events, attaches a candidates artifact, and ends in `needs_review`.
- Added candidate selection, content brief creation, and prompt composition services with run events and artifacts.
- Added Phase 7 APIs: `POST /api/characters/:id/activity-runs`, `GET /api/activity-candidates`, `POST /api/activity-candidates/:id/select`, `GET/POST /api/content-briefs`, `GET /api/prompt-recipes`, and `POST /api/prompt-recipes/compose`.
- Added `/prompt-studio` UI for choosing a character/platform, generating activities, selecting candidates, creating briefs, composing prompt recipes, and previewing final prompt lineage.
- Extended Asset and Asset Analysis persistence for prompt recipe lineage, run lineage, local file metadata, normalized identity/quality/story scores, platform fit, quality issues, identity notes, suggested prompt fixes, alt text, and recommended action.
- Added image generation service that takes a prompt recipe, uses the selected image generation provider, records provider jobs/events, materializes generated output into `data/assets`, stores an asset, emits `image.generated`, and handles provider failures visibly.
- Added image analysis service that takes an asset, uses the selected analysis provider, records provider jobs/events, stores normalized analysis, emits `image.analyzed`, and promotes raw generations to candidates.
- Added asset review actions for approving draft assets, approving references, rejecting identity drift, rejecting quality, rejecting policy, archiving/publishing states, and recording RunEvents/RunDecisions.
- Added regeneration from suggested prompt fixes while preserving prompt recipe lineage.
- Added Phase 8 APIs: `POST /api/prompt-recipes/:id/generate-image`, `GET /api/assets`, `GET /api/assets/:id`, `GET /api/assets/:id/file`, `POST /api/assets/:id/analyze`, `POST /api/assets/:id/review`, and `POST /api/assets/:id/regenerate`.
- Replaced the Assets placeholder with `/assets` Asset Library UI: character/status/run-adjacent filters, platform-fit filter, prompt recipe picker, image grid, asset detail/review panel, score badges, quality issues, suggested fixes, prompt drawer, approve/reject actions, and regenerate action.
- Extended Draft, PlatformVariant, PublishingPackage, and PublishingEvent persistence with content brief/prompt/asset lineage, export file manifests, publishing status, live URL, and first-class disclosure flags.
- Added Draft Packaging Run service that starts from an approved/candidate asset, creates a draft, creates Instagram/TikTok/Threads/generic variants, emits `draft.created` and `review.required`, and stores a draft package artifact.
- Added editable platform variants with caption, hashtags, alt text, disclosure text, AI-generated flag, paid partnership flag, brand content flag, readiness notes, and status.
- Added local export package generation under `data/exports` with copied asset, platform caption files, `hashtags.txt`, `alt_text.txt`, `disclosure_checklist.md`, and `metadata.json`.
- Added manual publishing ledger actions for exported/published states, platform, live URL, notes, and published timestamp.
- Added Phase 9 APIs: `POST /api/assets/:id/create-draft`, `GET /api/drafts`, `GET /api/drafts/:id`, `PATCH /api/drafts/:id`, `PATCH /api/platform-variants/:variantId`, `POST /api/drafts/:id/export`, `POST /api/drafts/:id/publish`, and `GET /api/publishing-events`.
- Replaced `/drafts` placeholder with Draft Review Desk UI for draft list/status filter, asset thumbnail, analysis summary, platform variant editors, disclosure checklist flags, approve/reject/export actions, and manual publish ledger entry.
- Replaced `/calendar` placeholder with Publishing Ledger UI showing planned, draft ready, exported, published, and needs feedback buckets plus ledger entries.
- Extended SocialFeedback persistence with publishing event/character lineage, published URL, impressions/views, reach, likes, comments, shares, saves, profile visits, follows gained, qualitative notes, top comments, and operator judgment.
- Extended Reflection and IdentityUpdateProposal persistence with draft/feedback lineage, structured reflection JSON, rationale, source run/reflection IDs, risk level, and review status.
- Added feedback logging and reflection APIs: `POST /api/publishing-events/:id/feedback`, `GET /api/characters/:id/feedback`, `POST /api/feedback/:feedbackId/reflection-run`, and `POST /api/identity-proposals/:proposalId/review`.
- Added deterministic Feedback Reflection Run service that loads character identity context, draft, latest asset analysis, social feedback, platform variants, active Constitution, Canon, and Memory, then emits structured reflection output and human-review proposals.
- Added proposal approval behavior: memory approvals create feedback-sourced Memory entries, canon approvals create approved Canon entries, and Constitution patch approvals require an explicit change reason before creating a new active Constitution version.
- Added Social Feedback form to `/calendar` with metric inputs, qualitative notes, top comments, operator judgment, feedback logging, and reflection-run launch.
- Added character profile sections for recent Feedback Loop, Reflections, Identity Proposals, and approved feedback memory.
- Added Automation Settings persistence for daily activity scheduler enablement, daily run time, default characters, default platforms, default image/analysis providers, max images per run, top-activity auto-selection, and review-before-draft gate.
- Added local in-process Automation Scheduler that remains disabled unless enabled in settings, records scheduler state, and can create supervised Daily Activity Runs when due.
- Added supervised Daily Activity orchestration that loads character context, generates activity candidates, optionally selects the top candidate, creates a content brief and prompt recipe, generates/analyzes configured image candidates, and stops at review gates unless draft packaging is explicitly allowed.
- Added automation RunEvents for scheduler triggers, automation steps, automated decisions, warnings, provider wait/status, image generation, image analysis, and review-required gates.
- Added Phase 11 APIs: `GET/PATCH /api/settings/automation`, `GET /api/automation/status`, `POST /api/automation/daily-runs`, `POST /api/automation/characters/:id/activity-candidates`, `POST /api/automation/prompt-recipes/:id/generate-images`, `POST /api/automation/characters/:id/analyze-latest`, and `POST /api/automation/assets/:id/package`.
- Added Agency Heartbeat automation cards for scheduler enabled/disabled state, next scheduled run, running automation, and review gates.
- Added Settings automation UI with scheduler controls, default character selection, provider defaults, image count, review gate toggles, and manual trigger buttons.
- Added `scripts/smoke-demo.mjs` and root `npm run smoke:demo` for a repeatable local end-to-end demo flow.
- Replaced the README with complete MVP setup, provider, mock mode, data directory, command, and limitation documentation.
- Added `DEMO_SCRIPT.md` with a step-by-step demo path, expected pages/screenshots, inspection points, and local data reset instructions.
- Added `TROUBLESHOOTING.md` covering provider errors, database reset, missing data directories, port conflicts, and mock mode.
- Added `SECURITY_LOCAL.md` documenting local-only assumptions, no-auth warning, localhost binding, provider secrets handling, and public deployment risks.
- Completed Phase 12 hardening review across startup, route rendering, empty/error/loading surfaces, smoke coverage, export locality, and provider secret redaction.
- Added OpenAI Images as a first-class image generation provider with redacted settings, configurable model, size, quality, output format, and moderation.
- Added the image Provider Router as the generation entry point with SFW OpenAI-first routing, ComfyUI Cloud fallback, direct mature Comfy routing, blocked/uncertain review gates, and manual override reasons.
- Added routing audit events: `routing.classified`, `routing.override_applied`, `routing.blocked`, and `provider.fallback`.
- Extended provider jobs with attempt index, route tier, route reason, and fallback reason metadata.
- Added named Comfy workflow storage with editable prompt/negative/seed/output mappings, validation, tier activation, and workflow test endpoint.
- Upgraded ComfyUI Cloud generation to submit `/api/prompt`, poll job status, fetch job details, download output through `/api/view`, and fail visibly if no materializable output is returned.
- Added Asset Library production setup controls for provider override, override reason, and content tier override.
- Added Settings UI for OpenAI Images and named Comfy workflow management.
- Added docs for provider routing, OpenAI Images, Comfy workflow activation, and troubleshooting route gates.
- Registered the Comfy Cloud MCP server in Codex as `comfy-cloud`, completed OAuth account login, and documented the MCP/app-provider split.
- Defaulted ComfyUI Cloud direct provider configuration to `https://cloud.comfy.org` and accepted `COMFY_API_KEY` as an alias for local account API-key configuration.
- Added Comfy Cloud reference-image workflow support: active workflows can declare a reference image node/input, and VAS uploads the approved character reference image to Comfy Cloud before `/api/prompt`.
- Added a FaceID/InstantID SFW character-shoot workflow template plus installer script, and routed ready SFW character generation to Comfy Cloud first for identity control.
- Added a review gate when an identity workflow is active but the character has no approved reference image.

## Verification

- Repository inspection: `find . -maxdepth 3 -type f`
- Git status check: `git status --short`
- Nearby Conservatory material check: `find /Users/csselement/Documents -maxdepth 3 -iname '*Conservatory*' -o -iname '*conservatory*'`
- Dependencies: `npm install`
- Typecheck: `npm run typecheck`
- Tests: `npm run test`
- Build: `npm run build`
- Provider package tests after routing update: `npm --workspace @virtual-agency/providers run test`
- Typecheck after routing update: `npm run typecheck`
- Full test suite after routing update: `npm run test`
- Production build after routing update: `npm run build`
- API smoke: `curl -s http://127.0.0.1:4317/health`
- Web smoke: `curl -I -s http://127.0.0.1:5173/`
- Browser smoke: Playwright loaded `http://127.0.0.1:5173/` and captured `virtual-agency-phase1-final.png`
- Seed: `npm --workspace @virtual-agency/api run db:seed`
- Character API smoke: `curl -s http://127.0.0.1:4317/api/characters`
- Run API smoke: `curl -s http://127.0.0.1:4317/api/runs`
- Run event API smoke: `curl -s http://127.0.0.1:4317/api/runs/<run_id>/events`
- Phase 3 create/process smoke: `POST /api/runs` with `{"type":"daily_activity","title":"Phase 3 Smoke Daily Activity Run","autoProcess":true}`
- Phase 3 cancel smoke: `POST /api/runs`, then `POST /api/runs/<run_id>/cancel`
- Phase 4 browser smoke: Playwright loaded `http://127.0.0.1:5173/`
- Phase 4 browser smoke: Playwright loaded `http://127.0.0.1:5173/runs`
- Phase 4 browser smoke: Playwright loaded `http://127.0.0.1:5173/runs/<run_id>` and captured `virtual-agency-phase4-run-detail.png`
- Phase 5 API test: create character, add constitution, appearance, voice, persona, canon, memory, reference image, and start birth run.
- Phase 5 live API smoke: created `Phase 5 Smoke`, added identity sections, uploaded a reference, and created birth run `run_5dc1f0e3-ed8a-4dba-aacf-861e100b962c`.
- Phase 5 browser smoke: Playwright loaded `http://127.0.0.1:5173/characters`.
- Phase 5 browser smoke: Playwright loaded `http://127.0.0.1:5173/characters/<character_id>`.
- Phase 5 browser smoke: Playwright loaded `http://127.0.0.1:5173/runs/<birth_run_id>` and captured `virtual-agency-phase5-birth-run.png`.
- Phase 6 provider package tests: mock generation, mock analysis, and Hermes missing-config failure.
- Phase 6 API test: provider settings update, secret redaction, mock provider test, provider job persistence, provider event persistence.
- Phase 6 live API smoke: `GET /api/settings/providers`.
- Phase 6 live API smoke: `POST /api/settings/providers/test` for image generation created `run_319e16a4-477e-4d50-adb0-20f9257e9055`.
- Phase 6 live API smoke: `POST /api/settings/providers/test` for image analysis created `run_c988e94f-9587-4152-8b7b-5afd9a0fe5f0`.
- Phase 6 browser smoke: Playwright loaded `http://127.0.0.1:5173/settings`.
- Phase 7 API test: create character, add constitution, appearance, persona, generate activity candidates, select a candidate, create a content brief, and compose a prompt recipe with constitution/appearance lineage.
- Phase 7 live API smoke: generated activity run `run_4b52d5c9-1449-44eb-a426-8c62d763102c` for `char_eaa03a27-f128-44cc-89cd-e59184cd7868`, selected an activity, created a brief, and composed prompt recipe `prompt_recipe_12ca328c-343e-40bb-ab0d-ca23a4ebfaf5`.
- Phase 7 live API smoke: activity run events included `context.loaded`, five `activity.proposed` events, `review.required`, and `activity.selected`.
- Phase 7 browser smoke: Playwright loaded `http://127.0.0.1:5173/prompt-studio`, composed a prompt, verified final prompt preview plus constitution/appearance lineage, and captured `output/playwright/virtual-agency-phase7-prompt-studio.png`.
- Phase 8 API test: create character and prompt recipe, mock-generate a local image asset, fetch asset file, mock-analyze the asset, approve it for draft, and verify provider jobs, `image.generated`, `human.approved`, and `asset.approved_post_asset` decision.
- Phase 8 live API smoke: generated local asset `asset_a518ef5d-233a-4501-840a-2f154e8cd113` from prompt recipe `prompt_recipe_d909d95c-39a2-480c-917c-346710af9fd2`; file endpoint returned `200 image/svg+xml`.
- Phase 8 live API smoke: analyzed asset as `strong` identity match with identity score `84`, platform fit `Instagram, Threads`, approved it as `approved_post_asset`, and verified generation run `run_00fd574c-1b3c-4e5e-be9e-9dffb0c242f9` recorded `image.generated`, `human.approved`, one provider job, and `asset.approved_post_asset`.
- Phase 8 browser smoke: Playwright loaded `http://127.0.0.1:5173/assets`, verified generated image preview, scores, issues, suggested fixes, and review actions, and captured `output/playwright/virtual-agency-phase8-assets.png`.
- Phase 9 API test: create approved asset, create draft package with four variants, edit Instagram variant, export package, mark draft as published, and verify publishing ledger.
- Phase 9 live API smoke: created draft `draft_13053a39-ecc0-4b98-bcce-c0bb5d54bb98` from asset `asset_f7e80d1c-5b71-4461-8642-42fcb7d133db`, generated four variants, edited Instagram caption/hashtags, exported package `exports/post-package-for-f7e80d1c-13053a39`, and marked Instagram published at `https://example.com/phase-9-smoke`.
- Phase 9 live export files: `asset.svg`, `caption_generic.txt`, `caption_instagram.txt`, `caption_threads.txt`, `caption_tiktok.txt`, `hashtags.txt`, `alt_text.txt`, `disclosure_checklist.md`, and `metadata.json`.
- Phase 9 browser smoke: Playwright loaded `http://127.0.0.1:5173/drafts`, verified draft list, thumbnail, variant editors, disclosure flags, export package path, and publish controls, and captured `output/playwright/virtual-agency-phase9-drafts.png`.
- Phase 9 browser smoke: Playwright loaded `http://127.0.0.1:5173/calendar`, verified published ledger bucket and live URL, and captured `output/playwright/virtual-agency-phase9-calendar.png`.
- Phase 10 API test: create approved asset, draft, published event, log social feedback, run reflection, approve a memory proposal, and verify feedback/reflection/memory appear on the character profile.
- Phase 10 live API smoke: created character `char_1ec9310d-cfe5-4799-b984-409d587befc2`, asset `asset_677a15fc-0fde-4373-96cf-5bcd1983aa89`, draft `draft_72c1a400-fd2b-4e1e-8c54-b4d7c71db9b8`, publishing event `publish_event_c843a1c5-bc03-4da5-b1fc-e7a4ae763c2b`, feedback `feedback_b884f527-beb2-459d-8074-4332a649ae65`, and reflection run `run_21a79757-419c-4a18-b982-6c4f407663c5`.
- Phase 10 live API smoke: reflection run returned `needs_review`, produced memory/canon/constitution patch proposals, approved memory proposal `proposal_29f4d67c-edac-4d21-a84a-439454837c6b`, created feedback memory `memory_4da91668-b94c-45cc-9d84-36767cde43f9`, and profile showed one feedback item, one reflection, three proposals, and one feedback-sourced memory.
- Phase 10 browser smoke: Playwright loaded `http://127.0.0.1:5173/calendar`, verified the Social Feedback form and metric/note inputs, and captured `output/playwright/virtual-agency-phase10-calendar-feedback.png`.
- Phase 10 browser smoke: Playwright loaded `http://127.0.0.1:5173/characters/char_1ec9310d-cfe5-4799-b984-409d587befc2`, verified Feedback Loop, Reflections, Identity Proposals, approved feedback memory, and captured `output/playwright/virtual-agency-phase10-character-feedback.png`.
- Phase 11 API test: update automation settings, manually run supervised daily automation, verify `needs_review`, activity selection, prompt recipe, generated/analyzed asset, review-required gate, and automation status review list.
- Phase 11 scheduler test: enabled scheduler with due run time and verified `AutomationScheduler.tick()` created a `daily_activity` run in `needs_review`.
- Phase 11 live API smoke: created character `char_5e6a7e7c-972a-4600-9cc5-12e15805716f`, enabled scheduler with next run `2026-06-29T16:30:00.000Z`, manually created Daily Activity run `run_1b4561e1-0c20-47bb-8ce7-ed2e1d14df68`, generated five candidates, selected `activity_ccea0361-9d05-4a69-a3c8-96975590273c`, composed prompt recipe `prompt_recipe_b7db5d78-170f-4dde-aaf2-416ea6066a58`, generated/analyzed asset `asset_8f822197-9c54-4612-aeb7-0b9ee3eb38a5`, and stopped at review with no draft because review-before-draft was enabled.
- Phase 11 live API smoke: Daily Activity run events included `automation.step`, `activity.proposed`, `activity.selected`, `automation.decision`, `brief.created`, `prompt.generated`, `provider.requested`, `image.generated`, `image.analyzed`, and `review.required`.
- Phase 11 browser smoke: Playwright loaded `http://127.0.0.1:5173/settings`, verified Automation Scheduler controls, default character selection, Automation Status, and Manual Automation buttons, and captured `output/playwright/virtual-agency-phase11-settings-automation.png`.
- Phase 11 browser smoke: Playwright loaded `http://127.0.0.1:5173/`, verified Automation, Next Scheduled Run, Running Automation, and Review Gates cards, and captured `output/playwright/virtual-agency-phase11-heartbeat-automation.png`.
- Phase 12 typecheck: `npm run typecheck`.
- Phase 12 tests: `npm run test` passed 14 test files and 64 tests across API, web, providers, and shared packages.
- Phase 12 build: `npm run build`.
- Phase 12 demo smoke: `npm run smoke:demo` created character `char_b3391b7e-ec36-4a58-8a14-09a61d6ac13c`, birth run `run_3731bbf0-9818-4f44-8343-b085675c739d`, daily run `run_2e5aa817-883f-4dea-b11a-aa39e6828bc6`, selected activity `activity_78abc371-0d7e-4737-bec9-900717bd882f`, prompt recipe `prompt_recipe_233f2295-f292-4fa3-ae1d-3dd7e0fbdb65`, asset `asset_6d41929f-1e0e-4d30-a7fd-8ed06a2c7ec7`, draft `draft_9b6322d1-15fe-455e-9f7b-6ecc1e3713db`, export path `exports/post-package-for-6d41929f-9b6322d1`, publishing event `publish_event_44d93de3-daa8-49bd-88e7-d8f40ec4966d`, feedback `feedback_27ddd14b-1fbc-4b1d-ae83-504783351870`, reflection run `run_22351317-d6ae-473c-9c78-a56295198ac6`, and memory/canon proposals.
- Phase 12 API startup smoke: `curl -sS http://127.0.0.1:4317/health` returned `ok: true` with local `dataDir`.
- Phase 12 browser route sweep: in-app Browser loaded `/`, `/characters`, `/prompt-studio`, `/runs`, `/assets`, `/drafts`, `/calendar`, and `/settings`; each route showed the expected heading, `API online`, meaningful app content, no framework overlay, and no console warnings/errors.
- Phase 12 browser interaction proof: clicked `Test image generation` in Settings mock mode and verified the app opened a completed `Provider Test: Image Generation` run with provider request/completion events and no console warnings/errors.
- Phase 12 secret scan: searched for API-key/secret patterns outside `node_modules`, `dist`, `data`, and `package-lock.json`; hits were limited to placeholders/docs/config names and the intentional redaction test.
- Comfy Cloud MCP setup: `codex mcp add comfy-cloud --url https://cloud.comfy.org/mcp`, OAuth login completed, and `codex mcp get comfy-cloud` reported enabled Streamable HTTP at `https://cloud.comfy.org/mcp`.
- FaceID/InstantID provider tests: `npm --workspace @virtual-agency/providers run test`
- FaceID/InstantID API routing tests: `npm --workspace @virtual-agency/api run test -- src/providers/providerRouter.test.ts src/app.test.ts`

## Known Gaps

- Real Hermes calls require configured base URLs, API keys, and endpoint paths.
- Real ComfyUI Cloud app-provider calls require a saved API key plus an activated API-format workflow, even though the Codex MCP account is authenticated separately.
- The FaceID/InstantID workflow template depends on the matching Comfy Cloud custom nodes and model filenames; checkpoint/model names may need adjustment in the target workspace before first successful real generation.
- The scheduler is an in-process local MVP scheduler, not a production durable worker.
- The app has no authentication and is documented as unsafe for public deployment without a real auth, authorization, and network hardening pass.
- No reusable Conservatory source code was found inside this repo.

## Next Recommended App Structure

Use a TypeScript npm workspace:

```text
apps/api
apps/web
packages/shared
packages/providers
data/assets
data/exports
```
