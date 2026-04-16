import { NextResponse } from "next/server"
import { schedulerQuery } from "@/lib/db"

export async function GET() {
  try {
    const result = await schedulerQuery(
      `SELECT id, name, "startDate", "endDate", "isActive"
       FROM term ORDER BY "startDate" DESC`
    )
    return NextResponse.json({ data: result.rows })
  } catch (err: any) {
    console.error("GET /api/scheduler_schema/term error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}