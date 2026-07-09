# 20 — PR Review Template: UX Refactor

Use this template for every VAS UX refactor PR.

## Phase

- Phase:
- Issue:
- Screens touched:
- Files touched:

## Product intent

What agency-facing user problem does this PR solve?

```text
...
```

## Before

What was machine-facing, confusing, overloaded, or illogical?

```text
...
```

## After

What is clearer now?

```text
...
```

## Primary director action

What is the one main action on each changed screen?

```text
...
```

## Machine details moved or collapsed

List any technical details that were moved, renamed, collapsed, or demoted.

- [ ] Run IDs
- [ ] RunEvents
- [ ] Provider jobs
- [ ] Raw JSON
- [ ] Prompt recipes
- [ ] Route tiers
- [ ] Payloads
- [ ] Workflow JSON
- [ ] Advanced IDs

Notes:

```text
...
```

## Studio Ops access

Confirm that technical transparency still exists.

```text
...
```

## Copy changes

List important terminology changes.

```text
...
```

## Empty / loading / error states

- [ ] Empty states guide the director to a next action.
- [ ] Loading states use agency language.
- [ ] Error states explain consequence and link to Studio Ops when needed.

Notes:

```text
...
```

## Visual design preservation

- [ ] No new visual direction.
- [ ] No new color system.
- [ ] No new typography.
- [ ] No generic SaaS restyle.
- [ ] Layout changes preserve current component feel.

Notes:

```text
...
```

## Checks

```bash
npm run typecheck
npm run build
npm run test
npm run verify:design
```

Results:

- typecheck:
- build:
- test:
- verify:design:

## Manual UX QA

For each changed screen:

- [ ] Can a first-time director understand the screen in 10 seconds?
- [ ] Is the primary action obvious?
- [ ] Is machine data hidden/collapsed unless needed?
- [ ] Does the screen use agency language?
- [ ] Does the screen make the next step clear?

## Remaining UX debt

```text
...
```
