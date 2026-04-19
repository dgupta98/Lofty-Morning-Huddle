"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Nav } from "@/components/nav"
import { HeroHeader } from "@/components/hero-header"
import { ActionCard } from "@/components/action-card"
import { AskBar } from "@/components/ask-bar"
import { VideoBrief } from "@/components/video-brief"
import { useAudioBrief } from "@/components/audio-brief"
import { MOCK_OVERNIGHT_SUMMARY, MOCK_QUEUE } from "@/lib/mock-data"
import type { ActionTaken, QueueItem } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const [agentId, setAgentId] = useState("")
  const [agentName, setAgentName] = useState("James")
  const [queue, setQueue] = useState<QueueItem[]>(MOCK_QUEUE)
  const [showVideo, setShowVideo] = useState(false)
  const hasFetched = useRef(false)

  const { play } = useAudioBrief(agentName, MOCK_OVERNIGHT_SUMMARY, queue[0]?.lead.name ?? "")

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    const storedId = sessionStorage.getItem("lofty_agent_id") ?? "3b6e5282-dc35-4f89-b33f-fe464d627408"
    const storedName = sessionStorage.getItem("lofty_agent_name") ?? "James"
    setAgentId(storedId)
    setAgentName(storedName)

    // Show video brief on first visit
    const seen = sessionStorage.getItem(`video_seen_${storedId}`)
    if (!seen) {
      setTimeout(() => setShowVideo(true), 400)
      sessionStorage.setItem(`video_seen_${storedId}`, "1")
    }

    fetch(`/api/queue?agentId=${storedId}`)
      .then((r) => r.json())
      .then((json) => { if (json.queue?.length) setQueue(json.queue) })
      .catch(() => {})

    fetch(`/api/agent?agentId=${storedId}`)
      .then((r) => r.json())
      .then((json) => { if (json.name) setAgentName(json.name.split(" ")[0]) })
      .catch(() => {})
  }, [])

  async function handleAction(itemId: string, action: ActionTaken) {
    await fetch("/api/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        queueItemId: itemId,
        agentId,
        actionTaken: action,
        scoreBreakdown: {},
        llmExplanation: null,
      }),
    }).catch(() => {})

    if (action === "approve" || action === "delegate" || action === "snooze") {
      setQueue((prev) => prev.filter((item) => item.id !== itemId))
    }
  }

  function handleLogout() {
    sessionStorage.clear()
    router.push("/")
  }

  return (
    <div className="relative z-10">
      {showVideo && (
        <VideoBrief
          agentName={agentName}
          summary={MOCK_OVERNIGHT_SUMMARY}
          queue={queue}
          onClose={() => setShowVideo(false)}
        />
      )}

      <Nav agentName={agentName} onLogout={handleLogout} onPlayVideo={() => setShowVideo(true)} />

      <main className="max-w-2xl mx-auto px-5 pt-7 pb-36">
        <HeroHeader agentName={agentName} summary={MOCK_OVERNIGHT_SUMMARY} onPlayAudio={play} />
        <div className="flex flex-col gap-3.5">
          {queue.length === 0 ? (
            <div className="text-center py-16 text-indigo-300 font-semibold">
              ✓ All decisions handled. Great work, {agentName}.
            </div>
          ) : (
            queue.map((item, index) => (
              <ActionCard key={item.id} item={item} index={index} onAction={handleAction} />
            ))
          )}
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
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }} />
        Powered by Lofty AOS
      </div>

      <AskBar />
    </div>
  )
}
