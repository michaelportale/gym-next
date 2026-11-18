import http from 'node:http'
import type { DatabaseSync } from 'node:sqlite'
import type { Unit } from '@gym-next/core'

export const DEFAULT_UNIT: Unit = 'kg'

export interface AppOptions {
  db: DatabaseSync
  version: string
}

function send(res: http.ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify(body))
}

export function createApp({ db, version }: AppOptions): http.Server {
  return http.createServer((req, res) => {
    const { pathname } = new URL(req.url ?? '/', 'http://localhost')
    if (req.method === 'GET' && pathname === '/health') {
      try {
        db.prepare('SELECT 1').get()
        send(res, 200, { ok: true, version, db: 'ok', unit: DEFAULT_UNIT })
      } catch {
        send(res, 503, { ok: false, db: 'error' })
      }
      return
    }
    send(res, 404, { error: 'not_found' })
  })
}
