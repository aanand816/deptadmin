import { NextResponse } from "next/server"
import { facultyQuery } from "@/lib/db"

export async function GET(
    _req: Request,
    { params }: { params: { facultyId: string } }
) {
    try {
        const result = await facultyQuery(
            `SELECT id, "facultyId", "dayOfWeek", "startTime", "endTime"
       FROM availability
       WHERE "facultyId" = $1
       ORDER BY "dayOfWeek" ASC`,
            [params.facultyId]
        )
        return NextResponse.json({ data: result.rows })
    } catch (err: any) {
        console.error("GET /api/faculty_schema/availability error:", err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}