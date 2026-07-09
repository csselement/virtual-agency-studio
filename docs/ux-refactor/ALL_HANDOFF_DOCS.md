# VAS UX Refactor Handoff — Combined Reference



---

# 00_repo_context_snapshot.md


# 00 — Repo Context Snapshot

This document summarizes the current VAS source observations that shaped the refactor plan. It should be treated as a planning snapshot, not a replacement for a fresh code audit before implementation.

## Current project model

The README describes Virtual Agency Studio as:

> a local-first, single-user MVP for running an observable AI-powered virtual influencer agency.

The current implementation is built around a `Run` / `RunEvent` spine. That was the right MVP architecture decision because it made automation observable, review-gated, and auditable. It is not the right primary mental model for the agency director.

## Current supported capabilities

The repo already supports most of the target product loop:

- Character registry
- Constitution versioning
- Canon
- Memory
- Appearance Bible
- Voice Guide
- Platform Personas
- Reference images
- Character Birth Runs
- Daily Activity Runs
- Prompt Studio
- Activity candidates
- Content briefs
- Prompt recipes
- Image generation
- Image analysis
- Asset Library
- Draft Review Desk
- Platform variants
- Export packages
- Manual publishing ledger
- Social feedback capture
- Feedback Reflection Runs
- Review-gated memory, canon, and Constitution proposals
- Local automation scheduler
- Manual automation triggers

This means the refactor should mostly **reframe and reorganize existing product capability** before adding large new backend features.

## Current frontend observations

Primary frontend file observed:

```text
apps/web/src/App.tsx
```

Current top-level work modes include:

- Command
- Create
- Runs
- Review
- Calendar / Queue
- Library
- Insights
- Settings / System
- Help

The app already has some user-facing language, including “Casting desk,” “Review,” “Calendar / Queue,” and “Insights.” However, the UI still exposes machine concepts too prominently:

- `Runs` remains a top-level navigation item.
- `Runs` is described as “Machine activity.”
- `Settings / System` is described as “Tune machine.”
- Shell branding uses “Agentic social studio.”
- Workspace chrome exposes “Local mode,” “LLM,” and “Storage.”
- Run Detail foregrounds events, artifacts, providers, decisions, raw audit payloads, and provider jobs.
- Demo flow asks the user to inspect event names such as `context.loaded`, `automation.step`, `image.generated`, and `review.required`.

These details are valuable for debugging and trust, but they should be treated as **Studio Ops**, not as primary agency workflows.

## Current backend observations

Primary API file observed:

```text
apps/api/src/app.ts
```

The backend already offers endpoints and data structures that can support the refactor without a complete rewrite:

- `/api/workflow/summary`
- `/api/characters`
- `/api/characters/:id`
- `/api/characters/:id/birth-run`
- `/api/activity-candidates`
- `/api/content-briefs`
- `/api/prompt-recipes`
- `/api/assets`
- `/api/drafts`
- `/api/publishing-events`
- `/api/automation/status`
- feedback and reflection endpoints

The `/api/workflow/summary` endpoint is especially important because it already produces stage summaries. It can be evolved into a Director’s Desk read model.

## Product problem

The current UX makes the agency director operate the machine.

The target UX should make the agency director manage talent.

## Refactor posture

Do not delete the machine layer. Contain it.

The existing observable run architecture should remain intact because it provides:

- auditability
- trust
- provider debugging
- review gates
- traceability
- local-first transparency

The user-facing layer should sit above it and translate machine activity into agency meaning.



---

# 01_product_north_star.md


# 01 — Product North Star

## One-sentence product vision

Virtual Agency Studio is a private operating desk for a virtual talent agency where the agency head scouts, develops, books, reviews, publishes, and evolves synthetic talent based on public response.

## The user

The user is not a prompt engineer, machine operator, or automation supervisor.

The user is the **agency head**.

He thinks like the director of a real talent/modeling agency:

- Who belongs on the roster?
- Who has star potential?
- Who is still in development?
- Who should be pushed publicly?
- Who should be paused or retired?
- What kind of work should each talent book?
- What did the audience respond to?
- What career direction should be approved?

## The talent

The talent are fictitious AI-generated characters, but the interface should treat them as represented identities within the agency.

They should not feel like generic records, prompts, or assets. Each talent should have:

- name
- visual identity
- public positioning
- emotional interiority
- agency stage
- career trajectory
- platform fit
- audience response history
- development notes
- approved identity canon
- career risk profile
- next recommended move

## Agency metaphor

VAS should feel like an agency office, not a machine control room.

The product should model these agency departments:

1. **Director’s Desk** — executive attention and decisions
2. **Roster** — represented talent
3. **Scouting** — new face discovery and birth
4. **Development** — shaping identities over time
5. **Bookings** — planned creative assignments
6. **Production** — generating candidate work
7. **Portfolio** — approved work and reference material
8. **Review Desk** — director approval
9. **Publishing / Placements** — social posts and releases
10. **Audience Response** — public feedback and performance
11. **Career Strategy** — winners, losers, stars, and bets
12. **Studio Ops** — providers, logs, automation, debugging

## Talent lifecycle

The main workflow should be:

```text
Scout → Birth → Develop → Book → Produce → Review → Publish → Measure → Evolve → Repeat
```

Plain-language version:

```text
Find talent → Shape identity → Create work → Put it in public → Learn from response → Build stars
```

## Core product loop

1. A new identity is born.
2. The agency develops that identity through profile, appearance, voice, canon, and reference material.
3. The agency books creative work for the talent.
4. The system produces candidate outputs.
5. The director reviews and approves/rejects work.
6. Approved work is published to social platforms.
7. Social response is logged.
8. Audience response creates identity-learning proposals.
9. The director approves or rejects identity evolution.
10. The talent’s career stage, positioning, and strategy are updated.

## What makes VAS distinctive

VAS is not just an AI content tool.

It is a **creative agency simulator** where synthetic talent evolve through public market response.

The public decides what works. VAS learns from:

- views
- impressions
- likes
- comments
- reposts/shares
- saves
- follows gained
- profile visits
- qualitative notes
- top comments
- director judgment

The system should help the director identify:

- star talent
- rising talent
- development bets
- weak performers
- identity drift
- content themes that resonate
- platform-specific strengths
- realistic next moves for each identity

## Design principles

### 1. The talent is the main character

The UI should foreground talent identity, career stage, and audience response.

### 2. The director makes decisions

The primary UI should package machine output into director decisions.

### 3. Public response drives evolution

The feedback loop should be central, not a secondary form.

### 4. The machine is staff, not the product

Automation, providers, runs, and logs are behind-the-scenes staff work.

### 5. Transparency is available, not unavoidable

Auditing and debugging should remain possible through Studio Ops.

### 6. Agency language beats system language

Use “booking,” “portfolio,” “audience response,” and “career direction” instead of “run,” “asset,” “feedback reflection,” and “identity proposal” wherever possible.

### 7. Winners and losers matter

Not every talent deserves equal attention. The UI should make resource allocation clear.



---

# 02_information_architecture.md


# 02 — Information Architecture

## Current issue

The current app exposes implementation primitives too prominently:

- Runs
- RunEvents
- provider jobs
- prompt recipes
- raw payloads
- route tiers
- system health
- scheduler details

These should remain accessible, but they should not be the primary navigation model.

## Target primary navigation

Recommended MVP nav:

```text
Director’s Desk
Roster
Scouting
Development
Bookings
Review Desk
Publishing
Audience
Strategy
Studio Ops
```

If the app needs fewer nav items at first:

```text
Desk
Roster
Scout
Book
Review
Publish
Audience
Ops
```

## Navigation mapping

| Current | Target | Notes |
|---|---|---|
| Command | Director’s Desk | Executive attention router |
| Create | Scouting | New talent and new work starts here |
| Characters | Roster | Main talent management surface |
| Prompt Studio | Bookings | Planning shoots/content assignments |
| Assets / Library | Portfolio | Approved work, candidate shots, references |
| Drafts / Review | Review Desk | Director approval workflow |
| Calendar / Queue | Publishing | Social release queue and live placements |
| Feedback / Insights | Audience | Response, learning, signal interpretation |
| Runs | Studio Ops → Production Logs | Demote from primary nav |
| Settings / System | Studio Ops | Providers, scheduler, routing, debug |

## Primary hierarchy

The first-level product should answer director questions:

```text
Desk: What needs my attention?
Roster: Who do I represent?
Scouting: Who should I create or test next?
Development: Who needs shaping?
Bookings: What work is each talent doing?
Review: What needs approval?
Publishing: What is going public?
Audience: What did the public say?
Strategy: Who gets resources?
Ops: What did the machine do?
```

## Studio Ops containment

`Runs`, provider jobs, raw JSON, event payloads, route tiers, workflow JSON, scheduler settings, and advanced IDs should live under:

```text
Studio Ops
  Production Logs
  Providers
  Scheduler
  Routing
  Workflow Engines
  Data / Exports
  Debug
```

## Route strategy

Avoid breaking routes in early phases.

Recommended approach:

- Keep existing routes functional.
- Add agency-facing route labels.
- Alias old routes to new surfaces where helpful.
- Demote `/runs` but keep it accessible from Studio Ops.
- Keep `/runs/:id` accessible as Production Log detail.
- Avoid backend renames until UI language stabilizes.

## Suggested route aliases

| Existing route | Suggested agency alias |
|---|---|
| `/` | `/desk` optional alias later |
| `/characters` | `/roster` optional alias later |
| `/characters/:id` | `/talent/:id` optional alias later |
| `/prompt-studio` | `/bookings` optional alias later |
| `/assets` | `/portfolio` optional alias later |
| `/drafts` | `/review` already used |
| `/calendar` | `/publishing` optional alias later |
| `/feedback` | `/audience` optional alias later |
| `/runs` | `/ops/production-logs` optional alias later |
| `/settings` | `/ops` optional alias later |

Early PRs should focus on labels and hierarchy, not route migrations.

## Page structure rule

Every primary page should have:

1. Page purpose in agency language
2. One primary director action
3. A short “why this matters” section or contextual signal
4. The fewest visible decision areas required
5. Advanced technical detail hidden by default

## Do not expose in primary nav

- Runs
- Prompt Recipes
- Provider Jobs
- RunEvents
- Raw JSON
- Workflow JSON
- Scheduler internals
- Provider route tiers
- Database identifiers



---

# 03_language_copy_map.md


# 03 — Language and Copy Map

This document defines the machine-to-agency language conversion for VAS.

## Global copy principles

- Use agency language by default.
- Use machine language only inside Studio Ops, Debug, and Audit views.
- Treat synthetic characters as represented talent identities.
- Avoid copy that makes the director feel like a machine operator.
- Replace “AI did X” with “Studio prepared X” or “Production prepared X” where appropriate.
- Preserve transparency through collapsible technical details.

## Core terminology map

| Machine-facing | Agency-facing |
|---|---|
| Character | Talent / Model / Identity |
| Character Registry | Roster |
| Character Profile | Talent Profile |
| Character Birth Run | New Face Birth / Talent Intake |
| Run | Job / Production / Assignment |
| Run Detail | Production Log |
| Run Events | Staff Notes / Production Log Entries |
| Machine Activity | Studio Activity / Production Logs |
| Prompt Studio | Booking Desk / Creative Briefs |
| Activity Candidate | Booking Idea |
| Content Brief | Shoot Brief / Creative Brief |
| Prompt Recipe | Creative Treatment |
| Image Generation | Production / Shoot |
| Image Analysis | Quality Review / Portfolio Review |
| Asset | Portfolio Shot / Candidate Image |
| Asset Library | Portfolio |
| Draft | Social Package |
| Draft Review Desk | Review Desk |
| Export Package | Placement Package |
| Publishing Event | Live Placement / Published Post |
| Calendar / Queue | Publishing Calendar |
| Social Feedback | Audience Response |
| Feedback Reflection | Audience Debrief |
| Identity Proposal | Career Direction Proposal |
| Memory | Lived Experience / Audience-Learned Note |
| Canon | Public Story / Canon |
| Constitution | Identity Bible |
| Appearance Bible | Look Book / Appearance Bible |
| Voice Guide | Voice Guide |
| Platform Persona | Platform Persona |
| Provider | Production Engine / Vendor |
| Provider Job | Vendor Log / Engine Call |
| Routing | Studio Routing |
| Scheduler | Studio Schedule |
| Automation | Studio Staff / Scheduled Work |
| Review Gate | Director Approval |
| Settings / System | Studio Ops |
| Manual Dispatch | Production Console |
| Raw Details | Technical Audit |
| Advanced IDs | Technical IDs |

## Navigation copy

| Current | Target |
|---|---|
| Command | Director’s Desk |
| Create | Scouting |
| Runs | Studio Ops / Production Logs |
| Review | Review Desk |
| Calendar / Queue | Publishing |
| Library | Portfolio |
| Insights | Audience |
| Settings / System | Studio Ops |
| Help | Guide |

## Shell copy

| Current | Target |
|---|---|
| Agentic social studio | Virtual talent agency |
| Agency Operator | Agency Director |
| Local Operator | Director |
| System Health | Studio Ops Health |
| Local mode / LLM / Storage | Move to Studio Ops or collapse |

## Status vocabulary

Map technical statuses to agency-facing states.

| Technical status | Agency state |
|---|---|
| idea | Scouted |
| queued | Scheduled |
| running | In production |
| waiting_for_provider | Waiting on production engine |
| needs_review | Needs director approval |
| completed | Complete |
| failed | Needs studio attention |
| cancelled | Cancelled |
| approved_post_asset | Approved for publishing |
| approved_reference | Approved reference |
| rejected_identity_drift | Rejected: identity drift |
| rejected_quality | Rejected: quality issue |
| raw_generation | Candidate shot |
| candidate | Ready for review |
| published | Live |
| exported | Package ready |

## Talent career stages

Use these agency-facing stages:

```text
Scouted
New Face
Development
Working Talent
Core Talent
Star Talent
At Risk
Paused
Retired
```

Definitions:

- **Scouted**: idea exists, identity not yet approved.
- **New Face**: born and approved, needs initial development.
- **Development**: profile exists but needs refinement and testing.
- **Working Talent**: producing regular publishable work.
- **Core Talent**: reliable performer worth ongoing attention.
- **Star Talent**: proven standout with high audience pull.
- **At Risk**: declining response, identity drift, or poor fit.
- **Paused**: temporarily not worth active production resources.
- **Retired**: archived identity, no active investment.

## CTA copy

Use CTAs that describe director decisions.

| Avoid | Prefer |
|---|---|
| Start run | Start booking |
| Run daily activity now | Book today’s work |
| Generate activities | Propose booking ideas |
| Compose prompt | Prepare creative treatment |
| Generate image | Start production |
| Analyze | Review quality |
| Approve post asset | Approve for publishing |
| Create draft | Create social package |
| Export | Prepare placement package |
| Mark published | Mark live |
| Run reflection | Debrief audience response |
| Review proposal | Review career direction |
| Open runs | Open production logs |

## Error copy

Error states should avoid exposing internal failure first.

Bad:

```text
provider.request failed: timeout
```

Better:

```text
Production engine did not respond. Open Studio Ops for technical details.
```

Bad:

```text
Run failed.
```

Better:

```text
This production job needs studio attention.
```

## Empty state copy

Good empty states should guide the agency director.

Examples:

```text
No talent in the roster yet.
Scout the first New Face to begin building the agency.
[Scout New Talent]
```

```text
No audience response logged.
Publish a placement, then record social performance so VAS can learn what the public responds to.
[Open Publishing]
```

```text
Nothing needs approval.
The Review Desk is clear. Check the Roster or book new work for a developing talent.
[Open Roster]
```



---

# 04_progressive_disclosure_rules.md


# 04 — Progressive Disclosure Rules

VAS must remain transparent, but transparency should be available rather than unavoidable.

## Primary rule

The director-facing UI should show:

```text
Decision → Reason → Consequence → Action
```

It should not show:

```text
Provider → RunEvent → Payload → ID → Raw JSON → User interprets consequence
```

## Three-layer model

### 1. Agency layer

The default user experience.

Shows:

- talent
- career stage
- bookings
- portfolio work
- review decisions
- publishing status
- audience response
- career direction
- recommendations
- risks
- next moves

### 2. Ops layer

Used when the director or builder needs operational context.

Shows:

- production logs
- run statuses
- scheduler
- provider configuration
- routing
- exports
- workflow engines

### 3. Debug/audit layer

Used for troubleshooting.

Shows:

- IDs
- raw payloads
- JSON
- provider requests/responses
- event payloads
- route tiers
- trace details
- workflow JSON

## What belongs on default screens

Default screens may show:

- current talent
- selected booking
- preview
- recommendation
- director decision
- high-level reason
- risk summary
- audience summary
- status in agency language

Default screens should not show:

- run IDs
- prompt recipe IDs
- provider job IDs
- database IDs
- route tiers
- raw prompts
- raw JSON
- provider request/response bodies
- full event streams
- workflow JSON
- internal status enums

## When to show machine details

Machine details may be shown when:

- user opens Studio Ops
- user expands “Technical Audit”
- an error requires troubleshooting
- a decision needs traceability
- provider setup is being configured
- developer/debug mode is active

## Disclosure labels

Use labels that communicate why the details exist:

| Bad label | Better label |
|---|---|
| Raw details | Technical audit |
| JSON | Developer payload |
| Provider jobs | Production engine logs |
| Run events | Production log |
| Advanced IDs | Technical IDs |
| Prompt | Creative treatment source |
| Audit payloads | Full technical audit |

## Decision packet rule

Any machine-generated output that reaches the director should be transformed into a decision packet:

```text
What is this?
Recommendation
Why
Risk
Consequence
Director action
Technical audit, collapsed
```

## Maximum visible complexity

On default director-facing screens:

- one primary action
- no more than three major decision zones
- no raw tables above the fold unless the screen is a true list/index
- no more than one technical status indicator outside Studio Ops
- no more than one collapsed technical drawer per decision item

## Error state pattern

```text
[Agency-facing error]
What this means:
[Plain-language consequence]

Recommended action:
[Human next step]

Technical audit:
[Collapsed technical details]
```

## Review state pattern

```text
[Preview]
[Recommendation]
[Why this is recommended]
[Risk]
[Director action]
[Technical audit collapsed]
```

## Feedback state pattern

```text
[Public response summary]
[What worked]
[What failed]
[What this means for the talent]
[Proposed career/identity update]
[Approve / Reject]
[Metrics detail collapsed]
```



---

# 05_screen_contracts.md


# 05 — Screen Contracts

Each primary screen must have one agency-facing job, one primary action, and a clear next step.

## Global screen contract

Every screen should define:

- Screen purpose
- Primary user question
- Primary action
- Secondary actions
- What is visible by default
- What is collapsed
- Empty state
- Error state
- Success state
- Studio Ops escape hatch

## 1. Director’s Desk

### Purpose

Executive attention router for the agency director.

### Primary question

> What needs my attention today?

### Primary action

`Review Today’s Decisions`

### Visible by default

- Today’s Decisions
- Star Watch
- Today’s Bookings
- Audience Signals
- Publishing Follow-up
- collapsed Studio Ops Health

### Collapsed or hidden

- run IDs
- event payloads
- provider details
- scheduler internals
- raw system health strip

### Empty state

```text
The desk is clear.
No talent, bookings, publishing, or audience items need attention right now.
[Scout New Talent] [Open Roster]
```

### Success state

```text
Decision recorded.
The next agency step has been updated.
```

## 2. Roster

### Purpose

Manage represented talent and career stages.

### Primary question

> Who does the agency represent, and where should attention go?

### Primary action

`Open Selected Talent` or `Scout New Talent`

### Visible by default

- Star Board / Roster lanes
- talent cards
- stage
- agency priority
- momentum
- best platform
- next recommended move

### Collapsed or hidden

- recent run IDs
- raw status enum
- provider activity
- prompt recipe lineage

### Empty state

```text
No talent in the roster yet.
Scout the first New Face to begin building the agency.
[Scout New Talent]
```

## 3. Talent Profile

### Purpose

Show who the talent is, how they are developing, and what the director should do next.

### Primary question

> What is this talent’s career state and next move?

### Primary action

Depends on state:

- `Approve New Face`
- `Book Next Work`
- `Review Career Direction`
- `Open Audience Response`
- `Pause Talent`

### Visible by default

- Comp Card
- Career Summary
- Next Recommended Move
- Agency Priority
- Portfolio highlights
- Audience summary
- Development notes
- pending director approvals

### Collapsed or hidden

- Constitution full text
- canon entries
- raw memory entries
- run timeline
- provider details
- technical IDs

### Empty state

```text
This talent has not developed a public career yet.
Start with a portfolio test or first booking.
[Book First Work]
```

## 4. Scouting / Birth

### Purpose

Create and approve a new synthetic identity as a represented New Face.

### Primary question

> Is this new identity worth adding to the agency roster?

### Primary action

`Approve New Face`

### Visible by default

- guided intake
- market opportunity
- identity seed
- visual direction
- voice/interiority
- platform fit
- first portfolio test
- New Face Dossier

### Collapsed or hidden

- birth run timeline
- prompt assembly
- raw artifacts
- provider logs

### Empty state

```text
No new face is being scouted.
Start with a market opportunity or identity idea.
[Scout New Talent]
```

## 5. Development

### Purpose

Shape talent over time based on audience response and agency strategy.

### Primary question

> Which talent should we push, develop, pause, or retire?

### Primary action

`Review Development Plan`

### Visible by default

- development lanes
- talent stage
- momentum
- identity strength
- development risk
- next test
- recommended investment level

### Collapsed or hidden

- raw scoring formula
- raw feedback records
- technical reflections

## 6. Bookings

### Purpose

Plan creative assignments for talent.

### Primary question

> What work is this talent doing next?

### Primary action

`Start Production`

### Visible by default

- selected talent
- platform
- booking idea
- shoot brief
- creative treatment summary
- audience hypothesis
- next step

### Collapsed or hidden

- full prompt
- prompt recipe ID
- provider routing
- workflow JSON

### Empty state

```text
No booking selected.
Choose a talent and propose booking ideas based on their current career direction.
[Choose Talent]
```

## 7. Portfolio

### Purpose

Manage approved and candidate work for talent.

### Primary question

> Which shots belong in this talent’s book?

### Primary action

`Review Candidate`

### Visible by default

- image grid
- talent
- portfolio status
- identity match summary
- platform fit
- recommendation

### Collapsed or hidden

- original prompt
- provider
- raw analysis
- suggested prompt fixes unless requested

## 8. Review Desk

### Purpose

Package machine outputs into director decisions.

### Primary question

> What should I approve, revise, reject, or publish?

### Primary action

State-specific:

- `Approve for Publishing`
- `Request Revision`
- `Reject`
- `Approve Career Update`

### Visible by default

- item preview
- recommendation
- reason
- risk
- consequence
- director actions

### Collapsed or hidden

- raw prompt
- provider jobs
- event payloads
- route details
- JSON

### Empty state

```text
Nothing needs approval.
The Review Desk is clear.
[Open Roster] [Book New Work]
```

## 9. Publishing

### Purpose

Track what is ready to go public and what needs follow-up.

### Primary question

> What is going live, and what response needs to be logged?

### Primary action

`Mark Live` or `Log Audience Response`

### Visible by default

- social packages
- platform variants
- disclosure checklist
- live placement status
- follow-up needed

### Collapsed or hidden

- export file manifest
- local filesystem paths
- draft IDs
- package metadata JSON

## 10. Audience

### Purpose

Turn public social performance into identity and career learning.

### Primary question

> What did the public tell us about this talent?

### Primary action

`Review Audience Debrief`

### Visible by default

- performance summary
- top comments
- qualitative themes
- what worked
- what failed
- proposed memory/canon/career updates

### Collapsed or hidden

- raw metric table
- raw reflection JSON
- source IDs
- technical run detail

## 11. Strategy

### Purpose

Allocate agency resources across winners, risers, bets, and weak performers.

### Primary question

> Who deserves more agency attention?

### Primary action

`Set Agency Priority`

### Visible by default

- Star Talent
- Rising Talent
- Development Bets
- At Risk
- Paused
- metrics summary
- recommended investment

### Collapsed or hidden

- detailed formulas
- raw metric history
- technical derivations

## 12. Studio Ops

### Purpose

Expose technical operations without polluting agency workflow.

### Primary question

> What did the machine do, and is the studio configured correctly?

### Primary action

Depends on tab:

- `Open Production Log`
- `Configure Provider`
- `Test Engine`
- `Save Scheduler`
- `Inspect Audit`

### Visible by default

- production logs
- provider status
- scheduler status
- routing
- workflow engines
- technical audit

### Collapsed or hidden

None required. This is the machine-facing area.



---

# 06_data_read_models.md


# 06 — Agency-Facing Data Read Models

This refactor should not immediately rename backend tables or delete the existing `Run` spine. Instead, create agency-facing read models that translate backend records into director-facing concepts.

## Principle

Backend primitives may remain machine-facing.

Frontend/read-model primitives should be agency-facing.

```text
Backend: Run, RunEvent, Asset, Draft, SocialFeedback, Reflection, IdentityProposal
Frontend: ProductionJob, CareerEvent, PortfolioShot, SocialPackage, AudienceSignal, CareerDirection
```

## Suggested read models

## 1. TalentCareerSummary

Used on Roster, Director’s Desk, Strategy, and Talent Profile.

```ts
interface TalentCareerSummary {
  talentId: string;
  displayName: string;
  stage: TalentStage;
  agencyPriority: "push" | "develop" | "test" | "pause" | "retire";
  shortPositioning: string | null;
  bestPlatform: string | null;
  momentumScore: number | null;
  audiencePullScore: number | null;
  identityStrengthScore: number | null;
  developmentRisk: "low" | "medium" | "high" | null;
  nextRecommendedMove: string | null;
  pendingDecisionCount: number;
  latestAudienceSignal: string | null;
  updatedAt: string;
}
```

## 2. TalentStage

```ts
type TalentStage =
  | "scouted"
  | "new_face"
  | "development"
  | "working_talent"
  | "core_talent"
  | "star_talent"
  | "at_risk"
  | "paused"
  | "retired";
```

## 3. DirectorDecision

Used on Director’s Desk and Review Desk.

```ts
interface DirectorDecision {
  id: string;
  type:
    | "new_face_approval"
    | "portfolio_review"
    | "social_package_review"
    | "publishing_follow_up"
    | "audience_debrief"
    | "career_direction"
    | "studio_attention";
  talentId: string | null;
  talentName: string | null;
  title: string;
  summary: string;
  recommendation: string | null;
  reason: string[];
  risk: string | null;
  primaryActionLabel: string;
  primaryActionPath: string;
  technicalSource?: {
    runId?: string;
    assetId?: string;
    draftId?: string;
    feedbackId?: string;
    proposalId?: string;
  };
}
```

## 4. CareerEvent

A director-facing timeline event derived from machine records.

```ts
interface CareerEvent {
  id: string;
  talentId: string;
  occurredAt: string;
  category:
    | "birth"
    | "booking"
    | "production"
    | "portfolio"
    | "review"
    | "publishing"
    | "audience"
    | "identity"
    | "strategy";
  title: string;
  body: string;
  outcome: string | null;
  sourceRunId?: string;
  sourceEntityId?: string;
}
```

Example translation:

```text
Machine:
image.analyzed

Career event:
Portfolio candidate reviewed. Identity match was strong and the shot is ready for director review.
```

## 5. Booking

Agency-facing wrapper around activity candidate + content brief + prompt recipe.

```ts
interface Booking {
  id: string;
  talentId: string;
  talentName: string;
  platform: string;
  title: string;
  goal: string;
  creativeDirection: string;
  audienceHypothesis: string | null;
  status:
    | "idea"
    | "brief_ready"
    | "treatment_ready"
    | "in_production"
    | "ready_for_review"
    | "completed"
    | "cancelled";
  sourceActivityCandidateId?: string;
  sourceContentBriefId?: string;
  sourcePromptRecipeId?: string;
  sourceRunId?: string;
}
```

## 6. PortfolioShot

Agency-facing wrapper around ImageAsset + AssetAnalysis.

```ts
interface PortfolioShot {
  id: string;
  talentId: string | null;
  bookingId: string | null;
  imageUrl: string | null;
  status:
    | "candidate"
    | "approved_for_portfolio"
    | "approved_for_publishing"
    | "rejected_identity_drift"
    | "rejected_quality"
    | "archived";
  identityMatchSummary: string | null;
  qualitySummary: string | null;
  platformFit: string[];
  recommendation: string | null;
  risk: string | null;
  technicalSource: {
    assetId: string;
    promptRecipeId?: string | null;
    runId?: string | null;
  };
}
```

## 7. SocialPackage

Agency-facing wrapper around Draft + PlatformVariant + PublishingPackage.

```ts
interface SocialPackage {
  id: string;
  talentId: string;
  talentName: string;
  title: string;
  status:
    | "needs_review"
    | "approved"
    | "package_ready"
    | "live"
    | "needs_audience_response"
    | "closed";
  platforms: string[];
  primaryCaption: string | null;
  disclosureReady: boolean;
  packagePath?: string | null;
  liveUrls: string[];
  nextActionLabel: string;
}
```

## 8. AudienceSignal

Agency-facing wrapper around SocialFeedback.

```ts
interface AudienceSignal {
  id: string;
  talentId: string;
  sourcePostId: string | null;
  platform: string;
  result: "strong" | "promising" | "mixed" | "weak" | "unknown";
  summary: string;
  whatWorked: string[];
  whatFailed: string[];
  commentThemes: string[];
  recommendedNextTest: string | null;
  metrics: {
    impressions: number;
    reach: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    profileVisits: number;
    followsGained: number;
  };
}
```

## 9. CareerDirectionProposal

Agency-facing wrapper around IdentityProposal.

```ts
interface CareerDirectionProposal {
  id: string;
  talentId: string;
  kind: "memory" | "canon" | "identity_bible" | "strategy";
  title: string;
  proposal: string;
  rationale: string | null;
  riskLevel: "low" | "medium" | "high";
  sourceAudienceSignalId?: string;
  sourceRunId?: string;
  status: "proposed" | "approved" | "rejected";
}
```

## Where to compute read models

Early phase:

- compute in frontend helper functions from existing API payloads
- avoid database migrations unless necessary

Later phase:

- add `/api/director/desk`
- add `/api/talent-careers`
- add `/api/talent-careers/:id`
- add `/api/bookings`
- add `/api/audience/signals`
- add `/api/strategy/star-board`

## Migration posture

Do not block Phase 1–3 on new backend models.

Start with UI-level mapping. Add API read models when repeated transformations become messy.



---

# 07_implementation_phases.md


# 07 — Implementation Phases

This is the recommended branch/PR sequence for Codex.

## Refactor strategy

- Preserve visual design.
- Preserve backend functionality.
- Keep existing routes working.
- Add agency-facing language first.
- Add read models second.
- Demote machine-facing surfaces into Studio Ops.
- Refactor one workflow at a time.

## Phase 0 — Docs and guardrails

### Goal

Land the product model and UX rules inside the repo before coding.

### Deliverables

- `docs/ux-refactor/UX_PRODUCT_MODEL.md`
- `docs/ux-refactor/UX_COPY_MAP.md`
- `docs/ux-refactor/UX_SCREEN_CONTRACTS.md`
- `docs/ux-refactor/UX_GUARDRAILS.md`

### Acceptance criteria

- Codex has project-specific UX rules to follow.
- No runtime code changes.
- Product model clearly states that the user is the agency director.
- Machine data containment is explicitly defined.

## Phase 1 — Navigation and language refactor

### Goal

Replace machine-facing labels with agency-facing language without changing behavior.

### Deliverables

- Update nav labels/details.
- Update shell copy.
- Demote Runs into Studio Ops.
- Rename copy on key CTAs.
- Keep routes working.

### Acceptance criteria

- No primary nav item says “Runs.”
- No primary nav detail says “Machine activity.”
- Shell no longer says “Agentic social studio.”
- Settings/System becomes Studio Ops.
- Typecheck/build pass.

## Phase 2 — Director’s Desk

### Goal

Refactor home screen from machine heartbeat to CEO decision desk.

### Deliverables

- Today’s Decisions
- Star Watch
- Today’s Bookings
- Audience Signals
- Publishing Follow-up
- Studio Ops Health collapsed

### Acceptance criteria

- One primary action.
- No raw run IDs by default.
- No provider/system detail above fold.
- Director sees who/what needs attention.

## Phase 3 — Roster and Talent Profile

### Goal

Make represented talent the core product entity.

### Deliverables

- Roster lanes / Star Board
- Talent career stages
- Talent Profile top summary
- Comp Card
- Career Summary
- Next Move
- Audience Summary
- Development Notes
- Identity Bible collapsed

### Acceptance criteria

- Talent Profile starts with career state, not editor forms.
- Machine timeline is demoted to Production Log.
- Roster helps choose where to invest attention.

## Phase 4 — Scouting / Birth

### Goal

Turn character creation into New Face Intake.

### Deliverables

- Scouting page or improved creation flow
- Guided intake steps
- New Face Dossier
- Birth run technical details linked as Production Log

### Acceptance criteria

- User approves/rejects a New Face, not a run.
- Birth output is director-facing.
- Existing birth-run functionality remains intact.

## Phase 5 — Bookings / Production

### Goal

Refactor Prompt Studio into Booking Desk.

### Deliverables

- Booking Ideas
- Shoot Briefs
- Creative Treatments
- Start Production CTA
- Audience hypothesis field/summary

### Acceptance criteria

- User thinks in assignments, not prompt recipes.
- Full prompt remains available only through collapsed detail.
- Production output routes into Review Desk.

## Phase 6 — Review Desk

### Goal

Unify review around decision packets.

### Deliverables

- Review queue of decisions
- Portfolio review packet
- Social package review packet
- Career direction review packet
- Collapsed technical audit

### Acceptance criteria

- Every review item answers: What is this? Recommendation? Why? Risk? What happens next?
- Prompt/provider/raw JSON are hidden by default.
- Approve/revise/reject actions are clear.

## Phase 7 — Audience and Strategy

### Goal

Make public response the driver of career evolution and star selection.

### Deliverables

- Audience Response screen
- Audience Debrief cards
- Strategy / Star Board
- Agency priority controls
- Proposed identity/career updates

### Acceptance criteria

- Feedback becomes an interpretation workflow, not just metrics entry.
- Star talent and weak performers are visible.
- Director approves career evolution.

## Phase 8 — Studio Ops containment

### Goal

Organize all machine-facing tools under Studio Ops.

### Deliverables

- Production Logs
- Provider configuration
- Scheduler
- Routing
- Workflow engines
- Technical audit
- Advanced IDs

### Acceptance criteria

- Machine data remains available.
- Normal agency workflows do not require machine data.
- Studio Ops is clearly separate from director workflow.

## Recommended PR order

1. Docs only
2. Navigation/copy only
3. Director’s Desk
4. Roster/Profile summary
5. Scouting/Birth Dossier
6. Booking Desk
7. Review Desk decision packets
8. Audience Response
9. Strategy/Star Board
10. Studio Ops cleanup

## Required checks after each implementation phase

Run what exists in the repo:

```bash
npm run typecheck
npm run test
npm run build
```

If the changed phase touches design-system-sensitive components, also run:

```bash
npm run verify:design
```

## UX diff required after each phase

Codex should report:

```text
Before:
- What was machine-facing or confusing?

After:
- What is now agency-facing?
- What was hidden/collapsed?
- What is the primary director action?
- What remains as UX debt?
```



---

# 08_phase_1_navigation_language.md


# 08 — Phase 1: Navigation and Language Refactor

## Goal

Replace machine-facing labels with agency-facing language without changing backend behavior.

This phase is intentionally low-risk. It should mostly touch copy, nav models, page headings, CTA labels, and shell text.

## Non-goals

- Do not rename database fields.
- Do not remove existing routes.
- Do not delete Runs or Run Detail.
- Do not redesign the visual system.
- Do not add major new layout structures yet.
- Do not change provider behavior.

## Likely files

Start with:

```text
apps/web/src/App.tsx
apps/web/src/*.css
```

Only touch CSS if label length requires minor spacing fixes.

## Specific changes

### 1. Shell brand

Replace:

```text
Virtual Agency Studio
Agentic social studio
```

With:

```text
Virtual Agency Studio
Virtual talent agency
```

Replace:

```text
Agency Operator
Local Operator
```

With:

```text
Agency Director
Director
```

### 2. Top-level navigation

Change work mode labels/details:

```ts
Command → Director’s Desk
Create → Scouting
Runs → Studio Ops
Review → Review Desk
Calendar / Queue → Publishing
Library → Portfolio
Insights → Audience
Settings / System → Studio Ops
Help → Guide
```

If both Runs and Settings currently occupy separate nav items, consolidate conceptually but do not break routes. Short-term acceptable option:

```text
Director’s Desk
Scouting
Roster
Bookings
Review Desk
Publishing
Portfolio
Audience
Studio Ops
Guide
```

If a new Roster/Bookings item requires surfacing existing hidden routes, add nav entries to existing routes:

```text
Roster → /characters
Bookings → /prompt-studio
Studio Ops → /settings
Production Logs → accessible inside Studio Ops or as secondary link to /runs
```

### 3. Remove machine-facing nav details

Replace details:

| Current | Target |
|---|---|
| Attention | Today’s decisions |
| Start work | New faces |
| Machine activity | Production logs |
| Human judgment | Director approval |
| Cadence | Publishing |
| Source material | Portfolio |
| Learning loop | Audience response |
| Tune machine | Studio operations |
| How VAS works | Agency guide |

### 4. Workspace chrome

Move or soften system-state copy.

Current concepts like:

```text
Local mode
LLM
Storage
API online
```

should not dominate the primary workspace.

Options:

- Move them into a collapsed `Studio Ops Health` drawer.
- Keep only a small nonverbal health dot.
- Show detailed labels only on hover or inside Studio Ops.

### 5. Page headings

Change headings:

| Current | Target |
|---|---|
| Command | Director’s Desk |
| Create mode / Create | Scouting |
| Machine activity / Runs | Studio Ops / Production Logs |
| Casting / Casting desk | Roster |
| Prompt Studio | Booking Desk |
| Assets / Archive controls | Portfolio |
| Draft Review Desk | Review Desk |
| Calendar / Queue | Publishing |
| Feedback / Insights | Audience Response |
| Settings / System | Studio Ops |

### 6. CTAs

Update visible CTAs:

| Current | Target |
|---|---|
| Review outputs | Review Today’s Decisions |
| Start creating | Scout New Talent |
| Open runs | Open Production Logs |
| Run daily activity now | Book Today’s Work |
| Generate activities | Propose Booking Ideas |
| Create brief | Create Shoot Brief |
| Compose recipe | Prepare Creative Treatment |
| Generate image | Start Production |
| Analyze | Review Quality |
| Create draft | Create Social Package |
| Export | Prepare Placement Package |
| Mark published | Mark Live |
| Run reflection | Debrief Audience Response |

## Acceptance criteria

- Primary nav feels like a talent agency, not a machine console.
- Existing routes still work.
- The user can still access Runs through Studio Ops / Production Logs.
- No raw technical detail is newly exposed.
- No visual redesign is introduced.
- Typecheck/build pass.

## Codex implementation prompt

```text
Implement Phase 1 from docs/ux-refactor/08_phase_1_navigation_language.md.

Preserve existing visual design.
Do not change backend behavior.
Do not remove routes.
Do not delete the Runs page.
Demote Runs into Studio Ops / Production Logs.
Replace machine-facing labels and CTAs with agency-facing language according to docs/ux-refactor/03_language_copy_map.md.

After implementation:
1. Run npm run typecheck.
2. Run npm run build.
3. Provide a UX diff.
4. List any remaining machine-facing labels.
```



---

# 09_phase_2_directors_desk.md


# 09 — Phase 2: Director’s Desk

## Goal

Refactor the home screen from an agency heartbeat / machine state dashboard into the agency director’s daily decision desk.

## Primary user question

> What needs my attention today?

## Primary action

```text
Review Today’s Decisions
```

## Existing foundation

The current dashboard already has:

- Today attention list
- Active Run
- Ready for Review
- Upcoming
- System Health
- primary action selection logic

Keep the useful structure but change the framing and hierarchy.

## Target layout

```text
Director’s Desk

Today’s Decisions
- X talent items need approval
- X social packages ready for publishing
- X audience responses need debrief
- X career direction proposals waiting

Primary CTA:
[Review Today’s Decisions]

Star Watch
- Rising talent
- At-risk talent
- New Face needing development

Today’s Bookings
- Current/next assignments
- Talent + platform + purpose

Audience Signals
- Top public response themes
- Weak signals / declining attention

Publishing Follow-up
- Posts live without feedback
- Packages ready to publish

Studio Ops Health
- collapsed by default
```

## Data mapping

Initial implementation can derive from existing `AppData`:

- `characters`
- `runs`
- `automationStatus`
- `workflowSummary`

Later phases can add a richer `/api/director/desk` endpoint.

## Today’s Decisions sources

Include:

- runs needing review
- drafts needing review
- assets ready for review
- publishing events needing feedback
- identity proposals awaiting approval
- characters needing setup
- failed runs requiring Studio Ops attention

## Star Watch initial approximation

Before adding real scoring, use available data:

- Talent with recent feedback → “Audience signal available”
- Talent with pending proposals → “Career direction waiting”
- Talent with approved/published activity → “Working talent”
- Talent with no birth/development activity → “New Face needs development”
- Failed/weak feedback if available → “At risk”

Do not invent fake performance numbers if data is unavailable.

## Copy examples

### Empty desk

```text
The desk is clear.
No talent, publishing, or audience decisions need attention right now.
```

### Star Watch empty

```text
No stars yet.
Publish work and log audience response to see which talent earns more agency attention.
```

### Studio Ops Health

Collapsed summary:

```text
Studio Ops: healthy
```

Expanded detail:

```text
API online
Providers configured
Scheduler state
Open Studio Ops
```

## What to remove from default home

- “machine state” copy
- raw active run details beyond a plain-language production status
- provider references
- LLM/storage status strip
- system health as a major panel

## Acceptance criteria

- The screen reads as an executive agency desk.
- There is one primary CTA.
- Machine/system details are not prominent.
- The director can identify who/what needs attention.
- Empty states guide the user to Scout, Roster, or Bookings.
- Typecheck/build pass.

## Codex implementation prompt

```text
Implement Phase 2 from docs/ux-refactor/09_phase_2_directors_desk.md.

Preserve visual design and existing app behavior.
Refactor the home screen into Director’s Desk.
Keep machine/system health collapsed or visually subordinate.
Use existing data first; do not add backend migrations unless unavoidable.
Do not expose run IDs, provider jobs, raw payloads, or prompt details by default.

After implementation:
1. Run npm run typecheck.
2. Run npm run build.
3. Provide UX diff.
4. List data gaps that should be solved by future read models.
```



---

# 10_phase_3_roster_talent_profile.md


# 10 — Phase 3: Roster and Talent Profile

## Goal

Make represented talent the central product entity.

## Primary questions

Roster:

> Who does this agency represent, and where should attention go?

Talent Profile:

> What is this talent’s career state and next move?

## Roster target

The Roster should feel like a talent board.

### Roster lanes

Add or simulate lanes:

```text
Star Talent
Core Talent
Rising Talent
Development
New Faces
At Risk
Paused / Retired
```

If backend stages are not yet available, derive provisional lanes:

- no birth run / minimal setup → New Face
- pending identity proposals → Development
- published events / feedback exists → Working Talent
- strong positive operator judgment → Rising/Core
- negative operator judgment or rejected outputs → At Risk
- archived/paused status → Paused

Avoid pretending exact scoring exists.

### Talent card

A card should show:

```text
Portrait or initials
Name
Stage
Short positioning
Best platform
Momentum / latest audience signal
Next recommended move
```

Avoid default display of:

- run IDs
- raw status enum
- latest technical run name
- prompt recipe data
- provider data

## Talent Profile target

### Top profile layout

```text
Talent Profile

[Portrait / approved reference]
Name
Stage
Agency Priority
Best Platform
Momentum
Identity Stability
Next Recommended Move

Primary CTA:
[Book Next Work] or [Review Career Direction]
```

### Profile sections

1. Comp Card
2. Career Summary
3. Next Move
4. Portfolio Highlights
5. Audience Response
6. Development Notes
7. Director Approvals
8. Identity Bible
9. Career Timeline
10. Production Logs link

## Existing data to use

Current `CharacterDetail` includes:

- constitutions
- canon
- memory
- appearanceProfiles
- voiceGuides
- platformPersonas
- referenceImages
- recentRuns
- feedback
- reflections
- identityProposals

This is enough to reframe the profile without major backend work.

## Identity Bible containment

Keep these available but not dominant:

- Constitution
- Canon
- Memory
- Appearance Bible
- Voice Guide
- Platform Personas
- Reference Images

Recommended UI:

```text
Identity Bible
[summary visible]
[full sections inside tabs/details]
```

## Director Approvals

Surface pending proposals as real decisions:

```text
Career Direction Proposal
Type: Audience-learned memory
Recommendation: Add “morning ritual” as a recurring identity signal.
Risk: Low
[Approve] [Reject]
```

## Career Timeline

Translate recent runs and events into agency terms:

| Machine event | Career event |
|---|---|
| character_birth | Born as New Face |
| daily_activity | Booked daily work |
| image_generation | Production created candidate shots |
| image_analysis | Portfolio quality review completed |
| draft_packaging | Social package prepared |
| feedback_reflection | Audience debrief completed |
| canon_evolution | Career story updated |

## Acceptance criteria

- Roster is about talent and career stages.
- Talent Profile starts with identity/career meaning, not editor controls.
- Editing remains available but no longer dominates first view.
- Machine timeline is linked as Production Log.
- Pending identity changes are director-facing Career Direction Proposals.
- Typecheck/build pass.

## Codex implementation prompt

```text
Implement Phase 3 from docs/ux-refactor/10_phase_3_roster_talent_profile.md.

Preserve visual design.
Do not change backend schema unless absolutely necessary.
Use existing CharacterDetail data to create agency-facing Roster and Talent Profile summaries.
Move technical/recent run details into a Career Timeline or Production Logs link.
Collapse detailed Constitution/Canon/Memory editors under Identity Bible.
Surface pending identity proposals as Career Direction Proposals.

After implementation:
1. Run npm run typecheck.
2. Run npm run build.
3. Provide UX diff.
4. Identify any backend read model gaps.
```



---

# 11_phase_4_scouting_birth.md


# 11 — Phase 4: Scouting and Birth

## Goal

Turn character creation into a guided New Face Intake workflow.

## Primary question

> Is this new identity worth adding to the agency roster?

## Current problem

The current create flow treats identity creation as record creation plus a Birth Run.

The refactor should make it feel like scouting and evaluating a new represented identity.

## Target flow

```text
Scouting
  1. Market Opportunity
  2. Identity Seed
  3. Look Direction
  4. Voice and Inner Life
  5. Platform Fit
  6. First Portfolio Test
  7. New Face Dossier
```

## Step details

### 1. Market Opportunity

Ask:

- What kind of talent is missing from the roster?
- What audience or platform should this talent serve?
- What makes this identity different from existing talent?

### 2. Identity Seed

Fields:

- name
- public archetype
- emotional tone
- life texture
- uniqueness hook
- initial summary

### 3. Look Direction

Fields:

- visual identity
- style language
- reference constraints
- what to avoid
- identity consistency notes

### 4. Voice and Inner Life

Fields:

- voice guide
- emotional depth
- recurring tensions
- values
- public/private contrast

### 5. Platform Fit

Fields:

- primary platform
- secondary platforms
- content strengths
- public appeal hypothesis

### 6. First Portfolio Test

Actions:

- upload reference
- generate initial candidate
- approve/reject reference
- identify identity drift risk

### 7. New Face Dossier

Final review:

```text
Name
Stage: New Face
Public promise
Visual direction
Voice/interiority
Best initial platform
Development risk
Recommended first booking
Director decision:
[Approve New Face] [Revise Identity] [Reject Concept]
```

## Backend posture

Use existing endpoints initially:

- create character
- add Constitution
- add Appearance
- add Voice
- add Platform Persona
- upload Reference Image
- start Birth Run

Do not require a new backend wizard table for the first implementation.

## Birth Run handling

After Birth Run completes, do not send the user primarily to Run Detail.

Instead show:

```text
New Face Dossier
```

with a link:

```text
View Production Log
```

## Acceptance criteria

- New character creation feels like scouting.
- The director evaluates identity promise before moving forward.
- The birth run is available but not primary.
- The result is a New Face Dossier.
- Typecheck/build pass.

## Codex implementation prompt

```text
Implement Phase 4 from docs/ux-refactor/11_phase_4_scouting_birth.md.

Create or refactor the Scouting/New Face flow using existing character endpoints.
Preserve visual style.
Do not remove the existing character creation path until the new flow works.
After Birth Run, present a New Face Dossier instead of making the run timeline the primary success screen.
Keep Production Log available as a secondary link.

After implementation:
1. Run npm run typecheck.
2. Run npm run build.
3. Provide UX diff.
4. List any data that is still simulated or derived.
```



---

# 12_phase_5_bookings_production.md


# 12 — Phase 5: Bookings and Production

## Goal

Refactor Prompt Studio into a Booking Desk that plans creative assignments for talent.

## Primary question

> What work is this talent doing next?

## Current machine chain

```text
Activity Candidate → Content Brief → Prompt Recipe → Image Generation
```

## Target agency chain

```text
Booking Idea → Shoot Brief → Creative Treatment → Production
```

## Target screen

```text
Booking Desk

Talent: Ava Monroe
Platform: Instagram
Career goal: deepen morning ritual identity
Audience hypothesis: saves/comments improve when posts show process

Booking Ideas
- Café morning ritual
- Studio reset
- Streetwear errand

Shoot Brief
- goal
- visual direction
- caption angle
- disclosure needs

Creative Treatment
- summary visible
- full prompt collapsed

Primary CTA:
[Start Production]
```

## Copy replacements

| Current | Target |
|---|---|
| Generate activities | Propose Booking Ideas |
| Activity candidates | Booking Ideas |
| Select activity | Choose Booking |
| Create brief | Create Shoot Brief |
| Content brief | Shoot Brief |
| Compose recipe | Prepare Creative Treatment |
| Prompt recipe | Creative Treatment |
| Generate image | Start Production |
| Final prompt | Treatment source |
| Prompt lineage | Technical treatment audit |

## Visible by default

- selected talent
- stage / current career direction
- platform
- booking idea
- shoot brief summary
- audience hypothesis
- production CTA

## Collapsed

- full prompt
- negative prompt
- recipe ID
- generation settings
- provider/routing
- raw lineage

## Audience hypothesis

Add a simple field or derived copy:

```text
Audience hypothesis:
This booking tests whether Ava’s audience responds to quiet ritual/process content.
```

This is crucial because later Audience Response should evaluate whether the hypothesis worked.

## Data posture

Use existing:

- activity candidates
- content briefs
- prompt recipes
- generation endpoints

If adding fields is too much for the first pass, store audience hypothesis in existing brief goal/body copy or derive it from the content pillar and visual direction.

## Acceptance criteria

- The user never has to think “prompt recipe” by default.
- The page reads as planning work for represented talent.
- The production start action is clear.
- Full technical prompt remains accessible.
- Typecheck/build pass.

## Codex implementation prompt

```text
Implement Phase 5 from docs/ux-refactor/12_phase_5_bookings_production.md.

Refactor Prompt Studio into Booking Desk.
Preserve existing endpoint behavior.
Rename Activity Candidate / Content Brief / Prompt Recipe concepts in the UI to Booking Idea / Shoot Brief / Creative Treatment.
Show full prompt and recipe lineage only in collapsed technical detail.
Add or derive an Audience Hypothesis for each booking.
Make Start Production the primary CTA once a creative treatment is ready.

After implementation:
1. Run npm run typecheck.
2. Run npm run build.
3. Provide UX diff.
4. List remaining machine-facing labels in this flow.
```



---

# 13_phase_6_review_desk.md


# 13 — Phase 6: Review Desk

## Goal

Refactor review surfaces into director-facing decision packets.

## Primary question

> What should I approve, revise, reject, or publish?

## Current surfaces involved

- Asset Library review panel
- Draft Review Desk
- pending run review gates
- identity proposal reviews

## Target model

The Review Desk should be a queue of decisions, not a collection of machine outputs.

## Decision packet structure

Every review item should follow:

```text
What is this?
Recommendation
Why
Risk
What happens next
Director actions
Technical audit, collapsed
```

## Review item types

### 1. Portfolio candidate

```text
Candidate portfolio shot for Ava Monroe

Recommendation:
Approve for publishing.

Why:
- Strong identity match
- Good story fit
- Matches current booking
- No major quality issues

Risk:
Caption needs more personality.

Actions:
[Approve for Publishing] [Add to Portfolio] [Request Revision] [Reject]
```

### 2. Social package

```text
Social package for Ava Monroe — Café Morning Series

Recommendation:
Approve and prepare placement package.

Why:
- Image and caption align with current career direction
- Disclosure is present
- Platform variant is ready

Actions:
[Approve Package] [Edit Copy] [Reject]
```

### 3. Career direction proposal

```text
Audience-learned career update

Recommendation:
Add “morning ritual” as a recurring identity memory.

Why:
- Saves and comments were above baseline
- Top comments mention calmness and ritual
- Fits existing voice and canon

Risk:
Low. Avoid making every post too similar.

Actions:
[Approve Career Update] [Reject]
```

### 4. Studio attention item

```text
Production job needs attention

Recommendation:
Open Studio Ops.

Why:
The production engine failed before candidate shots were created.

Actions:
[Open Production Log]
```

## Default Review Desk layout

```text
Review Desk

Decision Queue
- all items requiring director action

Selected Decision
- preview / summary
- recommendation
- reason
- risk
- action buttons

Technical Audit
- collapsed
```

## Technical details to collapse

- raw prompt
- provider jobs
- route tier
- event payloads
- JSON
- IDs
- full analysis object

## Acceptance criteria

- Review Desk is decision-first.
- Every item has a clear recommendation and consequence.
- Technical data is available but not visible by default.
- The director can process the queue without opening Runs.
- Typecheck/build pass.

## Codex implementation prompt

```text
Implement Phase 6 from docs/ux-refactor/13_phase_6_review_desk.md.

Refactor review surfaces into director-facing decision packets.
Use existing assets, drafts, runs needing review, and identity proposals.
Do not remove technical audit access; collapse it.
Do not expose raw prompt, provider jobs, IDs, or JSON by default.
Make each review item answer: What is this? Recommendation? Why? Risk? What happens next?

After implementation:
1. Run npm run typecheck.
2. Run npm run build.
3. Provide UX diff.
4. List any review item types still missing from the queue.
```



---

# 14_phase_7_audience_strategy.md


# 14 — Phase 7: Audience Response and Strategy

## Goal

Make public response the engine of talent evolution and agency resource allocation.

## Primary questions

Audience:

> What did the public tell us about this talent?

Strategy:

> Who deserves more agency attention?

## Audience Response

### Input

Use existing feedback fields:

- impressions/views
- reach
- likes
- comments
- shares/reposts
- saves
- profile visits
- follows gained
- qualitative notes
- top comments
- operator judgment

### Output

The UI should interpret feedback as agency signal:

```text
Audience Debrief

Result: Strong
What worked:
- Saves suggest aspirational value.
- Comments mention calmness and ritual.
- Follows gained were above baseline.

What failed:
- Caption did not create much discussion.

Meaning for talent:
Ava’s audience responds to quiet process and morning rituals.

Recommended next test:
Repeat the ritual theme with more conversational captioning.

Career Direction:
Add “morning ritual / interior stillness” to audience-learned memory.

Actions:
[Approve Memory Update] [Add to Canon] [Ignore Signal]
```

## Audience result categories

```text
Strong
Promising
Mixed
Weak
Unknown
```

Do not overfit if data is sparse.

## Strategy / Star Board

### Purpose

Rank and allocate attention across talent.

### Lanes

```text
Star Talent
Core Talent
Rising Talent
Development Bets
At Risk
Paused / Retired
```

### Signals

Use interpretable signals:

- Momentum
- Audience Pull
- Identity Strength
- Platform Fit
- Development Risk
- Agency Priority

### Agency priority values

```text
Push
Develop
Test
Pause
Retire
```

## Initial scoring guidance

Do not create a fake precise score if the data is not mature.

Use simple transparent heuristics first:

- recent positive feedback + follows gained → Rising
- repeated positive feedback → Core/Star
- no feedback yet → Development/New Face
- negative operator judgment → At Risk
- no production/publishing activity → Needs development
- repeated rejection/identity drift → At Risk

## Career evolution

Identity evolution should be review-gated.

Audience feedback may propose:

- memory updates
- canon updates
- voice adjustments
- platform persona adjustments
- career stage changes
- agency priority changes

The director approves or rejects.

## Acceptance criteria

- Audience is not just a metrics form.
- Feedback produces a plain-language debrief.
- Debriefs connect to career direction.
- Star Board makes winners/losers visible.
- Director controls identity evolution.
- Typecheck/build pass.

## Codex implementation prompt

```text
Implement Phase 7 from docs/ux-refactor/14_phase_7_audience_strategy.md.

Refactor Feedback/Insights into Audience Response and Strategy surfaces.
Use existing SocialFeedback, Reflection, and IdentityProposal data.
Show public response as debriefs: result, what worked, what failed, meaning for talent, recommended next test.
Add a Star Board / Strategy view using transparent derived signals.
Do not invent precise analytics if source data is missing.
Keep raw metrics available in collapsed detail.
Director must approve career/identity updates.

After implementation:
1. Run npm run typecheck.
2. Run npm run build.
3. Provide UX diff.
4. List which signals are derived vs. persisted.
```



---

# 15_phase_8_studio_ops.md


# 15 — Phase 8: Studio Ops Containment

## Goal

Move machine-facing surfaces into a clearly bounded Studio Ops area.

## Primary question

> What did the machine do, and is the studio configured correctly?

## What belongs in Studio Ops

- Production Logs
- Run list
- Run Detail
- Run Events
- Provider Jobs
- Provider settings
- Routing
- Scheduler
- Workflow engines
- Comfy workflows
- Raw payloads
- Advanced IDs
- Export paths
- API health
- Local storage state
- Debug/testing actions

## What does not belong in primary agency screens

- raw run IDs
- provider job details
- event type names
- audit payloads
- workflow JSON
- prompt recipe IDs
- provider route tiers
- LLM/storage status labels

## Studio Ops layout

```text
Studio Ops

Overview
- health
- provider readiness
- scheduler
- recent failures

Production Logs
- runs table
- filters
- run detail
- event timeline

Providers
- mock/live
- OpenAI
- ComfyUI
- Hermes
- WaveSpeed

Routing
- content tiers
- fallback behavior
- override logs

Workflow Engines
- Comfy workflows
- validation
- test runs

Automation
- daily schedule
- default talent
- max images
- review gates
- manual dispatch

Technical Audit
- raw payloads
- IDs
- exports
```

## Run Detail rename

The route can remain `/runs/:id`, but the page title should be:

```text
Production Log
```

Run Detail should answer:

```text
What happened behind the scenes?
```

not:

```text
What should the director do?
```

Director decisions should happen in Review Desk.

## Access pattern

Agency screens should link to Studio Ops with secondary text:

```text
View Production Log
Open Technical Audit
Inspect Studio Ops
```

These links should never be the primary CTA unless there is a technical failure.

## Acceptance criteria

- Machine data remains accessible.
- Normal agency workflows no longer require opening Runs.
- Studio Ops has a clear technical identity.
- Run Detail is relabeled as Production Log.
- Typecheck/build pass.

## Codex implementation prompt

```text
Implement Phase 8 from docs/ux-refactor/15_phase_8_studio_ops.md.

Consolidate machine-facing UI under Studio Ops.
Rename Runs surfaces as Production Logs.
Keep existing routes working.
Ensure agency-facing screens only link to Studio Ops as secondary technical/audit actions.
Do not remove raw payloads or provider jobs; move/collapse them appropriately.

After implementation:
1. Run npm run typecheck.
2. Run npm run build.
3. Provide UX diff.
4. Confirm all technical details remain accessible.
```



---

# 16_codex_prompt_pack.md


# 16 — Codex Prompt Pack

Use these prompts to keep Codex focused on UX refactor implementation rather than generic redesign.

## Master setup prompt

```text
We are working on Virtual Agency Studio.

Read these docs before coding:
- docs/ux-refactor/README.md
- docs/ux-refactor/01_product_north_star.md
- docs/ux-refactor/03_language_copy_map.md
- docs/ux-refactor/04_progressive_disclosure_rules.md
- docs/ux-refactor/05_screen_contracts.md
- docs/ux-refactor/07_implementation_phases.md

Important:
This is not a visual redesign. Preserve the existing visual identity, color palette, typography, spacing language, card styling, and component feel.

The user is the head of a virtual talent agency. He manages synthetic talent as represented identities. The UI should feel like a real agency operating desk: scouting, roster, development, bookings, review, publishing, audience response, career strategy, and studio ops.

Runs, RunEvents, provider jobs, prompt recipes, raw payloads, and IDs are backend/Studio Ops concepts. They should not be the primary user-facing mental model.

Before coding, summarize:
1. The phase you are implementing.
2. The screens/files likely touched.
3. The agency-facing UX goal.
4. What machine-facing details will be hidden, renamed, or moved.
5. Acceptance criteria.
```

## Phase implementation prompt

```text
Implement Phase [N] from docs/ux-refactor/[phase_file].md.

Rules:
- Preserve visual design.
- Do not introduce a new design system.
- Do not remove existing routes unless explicitly requested.
- Do not change backend schema unless the phase requires it.
- Use existing data first; add read models only when necessary.
- Hide/collapse machine data by default.
- Keep technical audit access available.
- Every primary screen should have one director-facing job and one primary action.

After coding:
1. Run npm run typecheck.
2. Run npm run build.
3. Run npm run test if related code changed or if time allows.
4. Provide a UX diff:
   - Before: what was machine-facing/confusing?
   - After: what is agency-facing now?
   - What was hidden/collapsed/moved?
   - What is the primary director action?
   - Remaining UX debt.
```

## UX audit prompt

```text
Audit the current implementation against docs/ux-refactor/04_progressive_disclosure_rules.md and docs/ux-refactor/05_screen_contracts.md.

Do not code yet.

For each primary screen, report:
1. Screen purpose
2. Primary director question
3. Primary action
4. Machine-facing elements still visible by default
5. Areas with too many competing decisions
6. Copy that should be changed
7. Technical details that should move to Studio Ops
8. Empty/loading/error states that need improvement
9. Recommended smallest corrective change
```

## Copy refactor prompt

```text
Refactor only visible product copy according to docs/ux-refactor/03_language_copy_map.md.

Do not change behavior.
Do not change layout unless label length breaks the UI.
Do not rename backend fields.
Do not remove routes.

After editing, list:
1. Terms replaced.
2. Terms intentionally left because they are inside Studio Ops.
3. Any copy that still feels machine-facing.
```

## Progressive disclosure prompt

```text
Review this screen for progressive disclosure.

Goal:
The default view should show director-facing decisions, not machine internals.

Move or collapse:
- run IDs
- provider jobs
- raw JSON
- prompt recipe IDs
- route tiers
- event payloads
- workflow JSON
- full prompts

Keep visible:
- recommendation
- reason
- risk
- consequence
- director action

Do not remove technical data. Keep it in a collapsed Technical Audit or Studio Ops area.
```

## Screen contract prompt

```text
Create a screen contract before implementing this screen.

Include:
1. Screen purpose
2. Primary director question
3. Primary action
4. Secondary actions
5. Visible by default
6. Collapsed/hidden by default
7. Empty state
8. Error state
9. Success state
10. Studio Ops escape hatch

Then implement only what satisfies the contract.
```

## PR cleanup prompt

```text
Before finalizing this PR, check for UX regressions.

Search for visible machine-facing terms outside Studio Ops:
- Run
- RunEvent
- Provider Job
- raw
- JSON
- prompt recipe
- route tier
- payload
- ID
- machine
- automation

For each occurrence:
- keep if it is inside Studio Ops or technical audit
- rename/collapse/move if it is on a director-facing screen

Then run typecheck/build and provide a UX diff.
```

## Final response template for Codex

```text
## UX refactor summary

Phase:
Screens changed:
Files changed:

## Before

- ...

## After

- ...

## Primary director action

- ...

## Machine details moved/collapsed

- ...

## Checks

- npm run typecheck: pass/fail
- npm run build: pass/fail
- npm run test: pass/fail/not run

## Remaining UX debt

- ...
```



---

# 17_qa_acceptance_checklist.md


# 17 — QA and Acceptance Checklist

Use this after every phase.

## Product model checklist

- [ ] The user is treated as an agency director, not a machine operator.
- [ ] Talent are treated as represented identities, not generic records.
- [ ] The screen uses agency language.
- [ ] The screen has one clear purpose.
- [ ] The screen has one primary action.
- [ ] The next step is obvious.

## Progressive disclosure checklist

- [ ] Raw JSON is hidden by default outside Studio Ops.
- [ ] Provider jobs are hidden by default outside Studio Ops.
- [ ] Run IDs are hidden by default outside Studio Ops.
- [ ] Prompt recipe IDs are hidden by default outside Studio Ops.
- [ ] Route tiers are hidden by default outside Studio Ops.
- [ ] Event payloads are hidden by default outside Studio Ops.
- [ ] Full prompts are collapsed unless the user is editing a Creative Treatment.
- [ ] Technical audit remains accessible.

## Navigation checklist

- [ ] Primary nav feels like an agency workflow.
- [ ] Runs is not a top-level primary user concept.
- [ ] Studio Ops is clearly available.
- [ ] Roster is easy to find.
- [ ] Review Desk is easy to find.
- [ ] Audience Response is easy to find.
- [ ] Publishing is clear.

## Director’s Desk checklist

- [ ] Shows Today’s Decisions.
- [ ] Shows who/what needs attention.
- [ ] Shows a primary CTA.
- [ ] Shows Star Watch or equivalent.
- [ ] Shows Publishing follow-up.
- [ ] Shows Audience Signals when available.
- [ ] System health is subordinate/collapsed.

## Roster checklist

- [ ] Talent cards show stage or derived stage.
- [ ] Talent cards show next recommended move or current gap.
- [ ] Roster supports attention allocation.
- [ ] New Faces and Star/Working talent are distinguishable.
- [ ] No technical run data dominates cards.

## Talent Profile checklist

- [ ] Starts with Comp Card / career summary.
- [ ] Shows agency stage.
- [ ] Shows agency priority or next move.
- [ ] Shows audience summary if available.
- [ ] Shows pending career direction approvals.
- [ ] Identity Bible is available but not dominant.
- [ ] Production logs are secondary.

## Scouting checklist

- [ ] Creation feels like New Face Intake.
- [ ] User can articulate market opportunity.
- [ ] User can define identity seed.
- [ ] User can define look/voice/platform fit.
- [ ] Birth result appears as New Face Dossier.
- [ ] Birth run remains accessible as Production Log.

## Bookings checklist

- [ ] Prompt Studio language is replaced with Booking Desk language.
- [ ] Activity Candidate appears as Booking Idea.
- [ ] Content Brief appears as Shoot Brief.
- [ ] Prompt Recipe appears as Creative Treatment.
- [ ] Start Production is the primary action.
- [ ] Full prompt is collapsed.

## Review Desk checklist

- [ ] Review item has a clear recommendation.
- [ ] Review item explains why.
- [ ] Review item identifies risk.
- [ ] Review item explains consequence.
- [ ] Approve/revise/reject actions are clear.
- [ ] Technical details are collapsed.

## Audience checklist

- [ ] Feedback becomes Audience Response.
- [ ] Metrics are interpreted as audience signal.
- [ ] Top comments and qualitative notes are visible.
- [ ] What worked/failed is clear.
- [ ] Career/identity proposals are director-approved.
- [ ] Raw metrics can be expanded.

## Strategy checklist

- [ ] Winners and losers are visible.
- [ ] Star Talent is distinguishable.
- [ ] Rising Talent is distinguishable.
- [ ] Development Bets are distinguishable.
- [ ] At Risk/Paused talent are visible.
- [ ] Agency Priority can be set or derived.

## Studio Ops checklist

- [ ] Runs are available as Production Logs.
- [ ] Provider configuration is available.
- [ ] Scheduler is available.
- [ ] Routing/workflow engine controls are available.
- [ ] Debug/audit data is available.
- [ ] Studio Ops does not bleed into director-facing screens.

## Build checks

Run after each phase where code changes:

```bash
npm run typecheck
npm run build
```

Run when behavior or backend changes:

```bash
npm run test
```

Run when visual/system changes may affect styling:

```bash
npm run verify:design
```

## Manual 10-second usability test

For each primary screen, ask:

1. Can a first-time director tell what this screen is for in 10 seconds?
2. Is the primary action obvious?
3. Is the screen about talent/career/work, not machine internals?
4. Are technical details available but not in the way?
5. Does the empty state tell the director what to do next?

If any answer is no, the phase is not done.



---

# 18_non_goals_and_risks.md


# 18 — Non-Goals, Risks, and Guardrails

## Non-goals

This refactor is not:

- a visual redesign
- a new component library migration
- a backend rewrite
- a route-breaking rename migration
- a removal of Runs or RunEvents
- a removal of provider debugging
- an attempt to hide all technical transparency
- a generic SaaS dashboard facelift
- an onboarding-modal bandage

## Preserve

- existing visual identity
- local-first architecture
- review gates
- human approval for Constitution changes
- human approval for canon changes
- observable run/event architecture
- provider configuration and tests
- mock provider mode
- manual publishing model
- social feedback capture
- reflection and identity proposal workflow

## Main risk: cosmetic rename without mental-model change

Bad outcome:

```text
Run is renamed Job, but the page still behaves like a run debugger.
```

Good outcome:

```text
The director sees a booking, recommendation, risk, and approval action.
The production log is available only as technical audit.
```

## Main risk: hiding too much

Do not remove auditability.

VAS needs transparency because:

- provider failures happen
- identity drift matters
- prompt lineage matters
- local files/exports matter
- review gates need evidence

The rule is not “delete machine data.”

The rule is:

```text
Machine data belongs in Studio Ops or Technical Audit.
```

## Main risk: fake intelligence

Do not invent precise scores if data is not available.

Bad:

```text
Star score: 94.2
```

Better:

```text
Audience signal: promising.
Reason: one published post has positive operator judgment and follows gained.
```

## Main risk: too many phases in one PR

Avoid large PRs that change navigation, profile, review, audience, and data models all at once.

Use one phase per PR.

## Main risk: new copy still sounds synthetic

Avoid:

- “AI agent”
- “machine”
- “automation”
- “workflow output”
- “payload”
- “run completed”
- “provider route”
- “prompt recipe”

Prefer:

- “studio”
- “production”
- “booking”
- “portfolio”
- “director approval”
- “audience response”
- “career direction”
- “identity bible”

## Main risk: treating all talent equally

The product vision requires winners and losers.

The UI must eventually make clear:

- who is promising
- who is underperforming
- who deserves more work
- who should be paused
- who is becoming a star

## Main risk: overexposing editing tools

Talent profile should not start as a wall of editable fields.

It should start as a dossier:

- who this talent is
- where they stand
- how audiences respond
- what the next move is

Editing belongs lower on the page or in structured drawers.

## Main risk: review overload

Review Desk should not become another dense dashboard.

Each item needs:

- preview
- recommendation
- reason
- risk
- consequence
- action

Nothing else should be visible by default.

## Main risk: audience feedback becomes a spreadsheet

Audience Response should not be a metrics table first.

It should answer:

```text
What did the public tell us?
What should the agency do with that signal?
```

Metrics can be expanded.

## Hard guardrails

- One primary action per screen.
- No raw JSON on default director-facing screens.
- No IDs on default director-facing screens unless needed for support/debug.
- No top-level Runs concept after Phase 1.
- No provider details outside Studio Ops unless there is a failure.
- No Constitution/canon/memory changes without director approval.
- No visual redesign in this refactor.



---

# 19_issue_templates.md


# 19 — Suggested GitHub Issue Breakdown

Use these as issue titles/bodies for implementation tracking.

## Epic: VAS human-facing agency UX refactor

### Goal

Refactor VAS so the primary UI serves the virtual talent agency director rather than exposing machine internals.

### Success criteria

- Talent/career model is primary.
- Runs are demoted to Studio Ops.
- Director’s Desk routes attention.
- Review Desk uses decision packets.
- Audience Response drives career evolution.
- Visual design is preserved.

---

## Issue 1 — Add UX refactor docs and guardrails

### Scope

- Add `docs/ux-refactor/` docs.
- Add product model, copy map, screen contracts, and QA checklist.
- No runtime code changes.

### Acceptance criteria

- Docs define agency director user model.
- Docs define progressive disclosure rules.
- Docs define Studio Ops containment.

---

## Issue 2 — Phase 1: Agency-facing navigation and copy

### Scope

- Rename nav labels/details.
- Update shell branding.
- Demote Runs into Studio Ops / Production Logs.
- Preserve routes.

### Acceptance criteria

- No primary nav item says Runs.
- Machine-facing labels are removed from default nav.
- Typecheck/build pass.

---

## Issue 3 — Phase 2: Director’s Desk

### Scope

- Refactor home screen into executive decision desk.
- Add Today’s Decisions, Star Watch, Bookings, Audience Signals.
- Collapse Studio Ops health.

### Acceptance criteria

- One primary CTA.
- No raw run IDs by default.
- Director sees what needs attention.

---

## Issue 4 — Phase 3A: Roster career lanes

### Scope

- Add agency-facing talent stages.
- Group roster by star/core/rising/development/new face/at risk.
- Show next recommended move when possible.

### Acceptance criteria

- Roster helps allocate attention.
- Technical run data is not prominent.

---

## Issue 5 — Phase 3B: Talent Profile dossier

### Scope

- Add Comp Card.
- Add Career Summary.
- Add Next Move.
- Add Audience Summary.
- Collapse Identity Bible details.
- Move recent runs to Career Timeline / Production Logs.

### Acceptance criteria

- Profile starts as a talent dossier, not an editor wall.

---

## Issue 6 — Phase 4: Scouting / New Face Intake

### Scope

- Refactor character creation into guided scouting flow.
- Add New Face Dossier after birth.
- Link to Production Log as secondary.

### Acceptance criteria

- Birth feels like talent intake.
- User approves/rejects New Face.

---

## Issue 7 — Phase 5: Booking Desk

### Scope

- Refactor Prompt Studio language/layout.
- Activity Candidate → Booking Idea.
- Content Brief → Shoot Brief.
- Prompt Recipe → Creative Treatment.
- Add audience hypothesis.

### Acceptance criteria

- User plans talent work, not prompts.
- Full prompt is collapsed.

---

## Issue 8 — Phase 6: Review Desk decision packets

### Scope

- Transform asset/draft/proposal review into decision packets.
- Add recommendation/reason/risk/consequence pattern.
- Collapse technical audit.

### Acceptance criteria

- Director can approve/revise/reject without reading machine data.

---

## Issue 9 — Phase 7A: Audience Response debriefs

### Scope

- Refactor feedback/insights into Audience Response.
- Interpret metrics into what worked/failed.
- Surface top comments and next test.

### Acceptance criteria

- Feedback is a debrief, not a raw form.

---

## Issue 10 — Phase 7B: Strategy / Star Board

### Scope

- Add Star Board.
- Group talent by priority/stage.
- Add transparent derived signals.

### Acceptance criteria

- Winners/losers are visible.
- No fake precision.

---

## Issue 11 — Phase 8: Studio Ops containment

### Scope

- Consolidate Runs, providers, scheduler, routing, workflow engines, and debug into Studio Ops.
- Rename Runs as Production Logs.
- Preserve all audit access.

### Acceptance criteria

- Machine details remain accessible.
- Normal agency work does not require Studio Ops.

---

## Issue 12 — UX regression pass

### Scope

- Search for remaining machine-facing terms outside Studio Ops.
- Fix/collapse/move them.
- Run full QA checklist.

### Acceptance criteria

- All primary screens pass 10-second usability test.



---

# 20_pr_review_template.md


# 20 — PR Review Template: UX Refactor

Use this template for every VAS UX refactor PR.

## Phase

- Phase:
- Issue:
- Screens touched:
- Files touched:

## Product intent

What agency-facing user problem does this PR solve?

```text
...
```

## Before

What was machine-facing, confusing, overloaded, or illogical?

```text
...
```

## After

What is clearer now?

```text
...
```

## Primary director action

What is the one main action on each changed screen?

```text
...
```

## Machine details moved or collapsed

List any technical details that were moved, renamed, collapsed, or demoted.

- [ ] Run IDs
- [ ] RunEvents
- [ ] Provider jobs
- [ ] Raw JSON
- [ ] Prompt recipes
- [ ] Route tiers
- [ ] Payloads
- [ ] Workflow JSON
- [ ] Advanced IDs

Notes:

```text
...
```

## Studio Ops access

Confirm that technical transparency still exists.

```text
...
```

## Copy changes

List important terminology changes.

```text
...
```

## Empty / loading / error states

- [ ] Empty states guide the director to a next action.
- [ ] Loading states use agency language.
- [ ] Error states explain consequence and link to Studio Ops when needed.

Notes:

```text
...
```

## Visual design preservation

- [ ] No new visual direction.
- [ ] No new color system.
- [ ] No new typography.
- [ ] No generic SaaS restyle.
- [ ] Layout changes preserve current component feel.

Notes:

```text
...
```

## Checks

```bash
npm run typecheck
npm run build
npm run test
npm run verify:design
```

Results:

- typecheck:
- build:
- test:
- verify:design:

## Manual UX QA

For each changed screen:

- [ ] Can a first-time director understand the screen in 10 seconds?
- [ ] Is the primary action obvious?
- [ ] Is machine data hidden/collapsed unless needed?
- [ ] Does the screen use agency language?
- [ ] Does the screen make the next step clear?

## Remaining UX debt

```text
...
```



---

# README.md


# VAS UX Refactor Handoff Package

This package is a Codex-ready implementation handoff for refactoring **Virtual Agency Studio** from a machine-facing automation interface into a human-facing virtual talent agency operating desk.

The goal is **not** to redesign the visual style. Preserve the current color, typography, spacing, card language, and navigation styling. The refactor is about information architecture, workflow clarity, product language, progressive disclosure, and director-facing decision support.

## Product reframing

Current implied experience:

> The user supervises observable automation runs.

Target experience:

> The user is the head of a virtual talent agency. He scouts, develops, books, reviews, publishes, and evolves synthetic talent based on public response.

The backend may still use `Run`, `RunEvent`, provider jobs, prompt recipes, assets, drafts, and feedback records. The primary UI should instead expose agency concepts:

- Talent
- Roster
- New Faces
- Development
- Bookings
- Portfolio
- Review Desk
- Publishing / Placements
- Audience Response
- Career Strategy
- Studio Ops

## How to use this package with Codex

Recommended workflow:

1. Copy this folder into the repo under `docs/ux-refactor/`.
2. Ask Codex to read `README.md`, `01_product_north_star.md`, `04_progressive_disclosure_rules.md`, and `07_implementation_phases.md` before coding.
3. Start with Phase 0 documentation inside the repo.
4. Implement one phase per branch/PR.
5. After each phase, require Codex to run the relevant checks and fill out `17_qa_acceptance_checklist.md`.

## File map

| File | Purpose |
|---|---|
| `00_repo_context_snapshot.md` | Current repo observations that shaped this handoff |
| `01_product_north_star.md` | Product vision, user model, and agency mental model |
| `02_information_architecture.md` | Target navigation and hierarchy |
| `03_language_copy_map.md` | Machine-facing to agency-facing terminology map |
| `04_progressive_disclosure_rules.md` | Rules for hiding machine data and surfacing decisions |
| `05_screen_contracts.md` | Screen-by-screen UX contracts |
| `06_data_read_models.md` | Agency-facing read models to layer over existing backend primitives |
| `07_implementation_phases.md` | Phased implementation plan |
| `08_phase_1_navigation_language.md` | Detailed Phase 1 handoff |
| `09_phase_2_directors_desk.md` | Detailed Phase 2 handoff |
| `10_phase_3_roster_talent_profile.md` | Detailed Phase 3 handoff |
| `11_phase_4_scouting_birth.md` | Detailed Phase 4 handoff |
| `12_phase_5_bookings_production.md` | Detailed Phase 5 handoff |
| `13_phase_6_review_desk.md` | Detailed Phase 6 handoff |
| `14_phase_7_audience_strategy.md` | Detailed Phase 7 handoff |
| `15_phase_8_studio_ops.md` | Detailed Phase 8 handoff |
| `16_codex_prompt_pack.md` | Copy-paste prompts for Codex sessions |
| `17_qa_acceptance_checklist.md` | UX QA checklist and regression guardrails |
| `18_non_goals_and_risks.md` | What not to do, major risks, and containment rules |
| `19_issue_templates.md` | Suggested GitHub issue breakdown |
| `20_pr_review_template.md` | PR review template focused on UX correctness |

## Core rule

Every primary screen must answer one of these director-facing questions:

1. Who needs my attention?
2. Which talent should I invest in?
3. What is this talent doing next?
4. What is ready for review?
5. What is going public?
6. What did the audience tell us?
7. What career direction should I approve?

If a screen primarily answers “what did the machine do?”, it belongs in **Studio Ops**, not the main agency workflow.
