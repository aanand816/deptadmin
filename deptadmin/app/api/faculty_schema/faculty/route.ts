import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const res = await query(`
      SELECT f."id", f."userId", f."employeeId", f."designation", f."departmentId", f."status", f."createdAt", f."updatedAt",
             u.name AS user_name, u.email AS user_email
      FROM faculty_schema."Faculty" f
      LEFT JOIN faculty_schema."User" u ON f."userId" = u.id
      ORDER BY u.name NULLS LAST, f."id"
    `)
    return NextResponse.json({ data: res.rows })
  } catch (err) {
    console.error("GET /api/faculty_schema/faculty error:", err)
    const message = err instanceof Error ? err.message : String(err)
    const safe = /password|secret|token|dsn|connectionstring/i.test(message) ? "Database error" : message
    return NextResponse.json({ error: safe }, { status: 500 })
  }
}
