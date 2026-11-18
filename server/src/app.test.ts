import { mkdtempSync, rmSync } from 'node:fs'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { DatabaseSync } from 'node:sqlite'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from './app.ts'
import { openDatabase, schemaVersion } from './db.ts'

describe('server', () => {
  let dir: string
  let db: DatabaseSync
  let server: Server
  let base: string

  beforeEach(async () => {
    dir = mkdtempSync(join(tmpdir(), 'gym-next-'))
    db = openDatabase(join(dir, 'app.db'))
    server = createApp({ db, version: '1.2.3' })
    await new Promise<void>((resolve) => server.listen(0, resolve))
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  })

  afterEach(async () => {
    await new Promise((resolve) => server.close(resolve))
    db.close()
    rmSync(dir, { recursive: true, force: true })
  })

  it('opens the database in WAL mode', () => {
    const row = db.prepare('PRAGMA journal_mode').get()
    expect(row?.journal_mode).toBe('wal')
    expect(schemaVersion(db)).toBe(0)
  })

  it('serves /health', async () => {
    const res = await fetch(`${base}/health`)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('application/json')
    expect(await res.json()).toEqual({ ok: true, version: '1.2.3', db: 'ok', unit: 'kg' })
  })

  it('returns 503 when the database is closed', async () => {
    db.close()
    const res = await fetch(`${base}/health`)
    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ ok: false, db: 'error' })
    db = openDatabase(join(dir, 'app.db'))
  })

  it('returns 404 for unknown paths', async () => {
    const res = await fetch(`${base}/nope`)
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'not_found' })
  })
})
