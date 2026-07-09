# 11 — Phase 4: Scouting and Birth

## Goal

Turn character creation into a guided New Face Intake workflow.

## Primary question

> Is this new identity worth adding to the agency roster?

## Current problem

The current create flow treats identity creation as record creation plus a Birth Run.

The refactor should make it feel like scouting and evaluating a new represented identity.

## Target flow

```text
Scouting
  1. Market Opportunity
  2. Identity Seed
  3. Look Direction
  4. Voice and Inner Life
  5. Platform Fit
  6. First Portfolio Test
  7. New Face Dossier
```

## Step details

### 1. Market Opportunity

Ask:

- What kind of talent is missing from the roster?
- What audience or platform should this talent serve?
- What makes this identity different from existing talent?

### 2. Identity Seed

Fields:

- name
- public archetype
- emotional tone
- life texture
- uniqueness hook
- initial summary

### 3. Look Direction

Fields:

- visual identity
- style language
- reference constraints
- what to avoid
- identity consistency notes

### 4. Voice and Inner Life

Fields:

- voice guide
- emotional depth
- recurring tensions
- values
- public/private contrast

### 5. Platform Fit

Fields:

- primary platform
- secondary platforms
- content strengths
- public appeal hypothesis

### 6. First Portfolio Test

Actions:

- upload reference
- generate initial candidate
- approve/reject reference
- identify identity drift risk

### 7. New Face Dossier

Final review:

```text
Name
Stage: New Face
Public promise
Visual direction
Voice/interiority
Best initial platform
Development risk
Recommended first booking
Director decision:
[Approve New Face] [Revise Identity] [Reject Concept]
```

## Backend posture

Use existing endpoints initially:

- create character
- add Constitution
- add Appearance
- add Voice
- add Platform Persona
- upload Reference Image
- start Birth Run

Do not require a new backend wizard table for the first implementation.

## Birth Run handling

After Birth Run completes, do not send the user primarily to Run Detail.

Instead show:

```text
New Face Dossier
```

with a link:

```text
View Production Log
```

## Acceptance criteria

- New character creation feels like scouting.
- The director evaluates identity promise before moving forward.
- The birth run is available but not primary.
- The result is a New Face Dossier.
- Typecheck/build pass.

## Codex implementation prompt

```text
Implement Phase 4 from docs/ux-refactor/11_phase_4_scouting_birth.md.

Create or refactor the Scouting/New Face flow using existing character endpoints.
Preserve visual style.
Do not remove the existing character creation path until the new flow works.
After Birth Run, present a New Face Dossier instead of making the run timeline the primary success screen.
Keep Production Log available as a secondary link.

After implementation:
1. Run npm run typecheck.
2. Run npm run build.
3. Provide UX diff.
4. List any data that is still simulated or derived.
```
