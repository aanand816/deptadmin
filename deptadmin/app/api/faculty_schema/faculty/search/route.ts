import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const name = req.nextUrl.searchParams.get("name")?.trim()
    const userId = req.nextUrl.searchParams.get("userId")?.trim()

    if (!name && !userId) {
      return NextResponse.json({ error: "Provide query param 'name' or 'userId'" }, { status: 400 })
    }

    let res
    if (userId) {
      res = await query(
        `SELECT f.*, u.name AS user_name, u.email AS user_email
         FROM faculty_schema."Faculty" f
         JOIN faculty_schema."User" u ON f."userId" = u.id
         WHERE f."userId" = $1
         LIMIT 1`,
        [userId]
      )
    } else {
      // case-insensitive partial match on user.name
      const like = `%${name}%`
      res = await query(
        `SELECT f.*, u.name AS user_name, u.email AS user_email
         FROM faculty_schema."Faculty" f
         JOIN faculty_schema."User" u ON f."userId" = u.id
         WHERE u.name ILIKE $1
         ORDER BY u.name
         LIMIT 50`,
        [like]
      )
    }

    return NextResponse.json({ data: res.rows })
  } catch (err) {
    console.error("GET /api/faculty_schema/faculty/search error:", err)
    const message = err instanceof Error ? err.message : String(err)
    const safe = /password|secret|token|dsn|connectionstring/i.test(message) ? "Database error" : message
    return NextResponse.json({ error: safe }, { status: 500 })
  }
}
