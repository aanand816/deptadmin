import { NextResponse } from "next/server"
import { courseQuery } from "@/lib/db"

export async function GET() {
  try {
    const result = await courseQuery(
      `SELECT
         c.id, c.name, c.code, c.credits, c.status,
         c.department_id, c.program_id,
         d.name AS department_name,
         p.name AS program_name
       FROM courses c
       LEFT JOIN departments d ON d.id = c.department_id
       LEFT JOIN programs    p ON p.id = c.program_id
       ORDER BY c.name ASC`
    )
    return NextResponse.json({ data: result.rows })
  } catch (err: any) {
    console.error("GET /api/course_schema/courses error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}