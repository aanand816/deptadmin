import { NextResponse } from "next/server"
import { courseQuery } from "@/lib/db"

export async function GET() {
  try {
    const result = await courseQuery(
      `SELECT * FROM course_schema.courses ORDER BY name ASC`
    )
    return NextResponse.json({ data: result.rows })
  } catch (err: any) {
    console.error("GET /api/course_schema/courses error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}