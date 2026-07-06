# Virtual Agency Studio

Virtual Agency Studio is a local-first, single-user MVP for running an observable AI-powered virtual influencer agency. Synthetic characters are managed through Constitution, Canon, Memory, appearance, voice, references, Runs, assets, drafts, publishing feedback, and review-gated identity evolution.

The central primitive is a `Run`. Automated work should emit `RunEvents` so the operator can see what happened, why it happened, and where human review is required.

## MVP Supports

- Character registry with Constitution versioning, Canon, Memory, Appearance Bible, Voice Guide, Platform Personas, and reference images.
- Character Birth Runs and Daily Activity Runs.
- Prompt Studio for activity candidates, content briefs, and prompt recipes.
- Mock image generation and mock image analysis for offline demos.
- Provider router with OpenAI SFW-first routing, ComfyUI Cloud fallback/direct mature routing, and manual override audit events.
- Configurable Hermes, OpenAI Images, ComfyUI Cloud, WaveSpeed AI, and mock provider adapters.
- Asset Library with analysis scores, review actions, and regeneration.
- Draft Review Desk with platform variants, disclosure flags, export packages, and manual publishing ledger.
- Social feedback capture and Feedback Reflection Runs.
- Review-gated memory, canon, and Constitution patch proposals.
- Optional local automation scheduler plus manual automation triggers.

## Requirements

- Node.js 26+
- npm 11+

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Default local services:

- API: `http://127.0.0.1:4317`
- Web: `http://127.0.0.1:5173`

The app binds to localhost by default and has no authentication.

## Commands

```bash
npm run dev
npm run dev:api
npm run dev:web
npm run typecheck
npm run test
npm run build
npm run deploy:orangepi
npm run smoke:demo
```

`npm run smoke:demo` expects the API server to already be running. It creates a demo character, birth run, daily activity automation run, draft, export package, feedback, and reflection in mock mode.

## Orange Pi Deployment

Deploy to `orangepi.local` with:

```bash
npm run deploy:orangepi
```

The script syncs source to `/home/$USER/apps/virtual-agency-studio`, preserves remote `.env` and `data/`, runs `npm ci`, builds the app, installs two user systemd services, and verifies:

- Web: `http://orangepi.local:5173`
- API: `http://orangepi.local:4317`

Common overrides:

```bash
REMOTE_USER=orangepi REMOTE_DIR=/home/orangepi/apps/virtual-agency-studio npm run deploy:orangepi
RUN_TESTS=true npm run deploy:orangepi
PUBLIC_HOST=192.168.8.242 npm run deploy:orangepi
```

If remote `.env` is missing, the script creates one with `API_HOST=0.0.0.0`, `MOCK_PROVIDERS=true`, and `HERMES_BASE_URL=http://127.0.0.1:8645`. Fill the Hermes generation and analysis paths after confirming the route names.

## Environment Variables

| Name | Default | Purpose |
| --- | --- | --- |
| `API_HOST` | `127.0.0.1` | API bind host. |
| `API_PORT` | `4317` | API port. |
| `WEB_PORT` | `5173` | Vite web port. |
| `DATA_DIR` | `./data` | Local data root. |
| `DATABASE_URL` | `./data/agency.sqlite` | SQLite database path. |
| `MOCK_PROVIDERS` | `true` | Keeps image generation and analysis local/mock. |
| `HERMES_BASE_URL` | empty | Hermes base URL. |
| `HERMES_API_KEY` | empty | Hermes API key. Do not commit real keys. |
| `HERMES_IMAGE_GENERATION_PATH` | empty | Hermes image generation endpoint path. |
| `HERMES_IMAGE_ANALYSIS_PATH` | empty | Hermes image analysis endpoint path. |
| `COMFYUI_CLOUD_BASE_URL` | `https://cloud.comfy.org` | ComfyUI Cloud base URL for direct provider calls. |
| `COMFYUI_CLOUD_API_KEY` | empty | ComfyUI Cloud API key for direct provider calls. Do not commit real keys. |
| `COMFY_API_KEY` | empty | Alias accepted for Comfy Cloud API keys and Codex MCP header-based auth. |
| `COMFYUI_CLOUD_GENERATION_PATH` | `/api/prompt` | ComfyUI Cloud prompt submission path. |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | OpenAI API base URL. |
| `OPENAI_API_KEY` | empty | OpenAI API key. Do not commit real keys. |
| `OPENAI_IMAGE_MODEL` | `gpt-image-1.5` | OpenAI image model. |
| `OPENAI_IMAGE_SIZE` | `1024x1536` | OpenAI image size. |
| `OPENAI_IMAGE_QUALITY` | `auto` | OpenAI image quality setting. |
| `OPENAI_IMAGE_OUTPUT_FORMAT` | `png` | OpenAI image output format. |
| `OPENAI_IMAGE_MODERATION` | `low` | OpenAI image moderation setting: `low` or `auto`. |
| `WAVESPEED_BASE_URL` | `https://api.wavespeed.ai/api/v3` | WaveSpeed AI REST API base URL. |
| `WAVESPEED_API_KEY` | empty | WaveSpeed AI API key. Do not commit real keys. |
| `WAVESPEED_IMAGE_GENERATION_PATH` | `/wavespeed-ai/flux-dev` | WaveSpeed model path for image generation. |

## Mock Provider Mode

Mock mode is enabled by default. It generates local SVG image assets and deterministic analysis results so the full MVP loop can run without external services.

Use Settings in the web app to keep `Mock mode` enabled, or set:

```bash
MOCK_PROVIDERS=true
```

## Hermes Configuration

1. Open `/settings`.
2. Disable mock mode only when Hermes endpoint paths and credentials are known.
3. Set Hermes base URL, image generation path, image analysis path, and API key.
4. Use provider test buttons before running creative flows.

The app stores provider keys in the local SQLite settings table and returns only redacted indicators to the UI.

## Provider Routing

Image generation goes through the provider router:

- `sfw_standard`: OpenAI first, then ComfyUI Cloud fallback on moderation/refusal/timeout/rate-limit.
- `sfw_sensitive`: OpenAI first, then ComfyUI Cloud fallback with the sensitive tier recorded.
- `mature_adult`: ComfyUI Cloud direct route with a review gate.
- `blocked_or_uncertain`: no provider call; the run is marked `needs_review`.

Manual provider overrides are available in the Asset Library. Every override requires an operator-visible reason and emits `routing.override_applied`.

## ComfyUI Cloud Configuration

The Codex Comfy Cloud MCP server is configured separately from this app's direct provider adapter. MCP lets Codex search templates, run workflows, and inspect billing through the Comfy account; the app provider still uses a Comfy API key plus saved workflow JSON when Virtual Agency Studio itself generates images.

Codex MCP account setup:

```bash
codex mcp add comfy-cloud --url https://cloud.comfy.org/mcp
codex mcp login comfy-cloud
codex mcp get comfy-cloud
```

This local Codex install has been registered as `comfy-cloud` and authenticated with OAuth. New Codex sessions should expose the Comfy Cloud MCP tools after the MCP server list refreshes.

For headless/API-key MCP auth, set `COMFY_API_KEY` in the shell and add the documented `env_http_headers` mapping to the Codex MCP server config instead of hardcoding the key.

1. Open `/settings`.
2. Keep the base URL as `https://cloud.comfy.org`, set generation path to `/api/prompt`, and save a Comfy Cloud API key.
3. Paste API-format workflow JSON into `Comfy Workflows`.
4. Map positive prompt, negative prompt, seed, and output nodes.
5. Validate the workflow, then activate it for each content tier that should use it.
6. Use mock analysis or Hermes analysis for image review.

Active Comfy workflows must have at least one output node. The adapter submits `/api/prompt`, polls job status, reads job details, downloads output through `/api/view`, and stores generated assets under `data/assets`.

## WaveSpeed AI Configuration

1. Open `/settings`.
2. Disable mock mode.
3. Choose `WaveSpeed AI` for image generation.
4. Set API key and model path. The default path is `/wavespeed-ai/flux-dev`.
5. Use mock analysis or Hermes analysis for image review.

The WaveSpeed adapter posts to the configured model endpoint and polls the prediction result endpoint until an image URL is available.

## Data Directories

```text
data/agency.sqlite
data/assets/
data/exports/
```

- `data/assets` stores reference images and generated images.
- `data/exports` stores local social post packages.
- The SQLite database stores workflow metadata, settings, run events, proposals, and draft state.

Local generated data is ignored by git except for `.gitkeep` placeholders.

## Reset Local Data

Stop the dev server, then remove generated local state:

```bash
rm -f data/agency.sqlite
rm -rf data/assets/* data/exports/*
touch data/assets/.gitkeep data/exports/.gitkeep
```

Start again with:

```bash
npm run dev
```

Optional seed:

```bash
npm --workspace @virtual-agency/api run db:seed
```

## Limitations

- Local single-user MVP only.
- No auth.
- No cloud deployment target.
- No automatic publishing.
- Constitution patches require explicit human approval and a change reason.
- Canon proposals require human approval.
- The scheduler is an in-process local timer, not a durable production queue.
- Hermes and ComfyUI Cloud paths must be configured by the operator.

## Status

See `BUILD_STATUS.md` for phase-by-phase implementation and verification evidence.
