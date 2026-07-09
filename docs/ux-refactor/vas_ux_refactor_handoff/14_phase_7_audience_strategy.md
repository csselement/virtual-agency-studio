# 14 — Phase 7: Audience Response and Strategy

## Goal

Make public response the engine of talent evolution and agency resource allocation.

## Primary questions

Audience:

> What did the public tell us about this talent?

Strategy:

> Who deserves more agency attention?

## Audience Response

### Input

Use existing feedback fields:

- impressions/views
- reach
- likes
- comments
- shares/reposts
- saves
- profile visits
- follows gained
- qualitative notes
- top comments
- operator judgment

### Output

The UI should interpret feedback as agency signal:

```text
Audience Debrief

Result: Strong
What worked:
- Saves suggest aspirational value.
- Comments mention calmness and ritual.
- Follows gained were above baseline.

What failed:
- Caption did not create much discussion.

Meaning for talent:
Ava’s audience responds to quiet process and morning rituals.

Recommended next test:
Repeat the ritual theme with more conversational captioning.

Career Direction:
Add “morning ritual / interior stillness” to audience-learned memory.

Actions:
[Approve Memory Update] [Add to Canon] [Ignore Signal]
```

## Audience result categories

```text
Strong
Promising
Mixed
Weak
Unknown
```

Do not overfit if data is sparse.

## Strategy / Star Board

### Purpose

Rank and allocate attention across talent.

### Lanes

```text
Star Talent
Core Talent
Rising Talent
Development Bets
At Risk
Paused / Retired
```

### Signals

Use interpretable signals:

- Momentum
- Audience Pull
- Identity Strength
- Platform Fit
- Development Risk
- Agency Priority

### Agency priority values

```text
Push
Develop
Test
Pause
Retire
```

## Initial scoring guidance

Do not create a fake precise score if the data is not mature.

Use simple transparent heuristics first:

- recent positive feedback + follows gained → Rising
- repeated positive feedback → Core/Star
- no feedback yet → Development/New Face
- negative operator judgment → At Risk
- no production/publishing activity → Needs development
- repeated rejection/identity drift → At Risk

## Career evolution

Identity evolution should be review-gated.

Audience feedback may propose:

- memory updates
- canon updates
- voice adjustments
- platform persona adjustments
- career stage changes
- agency priority changes

The director approves or rejects.

## Acceptance criteria

- Audience is not just a metrics form.
- Feedback produces a plain-language debrief.
- Debriefs connect to career direction.
- Star Board makes winners/losers visible.
- Director controls identity evolution.
- Typecheck/build pass.

## Codex implementation prompt

```text
Implement Phase 7 from docs/ux-refactor/14_phase_7_audience_strategy.md.

Refactor Feedback/Insights into Audience Response and Strategy surfaces.
Use existing SocialFeedback, Reflection, and IdentityProposal data.
Show public response as debriefs: result, what worked, what failed, meaning for talent, recommended next test.
Add a Star Board / Strategy view using transparent derived signals.
Do not invent precise analytics if source data is missing.
Keep raw metrics available in collapsed detail.
Director must approve career/identity updates.

After implementation:
1. Run npm run typecheck.
2. Run npm run build.
3. Provide UX diff.
4. List which signals are derived vs. persisted.
```
