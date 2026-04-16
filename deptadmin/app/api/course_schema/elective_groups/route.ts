import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const res = await query(`
      SELECT id, program_semester_id, choose_count, label, created_at, updated_at
      FROM course_schema.elective_groups
      ORDER BY id
    `)
    return NextResponse.json({ data: res.rows })
  } catch (err) {
    console.error("GET /api/course_schema/elective_groups error:", err)
    const message = err instanceof Error ? err.message : String(err)
    const safe = /password|secret|token|dsn|connectionstring/i.test(message) ? "Database error" : message
    return NextResponse.json({ error: safe }, { status: 500 })
  }
}
