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
