# VAS Workflow Refactor Research Brief

Date: 2026-07-06

## Method

Primary evidence is internal VAS material: `PRODUCT.md`, `DEMO_SCRIPT.md`, `docs/ui-design-system.md`, the previous UX audit, and the live route screenshots captured in this folder. Public sources are comparator patterns only, not direct evidence about VAS users.

Comparator sources:

- Nielsen Norman Group: user journeys and flows are goal-centered UX maps used to understand and optimize experiences. https://www.nngroup.com/articles/user-journeys-vs-user-flows/
- Nielsen Norman Group: complex apps and workflows benefit from patterns that support repetitive work. https://www.nngroup.com/videos/complex-apps-workflows/
- Ybug: content approval workflows replace scattered feedback with predictable paths from draft to done. https://ybug.io/blog/content-approval-workflow
- IntelligenceBank: creative approval commonly moves through creation/submission, review, feedback, revisions, approval, and documentation. https://intelligencebank.com/guides/creative-workflow-approval-software-the-definitive-guide/
- SocialBee: social media approval breaks down when feedback, approvals, and scheduling are scattered across tools. https://socialbee.com/blog/social-media-approval/

## Ranked Friction

1. Workflow labels are inconsistent across navigation, flow strip, and page headers.
   - Evidence type: internal rendered evidence.
   - Product move: define one stage model and reuse it everywhere.
   - Confidence: high.

2. `/feedback` is missing even though the demo script and product purpose require feedback-driven reflection.
   - Evidence type: internal route behavior.
   - Product move: add a dedicated Feedback stage for published-event response logging and reflection runs.
   - Confidence: high.

3. Heartbeat does not consume the same workflow summary as downstream pages.
   - Evidence type: internal rendered evidence.
   - Product move: add `/api/workflow/summary` and make Heartbeat/StageHandoff use it.
   - Confidence: high.

4. State continuity is lost when moving between stages.
   - Evidence type: internal behavior plus comparator pattern.
   - Product move: URL-backed filters and selected IDs for character, assets, drafts, publishing bucket, and feedback event.
   - Confidence: high.

5. Review gates are distributed across Runs, Drafts, Assets, and Character identity proposals.
   - Evidence type: internal data model and rendered pages.
   - Product move: keep Drafts as the primary Review Desk surface, but add a unified review overview and workflow summary count.
   - Confidence: medium-high.

6. Feedback should feed identity evolution, not just analytics.
   - Evidence type: internal product purpose and demo script; comparator pattern from creative workflows.
   - Product move: Feedback page should log social response, launch reflection, and link back to the character profile for proposal review.
   - Confidence: high.

## Implementation Direction

Proceed with a narrow refactor that preserves endpoints and mutation behavior. No database migration is needed because the existing repositories already expose characters, assets, drafts, publishing events, feedback, runs, and identity proposals. Add a shared frontend workflow model, a compact StageHandoff component, a new `/feedback` route, and one aggregate API endpoint that keeps workflow status consistent across the shell and pages.
