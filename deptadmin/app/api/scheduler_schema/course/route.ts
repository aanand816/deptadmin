import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const res = await query(`
      SELECT "id", "code", "title", "creditHours", "requiredRoomType", "departmentId", "createdAt", "updatedAt"
      FROM scheduler_schema."Course"
      ORDER BY "code"
    `)
    return NextResponse.json({ data: res.rows })
  } catch (err) {
    console.error("GET /api/scheduler_schema/course error:", err)
    const message = err instanceof Error ? err.message : String(err)
    const safe = /password|secret|token|dsn|connectionstring/i.test(message) ? "Database error" : message
    return NextResponse.json({ error: safe }, { status: 500 })
  }
}
