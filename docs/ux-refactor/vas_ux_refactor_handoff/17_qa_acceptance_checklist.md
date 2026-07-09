# 17 — QA and Acceptance Checklist

Use this after every phase.

## Product model checklist

- [ ] The user is treated as an agency director, not a machine operator.
- [ ] Talent are treated as represented identities, not generic records.
- [ ] The screen uses agency language.
- [ ] The screen has one clear purpose.
- [ ] The screen has one primary action.
- [ ] The next step is obvious.

## Progressive disclosure checklist

- [ ] Raw JSON is hidden by default outside Studio Ops.
- [ ] Provider jobs are hidden by default outside Studio Ops.
- [ ] Run IDs are hidden by default outside Studio Ops.
- [ ] Prompt recipe IDs are hidden by default outside Studio Ops.
- [ ] Route tiers are hidden by default outside Studio Ops.
- [ ] Event payloads are hidden by default outside Studio Ops.
- [ ] Full prompts are collapsed unless the user is editing a Creative Treatment.
- [ ] Technical audit remains accessible.

## Navigation checklist

- [ ] Primary nav feels like an agency workflow.
- [ ] Runs is not a top-level primary user concept.
- [ ] Studio Ops is clearly available.
- [ ] Roster is easy to find.
- [ ] Review Desk is easy to find.
- [ ] Audience Response is easy to find.
- [ ] Publishing is clear.

## Director’s Desk checklist

- [ ] Shows Today’s Decisions.
- [ ] Shows who/what needs attention.
- [ ] Shows a primary CTA.
- [ ] Shows Star Watch or equivalent.
- [ ] Shows Publishing follow-up.
- [ ] Shows Audience Signals when available.
- [ ] System health is subordinate/collapsed.

## Roster checklist

- [ ] Talent cards show stage or derived stage.
- [ ] Talent cards show next recommended move or current gap.
- [ ] Roster supports attention allocation.
- [ ] New Faces and Star/Working talent are distinguishable.
- [ ] No technical run data dominates cards.

## Talent Profile checklist

- [ ] Starts with Comp Card / career summary.
- [ ] Shows agency stage.
- [ ] Shows agency priority or next move.
- [ ] Shows audience summary if available.
- [ ] Shows pending career direction approvals.
- [ ] Identity Bible is available but not dominant.
- [ ] Production logs are secondary.

## Scouting checklist

- [ ] Creation feels like New Face Intake.
- [ ] User can articulate market opportunity.
- [ ] User can define identity seed.
- [ ] User can define look/voice/platform fit.
- [ ] Birth result appears as New Face Dossier.
- [ ] Birth run remains accessible as Production Log.

## Bookings checklist

- [ ] Prompt Studio language is replaced with Booking Desk language.
- [ ] Activity Candidate appears as Booking Idea.
- [ ] Content Brief appears as Shoot Brief.
- [ ] Prompt Recipe appears as Creative Treatment.
- [ ] Start Production is the primary action.
- [ ] Full prompt is collapsed.

## Review Desk checklist

- [ ] Review item has a clear recommendation.
- [ ] Review item explains why.
- [ ] Review item identifies risk.
- [ ] Review item explains consequence.
- [ ] Approve/revise/reject actions are clear.
- [ ] Technical details are collapsed.

## Audience checklist

- [ ] Feedback becomes Audience Response.
- [ ] Metrics are interpreted as audience signal.
- [ ] Top comments and qualitative notes are visible.
- [ ] What worked/failed is clear.
- [ ] Career/identity proposals are director-approved.
- [ ] Raw metrics can be expanded.

## Strategy checklist

- [ ] Winners and losers are visible.
- [ ] Star Talent is distinguishable.
- [ ] Rising Talent is distinguishable.
- [ ] Development Bets are distinguishable.
- [ ] At Risk/Paused talent are visible.
- [ ] Agency Priority can be set or derived.

## Studio Ops checklist

- [ ] Runs are available as Production Logs.
- [ ] Provider configuration is available.
- [ ] Scheduler is available.
- [ ] Routing/workflow engine controls are available.
- [ ] Debug/audit data is available.
- [ ] Studio Ops does not bleed into director-facing screens.

## Build checks

Run after each phase where code changes:

```bash
npm run typecheck
npm run build
```

Run when behavior or backend changes:

```bash
npm run test
```

Run when visual/system changes may affect styling:

```bash
npm run verify:design
```

## Manual 10-second usability test

For each primary screen, ask:

1. Can a first-time director tell what this screen is for in 10 seconds?
2. Is the primary action obvious?
3. Is the screen about talent/career/work, not machine internals?
4. Are technical details available but not in the way?
5. Does the empty state tell the director what to do next?

If any answer is no, the phase is not done.
