# Local Security Notes

Virtual Agency Studio is a local-first MVP. It is not designed for public deployment.

## Assumptions

- Single trusted local operator.
- API and web bind to localhost by default.
- No authentication.
- No multi-user access controls.
- Local SQLite database.
- Local filesystem assets and exports.

## Not Safe For Public Deployment

Do not expose this app directly to the internet. It has no auth, no tenant isolation, and no hardened upload boundary.

If public or team access is needed later, add:

- authentication
- authorization
- CSRF protection
- upload validation and scanning
- rate limits
- secret management
- durable job queue
- deployment-specific logging and monitoring

## Provider Secrets

Provider keys can be saved through `/settings` and are stored in the local SQLite settings table. API responses only return redacted key indicators, but the database is still sensitive.

Do not commit:

- `.env`
- `data/agency.sqlite`
- local provider keys
- exported provider payloads containing secrets
- `COMFY_API_KEY` or Comfy Cloud MCP header values

## Localhost Binding

Defaults:

- API: `127.0.0.1:4317`
- Web: `127.0.0.1:5173`

Keep `API_HOST=127.0.0.1` unless you understand the risk of exposing an unauthenticated API.

## Automation Safety

- The MVP does not automatically publish.
- Constitution patches require explicit human approval and a change reason.
- Canon proposals require human approval.
- Memory can be approved from feedback, but proposal review remains visible.
- All automated work should emit RunEvents.

## Local Exports

Draft packages are written under `data/exports`. They are local files for manual review and publishing. The app does not post them to social platforms.
