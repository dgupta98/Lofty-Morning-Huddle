"use client"

import { useState } from "react"
import { Nav } from "@/components/nav"
import { HeroHeader } from "@/components/hero-header"
import { ActionCard } from "@/components/action-card"
import { AskBar } from "@/components/ask-bar"
import { useAudioBrief } from "@/components/audio-brief"
import { MOCK_AGENT_NAME, MOCK_OVERNIGHT_SUMMARY, MOCK_QUEUE } from "@/lib/mock-data"
import type { ActionTaken, QueueItem } from "@/lib/types"

export default function DashboardPage() {
  const [queue] = useState<QueueItem[]>(MOCK_QUEUE)
  const { play } = useAudioBrief(MOCK_AGENT_NAME, MOCK_OVERNIGHT_SUMMARY, queue[0]?.lead.name ?? "")

  async function handleAction(itemId: string, action: ActionTaken) {
    console.log("Action:", action, "on item:", itemId)
    await new Promise((r) => setTimeout(r, 600))
  }

  return (
    <div className="relative z-10">
      <Nav agentName={MOCK_AGENT_NAME} />
      <main className="max-w-2xl mx-auto px-5 pt-7 pb-36">
        <HeroHeader agentName={MOCK_AGENT_NAME} summary={MOCK_OVERNIGHT_SUMMARY} onPlayAudio={play} />
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
