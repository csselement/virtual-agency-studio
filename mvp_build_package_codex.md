# Virtual Agency Studio MVP Build Package for Codex

## Project working name

**Virtual Agency Studio**

## Highest-level mission

Build a **local-first, single-user AI-powered virtual influencer agency platform** where synthetic characters “live” inside an observable machine.

The platform should manage multiple AI influencer characters, preserve their constitutions and identities, automate daily creative activity generation, generate and analyze image assets through Hermes / OpenAI Image Gen 2 and optionally ComfyUI Cloud, create platform-ready social media drafts, collect feedback, and propose memory/canon evolution under human oversight.

The MVP must prioritize:

1. Character identity consistency.
2. Transparent automation.
3. Human review gates.
4. Simple visible progress.
5. Social-media-ready draft packaging.
6. Local single-user operation.
7. Reusable foundations from The Conservatory where appropriate.

---

# Recommended repo strategy

Build this as a **new project**, not a direct fork.

However, extract or copy useful primitives from **The Conservatory**:

```text
- Character Constitution concepts
- Character Core Prompt patterns
- Appearance / visual identity prompts
- Image analysis workflows
- Hermes client logic
- Reference image handling
- Prompt assembly patterns
```

Do **not** copy old app navigation or mental models unless they directly support this new machine-like agency system.

---

# Suggested MVP stack

Unless the existing repo strongly suggests otherwise, use this stack:

```text
TypeScript monorepo
  apps/
    api/        Fastify or Express API server
    web/        Vite + React frontend
  packages/
    shared/     shared Zod schemas and types
    providers/  Hermes, ComfyUI Cloud, mock providers
  data/
    agency.sqlite
    assets/
    exports/
```

Preferred libraries:

```text
API: Fastify or Express
Frontend: React + Vite
Database: SQLite
DB access: Drizzle ORM or better-sqlite3 wrapper
Validation: Zod
Testing: Vitest
Styling: simple CSS modules or Tailwind, whichever is already present
Jobs: local persistent run/event records plus simple in-process queue
```

No auth for MVP. Bind local services to `127.0.0.1` by default.

---

# Core product model

The most important primitive is not a prompt, image, or post.

It is a **Run**.

Examples:

```text
Character Birth Run
Daily Activity Run
Prompt Generation Run
Image Generation Run
Hermes Analysis Run
Draft Packaging Run
Social Feedback Reflection Run
Canon Evolution Proposal Run
```

Every Run must emit visible `run_events`.

This is the “machine transparency” layer.

---

# Core status flow

```text
idea
→ briefed
→ generating
→ analyzing
→ draft_ready
→ needs_review
→ approved
→ exported
→ published
→ feedback_logged
→ reflection_complete
```

---

# Required UI screens

MVP should have these screens:

```text
/
  Agency Heartbeat dashboard

/characters
  Character roster

/characters/:id
  Character profile: Constitution, Canon, Memory, Appearance Bible, Voice, Platform Personas, References, Runs

/runs
  Machine-room run list

/runs/:id
  Run timeline with event log, artifacts, status, errors, and next action

/assets
  Asset library

/drafts
  Review desk for platform-ready drafts

/calendar
  Publishing ledger / lightweight calendar

/settings
  Local provider settings: Hermes, ComfyUI Cloud, mock mode, export paths
```

---

# Core data concepts

```text
Character
ConstitutionVersion
CanonEntry
MemoryEntry
AppearanceProfile
VoiceGuide
PlatformPersona
ReferenceImage

Run
RunEvent
RunArtifact
RunDecision
ProviderJob

ActivityCandidate
ContentBrief
PromptRecipe
PromptRun

Asset
AssetAnalysis
AssetScore

Draft
PlatformVariant
PublishingPackage
PublishingEvent

SocialFeedback
Reflection
IdentityUpdateProposal
```

---

# Automation philosophy

The MVP should aim for **Level 3 automation**:

```text
The system can wake a character, generate daily activities, create prompts,
generate images, analyze results, package drafts, and explain its decisions.

The human still approves publishing and major identity/canon changes.
```

Rules:

```text
- Memory updates may be automatic.
- Canon updates must be proposed and human-approved.
- Constitution changes must always be versioned and human-approved.
- Publishing must be manual or explicitly human-approved in MVP.
- No silent identity mutation.
```

---

# Provider philosophy

Implement providers behind abstractions.

Do not hardcode the product around one renderer.

```text
Image generation providers:
  - Hermes image generation path
  - ComfyUI Cloud path
  - Mock provider for local dev/testing

Image analysis providers:
  - Hermes image analysis path
  - Mock analysis provider
```

If exact Hermes endpoint paths are not documented in the repo, implement configurable endpoint settings and a mock provider. Do not invent irreversible assumptions.

---

# Master Goal Prompt for Codex

Paste this into Codex first.

```text
You are building the MVP for a new local-first app called Virtual Agency Studio.

MASTER GOAL:
Build a local, single-user AI-powered virtual influencer agency platform where synthetic characters “live” inside an observable automation machine. The MVP should manage character constitutions, canon, memory, appearance, reference images, prompt recipes, automated daily activity runs, image generation providers, Hermes analysis, social-media draft packaging, manual publishing/export, social feedback, and identity evolution proposals.

IMPORTANT PRODUCT PRINCIPLES:
1. This is a new project, not a direct fork of The Conservatory.
2. Reuse/extract concepts from The Conservatory only where helpful: character constitutions, core prompt patterns, Hermes client logic, image analysis, reference galleries, prompt assembly.
3. The central product primitive is a Run.
4. Every automated action must emit visible RunEvents.
5. The UI must show the machine’s current state clearly without overwhelming walls of text.
6. No auth is required for MVP.
7. Bind services to localhost by default.
8. No silent publishing.
9. No silent Constitution mutation.
10. Automation is high priority, but human oversight is mandatory.

ASSUMED STACK IF STARTING NEW:
- TypeScript monorepo
- apps/api: Fastify or Express API
- apps/web: Vite + React frontend
- packages/shared: Zod schemas and shared types
- packages/providers: Hermes, ComfyUI Cloud, and mock provider adapters
- SQLite local database
- Local filesystem storage under data/assets and data/exports
- Vitest tests
- Simple CSS/Tailwind based on existing repo conventions

IF AN EXISTING REPO IS PRESENT:
- Inspect the repo first.
- Respect existing package manager, styling conventions, test runner, and architecture unless they conflict with the MVP goal.
- Do not make broad rewrites without explaining why.
- Create or update AGENTS.md with durable build/test/dev instructions and project conventions.

PHASE ORDER:
Complete the MVP in the following phases, in order. After each phase:
- run relevant tests/build/lint,
- update BUILD_STATUS.md,
- list what changed,
- list known gaps,
- do not proceed if the app cannot start unless the blocker is documented and unavoidable.

PHASES:
0. Repository audit, architecture decision, AGENTS.md, BUILD_STATUS.md
1. Project scaffold and local dev foundation
2. Database schema, migrations, seed data, local file storage
3. Run/event machine spine
4. Agency Heartbeat dashboard and Runs machine-room UI
5. Character Registry and Character Birth flow
6. Provider abstraction: Hermes, ComfyUI Cloud, mock providers
7. Prompt Studio, activity candidates, and content brief generation
8. Image generation and Hermes analysis loop
9. Draft Review Desk, platform variants, and export packages
10. Social feedback, reflection, memory, canon proposals
11. Automation scheduler and daily activity cron/manual trigger
12. MVP hardening, tests, docs, and demo script

GLOBAL ACCEPTANCE CRITERIA:
The MVP is done when a local user can:
1. Start the API and web app locally.
2. Create at least one character.
3. Write and version a Constitution.
4. Add appearance, voice, platform personas, canon, and memory.
5. Upload reference images.
6. Start a Character Birth Run.
7. Start a Daily Activity Run.
8. See the run timeline update step by step.
9. Generate activity candidates.
10. Generate prompt recipes.
11. Generate or mock-generate images.
12. Analyze or mock-analyze images through Hermes provider abstraction.
13. Approve/reject assets.
14. Create Instagram, TikTok, Threads, and generic platform variants.
15. Export a post package locally.
16. Mark a post as published manually.
17. Enter social feedback manually.
18. Run a reflection.
19. Propose memory/canon updates.
20. See all machine activity through clear, simple monitoring UI.

Begin with Phase 0. Do not skip phases.
```

---

# Phase 0 Prompt — Repository Audit and Build Plan

```text
PHASE 0: Repository audit, architecture decision, AGENTS.md, and BUILD_STATUS.md

GOAL:
Inspect the current repository and produce the foundation for a phased MVP build of Virtual Agency Studio.

CONTEXT:
This app is a local-first, single-user AI-powered virtual influencer agency platform. It should be a new project, but may reuse concepts from The Conservatory if present or available nearby. The core primitive is a Run, and every automated action must emit RunEvents for transparent monitoring.

TASKS:
1. Inspect the repository structure.
2. Identify whether this is:
   a. an empty/new repo,
   b. The Conservatory,
   c. another existing app,
   d. a monorepo with reusable code.
3. Find any existing files related to:
   - character constitutions,
   - prompts,
   - Hermes API,
   - image analysis,
   - reference images,
   - local asset storage,
   - ComfyUI integration.
4. Decide whether to:
   - scaffold a new app inside this repo,
   - create a new app directory,
   - or extract reusable modules from existing code.
5. Create or update AGENTS.md.
6. Create BUILD_STATUS.md with all phases listed as unchecked.
7. Create ARCHITECTURE_DECISION.md explaining:
   - chosen stack,
   - why this is not a direct fork,
   - what will be reused from The Conservatory if available,
   - major risks,
   - how local-only operation will work.

CONSTRAINTS:
- Do not start building product features yet.
- Do not delete or overwrite existing application code.
- Prefer minimal, reversible changes.
- If The Conservatory code exists, treat it as source material, not the product shell.
- Do not assume real Hermes endpoint paths unless they are documented in the repo.

DONE WHEN:
- AGENTS.md exists and includes build/test/dev commands or placeholders.
- BUILD_STATUS.md exists with Phase 0 marked complete.
- ARCHITECTURE_DECISION.md exists.
- The repo inspection summary is clear.
- You recommend the exact app structure for Phase 1.
```

---

# Phase 1 Prompt — Project Scaffold and Local Dev Foundation

```text
PHASE 1: Project scaffold and local dev foundation

GOAL:
Create the local development foundation for Virtual Agency Studio.

CONTEXT:
This is a local-first, single-user MVP. No auth is needed. The app should run locally and bind to localhost by default. The preferred structure is a TypeScript monorepo with API, web, shared types, and provider packages unless the repo already has a better established architecture.

TASKS:
1. Scaffold the app structure:
   - apps/api
   - apps/web
   - packages/shared
   - packages/providers
   - data/assets
   - data/exports
2. Configure package manager workspaces according to repo convention.
3. Add root scripts:
   - dev
   - dev:api
   - dev:web
   - build
   - test
   - lint or typecheck
4. Build a simple API server with:
   - GET /health
   - GET /api/version
5. Build a simple web app with:
   - shell layout,
   - navigation links,
   - Agency Heartbeat placeholder,
   - Settings placeholder,
   - health check display.
6. Add shared types package with initial Zod schemas for:
   - ApiHealth
   - RunStatus
   - CharacterStatus
7. Add .env.example with:
   - API_HOST=127.0.0.1
   - API_PORT=4317
   - WEB_PORT=5173
   - DATA_DIR=./data
   - DATABASE_URL=./data/agency.sqlite
   - HERMES_BASE_URL=
   - HERMES_API_KEY=
   - HERMES_IMAGE_GENERATION_PATH=
   - HERMES_IMAGE_ANALYSIS_PATH=
   - COMFYUI_CLOUD_BASE_URL=
   - COMFYUI_CLOUD_API_KEY=
   - MOCK_PROVIDERS=true
8. Add README.md with local setup instructions.

CONSTRAINTS:
- Keep styling simple.
- No auth.
- No cloud requirement.
- Do not implement deep product logic yet.
- Use mock-safe defaults.
- App should run without Hermes or ComfyUI credentials.

DONE WHEN:
- The local API starts.
- The local web app starts.
- Web app can call /health.
- Root test/build/typecheck commands work or are documented if partially unavailable.
- BUILD_STATUS.md marks Phase 1 complete.
```

---

# Phase 2 Prompt — Database, Migrations, Seed Data, Local File Storage

```text
PHASE 2: Database schema, migrations, seed data, and local file storage

GOAL:
Implement the durable local data layer for characters, runs, assets, drafts, and feedback.

CONTEXT:
The system needs a local SQLite database and local filesystem storage. Assets should live under data/assets. Export packages should live under data/exports. The DB should store metadata, state, and audit trails, not binary blobs unless unavoidable.

TASKS:
1. Add SQLite database support.
2. Add migration mechanism.
3. Create initial tables for:
   - characters
   - character_constitution_versions
   - character_canon_entries
   - character_memory_entries
   - character_appearance_profiles
   - character_voice_guides
   - character_platform_personas
   - reference_images
   - assets
   - asset_analysis
   - runs
   - run_events
   - run_artifacts
   - run_decisions
   - provider_jobs
   - activity_candidates
   - content_briefs
   - prompt_recipes
   - prompt_runs
   - drafts
   - platform_variants
   - publishing_packages
   - publishing_events
   - social_feedback
   - reflections
   - identity_update_proposals
   - settings
4. Add created_at and updated_at where useful.
5. Add stable IDs.
6. Add local file storage helper:
   - ensure data/assets exists,
   - ensure data/exports exists,
   - save uploaded files,
   - return file metadata,
   - never expose arbitrary filesystem paths through public API.
7. Add seed command that creates:
   - one demo character,
   - one constitution version,
   - one appearance profile,
   - one voice guide,
   - one platform persona for Instagram, TikTok, Threads,
   - one demo run with events.
8. Add basic repository/data access functions.

CONSTRAINTS:
- Keep schema explicit and boring.
- Do not over-normalize prematurely.
- Avoid storing giant prompt blobs in many unrelated tables; prompt recipes may contain structured JSON.
- Local file paths should be relative to DATA_DIR where possible.
- No auth/user table for MVP.
- Manual publishing only.

DONE WHEN:
- Migrations can create a fresh local database.
- Seed command works.
- API can list demo characters.
- API can list demo runs and events.
- Tests cover at least DB initialization and seed creation.
- BUILD_STATUS.md marks Phase 2 complete.
```

---

# Phase 3 Prompt — Run/Event Machine Spine

```text
PHASE 3: Run/event machine spine

GOAL:
Implement the core observable automation model: Runs, RunEvents, artifacts, decisions, and simple state transitions.

CONTEXT:
The central primitive is a Run. The user needs to see how the machine is thinking and where it gets stuck. Every automated operation must write events. The UI can later summarize this, but the backend spine must exist now.

TASKS:
1. Define Run types:
   - character_birth
   - daily_activity
   - prompt_generation
   - image_generation
   - image_analysis
   - draft_packaging
   - feedback_reflection
   - canon_evolution
2. Define Run statuses:
   - queued
   - running
   - waiting_for_provider
   - needs_review
   - completed
   - failed
   - cancelled
3. Define RunEvent types:
   - run.created
   - run.started
   - context.loaded
   - activity.proposed
   - activity.selected
   - brief.created
   - prompt.generated
   - provider.requested
   - provider.completed
   - provider.failed
   - image.generated
   - image.analyzed
   - draft.created
   - review.required
   - human.approved
   - human.rejected
   - export.created
   - feedback.logged
   - reflection.generated
   - memory.proposed
   - canon_update.proposed
   - constitution_patch.proposed
   - run.completed
   - run.failed
4. Implement backend services:
   - createRun
   - appendRunEvent
   - updateRunStatus
   - attachRunArtifact
   - recordRunDecision
   - failRun
   - completeRun
5. Add API endpoints:
   - GET /api/runs
   - GET /api/runs/:id
   - GET /api/runs/:id/events
   - POST /api/runs/:id/cancel
6. Add a simple in-process queue abstraction:
   - enqueueRun
   - processNext
   - retry or fail gracefully
7. Make sure every queue action writes events.

CONSTRAINTS:
- The queue can be simple for MVP.
- Run/event persistence matters more than job sophistication.
- Never hide errors.
- Store provider raw responses as artifact JSON where appropriate, but avoid secrets.
- Events should be short and readable, with optional structured payload.

DONE WHEN:
- You can create a demo run.
- You can append events.
- You can view the ordered event timeline through the API.
- A failed run records a useful error.
- Tests cover run creation, event ordering, and failure state.
- BUILD_STATUS.md marks Phase 3 complete.
```

---

# Phase 4 Prompt — Agency Heartbeat and Runs UI

```text
PHASE 4: Agency Heartbeat dashboard and Runs machine-room UI

GOAL:
Build the first real user-facing view of the machine: clear, simple monitoring and progress indicators.

CONTEXT:
The user wants to see how the wheels are turning without overwhelming walls of options and text. The main UI should show current activity, what needs review, what failed, and what changed.

TASKS:
1. Build Agency Heartbeat dashboard at /.
2. Show cards for:
   - running runs,
   - failed runs,
   - runs needing review,
   - recent completed runs,
   - characters with recent activity,
   - drafts needing review.
3. Build /runs page:
   - list runs,
   - filter by status and type,
   - show character, status, current step, started time, completed time.
4. Build /runs/:id page:
   - run summary,
   - status pill,
   - progress timeline,
   - event list,
   - artifacts list,
   - errors/warnings,
   - next recommended action.
5. Use polling for MVP to refresh run status.
6. Keep the visual language calm and operational:
   - no dense dashboards,
   - no giant JSON blocks by default,
   - expandable raw details only when needed.
7. Add empty/loading/error states.

CONSTRAINTS:
- UI should be simple and readable.
- Do not add a complex design system unless one already exists.
- Do not expose secrets from provider payloads.
- Keep raw JSON behind expand/collapse.

DONE WHEN:
- User can see demo runs on dashboard.
- User can click into a run and inspect event history.
- Failed runs are visibly understandable.
- Running/needing-review/completed states are visually distinct.
- BUILD_STATUS.md marks Phase 4 complete.
```

---

# Phase 5 Prompt — Character Registry and Character Birth Flow

```text
PHASE 5: Character Registry and Character Birth flow

GOAL:
Build the character management system and first identity-formation workflow.

CONTEXT:
Characters are the beings that live in the agency machine. Each character needs a Constitution, Canon, Memory, Appearance Bible, Voice Guide, Platform Personas, and Reference Images. The Constitution is sacred and versioned. Canon changes require human approval. Memory can grow over time.

TASKS:
1. Build /characters roster page:
   - list characters,
   - create character,
   - status,
   - thumbnail/reference image if available,
   - last run.
2. Build /characters/:id profile page with sections:
   - Overview
   - Constitution
   - Canon
   - Memory
   - Appearance Bible
   - Voice Guide
   - Platform Personas
   - Reference Images
   - Recent Runs
3. Add character create/edit API endpoints.
4. Add Constitution versioning:
   - create new version,
   - mark active version,
   - show version history,
   - require change reason.
5. Add Canon entries:
   - active/proposed/rejected states,
   - source run ID,
   - human approval action.
6. Add Memory entries:
   - allow automatic or manual source,
   - source run ID,
   - confidence/importance field.
7. Add Appearance Bible editor:
   - face descriptors,
   - hair descriptors,
   - wardrobe rules,
   - palette,
   - visual motifs,
   - negative prompts,
   - forbidden drift notes.
8. Add Voice Guide editor:
   - tone,
   - caption style,
   - emoji policy,
   - slang rules,
   - taboo phrases.
9. Add Platform Personas:
   - Instagram,
   - TikTok,
   - Threads,
   - generic.
10. Add Reference Image upload:
   - save file locally,
   - attach to character,
   - allow mark as approved reference / rejected / experimental.
11. Implement Character Birth Run:
   - loads Constitution, Appearance, Voice, References,
   - writes context.loaded event,
   - creates a birth summary artifact,
   - produces initial prompt core artifact,
   - ends in needs_review or completed.

CONSTRAINTS:
- Do not use auth.
- Constitution edits must never overwrite old versions.
- Character Birth Run can be mostly deterministic/template-driven for now.
- Keep forms simple.
- Use textarea editors for rich prompt-like fields in MVP.

DONE WHEN:
- User can create a character.
- User can create and version a Constitution.
- User can add Appearance, Voice, Platform Personas, Canon, Memory.
- User can upload reference images.
- User can start a Character Birth Run.
- Character Birth Run appears in run timeline with events and artifacts.
- BUILD_STATUS.md marks Phase 5 complete.
```

---

# Phase 6 Prompt — Provider Abstraction: Hermes, ComfyUI Cloud, Mock Providers

```text
PHASE 6: Provider abstraction for Hermes, ComfyUI Cloud, and mock mode

GOAL:
Create clean provider interfaces for image generation and image analysis, with Hermes, ComfyUI Cloud, and mock implementations.

CONTEXT:
Hermes can already use OpenAI Image Gen 2. ComfyUI Cloud has worked well for integrated image generation. The app should not become hardcoded to either. Provider calls must be visible through RunEvents and ProviderJobs.

TASKS:
1. In packages/providers, define provider interfaces:
   - ImageGenerationProvider
   - ImageAnalysisProvider
   - CreativeTextProvider if useful
2. Define common request/response types:
   - GenerateImageRequest
   - GenerateImageResult
   - AnalyzeImageRequest
   - AnalyzeImageResult
   - ProviderJobStatus
3. Implement MockImageGenerationProvider:
   - creates placeholder image file or uses bundled placeholder,
   - returns deterministic metadata,
   - useful for tests and offline dev.
4. Implement MockImageAnalysisProvider:
   - returns identity_match, quality_notes, platform_fit, suggested_prompt_fixes, alt_text.
5. Implement HermesImageGenerationProvider:
   - reads HERMES_BASE_URL, HERMES_API_KEY, HERMES_IMAGE_GENERATION_PATH,
   - supports configurable endpoint path,
   - sends prompt, negative prompt, references if supported by config,
   - handles errors cleanly,
   - never logs secrets.
6. Implement HermesImageAnalysisProvider:
   - reads HERMES_BASE_URL, HERMES_API_KEY, HERMES_IMAGE_ANALYSIS_PATH,
   - sends image reference or upload according to available local implementation,
   - returns normalized AnalyzeImageResult.
7. Implement ComfyUICloudImageGenerationProvider:
   - reads COMFYUI_CLOUD_BASE_URL and COMFYUI_CLOUD_API_KEY,
   - supports workflow payload config,
   - creates provider job record,
   - handles async status if enough API shape is known,
   - otherwise creates clear TODOs and mock fallback.
8. Add provider settings API:
   - GET /api/settings/providers
   - PATCH /api/settings/providers
   - POST /api/settings/providers/test
9. Add Settings UI:
   - select default image generation provider,
   - select default analysis provider,
   - toggle mock mode,
   - configure endpoint paths,
   - test provider connection.
10. Wire provider calls into ProviderJobs and RunEvents.

CONSTRAINTS:
- Do not invent exact Hermes API paths if undocumented.
- Do not block MVP if providers are not configured.
- Mock providers must allow the whole app to be demoed offline.
- All provider errors should become visible run events.
- Do not expose API keys in UI after saving.

DONE WHEN:
- Mock generation works.
- Mock analysis works.
- Provider settings can be edited.
- Provider test endpoint reports success/failure.
- Provider calls create ProviderJob records.
- Provider calls emit run events.
- BUILD_STATUS.md marks Phase 6 complete.
```

---

# Phase 7 Prompt — Prompt Studio, Activity Candidates, Content Briefs

```text
PHASE 7: Prompt Studio, activity candidates, and content brief generation

GOAL:
Build the creative planning layer that turns character identity into daily activity candidates, content briefs, and prompt recipes.

CONTEXT:
The character should feel like they are living a life. Hermes or local providers can eventually run creative prompting cronjobs with daily activities: shopping, leaving the office, drinks with friends, flying to LA, etc. The MVP should support both manual and generated activity candidates.

TASKS:
1. Add Activity Candidate model and API:
   - character_id
   - run_id
   - title
   - description
   - location_fiction
   - activity_type
   - visual_motif
   - platform_fit
   - identity_fit_score
   - campaign_fit_score
   - freshness_score
   - selected/rejected state
2. Add Content Brief model and API:
   - character_id
   - campaign_id optional
   - activity_candidate_id optional
   - goal
   - platform targets
   - content pillar
   - visual direction
   - caption angle
   - disclosure flags
   - desired outputs
3. Add Prompt Recipe model and API:
   - character core block
   - constitution block
   - appearance block
   - scene block
   - platform block
   - campaign block
   - negative prompt block
   - generation settings JSON
4. Build Prompt Studio UI:
   - select character,
   - load active Constitution,
   - load Appearance Bible,
   - choose platform,
   - edit scene/activity,
   - compose prompt,
   - preview full prompt,
   - save prompt recipe.
5. Implement activity generation service:
   - loads character Constitution, Canon, Memory, Appearance, Voice, Platform Personas,
   - produces 5-8 candidate daily activities,
   - scores them using simple deterministic scoring or mock creative provider,
   - writes run events for proposed candidates.
6. Implement content brief generation:
   - from selected activity,
   - platform-specific variants for Instagram/TikTok/Threads,
   - generates caption angle and visual direction.
7. Implement prompt assembly:
   - structured prompt blocks,
   - readable final prompt,
   - negative prompt,
   - metadata showing source sections.
8. Add API endpoint:
   - POST /api/characters/:id/activity-runs
   - POST /api/activity-candidates/:id/select
   - POST /api/content-briefs
   - POST /api/prompt-recipes/compose

CONSTRAINTS:
- Avoid opaque giant AI text.
- Show why an activity was selected.
- Prompt output should be inspectable and editable.
- Store prompt lineage.
- The system may suggest, but user can edit.

DONE WHEN:
- User can generate activity candidates for a character.
- User can select an activity.
- User can create a content brief.
- User can compose and save a prompt recipe.
- Prompt recipe records which Constitution version and Appearance profile were used.
- Run timeline shows activity and prompt generation steps.
- BUILD_STATUS.md marks Phase 7 complete.
```

---

# Phase 8 Prompt — Image Generation and Hermes Analysis Loop

```text
PHASE 8: Image generation and Hermes analysis loop

GOAL:
Connect prompt recipes to image generation providers and route generated images through Hermes/mock analysis.

CONTEXT:
This is the first full creative loop. The system should generate images from prompts, store assets locally, analyze them for identity consistency, quality, platform readiness, and story fit, then create reviewable candidates.

TASKS:
1. Add Image Generation Run:
   - takes prompt_recipe_id,
   - uses selected image generation provider,
   - emits provider.requested,
   - stores provider job,
   - stores generated asset,
   - emits image.generated,
   - handles provider failure visibly.
2. Add Image Analysis Run or analysis step:
   - takes asset_id and character_id,
   - uses selected analysis provider,
   - emits provider.requested,
   - stores analysis result,
   - emits image.analyzed.
3. Normalize analysis result fields:
   - identity_match: strong / medium / weak / failed
   - identity_score 0-100
   - quality_score 0-100
   - story_fit_score 0-100
   - platform_fit for Instagram/TikTok/Threads
   - quality_issues
   - identity_notes
   - suggested_prompt_fixes
   - alt_text
   - recommended_action
4. Add asset states:
   - raw_generation
   - candidate
   - approved_reference
   - approved_post_asset
   - rejected_identity_drift
   - rejected_quality
   - rejected_policy
   - published
   - archived
5. Build Asset Library UI:
   - grid/list,
   - character filter,
   - run filter,
   - state filter,
   - platform fit filter,
   - analysis score badges.
6. Build asset detail page or modal:
   - image preview,
   - prompt,
   - generation provider,
   - analysis result,
   - approve/reject actions,
   - suggested prompt fixes.
7. Add Review actions:
   - approve asset for draft,
   - approve as reference,
   - reject with reason,
   - regenerate with suggested fixes.
8. Ensure all actions append RunEvents or RunDecisions.

CONSTRAINTS:
- App must work in mock provider mode.
- Generated files must be stored locally.
- If provider returns remote URLs, download or copy into local asset store when possible.
- Do not permanently depend on remote asset URLs.
- Avoid long raw JSON display unless expanded.

DONE WHEN:
- User can generate/mock-generate images from prompt recipes.
- Generated images appear in Asset Library.
- User can analyze/mock-analyze images.
- Analysis results are visible and stored.
- User can approve or reject assets.
- Identity drift and quality issues are visible in a simple way.
- BUILD_STATUS.md marks Phase 8 complete.
```

---

# Phase 9 Prompt — Draft Review Desk, Platform Variants, Export Packages

```text
PHASE 9: Draft Review Desk, platform variants, and export packages

GOAL:
Turn approved assets into social-media-ready draft packages for Instagram, TikTok, Threads, and generic export.

CONTEXT:
The MVP should optimize for social media publishing and management, but no auto-posting is required. The output should be practical: asset files, captions, hashtags, alt text, disclosures, and metadata.

TASKS:
1. Add Draft model:
   - character_id
   - content_brief_id
   - prompt_recipe_id
   - asset_id
   - status
   - title
   - summary
   - created_from_run_id
2. Add PlatformVariant model:
   - draft_id
   - platform: instagram / tiktok / threads / generic
   - post_format
   - caption
   - hashtags
   - alt_text
   - disclosure_text
   - ai_generated_flag
   - paid_partnership_flag
   - brand_content_flag
   - notes
   - status
3. Add Draft Packaging Run:
   - starts from approved asset + content brief,
   - creates draft,
   - creates platform variants,
   - emits draft.created and review.required events.
4. Build /drafts Review Desk:
   - list drafts by status,
   - show character,
   - show asset thumbnail,
   - show platform variants,
   - show why this draft was made,
   - show analysis summary.
5. Build draft detail UI:
   - image preview,
   - prompt lineage,
   - caption editors,
   - hashtag editors,
   - alt text editor,
   - disclosure checklist,
   - platform readiness notes,
   - approve/reject/regenerate/export actions.
6. Add export package generation:
   - create directory under data/exports,
   - copy asset,
   - write caption_instagram.txt,
   - write caption_tiktok.txt,
   - write caption_threads.txt,
   - write hashtags.txt,
   - write alt_text.txt,
   - write disclosure_checklist.md,
   - write metadata.json.
7. Add PublishingPackage record:
   - draft_id
   - export_path
   - created_at
   - files JSON
8. Add manual publishing ledger:
   - mark as exported,
   - mark as published,
   - enter live URL,
   - platform,
   - published_at.
9. Add calendar/publishing ledger page:
   - planned,
   - draft ready,
   - exported,
   - published,
   - needs feedback.

CONSTRAINTS:
- No automatic posting in MVP.
- Keep disclosure fields visible.
- Treat AI-generated and paid/brand flags as first-class metadata.
- Export paths must be safe and local.
- Avoid platform API complexity for now.

DONE WHEN:
- User can create a draft from an approved asset.
- User can edit Instagram/TikTok/Threads variants.
- User can export a local post package.
- User can mark a post as published and add URL.
- Calendar/ledger shows draft/export/published statuses.
- BUILD_STATUS.md marks Phase 9 complete.
```

---

# Phase 10 Prompt — Social Feedback, Reflection, Memory, Canon Proposals

```text
PHASE 10: Social feedback, reflection, memory, and canon proposals

GOAL:
Close the loop from published post response back into character growth.

CONTEXT:
The product mission is a feedback loop: once the original Constitution is solid and the character is born, the system repeatedly asks “who is this?” and uses social response to deepen identity. The machine can propose memory/canon updates, but important identity changes require human oversight.

TASKS:
1. Add SocialFeedback form for published posts:
   - platform
   - published URL
   - impressions/views
   - reach
   - likes
   - comments
   - shares
   - saves
   - profile visits
   - follows gained
   - qualitative notes
   - top comments
   - operator judgment
2. Add feedback API:
   - POST /api/publishing-events/:id/feedback
   - GET /api/characters/:id/feedback
3. Add Reflection Run:
   - loads character Constitution, Canon, Memory,
   - loads post draft, asset analysis, prompt, platform variants,
   - loads social feedback,
   - generates structured reflection.
4. Reflection output should include:
   - what worked,
   - what felt off-character,
   - what to repeat,
   - what to avoid,
   - suggested next activity,
   - proposed memory entry,
   - proposed canon update if justified,
   - Constitution patch proposal only if strongly justified.
5. Add Reflection UI:
   - short summary,
   - evidence,
   - recommendations,
   - approve memory,
   - approve/reject canon proposal,
   - view Constitution patch proposal.
6. Add IdentityUpdateProposal model:
   - type: memory / canon / constitution_patch
   - proposed text
   - rationale
   - source_run_id
   - status: proposed / approved / rejected
   - risk_level
7. Implement approval actions:
   - approved memory creates MemoryEntry,
   - approved canon creates active CanonEntry,
   - approved Constitution patch creates new ConstitutionVersion only after explicit confirmation.
8. Add character profile section:
   - recent feedback,
   - recent reflections,
   - approved memory from feedback,
   - pending canon proposals.

CONSTRAINTS:
- Memory may be approved quickly.
- Canon must require human approval.
- Constitution patch must require explicit human approval and version reason.
- Reflection should be concise and structured.
- No giant analytics dashboard yet.

DONE WHEN:
- User can enter feedback for a published post.
- User can run a reflection.
- Reflection proposes memory/canon updates.
- User can approve/reject proposals.
- Approved updates appear on character profile.
- BUILD_STATUS.md marks Phase 10 complete.
```

---

# Phase 11 Prompt — Automation Scheduler and Daily Activity Cron

```text
PHASE 11: Automation scheduler and daily activity cron/manual trigger

GOAL:
Implement supervised automation that can run daily creative activity workflows while remaining transparent and reviewable.

CONTEXT:
Automation is high priority, but the user needs to see how the wheels are turning. The MVP should support manually triggered runs and optional local scheduled runs. The system should not silently publish or silently mutate Constitution.

TASKS:
1. Add Automation Settings:
   - enable_daily_activity_runs boolean
   - daily_run_time
   - default_character_ids
   - default_platforms
   - default_image_provider
   - default_analysis_provider
   - max_images_per_run
   - require_review_before_draft boolean
2. Add Scheduler service:
   - local in-process scheduler is fine for MVP,
   - can be disabled,
   - writes scheduler events,
   - creates Daily Activity Runs.
3. Add Manual trigger buttons:
   - Run daily activity now for a character,
   - Generate activity candidates,
   - Generate image candidates,
   - Analyze latest candidates,
   - Package approved asset.
4. Implement Daily Activity Run orchestration:
   - load character context,
   - generate activity candidates,
   - select top candidate or ask for review depending setting,
   - create content brief,
   - compose prompt recipe,
   - generate configured number of images,
   - analyze images,
   - create draft only from passing asset or stop with needs_review,
   - write every step as RunEvents.
5. Add progress indicators:
   - current step,
   - percent-like step count,
   - provider wait status,
   - warnings,
   - next action.
6. Add /settings/automation UI or section:
   - enable/disable scheduler,
   - choose characters,
   - choose run time,
   - provider defaults,
   - image count.
7. Add Agency Heartbeat cards:
   - next scheduled run,
   - currently running automation,
   - automation disabled/enabled,
   - runs requiring human review.
8. Add safety:
   - no automatic publishing,
   - no automatic Constitution change,
   - no automatic canon approval,
   - log every automated decision.

CONSTRAINTS:
- Scheduler should not run unexpectedly on app start unless enabled.
- Manual trigger must always be available.
- Keep automation settings simple.
- Do not build complex cron UI.
- All automation must be transparent through Runs.

DONE WHEN:
- User can manually trigger a Daily Activity Run.
- Optional scheduler can create Daily Activity Runs.
- Daily Activity Run produces visible events and artifacts.
- Run can stop at review gates.
- Heartbeat shows current/next automation state.
- BUILD_STATUS.md marks Phase 11 complete.
```

---

# Phase 12 Prompt — MVP Hardening, Tests, Docs, Demo Script

```text
PHASE 12: MVP hardening, tests, docs, and demo script

GOAL:
Make the MVP usable, understandable, and safe enough for local iteration.

CONTEXT:
The product does not need to be perfect. It needs to clearly demonstrate the core machine loop and show where tuning is needed. The final result should be easy to run, test, and demo.

TASKS:
1. Run the full app locally.
2. Fix startup errors.
3. Fix broken routes.
4. Improve empty/error/loading states.
5. Add tests for:
   - DB initialization,
   - run event creation,
   - character creation,
   - Constitution versioning,
   - provider mock generation,
   - provider mock analysis,
   - draft export,
   - feedback reflection proposal creation.
6. Add smoke test script:
   - create demo character,
   - run birth flow,
   - run daily activity flow in mock mode,
   - generate draft,
   - export package,
   - add feedback,
   - run reflection.
7. Update README.md:
   - what this app is,
   - what MVP supports,
   - how to run,
   - environment variables,
   - mock provider mode,
   - Hermes configuration,
   - ComfyUI Cloud configuration,
   - data directories,
   - limitations.
8. Add DEMO_SCRIPT.md:
   - step-by-step demo walkthrough,
   - expected screenshots/pages,
   - what to inspect,
   - how to reset local data.
9. Add TROUBLESHOOTING.md:
   - provider errors,
   - database reset,
   - missing data directory,
   - port conflicts,
   - mock mode.
10. Add SECURITY_LOCAL.md:
   - local-only assumptions,
   - no auth warning,
   - localhost binding,
   - provider secrets,
   - not safe for public deployment.
11. Final review:
   - remove obvious dead code,
   - ensure no secrets in repo,
   - ensure exports are local,
   - ensure provider payloads do not leak API keys,
   - ensure BUILD_STATUS.md is complete.

CONSTRAINTS:
- Do not over-polish at the expense of core workflow.
- Keep docs practical.
- Mock mode must remain functional.
- Do not add auth.
- Do not add cloud deployment.

DONE WHEN:
- Fresh install can run the app.
- Mock-mode demo script completes.
- User can follow README and DEMO_SCRIPT.
- Tests pass or known failures are documented with reasons.
- BUILD_STATUS.md marks Phase 12 complete.
- Final summary explains MVP capabilities and remaining gaps.
```

---

# Optional Codex Review Prompt

Use this after Phase 12 or after any major phase.

```text
Review the current Virtual Agency Studio MVP implementation.

FOCUS AREAS:
1. Does the app preserve the product mission: a transparent machine where characters live and evolve?
2. Are Runs and RunEvents used consistently for automation visibility?
3. Are Constitution, Canon, and Memory properly separated?
4. Are Constitution changes versioned and human-approved?
5. Are provider calls abstracted cleanly?
6. Does mock provider mode allow a full local demo?
7. Is the UI simple and operational rather than overwhelming?
8. Are there any places where automation mutates identity silently?
9. Are local file paths and exports handled safely?
10. Are there obvious bugs, missing tests, or broken flows?

OUTPUT:
- Critical issues
- Important but non-blocking issues
- Suggested improvements
- Files changed if you apply fixes
- Verification commands run
```

---

# Optional Codex Prompt for Extracting Conservatory Primitives

Use this only if The Conservatory code is present or accessible.

```text
Inspect The Conservatory code and identify reusable primitives for Virtual Agency Studio.

LOOK FOR:
- character constitution schemas,
- character core prompt templates,
- appearance prompt patterns,
- negative prompt patterns,
- Hermes API client code,
- image analysis code,
- reference image gallery logic,
- local asset storage code,
- prompt versioning,
- image generation workflows.

DO:
- create CONSERVATORY_REUSE_AUDIT.md,
- list files worth reusing,
- explain what each file does,
- recommend copy/extract/refactor/ignore,
- extract only low-risk reusable code into packages/shared or packages/providers.

DO NOT:
- turn Virtual Agency Studio into a direct fork,
- copy old navigation or page structure,
- overwrite new MVP architecture,
- bring over unused dependencies,
- assume old abstractions are correct.

DONE WHEN:
- CONSERVATORY_REUSE_AUDIT.md exists,
- reusable code is extracted or clearly deferred,
- the new app still runs.
```

---

# Optional Codex Prompt for Creating a Repo-Scoped Skill Later

Codex supports reusable skills as instruction packages with a `SKILL.md` file, which can be useful once the workflow stabilizes. ([OpenAI Developers][3]) After the MVP loop works, this would be a good repo-local skill:

```text
Create a repo-scoped Codex skill for Virtual Agency Studio maintenance.

GOAL:
Create .agents/skills/virtual-agency-studio/SKILL.md that teaches Codex how to safely work on this app.

THE SKILL SHOULD INCLUDE:
- project mission,
- architecture summary,
- important directories,
- run/event requirements,
- Constitution/Canon/Memory rules,
- provider abstraction rules,
- mock mode requirement,
- local-only security assumptions,
- test commands,
- review checklist.

CONSTRAINTS:
- Keep the skill concise and practical.
- Do not duplicate the entire README.
- Include clear trigger description.

DONE WHEN:
- .agents/skills/virtual-agency-studio/SKILL.md exists,
- it has name and description frontmatter,
- it accurately reflects current repo structure.
```

---

# Build sequence summary

The cleanest way to run this is:

```text
1. Paste Master Goal Prompt into Codex.
2. Let Codex complete Phase 0.
3. Review ARCHITECTURE_DECISION.md.
4. Run each phase as its own Codex task.
5. After each phase, inspect BUILD_STATUS.md and run the app.
6. After Phase 8, the creative loop should be visible.
7. After Phase 10, the identity feedback loop should be visible.
8. After Phase 12, the MVP should be demoable end-to-end in mock mode.
```

The most important thing to protect throughout the build is the **Run/Event spine**. If that is solid, the rest of the system can be rough and still useful, because you’ll be able to see exactly where the machine is working, failing, drifting, or waiting for human judgment.

[1]: https://developers.openai.com/codex/learn/best-practices "Best practices – Codex | OpenAI Developers"
[2]: https://developers.openai.com/codex/cli "CLI – Codex | OpenAI Developers"
[3]: https://developers.openai.com/codex/skills "Agent Skills – Codex | OpenAI Developers"
