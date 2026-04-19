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
      <div className="rounded-2xl p-5" style={{
        background: "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.06))",
        border: "1px solid rgba(99,102,241,0.18)",
      }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 0 20px rgba(99,102,241,0.4)" }}>
            ✦
          </div>
          <div>
            <h2 className="text-base font-black text-indigo-900 leading-tight">Morning Action Plan</h2>
            <p className="text-[11px] text-indigo-400 font-medium">AOS briefing complete · {queue.length} items ranked</p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-lg font-black text-indigo-600">{completedCount}/{queue.length}</div>
            <div className="text-[10px] text-indigo-300 font-semibold">loaded</div>
          </div>
        </div>
      </div>

      {/* Task list */}
      <div className="rounded-2xl overflow-hidden" style={{
        background: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(99,102,241,0.12)",
        boxShadow: "0 4px 20px rgba(99,102,241,0.06)",
      }}>
        <div className="px-5 pt-4 pb-2 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(99,102,241,0.08)" }}>
          <span className="text-[10px] font-extrabold text-indigo-300 tracking-widest uppercase">Recommended actions · {agentName}</span>
          <span className="text-[10px] font-semibold text-gray-400">Drag to reorder in queue ↓</span>
        </div>

        <div className="divide-y" style={{ "--tw-divide-opacity": 1 } as React.CSSProperties}>
          {queue.map((item, i) => {
            const isVisible = i < revealed
            return (
              <div
                key={item.id}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateX(0)" : "translateX(-16px)",
                  transition: "opacity 0.35s ease, transform 0.35s ease",
                  borderBottom: "1px solid rgba(99,102,241,0.06)",
                }}
              >
                <div className="flex items-start gap-4 px-5 py-4">
                  {/* Rank bubble */}
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-xs font-black"
                    style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 2px 8px rgba(99,102,241,0.3)" }}>
                    {i + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-black text-indigo-900">{item.lead.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(99,102,241,0.08)", color: "#6366f1" }}>
                        {item.lead.opportunity_type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{item.recommended_action}</p>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <div className="text-base font-black" style={{
                      background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}>{item.lead.lead_score}</div>
                    <div className="text-[10px] text-gray-400 font-medium">score</div>
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
          transform: showCta ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
          background: "rgba(255,255,255,0.85)",
          border: "1px solid rgba(99,102,241,0.15)",
          borderRadius: "1rem",
          padding: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p className="text-sm font-black text-indigo-900">Ready to execute?</p>
          <p className="text-xs text-gray-400 font-medium">Approve, delegate, or snooze each item in your queue</p>
        </div>
        <button
          onClick={onDone}
          className="text-white text-sm font-black px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}
        >
          Open Queue →
        </button>
      </div>
    </div>
  )
}
