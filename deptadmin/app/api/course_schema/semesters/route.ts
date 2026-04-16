import { NextResponse } from "next/server"
import { courseQuery } from "@/lib/db"

export async function GET() {
  try {
    const result = await courseQuery(
      `SELECT id, year, type FROM semesters ORDER BY year DESC`
    )
    return NextResponse.json({ data: result.rows })
  } catch (err: any) {
    console.error("GET /api/course_schema/semesters error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}