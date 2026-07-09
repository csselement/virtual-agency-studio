# VAS UX Product Model

This is the canonical product model for the VAS UX refactor. It is distilled from the UX handoff package and should be read before implementation work in each UX phase.

## Product Frame

Virtual Agency Studio is a private operating desk for a virtual talent agency. The user is the agency director, not a machine operator. The product should help the director scout, develop, book, review, publish, measure, and evolve synthetic talent based on public response.

The backend can continue to use `Run`, `RunEvent`, providers, prompt recipes, assets, drafts, feedback records, and identity proposals. The default UI should translate those primitives into agency concepts.

## Core Mental Model

The product loop is:

```text
Scout -> Birth -> Develop -> Book -> Produce -> Review -> Publish -> Measure -> Evolve -> Repeat
```

Plain-language version:

```text
Find talent -> Shape identity -> Create work -> Put it in public -> Learn from response -> Build stars
```

Every primary screen should answer at least one director-facing question:

- Who needs my attention?
- Which talent should I invest in?
- What is this talent doing next?
- What is ready for review?
- What is going public?
- What did the audience tell us?
- What career direction should I approve?

If a screen primarily answers "what did the machine do?", it belongs in Studio Ops or a collapsed Technical Audit.

## Agency Departments

- Director's Desk: executive attention, daily decisions, star watch, follow-up.
- Roster: represented talent and career stages.
- Scouting: new face intake, birth, approval.
- Development: shaping identities over time.
- Bookings: planned creative assignments and shoot briefs.
- Production: candidate work generated from approved bookings.
- Portfolio: approved work, candidate shots, and reference material.
- Review Desk: director approval packets.
- Publishing: social packages, placements, and live follow-up.
- Audience Response: public performance, qualitative signal, and debriefs.
- Career Strategy: resource allocation, winners, risers, weak performers.
- Studio Ops: providers, production logs, scheduler, routing, workflow engines, audit.

## Talent Model

Talent are represented identities. They should not feel like generic records, prompt containers, or asset folders.

Each talent should progressively expose:

- name and visual identity
- public positioning
- emotional interiority
- agency stage
- career trajectory
- platform fit
- audience response history
- development notes
- approved public story/canon
- identity bible and appearance bible
- risk profile
- next recommended move

Canonical career stages:

```text
Scouted
New Face
Development
Working Talent
Core Talent
Star Talent
At Risk
Paused
Retired
```

## Director Decision Model

Machine-generated output that reaches the director must become a decision packet:

```text
What is this?
Recommendation
Why
Risk
Consequence
Director action
Technical audit, collapsed
```

The director should not be forced to interpret raw runs, event payloads, provider calls, route tiers, or JSON to understand what to do next.

## Product Principles

- Talent is the main character.
- The director makes decisions.
- Public response drives evolution.
- The machine is staff, not the product.
- Transparency is available, not unavoidable.
- Agency language beats system language.
- Winners and losers matter.

## Runtime Preservation

This UX refactor must preserve:

- local-first MVP operation
- no-auth MVP assumption
- mock provider operation when real credentials are absent
- manual publishing or explicitly human-approved publishing
- observable `Run` and `RunEvent` architecture
- `RunService` / `RunQueue` mutation visibility
- human approval for Constitution and Canon changes
- access to production logs and technical audit details
