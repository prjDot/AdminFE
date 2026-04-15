# Paw Admin QA Checklist (Practical)

## 1) Architecture & Boundaries
- [x] Single web runtime entry (`index.html` + `src/main.tsx`) only
- [x] Legacy Bun/template entries removed from `src`
- [x] Layered import boundaries enforced via ESLint (`shared/features/widgets/pages`)
- [x] Vercel SPA rewrite configured for direct route access

## 2) Security & Secrets
- [x] No server secrets hardcoded in client defaults
- [x] No `alert`/`console.log` in production UI flow
- [ ] Auth/session persistence strategy defined (currently mock-only in-memory store)

## 3) Quality Gates
- [x] `bun run lint` passes with `--max-warnings=0`
- [x] `bun run typecheck` passes
- [x] `bun run build` passes
- [x] `bun run check` wired for deploy gate
- [x] ESLint `max-lines` gate applied to `src/pages/**/*` (140 lines)

## 4) UI/UX Consistency
- [x] Shared UI source unified to `src/shared/ui`
- [x] Form completion feedback rendered in-app (not browser alert)
- [ ] Full i18n coverage for all route screens and mock labels
- [x] `notices/reports` status + badge labels fully key-based i18n

## 5) Maintainability (LLOC & Smell)
- [x] High-risk screens split into sections (`dashboard`, `settings`, `notifications`)
- [x] Additional table-heavy screens (`users`, `notices`, `reports`, `community`) section split 완료
- [x] `notices`, `reports` table sections extracted (page composition-only 유지)
- [x] `users`, `community` table sections extracted (page composition-only 유지)
- [x] Randomized dashboard data replaced with deterministic fixture by timeframe

## 6) Accessibility Baseline
- [x] Label-control association lint rule enabled
- [x] No autofocus lint rule enabled
- [ ] Keyboard/screen-reader scenario testing evidence not documented

## Current Action Summary
- Completed in this iteration:
  - OTP screen i18n conversion
  - Dashboard deterministic chart fixture
  - ESLint 강화: random data generator ban (`Math.random`), import cycle rule
- Remaining next iteration:
  - Auth/session persistence contract
  - A11y test evidence (axe/lighthouse + keyboard path report)
