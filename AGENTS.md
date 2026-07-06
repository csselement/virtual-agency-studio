# Virtual Agency Studio Agent Guide

## Project Scope

Virtual Agency Studio is a local-first, single-user MVP for managing AI influencer characters through observable automation runs. The central primitive is a `Run`; every automated action must emit readable `RunEvent` records.

## Repository Status

This repository starts as a new project. Do not treat nearby Conservatory material as the product shell. Conservatory concepts may be copied or adapted only when they directly help with constitutions, character prompts, appearance identity, reference images, Hermes provider logic, or image analysis workflows.

## Planned Structure

```text
apps/
  api/        Local Fastify API server
  web/        Vite + React frontend
packages/
  shared/     Zod schemas and shared TypeScript types
  providers/  Hermes, ComfyUI Cloud, and mock provider adapters
data/
  assets/     Local generated/uploaded assets
  exports/    Local publishing packages
```

## Development Commands

These commands are placeholders until Phase 1 creates the TypeScript workspace.

```bash
npm install
npm run dev
npm run dev:api
npm run dev:web
npm run build
npm run test
npm run typecheck
npm --workspace @virtual-agency/api run db:seed
```

## Local Operation Rules

- Bind local services to `127.0.0.1` by default.
- No auth for the MVP.
- The app must run without Hermes or ComfyUI credentials by using mock providers.
- Store local files under `data/assets` and `data/exports`.
- Do not expose arbitrary filesystem paths through public API responses.
- Publishing is manual or explicitly human-approved.
- Constitution changes must be versioned and human-approved.
- Canon updates must be proposed for human approval.
- Memory updates may be automatic if events explain the change.
- Every automated run mutation should flow through `RunService` or `RunQueue` so events, artifacts, decisions, and status changes stay visible.

## Build Phases

Work through `BUILD_STATUS.md` in order. After each phase, run relevant verification commands, update status, and document known gaps before continuing.
