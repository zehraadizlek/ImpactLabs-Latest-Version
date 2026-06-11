# ImpactLabs

ImpactLabs turns an organization's raw inputs into an investor- and grantmaker-grade, visual-first AI impact report that dynamically adapts to the organization's type (education, startup, climate, healthcare, nonprofit, social enterprise).

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/impact-os run dev` — run the ImpactLabs web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Web: React + Vite, Tailwind, shadcn/ui, recharts (charts), framer-motion (motion)

## Where things live

- `artifacts/impact-os/src/lib/state.ts` — source of truth for the frontend data contract: `AppState` (wizard inputs) and `GeneratedReport` (the 11-section report shape). `STORAGE_KEY` is versioned (`impactos-state-v2`); bump it whenever the persisted shape changes.
- `artifacts/impact-os/src/components/steps/` — the 6-step onboarding wizard (Step0–Step5).
- `artifacts/impact-os/src/components/report/ReportViewer.tsx` — the 11-section visual-first report.
- `artifacts/impact-os/src/lib/exports.ts` — PPTX/DOCX export builders; PDF export is `window.print()`.
- `artifacts/impact-os/src/index.css` — theme tokens, glassmorphism utilities, and the `@media print` contract for PDF output.
- `artifacts/api-server/src/routes/ai.ts` — `/api/ai/generate-report` (two parallel Anthropic calls, merged and Zod-validated), plus `/ai/generate-theory` and `/ai/suggest-kpis`.
- `lib/api-spec/openapi.yaml` — API contract (source for codegen). `info.title` is `Api` — do NOT change it (it controls generated filenames).
- `lib/api-client-react/src/generated/` — generated React Query hooks + Zod schemas.

## Architecture decisions

- The report is generated in TWO parallel Anthropic calls (narrative sections + visual/metric sections), merged, then validated against the generated `GeneratedReport` Zod schema; a mismatch returns 500. This keeps each prompt focused and within token limits.
- The report shape is intentionally visual-first (~70% visual / 30% text) and org-type adaptive (e.g. CO2e tonnes for climate, students for education) — the AI prompt enforces org-type framing and array-size caps.
- Geographic reach is a horizontal bar chart (recharts), not a map — there are no geo/map dependencies installed, by design.
- PDF export is browser print (`window.print()`), so the report must stay print-clean via the `@media print` block (controls hidden, glass neutralized, page-break handling).

## Product

- A 6-step onboarding wizard collects organization profile, beneficiary groups, key programs, theory-of-change inputs, measurement framework, key metrics, and (lightly) SDG context.
- One click generates an 11-section report: Cover with hero metric, Impact At A Glance, Organization Overview, Programs & Initiatives, Beneficiary Impact, Impact Dashboard, Theory of Change, Measurement Framework, Challenges & Learnings, Future Commitments, Appendix.
- The report can be exported to PPTX, DOCX, and PDF, and shared via a compact URL.

## User preferences

- Communicate with the user in Turkish.
- Visual style: dark navy glassmorphism. NEVER use purple/violet/indigo. NEVER use emojis anywhere in the UI.

## Gotchas

- `sdgs` must be sent to `/api/ai/generate-report` as STRINGS (`.map(String)`) — the API rejects numbers.
- Bump `STORAGE_KEY` in `state.ts` whenever the `GeneratedReport`/`AppState` shape changes, or stale localStorage will crash the report viewer.
- Do NOT change the OpenAPI `info.title`; it controls generated filenames.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
