import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    // Extract facultyId from the pathname segments (dynamic route)
    const parts = req.nextUrl.pathname.split("/")
    // the path is .../faculty/[facultyId]/availability
    const idx = parts.findIndex((p) => p === "faculty")
    const facultyId = idx >= 0 && parts.length > idx + 1 ? parts[idx + 1] : null

    if (!facultyId) {
      return NextResponse.json({ error: "Missing facultyId in path" }, { status: 400 })
    }

    const res = await query(
      `SELECT * FROM faculty_schema."FacultyAvailability" WHERE "facultyId" = $1 ORDER BY id`,
      [facultyId]
    )

    // Map known FacultyAvailability columns to UI-friendly shape
    const availability = res.rows.map((r: any) => {
      const preferred = r.preferredSlot ?? r.preferred_slot ?? null
      const customStart = r.customStartTime ?? r.custom_start_time ?? r.customstarttime ?? null
      const customEnd = r.customEndTime ?? r.custom_end_time ?? r.customendtime ?? null
      const unavailableStart = r.unavailableStart ?? r.unavailable_start ?? null
      const unavailableEnd = r.unavailableEnd ?? r.unavailable_end ?? null

      // Determine day label (we'll use preferred slot as a high-level label)
      let dayLabel: string | null = null
      if (preferred) {
        // Normalize common values
        const up = String(preferred).toUpperCase()
        dayLabel = up === "ANY" ? "Any" : (String(preferred))
      }

      // Determine times string
      let times: string | null = null
      if (customStart && customEnd) {
        times = `${customStart} - ${customEnd}`
      } else if (customStart || customEnd) {
        times = `${customStart ?? customEnd}`
      } else if (preferred) {
        times = String(preferred)
      }

      // If no explicit info, expose unavailable window or a default placeholder
      if (!times && unavailableStart && unavailableEnd) {
        times = `Unavailable ${unavailableStart} - ${unavailableEnd}`
      }

      // Fall back to a generic 'Any' so the UI treats this as available (not empty)
      if (!times && !dayLabel) {
        dayLabel = "Any"
        times = "Any"
      }

      return {
        id: r.id,
        facultyId: r.facultyId ?? r["facultyId"] ?? r.faculty_id ?? null,
        preferredSlot: preferred ?? null,
        customStartTime: customStart ?? null,
        customEndTime: customEnd ?? null,
        unavailableStart: unavailableStart ?? null,
        unavailableEnd: unavailableEnd ?? null,
        notes: r.notes ?? null,
        createdAt: r.createdAt ?? r.created_at ?? null,
        updatedAt: r.updatedAt ?? r.updated_at ?? null,
        raw: r,
        day: dayLabel,
        times,
      }
    })

    return NextResponse.json({ data: availability })
  } catch (err) {
    console.error("GET /api/faculty_schema/faculty/[facultyId]/availability error:", err)
    const message = err instanceof Error ? err.message : String(err)
    const safe = /password|secret|token|dsn|connectionstring/i.test(message) ? "Database error" : message
    return NextResponse.json({ error: safe }, { status: 500 })
  }
}
