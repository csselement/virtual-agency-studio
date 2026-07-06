# Virtual Agency Studio UX Audit And Corrections

Date: 2026-07-01

Target: local web app at `http://127.0.0.1:5173/`

Product frame: Virtual Agency Studio is a character development studio for agentic social media. The core user goal is to understand the current state of character automation, move through identity and creative workflows, review machine output, and keep human-approved identity changes visible.

## Evidence Captured

- `01-baseline-dashboard-desktop.png`: baseline Agency Heartbeat at 1280 x 720.
- `02-baseline-dashboard-mobile.png`: baseline Agency Heartbeat at 390 x 844.
- `03-corrected-dashboard-desktop.png`: corrected Agency Heartbeat at 1280 x 720.
- `04-corrected-dashboard-mobile.png`: corrected Agency Heartbeat at 390 x 844.

## Audit Findings

1. Navigation used buttons where links were the expected web primitive.
   - Baseline DOM had `0` anchors and all primary navigation items were buttons.
   - Impact: users could not copy links, open routes in a new tab, or get native browser link semantics. Assistive technology also lacked `aria-current` state for the active route.
   - Correction: converted sidebar navigation and the brand home control to internal anchors with `href`, SPA interception, modifier-key passthrough, and `aria-current="page"`.

2. The dashboard led with machine telemetry before explaining the studio workflow.
   - Baseline first screen showed status cards but did not state that the product is a character development studio for agentic social media.
   - Impact: a first-time operator could see that runs exist, but not how identity, creative work, review, publishing, and feedback connect.
   - Correction: added a concise product-positioning eyebrow and rewrote the dashboard summary around character identity work, creative automation, review gates, and publishing feedback.

3. The key workflow path was implicit instead of visible.
   - Baseline dashboard had status and recent runs, but no compact path from character identity to prompt work, asset review, draft review, and feedback.
   - Impact: users must infer the sequence from sidebar labels and prior product knowledge.
   - Correction: added a four-step workflow strip: Identity, Creative loop, Review, Feedback. Each step links to the relevant workspace.

4. Keyboard users had no quick bypass from navigation into the workspace.
   - Baseline sidebar navigation appears before the main content on every route.
   - Impact: keyboard users must tab through the full navigation repeatedly.
   - Correction: added a focus-visible skip link to `#workspace`.

5. Mobile orientation was readable but still dense.
   - Baseline mobile used a two-column nav grid, then API state, heading, CTA, and stacked telemetry cards.
   - Impact: the primary content is usable, but the dashboard remains operationally dense on small screens.
   - Correction made: improved copy and semantics without adding a heavier mobile-specific shell. Remaining risk: a future pass should consider a compact mobile navigation drawer or sticky section switcher if the route count grows.

## Verification

Commands:

```bash
npm run build:packages
npm --workspace @virtual-agency/web run typecheck
npm --workspace @virtual-agency/web run test
```

Browser checks:

- Loaded `http://127.0.0.1:5173/`.
- Confirmed title: `Virtual Agency Studio`.
- Confirmed dashboard heading: `Agency Heartbeat`.
- Confirmed corrected navigation exposes 10 anchors, including 8 route links, brand home, and skip link.
- Confirmed active dashboard nav item has `aria-current="page"`.
- Clicked the real `/runs` nav link and verified the rendered `Runs` route.
- Captured corrected desktop and mobile screenshots.
- Confirmed mobile viewport `390 x 844` has no horizontal overflow.
- Confirmed no browser console warnings or errors during verification.

## Remaining Recommendations

1. Make the status cards actionable.
   - `Review Gates`, `Failed Runs`, `Running Automation`, and `Active Characters` should link directly to filtered views.
   - Suggested implementation: replace static status cards with semantic buttons or anchors, and preserve a plain card style.

2. Add URL-backed filters.
   - Runs, Assets, Drafts, and Calendar filters are useful but not shareable.
   - Suggested implementation: sync filter state to query params, read params on load, and preserve state when navigating back.

3. Improve confirmation patterns for irreversible human-review decisions.
   - Draft rejection, canon rejection, and identity proposal approval/rejection are high-impact actions.
   - Suggested implementation: add lightweight confirmation dialogs that show the exact entity and decision before mutating state.

4. Create a focused review queue route.
   - Review gates are central to the product promise, but they currently surface as counts and mixed run lists.
   - Suggested implementation: add `/review` or a filtered `/runs?status=needs_review` route with grouped required actions.

5. Add empty-state guidance per workflow stage.
   - Empty states exist, but several are generic.
   - Suggested implementation: tailor each empty state to the next operator action, especially for new characters, prompt recipes, approved assets, and drafts.

