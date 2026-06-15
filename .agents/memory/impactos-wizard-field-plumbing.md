---
name: ImpactLabs wizard field plumbing
description: Why a new wizard input can be captured in the UI yet have zero effect on the generated AI report.
---

A new wizard input in ImpactLabs (artifacts/impact-os) only influences the generated report if it is plumbed through **three** layers, not one:

1. The step component writes it into `AppState` (state.ts).
2. The client payload builders actually send it — `Step5Preview.handleGenerate` (report) and `Step3TheoryOfChange.handleGenerate` (theory).
3. The server prompt in `artifacts/api-server/src/routes/ai.ts` actually **references** the field inside the prompt `context` string.

**Why:** A field can be present in the OpenAPI contract (`ReportInput`) and pass Zod validation while the prompt builder silently ignores it. `sdgChanges` was sent and validated but never read by `/ai/generate-report`, so commercial focus-area selections were cosmetic only — captured, persisted, shareable, but invisible to the model.

**How to apply:** When adding/repurposing any wizard input that should shape AI output, grep `ai.ts` to confirm the field name appears in the prompt `context`/`adaptation` text. Prefer emitting clean human-readable strings (see `lib/focus.ts` `buildFocusStrings`) rather than dumping raw `Record` entries — internal storage keys like `__commercial_areas__` / `comm_<id>` must never leak into prompts.
