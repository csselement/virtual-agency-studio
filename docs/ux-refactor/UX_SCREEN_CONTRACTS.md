# VAS UX Screen Contracts

Every primary screen must have one agency-facing job, one primary action, and a clear next step. Use this file as the implementation contract for future UX phases.

## Global Contract

Each screen must define:

- purpose
- primary director question
- primary action
- secondary actions
- visible-by-default information
- collapsed or hidden technical information
- empty state
- error state
- success state
- Studio Ops escape hatch

Default director-facing screens should use this hierarchy:

```text
Decision -> Reason -> Consequence -> Action
```

They should not make the director infer meaning from:

```text
Provider -> RunEvent -> Payload -> ID -> Raw JSON
```

## Screen Summary

| Screen | Primary question | Primary action | Visible by default | Hidden or collapsed |
|---|---|---|---|---|
| Director's Desk | What needs my attention today? | Review Today's Decisions | Today's Decisions, Star Watch, Today's Bookings, Audience Signals, Publishing Follow-up, collapsed Studio Ops Health | run IDs, event payloads, provider details, scheduler internals, raw system health strip |
| Roster | Who does the agency represent, and where should attention go? | Open Selected Talent or Scout New Talent | roster lanes, talent cards, stage, priority, momentum, best platform, next move | recent run IDs, raw enums, provider activity, prompt lineage |
| Talent Profile | What is this talent's career state and next move? | state-specific: Approve New Face, Book Next Work, Review Career Direction, Open Audience Response, Pause Talent | Comp Card, Career Summary, Next Recommended Move, Agency Priority, Portfolio highlights, Audience summary, Development notes, pending approvals | full Identity Bible, canon entries, raw memory entries, run timeline, provider details, technical IDs |
| Scouting | Is this new identity worth adding to the agency roster? | Approve New Face | guided intake, market opportunity, identity seed, visual direction, voice/interiority, platform fit, New Face Dossier | birth run timeline, prompt assembly, raw artifacts, provider logs |
| Development | Which talent should we push, develop, pause, or retire? | Review Development Plan | development lanes, stage, momentum, identity strength, development risk, next test, recommended investment | raw scoring formula, raw feedback records, technical reflections |
| Bookings | What work is this talent doing next? | Start Production | selected talent, platform, booking idea, shoot brief, creative treatment summary, audience hypothesis, next step | full prompt, prompt recipe ID, provider routing, workflow JSON |
| Portfolio | Which shots belong in this talent's book? | Review Candidate | image grid, talent, portfolio status, identity match summary, platform fit, recommendation | original prompt, provider, raw analysis, suggested prompt fixes unless requested |
| Review Desk | What should I approve, revise, reject, or publish? | Approve, Request Revision, Reject, or Approve Career Update | preview, recommendation, reason, risk, consequence, director actions | raw prompt, provider jobs, event payloads, route details, JSON |
| Publishing | What is going live, and what response needs to be logged? | Mark Live or Log Audience Response | social packages, platform variants, disclosure checklist, live placement status, follow-up needed | export file manifest, local filesystem paths, draft IDs, package metadata JSON |
| Audience Response | What did the public tell us about this talent? | Review Audience Debrief | performance summary, top comments, qualitative themes, what worked, what failed, proposed memory/canon/career updates | raw metric table, raw reflection JSON, source IDs, technical run detail |
| Strategy | Who deserves more agency attention? | Set Agency Priority | Star Talent, Rising Talent, Development Bets, At Risk, Paused, metrics summary, recommended investment | detailed formulas, raw metric history, technical derivations |
| Studio Ops | What did the machine do, and is the studio configured correctly? | tab-specific: Open Production Log, Configure Provider, Test Engine, Save Scheduler, Inspect Audit | production logs, provider status, scheduler status, routing, workflow engines, technical audit | none required; this is the machine-facing area |

## Empty State Standards

Use empty states to direct the next agency action.

```text
No talent in the roster yet.
Scout the first New Face to begin building the agency.
[Scout New Talent]
```

```text
Nothing needs approval.
The Review Desk is clear.
[Open Roster] [Book New Work]
```

```text
No audience response logged.
Publish a placement, then record social performance so VAS can learn what the public responds to.
[Open Publishing]
```

## Studio Ops Escape Hatch

Every director-facing decision that depends on machine output should preserve traceability through one of these affordances:

- Technical Audit
- Open Production Log
- View Production Engine Logs
- Inspect Developer Payload
- Open Studio Ops

The escape hatch should be visible enough for troubleshooting but not visually dominant.
