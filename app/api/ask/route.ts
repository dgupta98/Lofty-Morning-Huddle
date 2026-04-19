import { NextRequest, NextResponse } from "next/server"

const HF_API_URL = "https://router.huggingface.co/together/v1/chat/completions"
const HF_MODEL = "meta-llama/Llama-3.3-70B-Instruct-Turbo"

export async function POST(req: NextRequest) {
  const { query, agentName, queue } = await req.json()

  const queueSummary = (queue as Array<{
    rank: number
    lead: { name: string; opportunity_type: string; phone: string; email: string; lead_score: number }
    recommended_action: string
    explanation: string | null
  }>)
    .map(
      (q) =>
        `#${q.rank} ${q.lead.name} (${q.lead.opportunity_type}, score ${q.lead.lead_score}): ${q.recommended_action}`
    )
    .join("\n")

  const systemPrompt = `You are Lofty AOS, an intelligent real estate AI assistant helping agent ${agentName} manage their morning decisions. You know their current priority queue.

TODAY'S PRIORITY QUEUE:
${queueSummary}

RULES:
- Be concise and actionable — agents are busy
- If asked to draft an email, write a complete ready-to-send email with subject line
- If asked about a lead, give specific insight from their queue data
- If asked to take an action (reschedule, reassign, snooze), confirm and explain what you'd do
- Keep responses under 120 words unless writing an email draft
- Use their first name and lead names naturally
- Never make up data not in the queue`

  try {
    const res = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
        max_tokens: 300,
        temperature: 0.5,
      }),
      signal: AbortSignal.timeout(12000),
    })

    if (!res.ok) {
      return NextResponse.json({ answer: fallback(query, agentName, queue) })
    }

    const data = await res.json() as { choices: Array<{ message: { content: string } }> }
    const answer = data?.choices?.[0]?.message?.content?.trim() ?? fallback(query, agentName, queue)
    return NextResponse.json({ answer })
  } catch {
    return NextResponse.json({ answer: fallback(query, agentName, queue) })
  }
}

// Instant contextual fallback if HF is unavailable
function fallback(
  query: string,
  agentName: string,
  queue: Array<{ rank: number; lead: { name: string; opportunity_type: string; email: string }; recommended_action: string }>
): string {
  const q = query.toLowerCase()
  const top = queue[0]

  if (q.includes("email") && top) {
    const first = top.lead.name.split(" ")[0]
    return `Subject: Following up on your interest\n\nHi ${first},\n\nI noticed some exciting activity on your search and wanted to reach out personally. I'd love to connect and help you find the right property.\n\nWould a quick 15-minute call work tomorrow morning?\n\nBest,\n${agentName}`
  }
  if ((q.includes("urgent") || q.includes("priority") || q.includes("top")) && top) {
    return `Your #1 priority is ${top.lead.name} (${top.lead.opportunity_type}). ${top.recommended_action}`
  }
  if (q.includes("snooze") || q.includes("reschedule")) {
    return `Understood. I'll snooze that lead and reprioritize the queue. They'll resurface at your chosen time with a fresh action plan.`
  }
  if (q.includes("delegate") || q.includes("reassign")) {
    return `I'll flag this for your team. The lead details and recommended action will be forwarded to the selected team member with full context.`
  }
  return `Got it, ${agentName}. I'm working on that — based on your current queue, I'd recommend focusing on ${top?.lead.name ?? "your top lead"} first while I process your request.`
}
