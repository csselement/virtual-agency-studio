# Virtual Agency Studio Demo Script

Use this walkthrough to demonstrate the MVP end to end in mock mode.

## Start

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://127.0.0.1:5173`.

Expected first screen: Agency Heartbeat with API online, automation cards, recent runs, and local settings.

## Fast API Smoke

With the API running:

```bash
npm run smoke:demo
```

The script prints IDs for:

- character
- birth run
- daily activity run
- selected activity
- prompt recipe
- generated asset
- draft
- export path
- publishing event
- feedback
- reflection run
- proposal kinds

Use those IDs to inspect the corresponding pages.

## Manual Walkthrough

1. Open `/characters`.
2. Create a character with a short summary.
3. Open the character profile.
4. Add a Constitution, Appearance Bible, Voice Guide, and Platform Persona.
5. Click `Start Birth Run`.
6. Open the created run and inspect `context.loaded`, artifacts, and `review.required`.
7. Open `/settings`.
8. Keep Mock mode enabled.
9. In Automation Scheduler, select the character, enable `Auto-select top activity`, set max images to `1`, and save automation.
10. Click `Run daily activity now`.
11. Open the Daily Activity run and inspect:
    - `automation.step`
    - `activity.proposed`
    - `activity.selected`
    - `brief.created`
    - `prompt.generated`
    - `image.generated`
    - `image.analyzed`
    - `review.required`
12. Open `/assets`.
13. Select the generated asset, review analysis scores, and approve it for draft if needed.
14. Open `/drafts`.
15. Review platform variants, disclosure flags, caption text, hashtags, and alt text.
16. Export the package.
17. Mark it published manually with a demo URL.
18. Open `/calendar`.
19. Select the published event and log social feedback.
20. Run reflection.
21. Open the reflection run and inspect generated proposals.
22. Return to the character profile and approve/reject memory, canon, or Constitution patch proposals.

## Expected Pages To Inspect

- `/` - machine heartbeat and automation state.
- `/characters` - roster.
- `/characters/:id` - Constitution, Canon, Memory, Feedback Loop, Reflections, Identity Proposals.
- `/runs/:id` - timeline, artifacts, provider jobs, decisions.
- `/prompt-studio` - manual creative planning.
- `/assets` - generated image and analysis review.
- `/drafts` - platform-ready draft variants and export package.
- `/calendar` - publishing ledger and social feedback.
- `/settings` - provider and automation controls.

## Reset Local Data

Stop the dev server, then run:

```bash
rm -f data/agency.sqlite
rm -rf data/assets/* data/exports/*
touch data/assets/.gitkeep data/exports/.gitkeep
```

Then restart:

```bash
npm run dev
```

## What To Call Out

- Every automated action is visible through Runs and RunEvents.
- Publishing remains manual.
- Canon and Constitution changes are review-gated.
- Mock mode completes the demo without external provider credentials.
- Export packages are written locally under `data/exports`.

