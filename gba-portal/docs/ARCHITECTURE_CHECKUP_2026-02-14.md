# Architecture Checkup — 2026-02-14

## Priority Findings

### P0

- Legacy mock/localStorage still active in dashboard modules (`licences`, `stock`, `staff`, `categories`, `competitions`, `relances`).
- Very large page files (notably `dashboard/tactique`, `equipements`, `stock`, `staff`) increase regression risk.
- Runtime inconsistency during dev due to multiple concurrent next-server processes.
- Next.js warning from deprecated `middleware` convention (migrated to `proxy.ts`).

### P1

- Navigation semantics: coach flow improved but module naming and grouping still in transition.
- Public homepage messaging/design consistency can be improved with tighter hierarchy and proof blocks.
- `/shop` and `/boutique` overlap remains to be rationalized.

## Immediate Actions Applied

- Migrated auth/ACL gate to `src/proxy.ts` (Next.js 16-compatible convention).
- Added `scripts/dev-reset.sh` to safely restart dev runtime and avoid stale process confusion.

## Proposed Refactor Sequence

1. DB-first migration: replace localStorage/mock for `licences`, `stock`, `staff`.
2. Split monolithic pages into feature components + server query helpers.
3. Unify match domain (`/dashboard/match` parent + composition/convocations).
4. Public IA cleanup and `/shop`/`/boutique` merge strategy.
