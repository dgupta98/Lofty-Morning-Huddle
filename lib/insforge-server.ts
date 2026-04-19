import { createClient } from "@insforge/sdk"
import type { QueueItem } from "./types"

function getServerClient() {
  return createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.INSFORGE_SERVICE_KEY!,
  })
}

export async function getQueueForAgent(agentId: string): Promise<QueueItem[]> {
  const client = getServerClient()
  const today = new Date().toISOString().split("T")[0]

  const { data: queueRows, error: qErr } = await client.database
    .from("priority_queue")
    .select("*")
    .eq("agent_id", agentId)
    .eq("date", today)
    .order("rank", { ascending: true })
    .limit(3)

  if (qErr) throw new Error(qErr.message)
  if (!queueRows?.length) return []

  const leadIds = (queueRows as Array<{ lead_id: string }>).map((r) => r.lead_id)

  const { data: leads, error: lErr } = await client.database
    .from("leads")
    .select("*")
    .in("id", leadIds)

  if (lErr) throw new Error(lErr.message)

  const { data: signals, error: sErr } = await client.database
    .from("lead_signals")
    .select("*")
    .in("lead_id", leadIds)

  if (sErr) throw new Error(sErr.message)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leadsMap = Object.fromEntries((leads as any[]).map((l) => [l.id, l]))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const signalsMap: Record<string, any[]> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const sig of (signals as any[]) ?? []) {
    signalsMap[sig.lead_id] = [...(signalsMap[sig.lead_id] ?? []), sig]
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (queueRows as any[]).map((row) => ({
    ...row,
    lead: {
      ...leadsMap[row.lead_id],
      signals: signalsMap[row.lead_id] ?? [],
    },
  })) as QueueItem[]
}

export async function logApproval(
  queueItemId: string,
  agentId: string,
  actionTaken: string,
  scoreBreakdown: Record<string, unknown>,
  llmExplanation: string | null
) {
  const client = getServerClient()

  const { error: approvalError } = await client.database.from("approvals").insert({
    queue_item_id: queueItemId,
    agent_id: agentId,
    action_taken: actionTaken,
  })
  if (approvalError) throw new Error(approvalError.message)

  const { error: auditError } = await client.database.from("audit_log").insert({
    queue_item_id: queueItemId,
    score_breakdown: scoreBreakdown,
    llm_explanation: llmExplanation,
  })
  if (auditError) throw new Error(auditError.message)
}
