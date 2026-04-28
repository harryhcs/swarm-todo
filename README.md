# swarm-todo

A minimal todo app built on [RedwoodSDK](https://rwsdk.com) (React Server Components + Cloudflare Workers + D1).

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.0
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) (installed via dev dependencies)
- A Cloudflare account with D1 enabled (for deploy only)

## Develop

Install dependencies and start the dev server:

```bash
bun install
bun run dev
```

The app is available at <http://localhost:5173>.

The dev server uses a local D1 SQLite database (`.wrangler/state/`). Run migrations before first use:

```bash
bun run migrate:local
```

## Run migrations locally

Apply all pending migrations to the local D1 database:

```bash
bun run migrate:local
```

Migrations live in `src/db/migrations/`. To generate a new migration from schema changes:

```bash
bun run drizzle:generate
```

## Deploy to Cloudflare

1. Create a D1 database in Cloudflare and copy its `database_id` into `wrangler.jsonc`.

2. Apply migrations to the remote database:

```bash
bun run migrate:remote
```

3. Deploy the worker:

```bash
bun run deploy
```

## Quality gates

```bash
bun test          # unit tests
bun run lint      # ESLint (zero warnings)
bun run typecheck # TypeScript
```
