import { NextResponse } from "next/server"
import { schedulerQuery } from "@/lib/db"

export async function GET() {
  try {
    const result = await schedulerQuery(
      `SELECT id, name, code, credits, "departmentId"
       FROM scheduler_schema.course
       ORDER BY name ASC`
    )
    return NextResponse.json({ data: result.rows })
  } catch (err: any) {
    console.error("GET /api/scheduler_schema/course error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}