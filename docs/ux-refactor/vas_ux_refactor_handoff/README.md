# VAS UX Refactor Handoff Package

This package is a Codex-ready implementation handoff for refactoring **Virtual Agency Studio** from a machine-facing automation interface into a human-facing virtual talent agency operating desk.

The goal is **not** to redesign the visual style. Preserve the current color, typography, spacing, card language, and navigation styling. The refactor is about information architecture, workflow clarity, product language, progressive disclosure, and director-facing decision support.

## Product reframing

Current implied experience:

> The user supervises observable automation runs.

Target experience:

> The user is the head of a virtual talent agency. He scouts, develops, books, reviews, publishes, and evolves synthetic talent based on public response.

The backend may still use `Run`, `RunEvent`, provider jobs, prompt recipes, assets, drafts, and feedback records. The primary UI should instead expose agency concepts:

- Talent
- Roster
- New Faces
- Development
- Bookings
- Portfolio
- Review Desk
- Publishing / Placements
- Audience Response
- Career Strategy
- Studio Ops

## How to use this package with Codex

Recommended workflow:

1. Copy this folder into the repo under `docs/ux-refactor/`.
2. Ask Codex to read `README.md`, `01_product_north_star.md`, `04_progressive_disclosure_rules.md`, and `07_implementation_phases.md` before coding.
3. Start with Phase 0 documentation inside the repo.
4. Implement one phase per branch/PR.
5. After each phase, require Codex to run the relevant checks and fill out `17_qa_acceptance_checklist.md`.

## File map

| File | Purpose |
|---|---|
| `00_repo_context_snapshot.md` | Current repo observations that shaped this handoff |
| `01_product_north_star.md` | Product vision, user model, and agency mental model |
| `02_information_architecture.md` | Target navigation and hierarchy |
| `03_language_copy_map.md` | Machine-facing to agency-facing terminology map |
| `04_progressive_disclosure_rules.md` | Rules for hiding machine data and surfacing decisions |
| `05_screen_contracts.md` | Screen-by-screen UX contracts |
| `06_data_read_models.md` | Agency-facing read models to layer over existing backend primitives |
| `07_implementation_phases.md` | Phased implementation plan |
| `08_phase_1_navigation_language.md` | Detailed Phase 1 handoff |
| `09_phase_2_directors_desk.md` | Detailed Phase 2 handoff |
| `10_phase_3_roster_talent_profile.md` | Detailed Phase 3 handoff |
| `11_phase_4_scouting_birth.md` | Detailed Phase 4 handoff |
| `12_phase_5_bookings_production.md` | Detailed Phase 5 handoff |
| `13_phase_6_review_desk.md` | Detailed Phase 6 handoff |
| `14_phase_7_audience_strategy.md` | Detailed Phase 7 handoff |
| `15_phase_8_studio_ops.md` | Detailed Phase 8 handoff |
| `16_codex_prompt_pack.md` | Copy-paste prompts for Codex sessions |
| `17_qa_acceptance_checklist.md` | UX QA checklist and regression guardrails |
| `18_non_goals_and_risks.md` | What not to do, major risks, and containment rules |
| `19_issue_templates.md` | Suggested GitHub issue breakdown |
| `20_pr_review_template.md` | PR review template focused on UX correctness |

## Core rule

Every primary screen must answer one of these director-facing questions:

1. Who needs my attention?
2. Which talent should I invest in?
3. What is this talent doing next?
4. What is ready for review?
5. What is going public?
6. What did the audience tell us?
7. What career direction should I approve?

If a screen primarily answers “what did the machine do?”, it belongs in **Studio Ops**, not the main agency workflow.
