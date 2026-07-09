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
