import { NextRequest, NextResponse } from "next/server"
import { facilitiesQuery as query } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const res = await query(`
      SELECT "id", "buildingId", "roomNumber", "floor", "capacity", "roomType", "currentStatus", "createdAt", "updatedAt"
      FROM facilities_schema.rooms
      ORDER BY "buildingId", "roomNumber"
    `)
    return NextResponse.json({ data: res.rows })
  } catch (err) {
    console.error("GET /api/facilities_schema/rooms error:", err)
    const message = err instanceof Error ? err.message : String(err)
    const safe = /password|secret|token|dsn|connectionstring/i.test(message) ? "Database error" : message
    return NextResponse.json({ error: safe }, { status: 500 })
  }
}
