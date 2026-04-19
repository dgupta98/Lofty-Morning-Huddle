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

  const { data, error } = await client.database
    .from("priority_queue")
    .select(`*, lead:leads(*, signals:lead_signals(*))`)
    .eq("agent_id", agentId)
    .eq("date", today)
    .order("rank", { ascending: true })
    .limit(3)

  if (error) throw new Error(error.message)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map((row) => ({
    ...row,
    lead: {
      ...row.lead,
      signals: row.lead?.signals ?? [],
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
