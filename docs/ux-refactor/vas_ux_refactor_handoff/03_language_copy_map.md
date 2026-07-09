# 03 — Language and Copy Map

This document defines the machine-to-agency language conversion for VAS.

## Global copy principles

- Use agency language by default.
- Use machine language only inside Studio Ops, Debug, and Audit views.
- Treat synthetic characters as represented talent identities.
- Avoid copy that makes the director feel like a machine operator.
- Replace “AI did X” with “Studio prepared X” or “Production prepared X” where appropriate.
- Preserve transparency through collapsible technical details.

## Core terminology map

| Machine-facing | Agency-facing |
|---|---|
| Character | Talent / Model / Identity |
| Character Registry | Roster |
| Character Profile | Talent Profile |
| Character Birth Run | New Face Birth / Talent Intake |
| Run | Job / Production / Assignment |
| Run Detail | Production Log |
| Run Events | Staff Notes / Production Log Entries |
| Machine Activity | Studio Activity / Production Logs |
| Prompt Studio | Booking Desk / Creative Briefs |
| Activity Candidate | Booking Idea |
| Content Brief | Shoot Brief / Creative Brief |
| Prompt Recipe | Creative Treatment |
| Image Generation | Production / Shoot |
| Image Analysis | Quality Review / Portfolio Review |
| Asset | Portfolio Shot / Candidate Image |
| Asset Library | Portfolio |
| Draft | Social Package |
| Draft Review Desk | Review Desk |
| Export Package | Placement Package |
| Publishing Event | Live Placement / Published Post |
| Calendar / Queue | Publishing Calendar |
| Social Feedback | Audience Response |
| Feedback Reflection | Audience Debrief |
| Identity Proposal | Career Direction Proposal |
| Memory | Lived Experience / Audience-Learned Note |
| Canon | Public Story / Canon |
| Constitution | Identity Bible |
| Appearance Bible | Look Book / Appearance Bible |
| Voice Guide | Voice Guide |
| Platform Persona | Platform Persona |
| Provider | Production Engine / Vendor |
| Provider Job | Vendor Log / Engine Call |
| Routing | Studio Routing |
| Scheduler | Studio Schedule |
| Automation | Studio Staff / Scheduled Work |
| Review Gate | Director Approval |
| Settings / System | Studio Ops |
| Manual Dispatch | Production Console |
| Raw Details | Technical Audit |
| Advanced IDs | Technical IDs |

## Navigation copy

| Current | Target |
|---|---|
| Command | Director’s Desk |
| Create | Scouting |
| Runs | Studio Ops / Production Logs |
| Review | Review Desk |
| Calendar / Queue | Publishing |
| Library | Portfolio |
| Insights | Audience |
| Settings / System | Studio Ops |
| Help | Guide |

## Shell copy

| Current | Target |
|---|---|
| Agentic social studio | Virtual talent agency |
| Agency Operator | Agency Director |
| Local Operator | Director |
| System Health | Studio Ops Health |
| Local mode / LLM / Storage | Move to Studio Ops or collapse |

## Status vocabulary

Map technical statuses to agency-facing states.

| Technical status | Agency state |
|---|---|
| idea | Scouted |
| queued | Scheduled |
| running | In production |
| waiting_for_provider | Waiting on production engine |
| needs_review | Needs director approval |
| completed | Complete |
| failed | Needs studio attention |
| cancelled | Cancelled |
| approved_post_asset | Approved for publishing |
| approved_reference | Approved reference |
| rejected_identity_drift | Rejected: identity drift |
| rejected_quality | Rejected: quality issue |
| raw_generation | Candidate shot |
| candidate | Ready for review |
| published | Live |
| exported | Package ready |

## Talent career stages

Use these agency-facing stages:

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

Definitions:

- **Scouted**: idea exists, identity not yet approved.
- **New Face**: born and approved, needs initial development.
- **Development**: profile exists but needs refinement and testing.
- **Working Talent**: producing regular publishable work.
- **Core Talent**: reliable performer worth ongoing attention.
- **Star Talent**: proven standout with high audience pull.
- **At Risk**: declining response, identity drift, or poor fit.
- **Paused**: temporarily not worth active production resources.
- **Retired**: archived identity, no active investment.

## CTA copy

Use CTAs that describe director decisions.

| Avoid | Prefer |
|---|---|
| Start run | Start booking |
| Run daily activity now | Book today’s work |
| Generate activities | Propose booking ideas |
| Compose prompt | Prepare creative treatment |
| Generate image | Start production |
| Analyze | Review quality |
| Approve post asset | Approve for publishing |
| Create draft | Create social package |
| Export | Prepare placement package |
| Mark published | Mark live |
| Run reflection | Debrief audience response |
| Review proposal | Review career direction |
| Open runs | Open production logs |

## Error copy

Error states should avoid exposing internal failure first.

Bad:

```text
provider.request failed: timeout
```

Better:

```text
Production engine did not respond. Open Studio Ops for technical details.
```

Bad:

```text
Run failed.
```

Better:

```text
This production job needs studio attention.
```

## Empty state copy

Good empty states should guide the agency director.

Examples:

```text
No talent in the roster yet.
Scout the first New Face to begin building the agency.
[Scout New Talent]
```

```text
No audience response logged.
Publish a placement, then record social performance so VAS can learn what the public responds to.
[Open Publishing]
```

```text
Nothing needs approval.
The Review Desk is clear. Check the Roster or book new work for a developing talent.
[Open Roster]
```
