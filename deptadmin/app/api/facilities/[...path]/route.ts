import { NextRequest, NextResponse } from "next/server"

const UPSTREAM = "https://humber-facilities.vercel.app"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const apiPath = path.join("/")
  const search = req.nextUrl.search
  const url = `${UPSTREAM}/api/${apiPath}${search}`

  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: "Upstream request failed" }, { status: 502 })
  }
}