import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { facultyQuery } from "./db"
import bcrypt from "bcryptjs"

function getSecret() {
  return new TextEncoder().encode(
    process.env.JWT_SECRET || "archie-admin-fallback-secret-change-in-production"
  )
}

export interface AuthUser {
  id: number
  email: string
  name: string
  role: string
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function signToken(payload: AuthUser): Promise<string> {
  return new SignJWT({ id: payload.id, email: payload.email, name: payload.name, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as AuthUser
  } catch {
    return null
  }
}

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  if (!token) return null
  return verifyToken(token)
}

export async function initAuthTable() {
  try {
    await facultyQuery(`
      CREATE TABLE IF NOT EXISTS auth_users (
        id        SERIAL PRIMARY KEY,
        name      VARCHAR(255) NOT NULL,
        email     VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role      VARCHAR(50) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
  } catch (err: any) {
    // The DB role may lack DDL privileges — table must be created manually.
    // If the table already exists this is fine; only re-throw on unexpected errors.
    if (err?.code !== "42501" && err?.code !== "42P07") throw err
  }
}
