import { NextResponse } from "next/server"
import { facultyQuery } from "@/lib/db"

// GET — load all assignments for the dashboard queue
export async function GET() {
    try {
        const result = await facultyQuery(`
      SELECT 
        fca.id            AS "assignmentId",
        fca.faculty_id    AS "facultyId",
        u."name"          AS "facultyName",
        fca.request_title AS "course",
        fca.day_of_week   AS "day",
        fca.start_time    AS "startTime",
        fca.end_time      AS "endTime",
        fca.term_label    AS "term",
        fca.status,
        fca.assigned_at   AS "assignedAt"
      FROM faculty_schema.faculty_course_assignments fca
      LEFT JOIN faculty_schema."User" u ON u.id = fca.faculty_id
      ORDER BY fca.assigned_at DESC
    `)
        return NextResponse.json({ data: result.rows })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

// POST — create new assignment
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const {
            facultyId, requestTitle, courseId, termLabel,
            academicYear, semester, section, program,
            dayOfWeek, startTime, endTime, classType, assignedBy
        } = body

        const result = await facultyQuery(`
      INSERT INTO faculty_schema.faculty_course_assignments
        (id, faculty_id, request_title, course_id, term_label, academic_year,
         semester, section, program, day_of_week, start_time, end_time,
         class_type, status, assigned_by)
      VALUES
        (gen_random_uuid()::text, $1, $2, $3, $4, $5,
         $6, $7, $8, $9, $10, $11,
         $12, 'PENDING', $13)
      RETURNING id
    `, [
            facultyId, requestTitle, courseId, termLabel, academicYear,
            semester, section, program, dayOfWeek, startTime, endTime,
            classType ?? 'LECTURE', assignedBy
        ])

        return NextResponse.json({ data: result.rows[0] })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}