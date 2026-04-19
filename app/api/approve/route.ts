import { NextRequest, NextResponse } from "next/server"
import { logApproval } from "@/lib/insforge-server"

export async function POST(req: NextRequest) {
  const { queueItemId, agentId, actionTaken, scoreBreakdown, llmExplanation } =
    await req.json()

  if (!queueItemId || !agentId || !actionTaken) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    await logApproval(queueItemId, agentId, actionTaken, scoreBreakdown ?? {}, llmExplanation ?? null)
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
