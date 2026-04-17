import { NextResponse } from "next/server"
import { facultyQuery } from "@/lib/db"

// PATCH — accept or reject
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ assignmentId: string }> }
) {
    try {
        const { assignmentId } = await params
        const { status } = await req.json() // "ACCEPTED" or "REJECTED"

        const result = await facultyQuery(`
      UPDATE faculty_schema.faculty_course_assignments
      SET status = $1, responded_at = NOW()
      WHERE id = $2
      RETURNING id, status
    `, [status, assignmentId])

        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
        }

        return NextResponse.json({ data: result.rows[0] })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}