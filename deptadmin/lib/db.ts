import { Pool } from "pg"

const connectionString = process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL

declare global {
  // allow global pooling in development to avoid too many clients during HMR
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined
}

let pool: Pool | undefined = global.__pgPool

function getPool(): Pool {
  if (!pool) {
    if (!connectionString) {
      throw new Error("Missing database connection string. Set NEON_DATABASE_URL or DATABASE_URL in environment.")
    }
    pool = new Pool({ connectionString })
    global.__pgPool = pool
  }
  return pool
}

export async function query(text: string, params?: any[]) {
  const p = getPool()
  return p.query(text, params)
}

export default { query }
