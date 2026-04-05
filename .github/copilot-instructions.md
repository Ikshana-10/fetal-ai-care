## Purpose
Short, actionable guidance for AI coding agents working on this repo (frontend-only React + Vite app).

## Big-picture architecture (what to know first)
- Single-page React + TypeScript app bootstrapped with Vite (`src/main.tsx` → `src/App.tsx`).
- Client-side routing with React Router; protected routes use `AuthProvider` and the `useAuth` hook (`src/hooks/useAuth.tsx`, `src/App.tsx`).
- Data fetching/caching uses TanStack Query (`@tanstack/react-query`) via a top-level `QueryClientProvider`.
- Auth & persistence is handled by Supabase (see `src/integrations/supabase/client.ts`) — environment-driven (import.meta.env.VITE_SUPABASE_*) and uses localStorage.

## Where to look for common tasks / patterns
- UI primitives: `src/components/ui/*` (shadcn-like components). They use `class-variance-authority` + `cn` util from `src/lib/utils.ts` (example: `button.tsx`).
- Domain helpers: `src/lib/*` (e.g. `pregnancy-data.ts` contains deterministic domain logic used across pages).
- Pages: `src/pages/*` — each route is a page component; `App.tsx` wires routes and `ProtectedRoute`.
- Auth integration: `src/hooks/useAuth.tsx` and `src/integrations/supabase/client.ts` (do not edit the auto-generated comment in the client file).

## Dev / build / test commands (executable)
- Run dev server: `npm run dev` (Vite — host is configured to `::` and port `8080` in `vite.config.ts`).
- Build: `npm run build` (or `npm run build:dev` for dev-mode build).
- Preview production build: `npm run preview`.
- Lint: `npm run lint` (ESLint configured at repo root).
- Unit tests: `npm run test` (Vitest). Watch: `npm run test:watch`.
- End-to-end: Playwright is configured (`playwright.config.ts`, `playwright-fixture.ts`); run using `npx playwright test` (no package script present).

Note: repo contains a `bun.lock` — maintainers may prefer Bun, but package.json scripts are standard npm-compatible commands.

## Project-specific conventions and gotchas
- Aliases: imports use `@` → `src` (see `vite.config.ts`). Favor `@/` imports when editing across components.
- Component tagging: `-tagger` is enabled only in development via `vite.config.ts`. It may add dev-only markup/IDs — avoid relying on it in production code.
- Supabase env vars: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are required at runtime. Example `.env.local` keys:

  VITE_SUPABASE_URL=https://xxxxx.supabase.co
  VITE_SUPABASE_PUBLISHABLE_KEY=public-anon-xxxxx

- Auth contract: `useAuth()` throws if used outside `AuthProvider`. Use `AuthProvider` at app root (already wired in `App.tsx`).
- UI pattern: components expose both primitive exports and variant-driven APIs (see `button.tsx` using `cva` + `VariantProps`). Match this style when adding new shared controls.

## Integration points & where external config lives
- Supabase client: `src/integrations/supabase/client.ts` (reads VITE env keys).
- Tailwind config: `tailwind.config.ts` — content paths include `src/**/*` and `components/**/*` (update if you add files outside those globs).
- Vite aliases & dedupe list: `vite.config.ts` — update when adding packages that must be deduped.

## Suggested priorities for an AI agent when making changes
1. If touching auth or data fetching, update `src/hooks/useAuth.tsx` and tests in `test/` to cover session states.
2. For UI changes, follow existing `components/ui/*` patterns (use `cn`, `cva`, and `VariantProps`).
3. When adding new pages, register routes in `src/App.tsx` and ensure protected routes use `ProtectedRoute` if they require auth.

## Examples (copyable snippets)
- Import supabase: `import { supabase } from "@/integrations/supabase/client";`
- Protected route pattern (see `src/App.tsx`): use `useAuth()` and redirect to `/auth` when no user.

## If something is missing
- Read `src/App.tsx`, `src/hooks/useAuth.tsx`, and `src/integrations/supabase/client.ts` first — they capture the most important runtime contracts.

---
If you'd like, I can extend this with explicit examples for writing tests (Vitest + React Testing Library) or add a helper script to run Playwright in CI. What would you like me to add or clarify?
