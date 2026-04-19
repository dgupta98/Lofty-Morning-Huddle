"use client"

import { useState, useEffect } from "react"
import type { QueueItem } from "@/lib/types"

interface TranscriptViewProps {
  queue: QueueItem[]
  agentName: string
  onDone: () => void
}

export function TranscriptView({ queue, agentName, onDone }: TranscriptViewProps) {
  const [revealed, setRevealed] = useState(0)
  const [showCta, setShowCta] = useState(false)

  useEffect(() => {
    if (revealed >= queue.length) {
      const t = setTimeout(() => setShowCta(true), 400)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setRevealed((v) => v + 1), revealed === 0 ? 300 : 450)
    return () => clearTimeout(t)
  }, [revealed, queue.length])

  const completedCount = queue.filter((_, i) => i < revealed).length

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Header card */}
      <div className="glass-card-elevated rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 2px 12px rgba(99,102,241,0.3)" }}>
            ✦
          </div>
          <div>
            <h2 className="text-base font-black text-indigo-950 leading-tight">Morning Action Plan</h2>
            <p className="text-[11px] text-indigo-400/70 font-medium">AOS briefing complete · {queue.length} items ranked</p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-lg font-black gradient-text">{completedCount}/{queue.length}</div>
            <div className="text-[10px] text-gray-400/80 font-semibold">loaded</div>
          </div>
        </div>
      </div>

      {/* Task list */}
      <div className="glass-card-elevated rounded-2xl overflow-hidden">
        <div className="px-5 pt-4 pb-2.5 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(99,102,241,0.06)" }}>
          <span className="text-[10px] font-bold text-indigo-300/80 tracking-[0.15em] uppercase">Recommended actions · {agentName}</span>
          <span className="text-[10px] font-semibold text-gray-400/70">Drag to reorder in queue ↓</span>
        </div>

        <div>
          {queue.map((item, i) => {
            const isVisible = i < revealed
            return (
              <div
                key={item.id}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateX(0)" : "translateX(-12px)",
                  transition: "opacity 0.4s ease, transform 0.4s ease",
                  borderBottom: "1px solid rgba(99,102,241,0.04)",
                }}
              >
                <div className="flex items-start gap-4 px-5 py-4">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-white text-xs font-black"
                    style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 2px 8px rgba(99,102,241,0.25)" }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-black text-indigo-950">{item.lead.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(99,102,241,0.05)", color: "#6366f1" }}>
                        {item.lead.opportunity_type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500/90 leading-relaxed">{item.recommended_action}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-base font-black gradient-text">{item.lead.lead_score}</div>
                    <div className="text-[10px] text-gray-400/70 font-medium">score</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          opacity: showCta ? 1 : 0,
          transform: showCta ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        <div className="glass-card-elevated rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-indigo-950">Ready to execute?</p>
            <p className="text-xs text-gray-400/80 font-medium">Approve, delegate, or snooze each item in your queue</p>
          </div>
          <button
            onClick={onDone}
            className="gradient-btn text-white text-sm font-black px-6 py-3 rounded-xl"
          >
            Open Queue →
          </button>
        </div>
      </div>
    </div>
  )
}
