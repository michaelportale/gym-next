# Architecture

Status: draft v1 (2026-11-17). Codename `gym-next`; the product name is undecided.

An iPhone-first strength-training app for a small circle of people (the owner, a partner,
friends), with a public API that AI agents use the same way the app does.

## Goals

1. **Works with no signal.** Gyms have bad reception. Logging a set never waits on the network.
2. **One way to change data.** The app, the HTTP API and AI agents all go through the same
   validated mutations. There is no second write path to keep in sync.
3. **Private by construction.** A friend can only ever read a precomputed card, never your rows.
4. **Boring to run.** One process, one SQLite file, continuous backups, automatic HTTPS.

Non-goals for v1: web client, nutrition, body measurements, WHOOP/HealthKit, advanced
progression schemes, MCP write tools, horizontal scaling.

## System

```
 iPhone app (Expo)                 Server (one Node 24 process)            Agents
 ┌───────────────────┐   push      ┌──────────────────────────────┐        ┌─────────────┐
 │ UI reads local DB │ mutations   │ HTTP API (OpenAPI contract)  │◄───────│ MCP server  │
 │ expo-sqlite       │────────────►│  ├ auth: passkeys, sessions, │ scoped │ (thin, uses │
 │ mutation queue    │◄────────────│  │       scoped tokens       │ token  │  the API)   │
 │ core/ (same code) │  pull diffs │  ├ mutations (validated)     │        └─────────────┘
 └───────────────────┘  by cursor  │  ├ authz: one can() check    │
                                   │  ├ projections (friend card) │
                                   │  └ core/ (same code)         │
                                   │ SQLite (WAL) ─► Litestream ─► off-site backup
                                   └──────────────────────────────┘
                                     Caddy (auto HTTPS) · Docker · one small VPS
```

## Repository

npm workspaces, TypeScript everywhere, strict mode.

| Package   | What it is                                                                           | Runs on                                      |
| --------- | ------------------------------------------------------------------------------------ | -------------------------------------------- |
| `core/`   | Pure domain logic: units, exercises, sets, workouts, e1RM, progression, PRs. No I/O. | phone + server + tests                       |
| `server/` | HTTP API, auth, mutations, sync, projections, SQLite.                                | Node 24, `.ts` run directly (type stripping) |
| `mcp/`    | MCP server that calls the HTTP API with a scoped token.                              | Node 24                                      |
| `app/`    | The Expo iPhone app. Moves in at the end of P1 (see Migration).                      | iOS                                          |

TypeScript rules: `strict`, `erasableSyntaxOnly` (no enums, namespaces or parameter
properties, so Node can strip types without a build), relative imports carry `.ts`.
`tsc --noEmit` is the type check; nothing is compiled for the server.

## Data model (v1)

All ids are client-generated (UUIDv7) so the phone can create rows offline.

| Table                        | Key columns                                                                 |
| ---------------------------- | --------------------------------------------------------------------------- |
| `users`                      | id, display_name, unit (`kg`/`lb`), created_at                              |
| `credentials`                | user_id, kind (`passkey`/`password`), public data, created_at               |
| `sessions`                   | token hash, user_id, device name, expires_at                                |
| `api_tokens`                 | token hash, user_id, name, scopes (JSON), expires_at, revoked_at            |
| `exercises`                  | id, owner_id (NULL = catalogue), name, equipment, primary/secondary muscles |
| `routines` / `routine_items` | routine, ordered exercises with target sets/reps/load rule                  |
| `workouts` / `sets`          | a session; its sets (exercise, weight, reps, rir, completed_at)             |
| `friendships`                | user_a, user_b, status (`pending`/`accepted`), created_at                   |
| `friend_cards`               | user_id, card JSON, computed_at                                             |
| `mutations`                  | id, user_id, name, args, applied_seq, result                                |
| `changes`                    | seq (server-wide, monotonic), user_id, table, row_id, op                    |

## Mutations and sync

Every write is a named mutation defined once in `core/`:

```ts
defineMutation({
  name: 'logSet',
  args: LogSetArgs, // one schema: validation, OpenAPI and MCP tool input
  scope: 'workouts:write',
  apply(tx, args, ctx) {
    /* the only code that writes */
  },
})
```

**Push.** The phone records each mutation locally (applies it optimistically to its own DB and
queues it), then posts the queue. The server re-runs every mutation inside a transaction with
full validation and authorization, records it in `mutations` (idempotent by id), and appends
each touched row to `changes`.

**Pull.** The phone asks for changes since its cursor (`seq`). The server returns current rows
for everything touched since then, plus the new cursor. The phone writes them, then replays its
still-unacknowledged mutations on top (rebase). The server is the single ordering authority.

**Conflicts.** Logged sets are append-only and never conflict. Edits to routines and settings
resolve last-writer-wins per field in server order. Deletes are tombstones in `changes`.
Why not CRDTs: the only concurrent edits in this domain are routine edits by a person and an
agent; per-field last-writer-wins in server order is correct for that and needs no library.

The same mutation definitions generate the OpenAPI operations and the MCP tool schemas, so the
app, the API and the agents cannot drift apart.

## Auth and authorization

- **People:** passkeys (iOS Associated Domains, so this needs the public domain), with password
  as fallback. A session is an opaque token stored in the iOS keychain; only its hash is stored.
- **Agents:** scoped API tokens a person creates in the app (a recognisable prefix, 256 random
  bits, stored as SHA-256, expiry, revocable). Scopes are per category: `workouts`, `routines`,
  `bodyweight`, each `read` or `write`.
- **One permission check.** Every route and mutation calls `can(actor, action, resource)`. It
  is the only authorization code and has its own test table.

## Friends

Mutual and opt-in: one person makes a short-lived code, the other accepts, either can end it.
After every mutation that touches workouts, the server recomputes that user's `friend_cards`
row with `core/` (main-lift e1RM, recent PRs, streak, sessions per week). Friends can read
cards and nothing else; `can()` has no path from a friendship to `workouts` or `sets`.

## Operations

One Docker image; Caddy in front for HTTPS; SQLite in WAL mode; Litestream streams the database
to S3-compatible storage. GitHub Actions: typecheck, lint, test on every PR; a version tag
builds the iOS app and uploads it to TestFlight.

## Migration from openGym

- P1 rewrites the 28 domain modules `native/src/shared/training.js` imports from openGym's
  `frontend/src/lib`, as `core/` here, in this codebase's own design. Ideas and formulas (Epley,
  linear progression) are free to use; openGym's code and its exercise catalogue are not
  copied. The catalogue starts from yuhonas/free-exercise-db (Unlicense, 876 exercises).
- While P1 runs, the app stays in the openGym repo and is pointed at `core/` module by module;
  its existing tests check behaviour parity.
- When the app has no openGym imports left, it moves into `app/` with its own git history.
- Existing data (one user, eight workouts) is imported from `state-<uid>.json` by a script.

## Phases

| Phase | Delivers                                                                                                                       |
| ----- | ------------------------------------------------------------------------------------------------------------------------------ |
| P0    | Repo, TypeScript setup, CI, this document, `core/` and `server/` skeletons                                                     |
| P1    | `core/`: units, exercises + catalogue, sets/workouts, e1RM, linear and double progression, PRs; then the app moves into `app/` |
| P2    | `server/`: schema + migrations, auth, mutations, push/pull sync, OpenAPI                                                       |
| P3    | Scoped tokens, `mcp/` with read tools                                                                                          |
| P4    | Friends: codes, cards, revoke                                                                                                  |
| P5    | App switched to the new sync; data imported; deployed publicly; demo account                                                   |
