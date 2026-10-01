import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { getServerEnv } from '#/lib/env'
import * as schema from './schema'

let db: ReturnType<typeof createDb> | undefined

function createDb() {
  // Transaction pooler (:6543): no prepared statements. A pool of 3 (not 1) so parallel queries
  // from one request each get their own connection; pipelining several queries down a single
  // pooled connection stalled intermittently. Short idle and lifetime limits keep serverless
  // instances from holding pooler connections.
  const client = postgres(getServerEnv().DATABASE_URL, {
    prepare: false,
    max: 3,
    idle_timeout: 20,
    max_lifetime: 60 * 5,
    connect_timeout: 15,
  })
  return drizzle(client, { schema })
}

/** Server only. Lazy so importing it never needs env at build time. */
export function getDb() {
  db ??= createDb()
  return db
}

export type Db = ReturnType<typeof getDb>
