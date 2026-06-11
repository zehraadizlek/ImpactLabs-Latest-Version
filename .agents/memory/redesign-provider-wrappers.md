---
name: Redesign drops provider wrappers
description: Visual redesigns of App.tsx can drop context providers, crashing hooks on later screens.
---

When a design pass rewrites the root `App.tsx`, the `return` JSX can lose its context provider wrappers (e.g. `QueryClientProvider`, `TooltipProvider`) even while the `queryClient` is still constructed and the imports remain. TypeScript and the initial render stay green because the missing provider only matters once a component that uses the relevant hook mounts.

**Why:** In ImpactOS/ImpactLabs, a redesign rewrote `App.tsx` and rendered the wizard tree directly without `<QueryClientProvider>`. Steps 0–2 rendered fine; Step 3's `useGenerateTheoryOfChange` (React Query) crashed with "No QueryClient set" only when that step mounted.

**How to apply:** After any redesign that touches the root app component, confirm the JSX still wraps children in every required provider, and smoke-test the screen(s) that actually call data/query hooks — not just the landing screen.
