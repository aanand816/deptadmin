import { NextResponse } from "next/server"
import { facultyQuery } from "@/lib/db"
import { hashPassword, initAuthTable } from "@/lib/auth"

const DEFAULT_USERS = [
  { name: "Dev Patel",      email: "dev@archie.edu",   password: "Admin@1234", role: "admin" },
  { name: "Jane Smith",     email: "jane@archie.edu",  password: "Admin@1234", role: "admin" },
  { name: "Mark Johnson",   email: "mark@archie.edu",  password: "Admin@1234", role: "admin" },
]

export async function POST() {
  try {
    await initAuthTable()

    const results: { email: string; status: string }[] = []

    for (const u of DEFAULT_USERS) {
      const existing = await facultyQuery(
        "SELECT id FROM auth_users WHERE email = $1",
        [u.email]
      )
      if (existing.rows.length > 0) {
        results.push({ email: u.email, status: "already exists" })
        continue
      }
      const hash = await hashPassword(u.password)
      await facultyQuery(
        "INSERT INTO auth_users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)",
        [u.name, u.email, hash, u.role]
      )
      results.push({ email: u.email, status: "created" })
    }

    return NextResponse.json({ success: true, results })
  } catch (err) {
    console.error("Seed error:", err)
    return NextResponse.json({ error: "Seed failed" }, { status: 500 })
  }
}
