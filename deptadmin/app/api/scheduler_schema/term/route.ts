import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const res = await query(`
      SELECT "id", "code", "name", "startDate", "endDate", "isActive", "createdAt", "updatedAt"
      FROM scheduler_schema."Term"
      ORDER BY "startDate" DESC
    `)
    return NextResponse.json({ data: res.rows })
  } catch (err) {
    console.error("GET /api/scheduler_schema/term error:", err)
    const message = err instanceof Error ? err.message : String(err)
    const safe = /password|secret|token|dsn|connectionstring/i.test(message) ? "Database error" : message
    return NextResponse.json({ error: safe }, { status: 500 })
  }
}
