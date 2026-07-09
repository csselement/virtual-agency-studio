# 02 — Information Architecture

## Current issue

The current app exposes implementation primitives too prominently:

- Runs
- RunEvents
- provider jobs
- prompt recipes
- raw payloads
- route tiers
- system health
- scheduler details

These should remain accessible, but they should not be the primary navigation model.

## Target primary navigation

Recommended MVP nav:

```text
Director’s Desk
Roster
Scouting
Development
Bookings
Review Desk
Publishing
Audience
Strategy
Studio Ops
```

If the app needs fewer nav items at first:

```text
Desk
Roster
Scout
Book
Review
Publish
Audience
Ops
```

## Navigation mapping

| Current | Target | Notes |
|---|---|---|
| Command | Director’s Desk | Executive attention router |
| Create | Scouting | New talent and new work starts here |
| Characters | Roster | Main talent management surface |
| Prompt Studio | Bookings | Planning shoots/content assignments |
| Assets / Library | Portfolio | Approved work, candidate shots, references |
| Drafts / Review | Review Desk | Director approval workflow |
| Calendar / Queue | Publishing | Social release queue and live placements |
| Feedback / Insights | Audience | Response, learning, signal interpretation |
| Runs | Studio Ops → Production Logs | Demote from primary nav |
| Settings / System | Studio Ops | Providers, scheduler, routing, debug |

## Primary hierarchy

The first-level product should answer director questions:

```text
Desk: What needs my attention?
Roster: Who do I represent?
Scouting: Who should I create or test next?
Development: Who needs shaping?
Bookings: What work is each talent doing?
Review: What needs approval?
Publishing: What is going public?
Audience: What did the public say?
Strategy: Who gets resources?
Ops: What did the machine do?
```

## Studio Ops containment

`Runs`, provider jobs, raw JSON, event payloads, route tiers, workflow JSON, scheduler settings, and advanced IDs should live under:

```text
Studio Ops
  Production Logs
  Providers
  Scheduler
  Routing
  Workflow Engines
  Data / Exports
  Debug
```

## Route strategy

Avoid breaking routes in early phases.

Recommended approach:

- Keep existing routes functional.
- Add agency-facing route labels.
- Alias old routes to new surfaces where helpful.
- Demote `/runs` but keep it accessible from Studio Ops.
- Keep `/runs/:id` accessible as Production Log detail.
- Avoid backend renames until UI language stabilizes.

## Suggested route aliases

| Existing route | Suggested agency alias |
|---|---|
| `/` | `/desk` optional alias later |
| `/characters` | `/roster` optional alias later |
| `/characters/:id` | `/talent/:id` optional alias later |
| `/prompt-studio` | `/bookings` optional alias later |
| `/assets` | `/portfolio` optional alias later |
| `/drafts` | `/review` already used |
| `/calendar` | `/publishing` optional alias later |
| `/feedback` | `/audience` optional alias later |
| `/runs` | `/ops/production-logs` optional alias later |
| `/settings` | `/ops` optional alias later |

Early PRs should focus on labels and hierarchy, not route migrations.

## Page structure rule

Every primary page should have:

1. Page purpose in agency language
2. One primary director action
3. A short “why this matters” section or contextual signal
4. The fewest visible decision areas required
5. Advanced technical detail hidden by default

## Do not expose in primary nav

- Runs
- Prompt Recipes
- Provider Jobs
- RunEvents
- Raw JSON
- Workflow JSON
- Scheduler internals
- Provider route tiers
- Database identifiers
