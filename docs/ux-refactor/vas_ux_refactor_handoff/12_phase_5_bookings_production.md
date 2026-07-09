# 12 — Phase 5: Bookings and Production

## Goal

Refactor Prompt Studio into a Booking Desk that plans creative assignments for talent.

## Primary question

> What work is this talent doing next?

## Current machine chain

```text
Activity Candidate → Content Brief → Prompt Recipe → Image Generation
```

## Target agency chain

```text
Booking Idea → Shoot Brief → Creative Treatment → Production
```

## Target screen

```text
Booking Desk

Talent: Ava Monroe
Platform: Instagram
Career goal: deepen morning ritual identity
Audience hypothesis: saves/comments improve when posts show process

Booking Ideas
- Café morning ritual
- Studio reset
- Streetwear errand

Shoot Brief
- goal
- visual direction
- caption angle
- disclosure needs

Creative Treatment
- summary visible
- full prompt collapsed

Primary CTA:
[Start Production]
```

## Copy replacements

| Current | Target |
|---|---|
| Generate activities | Propose Booking Ideas |
| Activity candidates | Booking Ideas |
| Select activity | Choose Booking |
| Create brief | Create Shoot Brief |
| Content brief | Shoot Brief |
| Compose recipe | Prepare Creative Treatment |
| Prompt recipe | Creative Treatment |
| Generate image | Start Production |
| Final prompt | Treatment source |
| Prompt lineage | Technical treatment audit |

## Visible by default

- selected talent
- stage / current career direction
- platform
- booking idea
- shoot brief summary
- audience hypothesis
- production CTA

## Collapsed

- full prompt
- negative prompt
- recipe ID
- generation settings
- provider/routing
- raw lineage

## Audience hypothesis

Add a simple field or derived copy:

```text
Audience hypothesis:
This booking tests whether Ava’s audience responds to quiet ritual/process content.
```

This is crucial because later Audience Response should evaluate whether the hypothesis worked.

## Data posture

Use existing:

- activity candidates
- content briefs
- prompt recipes
- generation endpoints

If adding fields is too much for the first pass, store audience hypothesis in existing brief goal/body copy or derive it from the content pillar and visual direction.

## Acceptance criteria

- The user never has to think “prompt recipe” by default.
- The page reads as planning work for represented talent.
- The production start action is clear.
- Full technical prompt remains accessible.
- Typecheck/build pass.

## Codex implementation prompt

```text
Implement Phase 5 from docs/ux-refactor/12_phase_5_bookings_production.md.

Refactor Prompt Studio into Booking Desk.
Preserve existing endpoint behavior.
Rename Activity Candidate / Content Brief / Prompt Recipe concepts in the UI to Booking Idea / Shoot Brief / Creative Treatment.
Show full prompt and recipe lineage only in collapsed technical detail.
Add or derive an Audience Hypothesis for each booking.
Make Start Production the primary CTA once a creative treatment is ready.

After implementation:
1. Run npm run typecheck.
2. Run npm run build.
3. Provide UX diff.
4. List remaining machine-facing labels in this flow.
```
