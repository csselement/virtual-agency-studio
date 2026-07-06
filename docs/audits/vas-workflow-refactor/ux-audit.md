# VAS Workflow Refactor UX Audit

Date: 2026-07-06

Target: live local-network app at `http://orangepi.local:5173/`.

Product frame: Virtual Agency Studio is a local-first operating desk for a single operator managing AI influencer characters through observable, human-approved automation. The core workflow should read as one cycle: Birth, Production, Review, Publishing, Feedback, and Identity Evolution.

## Evidence Captured

Desktop viewport `1447 x 1044`:

- `01-heartbeat-desktop-1447x1044.png`
- `02-characters-desktop-1447x1044.png`
- `03-character-profile-desktop-1447x1044.png`
- `04-assets-desktop-1447x1044.png`
- `05-drafts-desktop-1447x1044.png`
- `06-calendar-desktop-1447x1044.png`
- `07-feedback-gap-desktop-1447x1044.png`
- `08-runs-desktop-1447x1044.png`
- `09-settings-desktop-1447x1044.png`

Mobile viewport `390 x 844`:

- `01-heartbeat-mobile-390x844.png`
- `02-characters-mobile-390x844.png`
- `03-character-profile-mobile-390x844.png`
- `04-assets-mobile-390x844.png`
- `05-drafts-mobile-390x844.png`
- `06-calendar-mobile-390x844.png`
- `07-feedback-gap-mobile-390x844.png`
- `08-runs-mobile-390x844.png`
- `09-settings-mobile-390x844.png`

## Findings

1. The operator cycle is split across labels that do not read in task order.
   - Evidence: sidebar order shows Publishing before Casting and Library; top flow uses Identity, Concept, Produce, Approve, Publish, Learn, while pages use Casting, Library, Review Desk, and Publishing Desk.
   - Risk: the operator has to infer how a character moves from creation to asset management, review, publishing, feedback, and identity evolution.
   - Correction: create one workflow-stage model shared by sidebar, flow strip, Heartbeat dispatch, and stage handoffs.

2. Heartbeat is close to a command center but still acts like telemetry.
   - Evidence: the first viewport has review queue and dispatch cards, followed by metrics, recent timeline, and guardrails.
   - Risk: the most important thing to do next is not derived from the same workflow state used by downstream pages.
   - Correction: make Heartbeat use `/api/workflow/summary` and promote the first blocked or ready workflow action.

3. Feedback is a route gap in the promised cycle.
   - Evidence: `/feedback` renders a Not Found placeholder.
   - Risk: published content cannot visibly feed back into reflection and identity proposals from its own workflow stage.
   - Correction: add `/feedback` as the response logging and reflection-launch page, with handoff back to character identity proposals.

4. Context continuity is weak between stages.
   - Evidence: pages accept useful filters internally, but route URLs do not preserve selected character, asset state, draft state, publishing bucket, or feedback event.
   - Risk: handoffs drop context, browser back/forward is less meaningful, and the operator cannot share or restore the exact archive/review state.
   - Correction: initialize and update query params for Characters, Assets, Drafts, Calendar, and Feedback.

5. Review is too draft-centric for a system with multiple review gates.
   - Evidence: Review Desk focuses on drafts, while runs, asset approvals, and identity proposals are elsewhere.
   - Risk: the user sees counts but not the combined review surface that blocks the workflow.
   - Correction: add a compact review overview that names draft, run, asset, and identity-gate work while keeping draft review primary.

6. The Library filter pass improved density, but it still needs workflow framing.
   - Evidence: filters are now compact and non-sticky, but the page does not explicitly say what blocks Production or what stage comes next.
   - Risk: the archive can feel like a media shelf rather than the production stage that creates reviewable drafts.
   - Correction: add StageHandoff and preserve URL-backed asset filters.

7. Mobile keeps the UI readable but route count is beginning to strain the top rail.
   - Evidence: mobile Heartbeat shows a horizontal rail with clipped later items.
   - Risk: adding Feedback can increase navigation scan cost.
   - Correction: keep nav semantic anchors, but stage ordering must make the first visible items follow the workflow.

## Accessibility Risks

- Stage navigation must use anchors with `href`, modifier-key passthrough, and `aria-current`.
- Review-state actions must expose selected, pending, disabled, and result feedback without relying on color alone.
- Empty states should name the next operator action, not generic absence.
- Mobile verification must check horizontal overflow after adding Feedback and StageHandoff.
