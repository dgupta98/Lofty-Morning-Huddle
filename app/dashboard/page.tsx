"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Nav } from "@/components/nav"
import { AgentsPanel } from "@/components/agents-panel"
import { VideoPlayer } from "@/components/video-player"
import { ActionCard } from "@/components/action-card"
import { TranscriptView } from "@/components/transcript-view"
import { AskBar } from "@/components/ask-bar"
import { useAudioBrief } from "@/components/audio-brief"
import { MOCK_OVERNIGHT_SUMMARY, MOCK_QUEUE } from "@/lib/mock-data"
import type { ActionTaken, QueueItem } from "@/lib/types"

type ViewState = "loading" | "video" | "transcript" | "queue"

export default function DashboardPage() {
  const router = useRouter()
  const [agentId, setAgentId] = useState("")
  const [agentName, setAgentName] = useState("James")
  const [queue, setQueue] = useState<QueueItem[]>(MOCK_QUEUE)
  const [view, setView] = useState<ViewState>("queue")
  const [reordered, setReordered] = useState(false)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const hasFetched = useRef(false)

  const { play } = useAudioBrief(agentName, MOCK_OVERNIGHT_SUMMARY, queue[0]?.lead.name ?? "")

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    const storedId = sessionStorage.getItem("lofty_agent_id") ?? "3b6e5282-dc35-4f89-b33f-fe464d627408"
    const storedName = sessionStorage.getItem("lofty_agent_name") ?? "James"
    setAgentId(storedId)
    setAgentName(storedName)

    const wantsVideo = (window as any).__lofty_play_video === true ||
                       sessionStorage.getItem("lofty_play_video") === "1"
    delete (window as any).__lofty_play_video

    if (wantsVideo) setView("loading")

    const savedOrder = sessionStorage.getItem("lofty_queue_order")

    Promise.all([
      fetch(`/api/agent?agentId=${storedId}`).then(r => r.json()).catch(() => ({})),
      fetch(`/api/queue?agentId=${storedId}`).then(r => r.json()).catch(() => ({})),
    ]).then(([agentJson, queueJson]) => {
      if (agentJson.name) setAgentName(agentJson.name.split(" ")[0])
      let realQueue: QueueItem[] = queueJson.queue?.length ? queueJson.queue : MOCK_QUEUE

      if (savedOrder) {
        try {
          const ids: string[] = JSON.parse(savedOrder)
          const ordered = ids.map(id => realQueue.find(q => q.id === id)).filter(Boolean) as QueueItem[]
          const rest = realQueue.filter(q => !ids.includes(q.id))
          realQueue = [...ordered, ...rest].map((it, i) => ({ ...it, rank: i + 1 }))
          setReordered(true)
        } catch (_) { /* ignore */ }
      }

      setQueue(realQueue)
      if (wantsVideo) {
        sessionStorage.removeItem("lofty_play_video")
        setView("video")
      }
    })
  }, [])

  function handleVideoComplete() { setView("transcript") }

  async function handleAction(itemId: string, action: ActionTaken) {
    await fetch("/api/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ queueItemId: itemId, agentId, actionTaken: action, scoreBreakdown: {}, llmExplanation: null }),
    }).catch(() => {})
    if (action === "approve" || action === "delegate" || action === "snooze") {
      setQueue((prev) => {
        const next = prev.filter((item) => item.id !== itemId)
        saveQueueOrder(next)
        return next
      })
    }
  }

  function saveQueueOrder(q: QueueItem[]) {
    sessionStorage.setItem("lofty_queue_order", JSON.stringify(q.map(it => it.id)))
  }

  function handleDragStart(idx: number) { setDragIdx(idx) }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    setDragOverIdx(idx)
  }

  function handleDrop(idx: number) {
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDragOverIdx(null); return }
    setQueue(prev => {
      const next = [...prev]
      const [moved] = next.splice(dragIdx, 1)
      next.splice(idx, 0, moved)
      const ranked = next.map((it, i) => ({ ...it, rank: i + 1 }))
      saveQueueOrder(ranked)
      return ranked
    })
    setReordered(true)
    setDragIdx(null)
    setDragOverIdx(null)
  }

  function handleDragEnd() { setDragIdx(null); setDragOverIdx(null) }

  function handleLogout() { sessionStorage.clear(); router.push("/") }

  const doneCount = MOCK_QUEUE.length - queue.length

  return (
    <div className="flex flex-col min-h-screen relative z-10">
      <Nav agentName={agentName} onLogout={handleLogout} onPlayVideo={() => setView("video")} />

      <div className="flex flex-1 gap-6 p-6 max-w-[1440px] mx-auto w-full" style={{ minHeight: "calc(100vh - 60px)" }}>
        {/* LEFT — agent dashboard */}
        <div className="w-[380px] shrink-0 flex flex-col">
          <AgentsPanel agentName={agentName} summary={MOCK_OVERNIGHT_SUMMARY} queue={queue} />
        </div>

        {/* RIGHT — loading → video → transcript → queue */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {view === "loading" && (
            <div className="flex flex-col items-center justify-center rounded-2xl"
              style={{ height: "calc(100vh - 100px)", background: "linear-gradient(160deg,#0f0a1e 0%,#1a1040 50%,#0d1530 100%)", border: "1px solid rgba(99,102,241,0.15)", boxShadow: "0 8px 40px rgba(99,102,241,0.1)" }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-black mb-6"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 0 40px rgba(99,102,241,0.5)", animation: "pulseGlow 2s ease infinite" }}>
                L✦
              </div>
              <div className="flex flex-col gap-3 w-64">
                {["Connecting to AOS agents…", "Pulling overnight lead signals…", "Building your morning briefing…"].map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full shrink-0 border-2 border-indigo-400 border-t-transparent"
                      style={{ animation: `spin 0.8s ${i * 0.15}s linear infinite` }} />
                    <span className="text-xs font-medium text-white/50">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === "video" && (
            <div style={{ height: "calc(100vh - 100px)", minHeight: 560 }}>
              <VideoPlayer agentName={agentName} summary={MOCK_OVERNIGHT_SUMMARY} queue={queue} onComplete={handleVideoComplete} />
            </div>
          )}

          {view === "transcript" && (
            <TranscriptView queue={queue} agentName={agentName} onDone={() => setView("queue")} />
          )}

          {view === "queue" && (
            <div className="flex flex-col gap-4 pb-24">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-indigo-950">Priority Queue</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-gray-400/80 font-medium">
                      {queue.length} decision{queue.length !== 1 ? "s" : ""} ranked by AI · today
                    </p>
                    {doneCount > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(34,197,94,0.06)", color: "#16a34a" }}>
                        ✓ {doneCount} done
                      </span>
                    )}
                    {reordered && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(99,102,241,0.05)", color: "#6366f1" }}>
                        ⠿ custom order saved
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => play()}
                    className="text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-200 hover:-translate-y-px glass-card"
                    style={{ color: "#6366f1" }}>
                    ▶ Audio brief
                  </button>
                  <button onClick={() => setView("video")}
                    className="text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-200 hover:-translate-y-px glass-card"
                    style={{ color: "#6366f1" }}>
                    ✦ Replay video
                  </button>
                </div>
              </div>

              {queue.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 glass-card-elevated rounded-2xl">
                  <div className="text-3xl mb-3 gradient-text">✦</div>
                  <p className="text-indigo-300 font-bold text-sm">All decisions handled.</p>
                  <p className="text-gray-400/80 text-xs mt-1">Great work, {agentName}.</p>
                </div>
              ) : (
                <>
                  <p className="text-[10px] text-gray-400/70 font-medium -mb-2">
                    Drag cards to reprioritize · changes saved automatically
                  </p>
                  {queue.map((item, index) => (
                    <ActionCard
                      key={item.id}
                      item={item}
                      index={index}
                      onAction={handleAction}
                      isDragOver={dragOverIdx === index}
                      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; handleDragStart(index) }}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={() => handleDrop(index)}
                      onDragEnd={handleDragEnd}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Powered by badge */}
      <div className="fixed bottom-20 right-5 z-40 flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full glass-card"
        style={{ color: "#6366f1" }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }} />
        Powered by Lofty AOS
      </div>

      <AskBar />
    </div>
  )
}
