import { mkdirSync, readFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { createApp } from './app.ts'
import { openDatabase } from './db.ts'

const port = Number(process.env.PORT ?? 3000)
const databasePath = process.env.DATABASE_PATH ?? './data/app.db'
const { version } = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
) as { version: string }

mkdirSync(dirname(databasePath), { recursive: true })
const db = openDatabase(databasePath)
const server = createApp({ db, version })

server.listen(port, () => {
  console.log(`gym-next server listening on :${port}`)
})
