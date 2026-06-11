---
name: Subagent early returns on large builds
description: Large delegated DESIGN/general builds can return early with no edits; how to make them actually finish.
---

# Subagent early returns on large builds

A large delegated build (e.g. a full multi-file frontend rebuild) can come back "successful" having only **reviewed/outlined** the work and made **zero edits**, citing a low effort/budget constraint.

**How to apply:** For any big delegated implementation:
- Prepend a hard mandate to the brief: "You MUST fully implement and write every file. Do NOT return early or just outline — that is a failure. Keep working until <objective check> passes."
- Give a concrete per-file checklist of exactly what to change.
- Give a machine-checkable finish criterion (e.g. "`pnpm --filter @workspace/<slug> run typecheck` passes with zero errors").
- After it returns, always independently verify (typecheck + git status) rather than trusting the success message — the first attempt's "success" had no diff.

**Why:** On the ImpactLabs rebuild, the first DESIGN subagent returned a polished outline and changed nothing; a relaunch with an explicit completion mandate + file checklist + typecheck finish-criterion completed it correctly.
