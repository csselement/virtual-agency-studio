# Troubleshooting

## API Does Not Start

Check for a port conflict:

```bash
lsof -nP -iTCP:4317 -sTCP:LISTEN
```

Either stop the existing process or change `API_PORT` in `.env`.

## Web App Does Not Start

Check for a port conflict:

```bash
lsof -nP -iTCP:5173 -sTCP:LISTEN
```

Either stop the existing process or change `WEB_PORT` in `.env`.

## Database Errors

The MVP uses SQLite at `data/agency.sqlite` by default.

To reset local data:

```bash
rm -f data/agency.sqlite
rm -rf data/assets/* data/exports/*
touch data/assets/.gitkeep data/exports/.gitkeep
```

Then restart the app.

## Missing Data Directory

The API creates `data/assets` and `data/exports` on startup. If the directories are missing or permissions are broken:

```bash
mkdir -p data/assets data/exports
touch data/assets/.gitkeep data/exports/.gitkeep
```

## Provider Errors

For local demos, keep Mock mode enabled in `/settings`.

If using Hermes:

- Confirm `HERMES_BASE_URL`.
- Confirm `HERMES_API_KEY`.
- Confirm image generation and analysis endpoint paths.
- Use `/settings` provider test buttons before running creative workflows.

If using ComfyUI Cloud:

- Confirm `COMFYUI_CLOUD_BASE_URL` is `https://cloud.comfy.org` unless you intentionally use a proxy.
- Confirm `COMFYUI_CLOUD_API_KEY` or `COMFY_API_KEY` is available for direct app provider calls.
- Confirm generation path, normally `/api/prompt`.
- Confirm a named workflow is saved, validates, and is active for the route tier.
- If the provider returns `workflow payload is not configured`, activate a valid workflow for `sfw_standard`, `sfw_sensitive`, or `mature_adult`.
- If the provider returns `completed without an output file`, check the workflow output node mapping and ensure the workflow uses an output/save node.
- Use mock or Hermes analysis for analysis.

For Codex MCP issues:

- Run `codex mcp get comfy-cloud` and confirm the URL is `https://cloud.comfy.org/mcp`.
- If auth is missing, run `codex mcp login comfy-cloud` and complete the Comfy Cloud browser authorization.
- Restart or refresh Codex after adding the server if MCP tools do not appear in the active session.

If using OpenAI Images:

- Confirm `OPENAI_API_KEY` or save the key in `/settings`.
- Confirm the image model, size, quality, output format, and moderation settings.
- SFW routes try OpenAI first. Moderation refusals, timeouts, and rate limits create `provider.fallback` events before ComfyUI Cloud is attempted.

If a run is marked `needs_review` before provider submission:

- Inspect the run events for `routing.blocked` or `routing.classified`.
- Blocked or legally uncertain prompts do not call providers, even with manual provider override.
- Mature adult routes use ComfyUI Cloud directly and require human review.

If using WaveSpeed AI:

- Confirm `WAVESPEED_API_KEY`.
- Confirm `WAVESPEED_BASE_URL` is `https://api.wavespeed.ai/api/v3` unless you are using a proxy.
- Confirm the model path, for example `/wavespeed-ai/flux-dev`.
- Use mock or Hermes analysis for analysis.
- If provider tests time out, the prediction did not complete before the local polling limit.

## Smoke Demo Fails

`npm run smoke:demo` expects the API server to already be running at `http://127.0.0.1:4317`, unless `API_BASE_URL` is provided.

```bash
npm run dev
API_BASE_URL=http://127.0.0.1:4317 npm run smoke:demo
```

If the script stops at a review gate, inspect the printed Daily Activity run in `/runs/:id`.

## Scheduler Did Not Run

The scheduler is local and in-process.

- The API process must be running.
- `Enable daily activity runs` must be checked in `/settings`.
- At least one default character must be selected.
- The local process checks once per minute.
- The scheduler runs at most once per local day.

Manual `Run daily activity now` remains available even when the scheduler is disabled.

## Empty Screens

Most screens are data-driven. Create a character or run `npm run smoke:demo` to populate:

- characters
- runs
- assets
- drafts
- calendar events
- reflections
