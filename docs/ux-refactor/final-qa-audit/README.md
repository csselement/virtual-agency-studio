# Final UX QA Hardening Audit

Date: 2026-07-08

Scope: final rendered-state QA pass after the phased VAS UX refactor. The audit checks that agency-facing screens read as a director workflow, keep technical detail inside Studio Ops and Production Logs, and avoid obvious responsive layout failures.

## Screenshot Evidence

| # | Route | Screenshot | Result |
|---|---|---|---|
| 1 | `/` | `screenshots/01-desktop-directors-desk.png` | Pass. Director workflow, decisions, and Studio Ops health are separated. |
| 2 | `/talent` | `screenshots/02-desktop-roster.png` | Pass. Talent roster uses agency language and profile-first hierarchy. |
| 3 | `/characters/:id` | `screenshots/03-desktop-talent-profile.png` | Pass. Career state, identity, and feedback are prominent. |
| 4 | `/create` | `screenshots/04-desktop-scouting.png` | Pass. Scouting flow is guided and non-technical. |
| 5 | `/prompt-studio` | `screenshots/05-desktop-booking-desk.png` | Fixed. Assignment grid no longer creates horizontal overflow. |
| 6 | `/library` | `screenshots/06-desktop-portfolio.png` | Fixed. Default portfolio copy uses studio-setup wording, hides provider strings, and sanitizes generated alt text. |
| 7 | `/review` | `screenshots/07-desktop-review-desk.png` | Pass. Review decisions are visible without raw source detail. |
| 8 | `/calendar` | `screenshots/08-desktop-publishing.png` | Pass with content debt. Publishing is readable, but generated package names can still contain UUID-like suffixes. |
| 9 | `/insights` | `screenshots/09-desktop-audience-strategy.png` | Pass. Audience strategy presents agency-facing debriefs and proposals. |
| 10 | `/settings` | `screenshots/10-desktop-studio-ops.png` | Pass. Technical provider, workflow, log, and automation controls are intentionally contained here. |
| 11 | `/runs` | `screenshots/11-desktop-production-log-index.png` | Pass. Technical run detail is inside the Production Log surface. |
| 12 | `/runs/:id` | `screenshots/12-desktop-production-log-detail.png` | Pass. Provider jobs, event payloads, and artifacts are visible only in the technical log. |
| 13 | `/` mobile | `screenshots/13-mobile-directors-desk.png` | Fixed. Mobile nav item width no longer clips labels. |
| 14 | `/settings` mobile | `screenshots/14-mobile-studio-ops.png` | Pass. Mobile Studio Ops has no horizontal body overflow in DOM checks. |

## Fixes Applied

- Fixed Booking Desk desktop overflow by changing the five-column assignment panel from fixed minimum columns to equal flexible tracks.
- Fixed mobile top-navigation label clipping by widening the mobile horizontal nav item width.
- Hardened Portfolio and Director's Desk copy so default agency-facing pages say "production setup" and "studio setup" instead of route/provider-engine language.
- Hardened Portfolio cards and media alt text so provider names, raw asset IDs, and mock-generated alt text do not leak into the default agency-facing or assistive-technology surface.

## Browser Checks

- Captured desktop screenshots for Director's Desk, Roster, Talent Profile, Scouting, Booking Desk, Portfolio, Review Desk, Publishing, Audience Strategy, Studio Ops, Production Log index, and Production Log detail.
- Captured mobile screenshots for Director's Desk and Studio Ops at `390 x 844`.
- Rechecked Booking Desk after the CSS fix: `scrollWidth` matched viewport width and no clipped text nodes were reported.
- Rechecked mobile Director's Desk and Studio Ops after the nav fix: `scrollWidth` matched viewport width and no clipped text nodes were reported.
- Checked visible text for Review Desk, Audience Strategy, and Portfolio against raw technical leak patterns such as default run IDs, prompt recipe IDs, provider jobs, route tiers, raw JSON, workflow JSON, and payload wording. No visible matches were found after the copy hardening pass.
- Refreshed Director's Desk and Portfolio screenshots with local Chrome headless directly into this audit folder after the final copy and alt-text hardening patch.

## Command Verification

- `npm --workspace @virtual-agency/web run test`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run verify:design`
- `git diff --check`
- Local Chrome headless screenshot refresh for `/` and `/library`, written directly to `docs/ux-refactor/final-qa-audit/screenshots`.
- `sips -g pixelWidth -g pixelHeight docs/ux-refactor/final-qa-audit/screenshots/*.png`
- `lsof -nP -iTCP:4317 -sTCP:LISTEN; lsof -nP -iTCP:5173 -sTCP:LISTEN`

## Residual Risks

- Generated publishing package names can still include UUID-like suffixes. This is content/data naming debt rather than a layout blocker.
- Long full-page mobile screenshots from the in-app browser preview can appear cropped in the chat image viewer. DOM layout checks passed for body overflow and clipped text, but a pixel-perfect mobile signoff should use direct browser capture review.
- Two refreshed desktop screenshots are Chrome headless viewport captures (`1286 x 900`) instead of the earlier full-page in-app browser captures so the final visual evidence matches the last hardening patch without writing through a stale external Playwright output root.
- This pass did not claim full WCAG compliance. It focused on rendered layout, language boundaries, visible technical leakage, and route-level workflow clarity.
