import { Pool } from "pg"

declare global {
  var __pgPools: Record<string, Pool> | undefined
}

if (!global.__pgPools) global.__pgPools = {}

function getPool(connectionString: string, key: string): Pool {
  if (!global.__pgPools![key]) {
    if (!connectionString) {
      throw new Error(`Missing database connection string for: ${key}`)
    }
    global.__pgPools![key] = new Pool({ connectionString })
  }
  return global.__pgPools![key]
}

// One named export per schema
export function facultyQuery(text: string, params?: any[]) {
  const cs = process.env.FACULTY_DATABASE_URL!
  return getPool(cs, "faculty").query(text, params)
}

export function courseQuery(text: string, params?: any[]) {
  const cs = process.env.COURSE_DATABASE_URL!
  return getPool(cs, "course").query(text, params)
}

export function facilitiesQuery(text: string, params?: any[]) {
  const cs = process.env.FACILITIES_DATABASE_URL!
  return getPool(cs, "facilities").query(text, params)
}

export function schedulerQuery(text: string, params?: any[]) {
  const cs = process.env.SCHEDULER_DATABASE_URL!
  return getPool(cs, "scheduler").query(text, params)
}

// Keep backward compat — defaults to faculty connection
export async function query(text: string, params?: any[]) {
  return facultyQuery(text, params)
}

export default { query, facultyQuery, courseQuery, facilitiesQuery, schedulerQuery }