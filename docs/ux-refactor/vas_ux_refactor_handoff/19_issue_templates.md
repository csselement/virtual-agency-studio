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
