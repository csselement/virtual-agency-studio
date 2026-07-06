# Architecture Decision: Virtual Agency Studio MVP

## Decision

Build Virtual Agency Studio as a new TypeScript monorepo in this repository:

```text
apps/
  api/        Fastify API server bound to 127.0.0.1 by default
  web/        Vite + React single-page frontend
packages/
  shared/     Zod schemas and shared TypeScript types
  providers/  Hermes, ComfyUI Cloud, and mock provider adapters
data/
  agency.sqlite
  assets/
  exports/
```

Use SQLite for local persistence, a small explicit migration mechanism, and local filesystem storage for assets and export packages. Provider integrations should sit behind package-level interfaces so mock providers can power local development without external credentials.

## Repository Audit Summary

This repository is an empty/new app repo. The only project file present at the start of Phase 0 is:

```text
mvp_build_package_codex.md
```

No existing app shell, package manager configuration, database schema, provider code, prompt logic, reference image handling, ComfyUI integration, or Hermes API implementation exists in this repo.

Nearby Conservatory-related documentation was found outside this repo under `Documents`, but no source modules were present locally in this workspace to extract directly. That material should be treated as source material only if later phases need concept-level guidance.

## Why This Is Not a Direct Fork

The requested product model is an agency-like automation machine, not the old Conservatory navigation or mental model. The build package explicitly makes `Run` the central primitive and requires transparent machine state, human review gates, social draft packaging, and local single-user operation. A fresh app shell avoids inheriting unrelated navigation, assumptions, and data shape.

## Reuse Plan

If The Conservatory source becomes available later, selectively reuse or adapt:

- Character Constitution structure and versioning patterns.
- Character Core Prompt and appearance prompt patterns.
- Reference image handling concepts.
- Prompt assembly patterns.
- Hermes client request conventions when documented.
- Image analysis workflow concepts.

Do not reuse old navigation, route hierarchy, product labels, or mental models unless they directly support the agency machine.

## Local-Only Operation

- API host defaults to `127.0.0.1`.
- Web dev server defaults to a localhost-only Vite server.
- SQLite database lives at `data/agency.sqlite`.
- Assets live under `data/assets`.
- Export packages live under `data/exports`.
- The MVP has no authentication.
- Mock providers are enabled by default so the app starts without Hermes or ComfyUI Cloud credentials.

## Provider Strategy

Implement provider adapters behind interfaces:

- `ImageGenerationProvider`
- `ImageAnalysisProvider`

Initial adapters:

- Mock image generation provider.
- Mock analysis provider.
- Configurable Hermes provider with base URL, API key, generation path, and analysis path.
- Configurable ComfyUI Cloud generation provider.

Do not hardcode undocumented Hermes endpoint paths. Use environment/config settings and fail with visible run events when a real provider is selected but not configured.

## Major Risks

- Character identity drift if memory, canon, and constitution updates are not clearly separated.
- Hidden automation failures if run events are not written consistently.
- Provider instability or undocumented endpoint assumptions.
- Overbuilding scheduling before the run/event spine is durable.
- Export package paths or local file APIs leaking arbitrary filesystem details.
- UI becoming text-heavy instead of exposing concise machine state.

## Phase 1 Recommendation

Proceed with the TypeScript npm workspace structure above. Keep the first runnable slice intentionally small:

- Root workspace scripts.
- Fastify API with `/health` and `/api/version`.
- Vite React web shell with navigation and a health display.
- Shared Zod schemas for health, run status, and character status.
- Provider package with interfaces and mock-safe placeholders.
- `.env.example` and README setup instructions.
