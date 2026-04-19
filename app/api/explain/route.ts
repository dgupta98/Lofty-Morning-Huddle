import { NextRequest, NextResponse } from "next/server"

const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.3"
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`

export async function POST(req: NextRequest) {
  const { leadName, leadScore, opportunityType, signals } = await req.json()

  const signalSummary = (signals as Array<{ signal_type: string; payload: Record<string, string> }>)
    .map((s) => `${s.signal_type}: ${JSON.stringify(s.payload)}`)
    .join("; ")

  const prompt = `<s>[INST] You are a real estate AI assistant. Write a 2-sentence plain-English explanation of why ${leadName} is a priority action for a real estate agent today. Use only these facts:
- Lead score: ${leadScore}/100
- Opportunity type: ${opportunityType}
- Overnight signals: ${signalSummary}

Be specific, cite the signals, keep it under 60 words. Do not make up details not listed above. [/INST]`

  try {
    const hfRes = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 120, temperature: 0.3, return_full_text: false },
      }),
    })

    if (!hfRes.ok) {
      return NextResponse.json({ explanation: null, error: "HF unavailable" }, { status: 200 })
    }

    const hfData = (await hfRes.json()) as Array<{ generated_text: string }>
    const explanation = hfData?.[0]?.generated_text?.trim() ?? null
    return NextResponse.json({ explanation })
  } catch {
    return NextResponse.json({ explanation: null, error: "HF unavailable" }, { status: 200 })
  }
}
