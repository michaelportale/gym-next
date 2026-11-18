# gym-next

An iPhone-first strength-training app for a small circle of people (the owner, a partner,
friends), with a public API that AI agents use the same way the app does. Logging a set never
waits on the network, every change goes through the same validated mutations, and friends only
ever read a precomputed card, never your rows.

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
