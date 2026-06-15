---
name: Persisted/shared report must be validated before render
description: ImpactOS loadState merges untrusted state; report renderer maps nested arrays unconditionally, so partial reports crash.
---

`loadState()` (impact-os `src/lib/state.ts`) shallow-merges untrusted persisted/shared
state — both the URL `#hash` and `localStorage` — straight into `AppState`. The report
renderer (`ReportViewer.tsx`) and the exporters (`exports.ts`) `.map()` / `.length` /
`.toLocaleString()` over `GeneratedReport`'s nested arrays and numeric fields
**unconditionally**. So a *truthy but incomplete* report (old shape, truncated, or
hand-crafted hash) white-screens the whole app — a `!!state.generatedReport` check is
not enough.

**Rule:** every field the renderer/exporter dereferences must be covered by the
load-time gate `isValidReport()`, which deep-checks all top-level sections, the nested
arrays inside programs/dashboard/beneficiaryImpact/theoryOfChange/challengesLearnings/
futureCommitments/appendix, and that numeric chart fields (`progressBars.current/target`,
`geographic.value`) are real numbers. `loadState` drops any report failing the gate to
`null` (wizard inputs preserved); the user then sees the generate UI instead of a crash.

**Why:** the merge boundary trusts external data, and the renderer assumes a complete
shape. Adding a new rendered field without extending the gate reopens this crash class.

**How to apply:** when adding/removing fields on `GeneratedReport` that ReportViewer or
exports.ts read, update `isValidReport` in lockstep. Also keep the share-link codec
symmetric: `generateShareUrl` encodes `btoa(unescape(encodeURIComponent(json)))`, so the
hash decoder must mirror it with `decodeURIComponent(escape(atob(hash)))` (plain `atob`
fallback) or Turkish/non-ASCII content mojibakes or throws.
