import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const res = await query(`
      SELECT "id", "code", "name", "createdAt", "updatedAt"
      FROM scheduler_schema."Department"
      ORDER BY "name"
    `)
    return NextResponse.json({ data: res.rows })
  } catch (err) {
    console.error("GET /api/scheduler_schema/department error:", err)
    const message = err instanceof Error ? err.message : String(err)
    const safe = /password|secret|token|dsn|connectionstring/i.test(message) ? "Database error" : message
    return NextResponse.json({ error: safe }, { status: 500 })
  }
}
