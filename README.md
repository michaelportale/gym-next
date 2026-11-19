# gym-next

An iPhone-first strength-training app for a small circle of people (the owner, a partner,
friends), with a planned public API that AI agents will use the same way the app does.

That is the design, not the current state. What exists today is `core/` (units, ids, an exercise
catalogue, set and workout types, estimated 1RM) and a server skeleton with one route,
`GET /health`. Still planned, per [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): the iPhone app,
logging a set without waiting on the network, validated mutations and sync for every change,
scoped tokens and an MCP server for agents, and friends who only ever read a precomputed card,
never your rows.

Status: **P0: scaffold**. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the design.

## Requirements

- Node 24 (see `.nvmrc`)

## Commands

| Task                                        | Command                                              |
| ------------------------------------------- | ---------------------------------------------------- |
| Install                                     | `npm install`                                        |
| Everything CI runs (typecheck, lint, tests) | `npm run check`                                      |
| Tests                                       | `npm test`                                           |
| Typecheck                                   | `npm run typecheck`                                  |
| Lint                                        | `npm run lint`                                       |
| Format (writes files)                       | `npm run format`                                     |
| Start the server                            | `npm start -w server` (env: `PORT`, `DATABASE_PATH`) |
