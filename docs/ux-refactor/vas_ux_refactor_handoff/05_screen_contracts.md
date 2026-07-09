# 05 — Screen Contracts

Each primary screen must have one agency-facing job, one primary action, and a clear next step.

## Global screen contract

Every screen should define:

- Screen purpose
- Primary user question
- Primary action
- Secondary actions
- What is visible by default
- What is collapsed
- Empty state
- Error state
- Success state
- Studio Ops escape hatch

## 1. Director’s Desk

### Purpose

Executive attention router for the agency director.

### Primary question

> What needs my attention today?

### Primary action

`Review Today’s Decisions`

### Visible by default

- Today’s Decisions
- Star Watch
- Today’s Bookings
- Audience Signals
- Publishing Follow-up
- collapsed Studio Ops Health

### Collapsed or hidden

- run IDs
- event payloads
- provider details
- scheduler internals
- raw system health strip

### Empty state

```text
The desk is clear.
No talent, bookings, publishing, or audience items need attention right now.
[Scout New Talent] [Open Roster]
```

### Success state

```text
Decision recorded.
The next agency step has been updated.
```

## 2. Roster

### Purpose

Manage represented talent and career stages.

### Primary question

> Who does the agency represent, and where should attention go?

### Primary action

`Open Selected Talent` or `Scout New Talent`

### Visible by default

- Star Board / Roster lanes
- talent cards
- stage
- agency priority
- momentum
- best platform
- next recommended move

### Collapsed or hidden

- recent run IDs
- raw status enum
- provider activity
- prompt recipe lineage

### Empty state

```text
No talent in the roster yet.
Scout the first New Face to begin building the agency.
[Scout New Talent]
```

## 3. Talent Profile

### Purpose

Show who the talent is, how they are developing, and what the director should do next.

### Primary question

> What is this talent’s career state and next move?

### Primary action

Depends on state:

- `Approve New Face`
- `Book Next Work`
- `Review Career Direction`
- `Open Audience Response`
- `Pause Talent`

### Visible by default

- Comp Card
- Career Summary
- Next Recommended Move
- Agency Priority
- Portfolio highlights
- Audience summary
- Development notes
- pending director approvals

### Collapsed or hidden

- Constitution full text
- canon entries
- raw memory entries
- run timeline
- provider details
- technical IDs

### Empty state

```text
This talent has not developed a public career yet.
Start with a portfolio test or first booking.
[Book First Work]
```

## 4. Scouting / Birth

### Purpose

Create and approve a new synthetic identity as a represented New Face.

### Primary question

> Is this new identity worth adding to the agency roster?

### Primary action

`Approve New Face`

### Visible by default

- guided intake
- market opportunity
- identity seed
- visual direction
- voice/interiority
- platform fit
- first portfolio test
- New Face Dossier

### Collapsed or hidden

- birth run timeline
- prompt assembly
- raw artifacts
- provider logs

### Empty state

```text
No new face is being scouted.
Start with a market opportunity or identity idea.
[Scout New Talent]
```

## 5. Development

### Purpose

Shape talent over time based on audience response and agency strategy.

### Primary question

> Which talent should we push, develop, pause, or retire?

### Primary action

`Review Development Plan`

### Visible by default

- development lanes
- talent stage
- momentum
- identity strength
- development risk
- next test
- recommended investment level

### Collapsed or hidden

- raw scoring formula
- raw feedback records
- technical reflections

## 6. Bookings

### Purpose

Plan creative assignments for talent.

### Primary question

> What work is this talent doing next?

### Primary action

`Start Production`

### Visible by default

- selected talent
- platform
- booking idea
- shoot brief
- creative treatment summary
- audience hypothesis
- next step

### Collapsed or hidden

- full prompt
- prompt recipe ID
- provider routing
- workflow JSON

### Empty state

```text
No booking selected.
Choose a talent and propose booking ideas based on their current career direction.
[Choose Talent]
```

## 7. Portfolio

### Purpose

Manage approved and candidate work for talent.

### Primary question

> Which shots belong in this talent’s book?

### Primary action

`Review Candidate`

### Visible by default

- image grid
- talent
- portfolio status
- identity match summary
- platform fit
- recommendation

### Collapsed or hidden

- original prompt
- provider
- raw analysis
- suggested prompt fixes unless requested

## 8. Review Desk

### Purpose

Package machine outputs into director decisions.

### Primary question

> What should I approve, revise, reject, or publish?

### Primary action

State-specific:

- `Approve for Publishing`
- `Request Revision`
- `Reject`
- `Approve Career Update`

### Visible by default

- item preview
- recommendation
- reason
- risk
- consequence
- director actions

### Collapsed or hidden

- raw prompt
- provider jobs
- event payloads
- route details
- JSON

### Empty state

```text
Nothing needs approval.
The Review Desk is clear.
[Open Roster] [Book New Work]
```

## 9. Publishing

### Purpose

Track what is ready to go public and what needs follow-up.

### Primary question

> What is going live, and what response needs to be logged?

### Primary action

`Mark Live` or `Log Audience Response`

### Visible by default

- social packages
- platform variants
- disclosure checklist
- live placement status
- follow-up needed

### Collapsed or hidden

- export file manifest
- local filesystem paths
- draft IDs
- package metadata JSON

## 10. Audience

### Purpose

Turn public social performance into identity and career learning.

### Primary question

> What did the public tell us about this talent?

### Primary action

`Review Audience Debrief`

### Visible by default

- performance summary
- top comments
- qualitative themes
- what worked
- what failed
- proposed memory/canon/career updates

### Collapsed or hidden

- raw metric table
- raw reflection JSON
- source IDs
- technical run detail

## 11. Strategy

### Purpose

Allocate agency resources across winners, risers, bets, and weak performers.

### Primary question

> Who deserves more agency attention?

### Primary action

`Set Agency Priority`

### Visible by default

- Star Talent
- Rising Talent
- Development Bets
- At Risk
- Paused
- metrics summary
- recommended investment

### Collapsed or hidden

- detailed formulas
- raw metric history
- technical derivations

## 12. Studio Ops

### Purpose

Expose technical operations without polluting agency workflow.

### Primary question

> What did the machine do, and is the studio configured correctly?

### Primary action

Depends on tab:

- `Open Production Log`
- `Configure Provider`
- `Test Engine`
- `Save Scheduler`
- `Inspect Audit`

### Visible by default

- production logs
- provider status
- scheduler status
- routing
- workflow engines
- technical audit

### Collapsed or hidden

None required. This is the machine-facing area.
