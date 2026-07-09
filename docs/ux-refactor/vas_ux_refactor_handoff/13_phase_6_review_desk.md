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
