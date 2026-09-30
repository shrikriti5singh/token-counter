# Token Lens

Token Lens is a developer tool for inspecting the exact token boundaries returned by a configurable tokenization service.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- `TOKENISE_UPSTREAM_URL` — optional API server URL used by `/api/tokenise`; it may include the `/tokenise` path
- `VITE_API_BASE_URL` — optional frontend API host override; defaults to the same-app `/api` route

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/token-lens/src/App.tsx` — single-page token inspection UI
- `artifacts/token-lens/src/index.css` — dark developer-tool visual system and token chip styling
- `artifacts/api-server/src/routes/tokenise.ts` — validated proxy route for the upstream tokenization API
- `lib/api-spec/openapi.yaml` — source of truth for generated API types and hooks

## Architecture decisions

- The backend response is authoritative; the frontend never splits text or calculates token counts.
- The API server returns explicit configuration/upstream errors instead of silently faking tokenization.
- The generated client uses the same-app `/api` route by default, while `VITE_API_BASE_URL` can point at another API host.

## Product

Users can submit text with an optional model selection, see the authoritative token count, inspect every returned token with preserved whitespace, retry failures, clear the inspection, and copy the original response text.

## User preferences

The interface should stay dark, precise, restrained, and centered on token boundaries.

## Gotchas

Set `TOKENISE_UPSTREAM_URL` before expecting successful API responses; without it, the backend intentionally returns a clear configuration error.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
