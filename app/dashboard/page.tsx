"use client"

import { useState, useEffect } from "react"
import { Nav } from "@/components/nav"
import { HeroHeader } from "@/components/hero-header"
import { ActionCard } from "@/components/action-card"
import { AskBar } from "@/components/ask-bar"
import { useAudioBrief } from "@/components/audio-brief"
import { MOCK_AGENT_NAME, MOCK_OVERNIGHT_SUMMARY, MOCK_QUEUE } from "@/lib/mock-data"
import type { ActionTaken, QueueItem } from "@/lib/types"

const AGENT_ID = process.env.NEXT_PUBLIC_DEMO_AGENT_ID ?? ""

export default function DashboardPage() {
  const [queue, setQueue] = useState<QueueItem[]>(MOCK_QUEUE)
  const [agentName, setAgentName] = useState(MOCK_AGENT_NAME)
  const { play } = useAudioBrief(agentName, MOCK_OVERNIGHT_SUMMARY, queue[0]?.lead.name ?? "")

  useEffect(() => {
    if (!AGENT_ID) return
    fetch(`/api/queue?agentId=${AGENT_ID}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.queue?.length) setQueue(json.queue)
      })
      .catch(() => {})

    fetch(`/api/agent?agentId=${AGENT_ID}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.name) setAgentName(json.name.split(" ")[0])
      })
      .catch(() => {})
  }, [])

  async function handleAction(itemId: string, action: ActionTaken) {
    await fetch("/api/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        queueItemId: itemId,
        agentId: AGENT_ID,
        actionTaken: action,
        scoreBreakdown: {},
        llmExplanation: null,
      }),
    }).catch(() => {})

    setQueue((prev) => prev.filter((item) => item.id !== itemId))
  }

  return (
    <div className="relative z-10">
      <Nav agentName={agentName} />
      <main className="max-w-2xl mx-auto px-5 pt-7 pb-36">
        <HeroHeader agentName={agentName} summary={MOCK_OVERNIGHT_SUMMARY} onPlayAudio={play} />
        <div className="flex flex-col gap-3.5">
          {queue.map((item, index) => (
            <ActionCard key={item.id} item={item} index={index} onAction={handleAction} />
          ))}
        </div>
      </main>

      <div
        className="fixed bottom-20 right-5 z-40 flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(99,102,241,0.15)",
          color: "#6366f1",
          boxShadow: "0 2px 10px rgba(99,102,241,0.1)",
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
        />
        Powered by Lofty AOS
      </div>

      <AskBar />
    </div>
  )
}
