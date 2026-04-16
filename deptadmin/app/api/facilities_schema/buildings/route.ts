import { NextRequest, NextResponse } from "next/server"
import { facilitiesQuery as query } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const res = await query(`
      SELECT "id", "campusId", "name", "buildingCode", "mapLatitude", "mapLongitude", "createdAt", "updatedAt"
      FROM facilities_schema.buildings
      ORDER BY "name"
    `)
    return NextResponse.json({ data: res.rows })
  } catch (err) {
    console.error("GET /api/facilities_schema/buildings error:", err)
    const message = err instanceof Error ? err.message : String(err)
    const safe = /password|secret|token|dsn|connectionstring/i.test(message) ? "Database error" : message
    return NextResponse.json({ error: safe }, { status: 500 })
  }
}
