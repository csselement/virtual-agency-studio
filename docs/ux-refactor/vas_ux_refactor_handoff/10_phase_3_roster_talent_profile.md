# 10 — Phase 3: Roster and Talent Profile

## Goal

Make represented talent the central product entity.

## Primary questions

Roster:

> Who does this agency represent, and where should attention go?

Talent Profile:

> What is this talent’s career state and next move?

## Roster target

The Roster should feel like a talent board.

### Roster lanes

Add or simulate lanes:

```text
Star Talent
Core Talent
Rising Talent
Development
New Faces
At Risk
Paused / Retired
```

If backend stages are not yet available, derive provisional lanes:

- no birth run / minimal setup → New Face
- pending identity proposals → Development
- published events / feedback exists → Working Talent
- strong positive operator judgment → Rising/Core
- negative operator judgment or rejected outputs → At Risk
- archived/paused status → Paused

Avoid pretending exact scoring exists.

### Talent card

A card should show:

```text
Portrait or initials
Name
Stage
Short positioning
Best platform
Momentum / latest audience signal
Next recommended move
```

Avoid default display of:

- run IDs
- raw status enum
- latest technical run name
- prompt recipe data
- provider data

## Talent Profile target

### Top profile layout

```text
Talent Profile

[Portrait / approved reference]
Name
Stage
Agency Priority
Best Platform
Momentum
Identity Stability
Next Recommended Move

Primary CTA:
[Book Next Work] or [Review Career Direction]
```

### Profile sections

1. Comp Card
2. Career Summary
3. Next Move
4. Portfolio Highlights
5. Audience Response
6. Development Notes
7. Director Approvals
8. Identity Bible
9. Career Timeline
10. Production Logs link

## Existing data to use

Current `CharacterDetail` includes:

- constitutions
- canon
- memory
- appearanceProfiles
- voiceGuides
- platformPersonas
- referenceImages
- recentRuns
- feedback
- reflections
- identityProposals

This is enough to reframe the profile without major backend work.

## Identity Bible containment

Keep these available but not dominant:

- Constitution
- Canon
- Memory
- Appearance Bible
- Voice Guide
- Platform Personas
- Reference Images

Recommended UI:

```text
Identity Bible
[summary visible]
[full sections inside tabs/details]
```

## Director Approvals

Surface pending proposals as real decisions:

```text
Career Direction Proposal
Type: Audience-learned memory
Recommendation: Add “morning ritual” as a recurring identity signal.
Risk: Low
[Approve] [Reject]
```

## Career Timeline

Translate recent runs and events into agency terms:

| Machine event | Career event |
|---|---|
| character_birth | Born as New Face |
| daily_activity | Booked daily work |
| image_generation | Production created candidate shots |
| image_analysis | Portfolio quality review completed |
| draft_packaging | Social package prepared |
| feedback_reflection | Audience debrief completed |
| canon_evolution | Career story updated |

## Acceptance criteria

- Roster is about talent and career stages.
- Talent Profile starts with identity/career meaning, not editor controls.
- Editing remains available but no longer dominates first view.
- Machine timeline is linked as Production Log.
- Pending identity changes are director-facing Career Direction Proposals.
- Typecheck/build pass.

## Codex implementation prompt

```text
Implement Phase 3 from docs/ux-refactor/10_phase_3_roster_talent_profile.md.

Preserve visual design.
Do not change backend schema unless absolutely necessary.
Use existing CharacterDetail data to create agency-facing Roster and Talent Profile summaries.
Move technical/recent run details into a Career Timeline or Production Logs link.
Collapse detailed Constitution/Canon/Memory editors under Identity Bible.
Surface pending identity proposals as Career Direction Proposals.

After implementation:
1. Run npm run typecheck.
2. Run npm run build.
3. Provide UX diff.
4. Identify any backend read model gaps.
```
