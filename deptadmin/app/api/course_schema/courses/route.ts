import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const res = await query(`
      SELECT id, name, code, description, credits, lecture_hours, lab_hours, status, program_id, course_kind, elective_group_id, program_semester_id, created_at, updated_at
      FROM course_schema.courses
      ORDER BY code
    `)
    return NextResponse.json({ data: res.rows })
  } catch (err) {
    console.error("GET /api/course_schema/courses error:", err)
    const message = err instanceof Error ? err.message : String(err)
    const safe = /password|secret|token|dsn|connectionstring/i.test(message) ? "Database error" : message
    return NextResponse.json({ error: safe }, { status: 500 })
  }
}
