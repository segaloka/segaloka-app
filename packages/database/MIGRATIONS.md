# Segaloka Database Migration Policy

`@segaloka/database` is the single migration authority for Segaloka.

## Authoritative paths

- Drizzle configuration: `drizzle.config.ts`
- Schema aggregation entry point: `src/schema.ts`
- Generated migration artifacts: `drizzle/`
- Database tooling configuration boundary: `tooling/database-config.ts`

## Commands

Run migration commands from the `@segaloka/database` workspace package:

- `pnpm --filter @segaloka/database db:generate`
- `pnpm --filter @segaloka/database db:check`
- `pnpm --filter @segaloka/database db:migrate`

## Rules

1. Schema changes are introduced incrementally by vertical slice.
2. Generated SQL migration artifacts are reviewed and committed to Git.
3. `drizzle-kit push` is not an approved schema deployment path.
4. Applications and workers must never execute migrations during startup.
5. Migration execution is an explicit deployment or operator action.
6. Production migrations use the same authoritative `drizzle.config.ts`.
7. `DATABASE_URL` must pass the canonical `@segaloka/config` validation boundary.
8. Runtime code under `src/` must not read database environment variables directly.
9. Migration history is append-only after a migration has been applied to a shared environment.
10. Existing applied migrations must not be silently rewritten or deleted.

## Expand-contract policy

Backward-compatible database evolution follows this sequence:

1. Expand the schema.
2. Deploy code that can operate across the compatibility window.
3. Backfill data when required.
4. Switch reads and writes to the new representation.
5. Observe correctness and operational health.
6. Contract obsolete schema only after compatibility is no longer required.

Destructive changes require an explicit rollout and rollback plan.

## Deployment safety

A migration must not be treated as successful only because the command exited successfully. Deployment procedures must also verify application compatibility, migration state, and operational health.

Database migration execution is not part of application startup.
