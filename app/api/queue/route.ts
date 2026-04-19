import { NextRequest, NextResponse } from "next/server"
import { getQueueForAgent } from "@/lib/insforge-server"

export async function GET(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get("agentId")
  if (!agentId) return NextResponse.json({ error: "Missing agentId" }, { status: 400 })

  try {
    const queue = await getQueueForAgent(agentId)
    return NextResponse.json({ queue })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
