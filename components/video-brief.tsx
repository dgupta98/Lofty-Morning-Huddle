"use client"

import { useState, useEffect, useCallback } from "react"
import type { QueueItem, OvernightSummary } from "@/lib/types"

interface VideoBriefProps {
  agentName: string
  summary: OvernightSummary
  queue: QueueItem[]
  onClose: () => void
}

const SLIDE_DURATION = 4200

export function VideoBrief({ agentName, summary, queue, onClose }: VideoBriefProps) {
  const [slide, setSlide] = useState(0)
  const [exiting, setExiting] = useState(false)
  const [progress, setProgress] = useState(0)

  const slides = [
    { type: "intro" },
    { type: "stats" },
    ...queue.map((item, i) => ({ type: "lead", item, rank: i + 1 })),
    { type: "cta" },
  ]

  const total = slides.length
  const totalDuration = total * SLIDE_DURATION

  const advance = useCallback(() => {
    if (slide >= total - 1) {
      onClose()
      return
    }
    setExiting(true)
    setTimeout(() => {
      setSlide((s) => s + 1)
      setExiting(false)
      setProgress(0)
    }, 350)
  }, [slide, total, onClose])

  useEffect(() => {
    const start = Date.now()
    const tick = setInterval(() => {
      const elapsed = Date.now() - start
      setProgress(Math.min(100, (elapsed / SLIDE_DURATION) * 100))
      if (elapsed >= SLIDE_DURATION) advance()
    }, 40)
    return () => clearInterval(tick)
  }, [slide, advance])

  const s = slides[Math.min(slide, slides.length - 1)]
  if (!s) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(15,10,30,0.92)", backdropFilter: "blur(12px)" }}
    >
      {/* Skip */}
      <button
        onClick={onClose}
        className="absolute top-5 right-6 text-white/50 hover:text-white text-sm font-semibold transition-colors z-10"
      >
        Skip ✕
      </button>

      {/* Progress dots */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {slides.map((_, i) => (
          <div
            key={i}
            className="h-0.5 rounded-full overflow-hidden"
            style={{ width: 28, background: "rgba(255,255,255,0.2)" }}
          >
            {i < slide && (
              <div className="h-full w-full" style={{ background: "rgba(255,255,255,0.7)" }} />
            )}
            {i === slide && (
              <div
                className="h-full"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg,#818cf8,#a78bfa)",
                  transition: "width 40ms linear",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Slide content */}
      <div
        className="w-full max-w-md mx-auto px-8 text-center"
        style={{ opacity: exiting ? 0 : 1, transform: exiting ? "scale(0.96)" : "scale(1)", transition: "all 0.35s ease" }}
      >
        {s.type === "intro" && <IntroSlide agentName={agentName} />}
        {s.type === "stats" && <StatsSlide summary={summary} queueLength={queue.length} />}
        {s.type === "lead" && "item" in s && <LeadSlide item={s.item} rank={s.rank} />}
        {s.type === "cta" && <CTASlide count={queue.length} onClose={onClose} />}
      </div>

      {/* Total duration indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="h-0.5 w-32 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${((slide * SLIDE_DURATION + (progress / 100) * SLIDE_DURATION) / totalDuration) * 100}%`,
              background: "linear-gradient(90deg,#818cf8,#a78bfa)",
              transition: "width 40ms linear",
            }}
          />
        </div>
        <span className="text-white/30 text-[10px] font-mono">
          {Math.round(totalDuration / 1000)}s
        </span>
      </div>
    </div>
  )
}

function IntroSlide({ agentName }: { agentName: string }) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black"
        style={{
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          boxShadow: "0 0 60px rgba(99,102,241,0.6)",
          animation: "pulseGlow 2s ease infinite",
        }}
      >
        L✦
      </div>
      <div>
        <p className="text-white/50 text-sm font-semibold mb-2 tracking-widest uppercase">
          Morning Handoff
        </p>
        <h2 className="text-4xl font-black text-white leading-tight">
          Good morning,
          <br />
          <span style={{ background: "linear-gradient(90deg,#818cf8,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            {agentName}
          </span>{" "}✦
        </h2>
        <p className="text-white/40 text-sm mt-3">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>
      <p className="text-white/60 text-sm">Lofty AOS worked through the night. Here's what happened.</p>
    </div>
  )
}

function StatsSlide({ summary, queueLength }: { summary: OvernightSummary; queueLength: number }) {
  const stats = [
    { n: summary.lead_followups, label: "follow-ups\nhandled", icon: "📬" },
    { n: summary.showing_requests_accepted, label: "showings\naccepted", icon: "🏠" },
    { n: summary.buyer_matches, label: "buyer\nmatches", icon: "🎯" },
    { n: queueLength, label: "decisions\nwaiting", icon: "⚡" },
  ]
  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-white/50 text-xs font-bold tracking-widest uppercase">While you slept</p>
      <div className="grid grid-cols-2 gap-3 w-full">
        {stats.map((s, i) => (
          <div
            key={i}
            className="rounded-2xl p-4 text-center"
            style={{
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.25)",
              animation: `fadeSlideUp 0.4s ${i * 0.1}s ease both`,
            }}
          >
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-3xl font-black text-white mb-1">{s.n}</div>
            <div className="text-white/40 text-[10px] font-semibold whitespace-pre-line leading-tight">{s.label}</div>
          </div>
        ))}
      </div>
      {summary.escalated_lead_name && (
        <div className="text-white/50 text-xs">
          🚨 <span className="text-orange-300 font-semibold">{summary.escalated_lead_name}</span> was escalated by the Homeowner Agent
        </div>
      )}
    </div>
  )
}

function LeadSlide({ item, rank }: { item: QueueItem; rank: number }) {
  const signalIcons: Record<string, string> = {
    site_visit: "👁",
    email_open: "📧",
    showing_request: "🏠",
    aos_escalation: "🚨",
    buyer_match: "🎯",
    seller_intent: "📋",
  }
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-2">
        <span className="text-white/30 text-xs font-bold tracking-widest uppercase">#{rank} Priority</span>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: "rgba(99,102,241,0.2)", color: "#a78bfa", border: "1px solid rgba(99,102,241,0.3)" }}
        >
          {item.lead.opportunity_type}
        </span>
      </div>

      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black"
        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 0 40px rgba(99,102,241,0.4)" }}
      >
        {item.lead.name[0]}
      </div>

      <div>
        <h3 className="text-2xl font-black text-white mb-1">{item.lead.name}</h3>
        <div className="text-white/40 text-xs">{item.lead.phone}</div>
      </div>

      {item.signals && item.signals.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {item.signals.slice(0, 3).map((sig, i) => (
            <span
              key={i}
              className="text-xs font-semibold px-3 py-1.5 rounded-full capitalize"
              style={{ background: "rgba(99,102,241,0.15)", color: "#c4b5fd", border: "1px solid rgba(99,102,241,0.2)" }}
            >
              {signalIcons[sig.signal_type] || "•"} {sig.signal_type.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}

      <div
        className="text-sm text-white/70 leading-relaxed rounded-xl p-4"
        style={{ background: "rgba(255,255,255,0.04)", borderLeft: "3px solid rgba(99,102,241,0.6)" }}
      >
        {item.recommended_action}
      </div>

      <div className="text-white/30 text-xs">
        Score <span className="text-indigo-300 font-bold">{item.lead.lead_score}</span>
        {" · "}Confidence <span className="text-indigo-300 font-bold">{Math.round(item.confidence * 100)}%</span>
      </div>
    </div>
  )
}

function CTASlide({ count, onClose }: { count: number; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-5xl">✦</div>
      <div>
        <h2 className="text-3xl font-black text-white mb-2">
          {count} decision{count !== 1 ? "s" : ""} waiting
        </h2>
        <p className="text-white/50 text-sm">Your queue is ranked. Approve in one tap.</p>
      </div>
      <button
        onClick={onClose}
        className="text-white font-black text-base px-8 py-4 rounded-2xl hover:-translate-y-1 transition-all"
        style={{
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          boxShadow: "0 6px 28px rgba(99,102,241,0.5)",
        }}
      >
        Open my queue →
      </button>
    </div>
  )
}
