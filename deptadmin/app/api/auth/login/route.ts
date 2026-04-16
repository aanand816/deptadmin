import { NextRequest, NextResponse } from "next/server"
import { facultyQuery } from "@/lib/db"
import { verifyPassword, signToken, initAuthTable } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    await initAuthTable()

    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const result = await facultyQuery(
      "SELECT id, name, email, role, password_hash FROM auth_users WHERE email = $1",
      [email.toLowerCase()]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const user = result.rows[0]
    const valid = await verifyPassword(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const token = await signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })

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
    console.error("Login error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
