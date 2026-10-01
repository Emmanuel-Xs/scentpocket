import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { getServerEnv } from '#/lib/env'
import * as schema from './schema'

let db: ReturnType<typeof createDb> | undefined

function createDb() {
  // Transaction pooler (:6543) does not support prepared statements.
  const client = postgres(getServerEnv().DATABASE_URL, { prepare: false })
  return drizzle(client, { schema })
}

/** Server only. Lazy so importing it never needs env at build time. */
export function getDb() {
  db ??= createDb()
  return db
}

export type Db = ReturnType<typeof getDb>
