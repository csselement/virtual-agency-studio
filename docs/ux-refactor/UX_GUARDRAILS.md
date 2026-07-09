# VAS UX Guardrails

These rules govern the VAS UX refactor. They are project-specific and override generic dashboard instincts.

## Phase Discipline

- Work through `docs/ux-refactor/vas_ux_refactor_handoff/07_implementation_phases.md` in order.
- Complete one phase at a time.
- Stop after each phase and notify the operator before continuing.
- Preserve existing routes until an explicit route migration phase.
- Preserve backend behavior unless the current phase explicitly requires backend work.
- Document known UX debt after each phase.

## Non-Goals

This refactor is not:

- a visual redesign
- a component library migration
- a backend rewrite
- a route-breaking rename migration
- a removal of `Run` or `RunEvent`
- a removal of provider debugging
- an attempt to hide all technical transparency
- a generic SaaS dashboard facelift
- an onboarding-modal bandage

## Preserve

- existing visual identity, color, typography, spacing, and card language
- local-first architecture
- mock provider mode
- provider configuration and tests
- manual publishing model
- social feedback capture
- reflection and career direction proposal workflow
- review gates
- human approval for Constitution changes
- human approval for Canon changes
- observable run/event architecture
- `RunService` / `RunQueue` as the mutation path for automated run state

## Progressive Disclosure

Default director-facing screens should show:

```text
Decision -> Reason -> Consequence -> Action
```

Default director-facing screens should not show:

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

Machine details may appear when:

- the user opens Studio Ops
- the user expands Technical Audit
- an error requires troubleshooting
- a decision needs traceability
- provider setup is being configured
- developer/debug mode is active

## Decision Packet Rule

Any machine-generated output that reaches the director must be transformed into:

```text
What is this?
Recommendation
Why
Risk
Consequence
Director action
Technical audit, collapsed
```

## Maximum Visible Complexity

On default director-facing screens:

- one primary action
- no more than three major decision zones
- no raw tables above the fold unless the screen is a true list/index
- no more than one technical status indicator outside Studio Ops
- no more than one collapsed technical drawer per decision item

## Studio Ops Containment

Studio Ops owns:

- Production Logs
- provider configuration
- scheduler controls
- routing
- workflow engines
- local data / exports
- debug payloads
- technical IDs

Runs must remain accessible as Production Logs, but Runs should not remain a primary top-level user concept after Phase 1.

## Copy Guardrails

Avoid:

- AI agent
- machine
- automation
- workflow output
- payload
- run completed
- provider route
- prompt recipe

Prefer:

- studio
- production
- booking
- portfolio
- director approval
- audience response
- career direction
- identity bible

## Data Honesty

Do not invent precision or intelligence that the data does not support.

Avoid:

```text
Star score: 94.2
```

Prefer:

```text
Audience signal: promising.
Reason: one published post has positive operator judgment and follows gained.
```

## Phase QA

After each phase, report:

```text
Before:
- What was machine-facing or confusing?

After:
- What is now agency-facing?
- What was hidden/collapsed?
- What is the primary director action?
- What remains as UX debt?
```

Run the checks that apply:

```bash
npm run typecheck
npm run build
```

Run behavior tests when behavior or backend changes:

```bash
npm run test
```

Run design verification when styling or design-system-sensitive components change:

```bash
npm run verify:design
```
