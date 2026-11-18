# AGENTS.md

gym-next: iPhone-first strength-training app plus a public API for AI agents. Status: P0 scaffold.
Design is in `docs/ARCHITECTURE.md` (authoritative; read it before structural changes).

## Commands (Node 24, from the repo root)

| Task                                                           | Command                                                     |
| -------------------------------------------------------------- | ----------------------------------------------------------- |
| Install                                                        | `npm install`                                               |
| Full check (typecheck, lint, tests)                            | `npm run check`                                             |
| Tests                                                          | `npm test`                                                  |
| Typecheck                                                      | `npm run typecheck`                                         |
| Lint                                                           | `npm run lint`                                              |
| Format (writes files)                                          | `npm run format`                                            |
| Regenerate catalogue (CI never downloads; output is committed) | `npm run catalogue`                                         |
| Start server                                                   | `PORT=3000 DATABASE_PATH=./data/app.db npm start -w server` |

## Layout

```
core/     pure domain logic (units, ids, exercises, e1RM); no I/O, no Node APIs (tsconfig has types: [])
server/   node:http API + node:sqlite; .ts run directly by Node (type stripping)
mcp/      planned: MCP server over the HTTP API
app/      planned: Expo iPhone app
scripts/  repo tooling; build-catalogue.ts regenerates core/src/catalogue.json
docs/     ARCHITECTURE.md
```

## Rules

- TypeScript strict + `erasableSyntaxOnly`: no enums, namespaces or parameter properties.
- Relative imports end in `.ts`.
- `core/` does no I/O and imports no `node:*` modules.
- From P2, every write goes through a validated mutation (see ARCHITECTURE.md).
- Tests live beside the code as `*.test.ts`.
- New dependencies only with the owner's OK, and only versions published at least 7 days ago.
- Never copy code or data from openGym; ideas and formulas are fine.
- Commit subjects: `area: lowercase summary`; areas `core`, `server`, `mcp`, `app`, `docs`, `repo`, `ci`.
