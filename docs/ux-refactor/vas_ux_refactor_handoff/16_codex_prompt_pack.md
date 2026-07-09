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
