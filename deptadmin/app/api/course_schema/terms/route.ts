import { NextRequest, NextResponse } from "next/server"
import { courseQuery } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const res = await courseQuery(`
      SELECT id, semester_id, course_id, created_at
      FROM course_schema.terms
      ORDER BY id
    `)
    return NextResponse.json({ data: res.rows })
  } catch (err) {
    console.error("GET /api/course_schema/terms error:", err)
    const message = err instanceof Error ? err.message : String(err)
    const safe = /password|secret|token|dsn|connectionstring/i.test(message) ? "Database error" : message
    return NextResponse.json({ error: safe }, { status: 500 })
  }
}
