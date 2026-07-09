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
