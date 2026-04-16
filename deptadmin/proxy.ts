import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const PUBLIC_PATHS = ["/login", "/signup"]

function getSecret() {
  return new TextEncoder().encode(
    process.env.JWT_SECRET || "archie-admin-fallback-secret-change-in-production"
  )
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow auth pages, auth API, and static assets
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get("auth-token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  try {
    await jwtVerify(token, getSecret())
    return NextResponse.next()
  } catch {
    const response = NextResponse.redirect(new URL("/login", req.url))
    response.cookies.set("auth-token", "", { maxAge: 0, path: "/" })
    return response
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.ico$).*)"],
}
