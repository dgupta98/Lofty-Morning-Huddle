import { NextRequest, NextResponse } from "next/server"

const HF_API_URL =
  "https://router.huggingface.co/together/v1/chat/completions"
const HF_MODEL = "meta-llama/Llama-3.3-70B-Instruct-Turbo"

export async function POST(req: NextRequest) {
  const { leadName, leadScore, opportunityType, signals } = await req.json()

  const signalSummary = (signals as Array<{ signal_type: string; payload: Record<string, string> }>)
    .map((s) => `${s.signal_type}: ${JSON.stringify(s.payload)}`)
    .join("; ")

  const userMessage = `You are a real estate AI assistant. Write a 2-sentence plain-English explanation of why ${leadName} is a priority action for a real estate agent today. Use only these facts:
- Lead score: ${leadScore}/100
- Opportunity type: ${opportunityType}
- Overnight signals: ${signalSummary}

Be specific, cite the signals, keep it under 60 words. Do not make up details not listed above.`

  try {
    const hfRes = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [{ role: "user", content: userMessage }],
        max_tokens: 120,
        temperature: 0.3,
      }),
    })

    if (!hfRes.ok) {
      return NextResponse.json({ explanation: null, error: "HF unavailable" }, { status: 200 })
    }

    const hfData = await hfRes.json() as { choices: Array<{ message: { content: string } }> }
    const explanation = hfData?.choices?.[0]?.message?.content?.trim() ?? null
    return NextResponse.json({ explanation })
  } catch {
    return NextResponse.json({ explanation: null, error: "HF unavailable" }, { status: 200 })
  }
}
