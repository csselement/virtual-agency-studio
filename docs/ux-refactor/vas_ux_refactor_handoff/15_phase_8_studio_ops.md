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
