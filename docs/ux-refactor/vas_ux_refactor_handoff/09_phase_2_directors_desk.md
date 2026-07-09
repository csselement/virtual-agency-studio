# 09 — Phase 2: Director’s Desk

## Goal

Refactor the home screen from an agency heartbeat / machine state dashboard into the agency director’s daily decision desk.

## Primary user question

> What needs my attention today?

## Primary action

```text
Review Today’s Decisions
```

## Existing foundation

The current dashboard already has:

- Today attention list
- Active Run
- Ready for Review
- Upcoming
- System Health
- primary action selection logic

Keep the useful structure but change the framing and hierarchy.

## Target layout

```text
Director’s Desk

Today’s Decisions
- X talent items need approval
- X social packages ready for publishing
- X audience responses need debrief
- X career direction proposals waiting

Primary CTA:
[Review Today’s Decisions]

Star Watch
- Rising talent
- At-risk talent
- New Face needing development

Today’s Bookings
- Current/next assignments
- Talent + platform + purpose

Audience Signals
- Top public response themes
- Weak signals / declining attention

Publishing Follow-up
- Posts live without feedback
- Packages ready to publish

Studio Ops Health
- collapsed by default
```

## Data mapping

Initial implementation can derive from existing `AppData`:

- `characters`
- `runs`
- `automationStatus`
- `workflowSummary`

Later phases can add a richer `/api/director/desk` endpoint.

## Today’s Decisions sources

Include:

- runs needing review
- drafts needing review
- assets ready for review
- publishing events needing feedback
- identity proposals awaiting approval
- characters needing setup
- failed runs requiring Studio Ops attention

## Star Watch initial approximation

Before adding real scoring, use available data:

- Talent with recent feedback → “Audience signal available”
- Talent with pending proposals → “Career direction waiting”
- Talent with approved/published activity → “Working talent”
- Talent with no birth/development activity → “New Face needs development”
- Failed/weak feedback if available → “At risk”

Do not invent fake performance numbers if data is unavailable.

## Copy examples

### Empty desk

```text
The desk is clear.
No talent, publishing, or audience decisions need attention right now.
```

### Star Watch empty

```text
No stars yet.
Publish work and log audience response to see which talent earns more agency attention.
```

### Studio Ops Health

Collapsed summary:

```text
Studio Ops: healthy
```

Expanded detail:

```text
API online
Providers configured
Scheduler state
Open Studio Ops
```

## What to remove from default home

- “machine state” copy
- raw active run details beyond a plain-language production status
- provider references
- LLM/storage status strip
- system health as a major panel

## Acceptance criteria

- The screen reads as an executive agency desk.
- There is one primary CTA.
- Machine/system details are not prominent.
- The director can identify who/what needs attention.
- Empty states guide the user to Scout, Roster, or Bookings.
- Typecheck/build pass.

## Codex implementation prompt

```text
Implement Phase 2 from docs/ux-refactor/09_phase_2_directors_desk.md.

Preserve visual design and existing app behavior.
Refactor the home screen into Director’s Desk.
Keep machine/system health collapsed or visually subordinate.
Use existing data first; do not add backend migrations unless unavoidable.
Do not expose run IDs, provider jobs, raw payloads, or prompt details by default.

After implementation:
1. Run npm run typecheck.
2. Run npm run build.
3. Provide UX diff.
4. List data gaps that should be solved by future read models.
```
