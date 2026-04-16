import { NextRequest, NextResponse } from "next/server"
import { facultyQuery } from "@/lib/db"
import { hashPassword, signToken, initAuthTable } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    await initAuthTable()

    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const existing = await facultyQuery(
      "SELECT id FROM auth_users WHERE email = $1",
      [email.toLowerCase()]
    )
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const result = await facultyQuery(
      "INSERT INTO auth_users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role",
      [name.trim(), email.toLowerCase(), passwordHash]
    )

    const user = result.rows[0]
    const token = await signToken(user)

    const response = NextResponse.json({ success: true })
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
    return response
  } catch (err) {
    console.error("Signup error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
