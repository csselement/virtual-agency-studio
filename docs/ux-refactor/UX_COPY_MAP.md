# VAS UX Copy Map

This is the canonical copy map for agency-facing UX work. Use agency language by default. Use machine language only inside Studio Ops, Debug, and Technical Audit views.

## Global Rules

- Refer to the user as the agency director.
- Treat characters as represented talent identities.
- Replace "AI did X" with "Studio prepared X" or "Production prepared X" where appropriate.
- Keep transparency through collapsed technical details.
- Do not make the director feel like a machine operator.
- Do not expose implementation IDs on default director-facing screens.

## Navigation

| Current | Agency-facing |
|---|---|
| Command | Director's Desk |
| Create | Scouting |
| Characters | Roster |
| Prompt Studio | Bookings / Booking Desk |
| Assets / Library | Portfolio |
| Drafts / Review | Review Desk |
| Calendar / Queue | Publishing |
| Feedback / Insights | Audience Response |
| Runs | Studio Ops / Production Logs |
| Settings / System | Studio Ops |
| Help | Guide |

Primary navigation should eventually feel like:

```text
Director's Desk
Roster
Scouting
Bookings
Review Desk
Publishing
Portfolio
Audience
Strategy
Studio Ops
Guide
```

Shorter MVP labels are acceptable when space is constrained:

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

## Nav Details

| Avoid | Prefer |
|---|---|
| Attention | Today's decisions |
| Start work | New faces |
| Machine activity | Production logs |
| Human judgment | Director approval |
| Cadence | Publishing |
| Source material | Portfolio |
| Learning loop | Audience response |
| Tune machine | Studio operations |
| How VAS works | Agency guide |

## Shell Copy

| Avoid | Prefer |
|---|---|
| Agentic social studio | Virtual talent agency |
| Agency Operator | Agency Director |
| Local Operator | Director |
| System Health | Studio Ops Health |
| Local mode / LLM / Storage above the fold | small health indicator or collapsed Studio Ops Health |

## Core Terms

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

## Status Vocabulary

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

## CTA Copy

| Avoid | Prefer |
|---|---|
| Review outputs | Review Today's Decisions |
| Start creating | Scout New Talent |
| Open runs | Open Production Logs |
| Run daily activity now | Book Today's Work |
| Generate activities | Propose Booking Ideas |
| Create brief | Create Shoot Brief |
| Compose recipe | Prepare Creative Treatment |
| Generate image | Start Production |
| Analyze | Review Quality |
| Create draft | Create Social Package |
| Export | Prepare Placement Package |
| Mark published | Mark Live |
| Run reflection | Debrief Audience Response |

## Error Copy Pattern

Avoid leading with internal failure strings.

```text
This production job needs studio attention.

What this means:
[Plain-language consequence]

Recommended action:
[Human next step]

Technical audit:
[Collapsed details]
```

## Empty State Pattern

Empty states should tell the director what to do next.

```text
No talent in the roster yet.
Scout the first New Face to begin building the agency.
[Scout New Talent]
```
