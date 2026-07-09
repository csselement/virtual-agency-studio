# 04 — Progressive Disclosure Rules

VAS must remain transparent, but transparency should be available rather than unavoidable.

## Primary rule

The director-facing UI should show:

```text
Decision → Reason → Consequence → Action
```

It should not show:

```text
Provider → RunEvent → Payload → ID → Raw JSON → User interprets consequence
```

## Three-layer model

### 1. Agency layer

The default user experience.

Shows:

- talent
- career stage
- bookings
- portfolio work
- review decisions
- publishing status
- audience response
- career direction
- recommendations
- risks
- next moves

### 2. Ops layer

Used when the director or builder needs operational context.

Shows:

- production logs
- run statuses
- scheduler
- provider configuration
- routing
- exports
- workflow engines

### 3. Debug/audit layer

Used for troubleshooting.

Shows:

- IDs
- raw payloads
- JSON
- provider requests/responses
- event payloads
- route tiers
- trace details
- workflow JSON

## What belongs on default screens

Default screens may show:

- current talent
- selected booking
- preview
- recommendation
- director decision
- high-level reason
- risk summary
- audience summary
- status in agency language

Default screens should not show:

- run IDs
- prompt recipe IDs
- provider job IDs
- database IDs
- route tiers
- raw prompts
- raw JSON
- provider request/response bodies
- full event streams
- workflow JSON
- internal status enums

## When to show machine details

Machine details may be shown when:

- user opens Studio Ops
- user expands “Technical Audit”
- an error requires troubleshooting
- a decision needs traceability
- provider setup is being configured
- developer/debug mode is active

## Disclosure labels

Use labels that communicate why the details exist:

| Bad label | Better label |
|---|---|
| Raw details | Technical audit |
| JSON | Developer payload |
| Provider jobs | Production engine logs |
| Run events | Production log |
| Advanced IDs | Technical IDs |
| Prompt | Creative treatment source |
| Audit payloads | Full technical audit |

## Decision packet rule

Any machine-generated output that reaches the director should be transformed into a decision packet:

```text
What is this?
Recommendation
Why
Risk
Consequence
Director action
Technical audit, collapsed
```

## Maximum visible complexity

On default director-facing screens:

- one primary action
- no more than three major decision zones
- no raw tables above the fold unless the screen is a true list/index
- no more than one technical status indicator outside Studio Ops
- no more than one collapsed technical drawer per decision item

## Error state pattern

```text
[Agency-facing error]
What this means:
[Plain-language consequence]

Recommended action:
[Human next step]

Technical audit:
[Collapsed technical details]
```

## Review state pattern

```text
[Preview]
[Recommendation]
[Why this is recommended]
[Risk]
[Director action]
[Technical audit collapsed]
```

## Feedback state pattern

```text
[Public response summary]
[What worked]
[What failed]
[What this means for the talent]
[Proposed career/identity update]
[Approve / Reject]
[Metrics detail collapsed]
```
