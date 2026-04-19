import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@insforge/sdk"

export async function GET(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get("agentId")
  if (!agentId) return NextResponse.json({ error: "Missing agentId" }, { status: 400 })

  try {
    const client = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
      anonKey: process.env.INSFORGE_SERVICE_KEY!,
    })
    const { data, error } = await client.database
      .from("agents")
      .select("name, email, goals, quota")
      .eq("id", agentId)
      .single()

    if (error) throw new Error(error.message)
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
