# Virtual Agency Studio Help

Virtual Agency Studio is a local-first operating desk for AI influencer characters. It is designed around one repeatable cycle: create a character, produce assets, review outputs, publish manually, log feedback, and use that feedback to propose identity evolution.

The product is not intended to be a fully autonomous social media account. Automation can draft, generate, analyze, package, and reflect. A human operator still approves publishing and all durable character identity changes.

## Core Principles

1. Runs are the audit trail.
   Every automated action should create readable RunEvents so the operator can inspect what happened, which provider ran, what artifacts were created, and whether a review gate is open.

2. Publication stays manual.
   VAS can prepare publishing packages and ledger entries, but the operator decides when and where something goes live.

3. Identity changes are gated.
   Canon, memory, and Constitution updates are proposals until the operator approves them.

4. The archive matters.
   Assets are not just generated images. They are the reusable visual memory of a character, with approval state and platform fit.

## The Operator Cycle

### 1. Heartbeat

Use Heartbeat when you do not know what needs attention. It summarizes the active workflow stages and points to the next operator action.

Typical actions:
- Open the most urgent review gate.
- Jump to the stage with attention.
- Confirm that automation is not blocked.

### 2. Birth

Birth is where the character begins. Create or select a character, run Birth, then review the generated identity material.

Typical actions:
- Create the character profile.
- Start a Birth Run.
- Review identity proposals.
- Continue to Production once the character is coherent enough to generate assets.

### 3. Production

Production is the asset archive and generation desk. Assets move from raw generation to candidate review, approval, rejection, draft creation, reference use, or archival.

Typical actions:
- Generate or import assets.
- Analyze assets.
- Approve assets that fit the character.
- Reject assets for quality, policy, or identity drift.
- Create drafts from approved assets.

### 4. Review

Review is the human approval desk. Drafts are reviewed first, but the same stage can point to run gates, asset gates, and identity proposals.

Typical actions:
- Review drafts before export or publishing.
- Check automation runs that need human review.
- Approve or reject proposed identity updates.
- Keep unsafe or off-character outputs from advancing.

### 5. Publishing

Publishing is the ledger and package state. It supports manual publishing and records what was prepared or posted.

Typical actions:
- Inspect approved or exported drafts.
- Prepare publishing packages.
- Record manual publish events.
- Move published work into Feedback.

### 6. Feedback

Feedback closes the loop. After a post is live, log response metrics and qualitative notes. Then run reflection to propose character learning.

Typical actions:
- Log impressions, engagement, comments, and operator judgment.
- Run feedback reflection.
- Review resulting memory, canon, or Constitution proposals.
- Return to Birth or Production with a more informed character.

## Support Navigation

Prompt Studio is for composing briefs and generation recipes when Production needs more directed assets.

Timeline is the trace-only machine room for RunEvents, artifacts, provider jobs, decisions, and failures.

Operations is for provider routing, Comfy workflows, automation supervision, and manual run tools.

Help explains the workflow and status language.

## Status Language

Attention means a stage needs an operator decision, usually a review gate, draft, asset, or feedback item.

Ready means the stage has enough input to proceed, but it is not urgent.

Blocked means an earlier stage must be completed before this stage can produce useful work.

Complete means the stage has produced usable output for the current cycle.

## First Session Checklist

1. Open Birth and create or select a character.
2. Run Birth and review proposed identity material.
3. Open Production and generate or import assets.
4. Analyze assets and approve only the ones that fit the character.
5. Create a draft and approve it in Review.
6. Prepare or record the manual publish event in Publishing.
7. Log response in Feedback.
8. Run reflection and review proposed identity updates.
