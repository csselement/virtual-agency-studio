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
