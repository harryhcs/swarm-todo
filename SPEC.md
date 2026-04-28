# Todo App — Spec

A minimal, production-shaped todo app on **RedwoodSDK** (React Server Components + Cloudflare Workers + D1).
Built and maintained by Overstory-orchestrated coding agents.

This file is the source of truth for *what* we are building. Implementation details are decided per-task in Seeds.

---

## 1. Goals

- A user can add, complete, and delete todos in a browser.
- State persists across reloads via Cloudflare D1.
- The app is server-rendered: the initial HTML contains the current todos.
- The codebase is small, typed end-to-end, and passes all quality gates from a fresh clone.

## 2. Non-goals

- No authentication or multi-user support.
- No real-time sync across tabs or devices.
- No deployment automation; deploy is a manual `bun run deploy`.
- No mobile app, no offline mode, no push notifications.
- No drag-to-reorder, no sub-tasks, no due dates, no tags.

## 3. Users & primary flow

The user is a single individual on their own laptop or a deployed Cloudflare Worker.

The primary flow:

1. Open the app at `/`.
2. Type a todo title and submit the form.
3. The new todo appears at the top of the list.
4. Click the checkbox to mark it complete; completed todos render with a strikethrough.
5. Click the delete button to remove it.
6. Reload the page — the list is unchanged.

## 4. Architecture

- **Runtime**: Cloudflare Workers via RedwoodSDK.
- **UI**: React 19 with Server Components (server-first rendering), client components for interactive bits.
- **Data**: Cloudflare D1 (SQLite) accessed through Drizzle ORM.
- **Mutations**: RedwoodSDK server functions (no separate REST/GraphQL layer).
- **Build**: Vite via the RedwoodSDK plugin. `bun` for package management and scripts.

## 5. Data model

Single table, `todos`:

| Column       | Type    | Constraints              | Notes                              |
| ------------ | ------- | ------------------------ | ---------------------------------- |
| `id`         | text    | primary key              | `crypto.randomUUID()` at insert    |
| `title`      | text    | not null, 1–200 chars    | Trimmed on insert                  |
| `completed`  | integer | not null, default `0`    | `0 = false`, `1 = true`            |
| `created_at` | integer | not null                 | Unix epoch milliseconds            |

Indexes: none required at this scale.

`Todo` row type is exported from `src/db/schema.ts` via Drizzle's `InferSelectModel`.

## 6. Server functions

All in `src/server/todos.ts`, annotated as RedwoodSDK server functions, with the D1 binding read from the request env:

| Function                         | Returns        | Behaviour                                              |
| -------------------------------- | -------------- | ------------------------------------------------------ |
| `listTodos()`                    | `Todo[]`       | All rows, ordered by `created_at` desc.                |
| `createTodo(title: string)`      | `Todo`         | Validates and inserts; returns the new row.            |
| `toggleTodo(id: string)`         | `Todo`         | Flips `completed` for the given id; returns new row.   |
| `deleteTodo(id: string)`         | `void`         | Deletes by id; idempotent (no error if missing).       |

### Validation

- `title` after trim must be 1–200 chars; otherwise throw `ValidationError("title must be 1-200 chars")`.
- `id` must look like a UUID; otherwise throw `ValidationError("invalid id")`.

### Errors

- `ValidationError` is a typed class exported from `src/server/errors.ts`.
- Server functions never leak D1 internals to the client. Wrap unexpected errors as `InternalError("could not …")` with the original error logged server-side.

## 7. UI components

All under `src/app/components/`.

- **`TodoList.tsx`** — async server component. Calls `listTodos()` and renders `<TodoItem />` per row. Empty state: `"No todos yet — add one above."`
- **`TodoForm.tsx`** — `"use client"`. Controlled `<input>` + submit button. On submit: trim, call `createTodo`, clear the input, refresh the list.
- **`TodoItem.tsx`** — `"use client"`. Checkbox bound to `completed`, calls `toggleTodo`. Delete button calls `deleteTodo`. Both use React 19 `useOptimistic` so the UI updates before the round-trip resolves.

### Visual & a11y rules

- Tailwind utility classes only; no custom CSS files.
- Every input has an associated `<label>` (visually hidden if needed).
- Visible focus rings (`focus-visible:ring-2`).
- Colour contrast ≥ AA against the chosen background.
- Buttons have discernible names (`aria-label` where icon-only).

## 8. Routing

One route: `GET /`. Renders `<TodoForm />` above `<TodoList />`. Page title is `Todos`. No client-side router needed.

## 9. Quality gates (must pass before merge)

| Gate         | Command                  | Standard                       |
| ------------ | ------------------------ | ------------------------------ |
| Tests        | `bun test`               | All green; no `.skip`.         |
| Lint         | `bun run lint`           | Zero errors, zero warnings.    |
| Typecheck    | `bun run typecheck`      | No TypeScript errors.          |

These match `.overstory/config.yaml > project.qualityGates`.

## 10. Testing strategy

- **Unit**: server functions tested against an in-memory SQLite via `better-sqlite3`. Cover happy path, validation failures, toggle semantics, idempotent delete.
- **Component**: not required for v1. Skip Vitest component tests unless behaviour is non-trivial.
- **Manual smoke (in the merge task)**: `bun run dev`, add 3 todos, toggle 1, delete 1, reload — state preserved.

## 11. Acceptance for v1

The epic is "done" when **all** of the following are true on `main`:

- `bun install && bun run dev` produces a working app at `http://localhost:5173`.
- All three quality gates pass.
- A user can complete the primary flow (§3) without console errors.
- `curl -s http://localhost:5173/ | grep -i '<h1>Todos'` returns a match (proves SSR).
- After `bun run dev` is restarted, previously-added todos are still visible (proves D1 persistence).
- README documents: develop, run migrations locally, deploy to Cloudflare.

## 12. Out of scope (parking lot for v2+)

- Auth (Cloudflare Access or `@auth/core`).
- Multi-tab live sync via RedwoodSDK `useSyncedState`.
- Filtering (`all` / `active` / `completed`).
- Editing a todo's title in place.
- Keyboard shortcuts.
- Deploy automation (GitHub Actions → `wrangler deploy`).

## 13. References

- RedwoodSDK docs: <https://docs.rwsdk.com/>
- Cloudflare D1: <https://developers.cloudflare.com/d1/>
- Drizzle (D1 dialect): <https://orm.drizzle.team/docs/get-started/d1-new>
- This project's Overstory config: `.overstory/config.yaml`
- Task tracker: `.seeds/` (use `sd ready` to see what's pickable)