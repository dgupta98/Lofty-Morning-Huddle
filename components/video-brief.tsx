"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { QueueItem, OvernightSummary } from "@/lib/types"

interface VideoBriefProps {
  agentName: string
  summary: OvernightSummary
  queue: QueueItem[]
  onClose: () => void
}

const SLIDE_DURATION = 5000
const TRANSITION_MS = 400

const signalIcons: Record<string, string> = {
  site_visit: "👁", email_open: "📧", showing_request: "🏠",
  aos_escalation: "🚨", buyer_match: "🎯", seller_intent: "📋",
}

function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start: number | null = null
    const animate = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value, duration])
  return <>{display}</>
}

export function VideoBrief({ agentName, summary, queue, onClose }: VideoBriefProps) {
  const [slide, setSlide] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startRef = useRef(0)
  const elapsedRef = useRef(0)

  const slides = [
    { type: "intro" },
    { type: "stats" },
    ...queue.map((item, i) => ({ type: "lead", item, rank: i + 1 })),
    { type: "cta" },
  ]

  const total = slides.length
  const totalDuration = total * SLIDE_DURATION

  const advance = useCallback(() => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null }
    if (slide >= total - 1) { onClose(); return }
    setTransitioning(true)
    elapsedRef.current = 0
    setTimeout(() => { setSlide((s) => s + 1); setProgress(0); setTransitioning(false) }, TRANSITION_MS)
  }, [slide, total, onClose])

  useEffect(() => {
    if (paused) return
    startRef.current = Date.now()
    tickRef.current = setInterval(() => {
      const elapsed = elapsedRef.current + (Date.now() - startRef.current)
      setProgress(Math.min(100, (elapsed / SLIDE_DURATION) * 100))
      if (elapsed >= SLIDE_DURATION) advance()
    }, 30)
    return () => { if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null } }
  }, [slide, advance, paused])

  useEffect(() => {
    if (paused) {
      elapsedRef.current += Date.now() - startRef.current
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null }
    }
  }, [paused])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " ") { e.preventDefault(); setPaused(p => !p) }
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const s = slides[Math.min(slide, slides.length - 1)]
  if (!s) return null

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center"
      style={{ background: "rgba(10,6,26,0.95)", backdropFilter: "blur(16px)" }}>

      <button onClick={onClose}
        className="absolute top-5 right-6 text-white/30 hover:text-white/70 text-sm font-semibold transition-colors z-10 px-2 py-1 rounded-lg hover:bg-white/5">
        Skip ✕
      </button>

      {/* Progress segments */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {slides.map((_, i) => (
          <div key={i} className="h-1 rounded-full overflow-hidden" style={{ width: 32, background: "rgba(255,255,255,0.08)" }}>
            {i < slide && <div className="h-full w-full rounded-full" style={{ background: "rgba(255,255,255,0.4)" }} />}
            {i === slide && (
              <div className="h-full rounded-full" style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg,#818cf8,#c084fc)",
                transition: "width 30ms linear",
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Slide content */}
      <div className="w-full max-w-md mx-auto px-8 text-center"
        style={{
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? "scale(0.95) translateY(8px)" : "scale(1) translateY(0)",
          transition: `all ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        }}>
        {s.type === "intro" && <BriefIntro agentName={agentName} />}
        {s.type === "stats" && <BriefStats summary={summary} queueLength={queue.length} />}
        {s.type === "lead" && "item" in s && <BriefLead item={s.item} rank={s.rank} />}
        {s.type === "cta" && <BriefCTA count={queue.length} onClose={onClose} />}
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <button onClick={() => setPaused(p => !p)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {paused ? "▶" : "⏸"}
        </button>
        <div className="h-0.5 w-32 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="h-full rounded-full" style={{
            width: `${((slide * SLIDE_DURATION + (progress / 100) * SLIDE_DURATION) / totalDuration) * 100}%`,
            background: "linear-gradient(90deg,#818cf8,#c084fc)",
            transition: "width 30ms linear",
          }} />
        </div>
        <span className="text-white/20 text-[10px] font-mono">{Math.round(totalDuration / 1000)}s</span>
      </div>
    </div>
  )
}

function BriefIntro({ agentName }: { agentName: string }) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black"
        style={{
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          boxShadow: "0 0 60px rgba(99,102,241,0.5), 0 0 120px rgba(99,102,241,0.15)",
          animation: "scaleIn 0.5s ease both",
        }}>
        L✦
      </div>
      <div style={{ animation: "fadeSlideUp 0.5s 0.2s ease both" }}>
        <p className="text-white/35 text-sm font-semibold mb-2 tracking-[0.2em] uppercase">Morning Handoff</p>
        <h2 className="text-4xl font-black text-white leading-tight">
          Good morning,<br />
          <span style={{ background: "linear-gradient(90deg,#818cf8,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            {agentName}
          </span>{" "}✦
        </h2>
        <p className="text-white/25 text-sm mt-3">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>
      <p className="text-white/40 text-sm" style={{ animation: "fadeSlideUp 0.5s 0.5s ease both" }}>
        Lofty AOS worked through the night. Here&apos;s what happened.
      </p>
    </div>
  )
}

function BriefStats({ summary, queueLength }: { summary: OvernightSummary; queueLength: number }) {
  const stats = [
    { n: summary.lead_followups, label: "follow-ups\nhandled", icon: "📬" },
    { n: summary.showing_requests_accepted, label: "showings\naccepted", icon: "🏠" },
    { n: summary.buyer_matches, label: "buyer\nmatches", icon: "🎯" },
    { n: queueLength, label: "decisions\nwaiting", icon: "⚡" },
  ]
  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-white/30 text-xs font-bold tracking-[0.25em] uppercase" style={{ animation: "fadeSlideUp 0.4s ease both" }}>
        While you slept
      </p>
      <div className="grid grid-cols-2 gap-3 w-full">
        {stats.map((s, i) => (
          <div key={i} className="rounded-2xl p-4 text-center"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              animation: `fadeSlideUp 0.4s ${i * 0.1}s ease both`,
            }}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-3xl font-black text-white mb-1"><AnimatedNumber value={s.n} duration={1000 + i * 200} /></div>
            <div className="text-white/30 text-[10px] font-semibold whitespace-pre-line leading-tight">{s.label}</div>
          </div>
        ))}
      </div>
      {summary.escalated_lead_name && (
        <div className="text-white/40 text-xs" style={{ animation: "fadeSlideUp 0.4s 0.5s ease both" }}>
          🚨 <span className="text-orange-300/80 font-semibold">{summary.escalated_lead_name}</span> was escalated
        </div>
      )}
    </div>
  )
}

function BriefLead({ item, rank }: { item: QueueItem; rank: number }) {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-2" style={{ animation: "fadeSlideUp 0.4s ease both" }}>
        <span className="text-white/20 text-xs font-bold tracking-[0.2em] uppercase">#{rank} Priority</span>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: "rgba(99,102,241,0.12)", color: "#a78bfa", border: "1px solid rgba(99,102,241,0.15)" }}>
          {item.lead.opportunity_type}
        </span>
      </div>

      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black"
        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 0 40px rgba(99,102,241,0.35)", animation: "scaleIn 0.4s 0.1s ease both" }}>
        {item.lead.name[0]}
      </div>

      <div style={{ animation: "fadeSlideUp 0.4s 0.15s ease both" }}>
        <h3 className="text-2xl font-black text-white mb-1">{item.lead.name}</h3>
        <div className="text-white/30 text-xs">{item.lead.phone}</div>
      </div>

      {item.signals && item.signals.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2" style={{ animation: "fadeSlideUp 0.4s 0.25s ease both" }}>
          {item.signals.slice(0, 3).map((sig, i) => (
            <span key={i} className="text-xs font-semibold px-3 py-1.5 rounded-full capitalize"
              style={{ background: "rgba(99,102,241,0.1)", color: "#c4b5fd", border: "1px solid rgba(99,102,241,0.12)" }}>
              {signalIcons[sig.signal_type] || "•"} {sig.signal_type.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}

      <div className="text-sm text-white/60 leading-relaxed rounded-xl p-4 text-left w-full"
        style={{ background: "rgba(255,255,255,0.03)", borderLeft: "3px solid rgba(99,102,241,0.4)", animation: "fadeSlideUp 0.4s 0.35s ease both" }}>
        {item.recommended_action}
      </div>

      <div className="text-white/20 text-xs" style={{ animation: "fadeSlideUp 0.4s 0.45s ease both" }}>
        Score <span className="text-indigo-300/60 font-bold">{item.lead.lead_score}</span>
        {" · "}Confidence <span className="text-indigo-300/60 font-bold">{Math.round(item.confidence * 100)}%</span>
      </div>
    </div>
  )
}

function BriefCTA({ count, onClose }: { count: number; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-5xl" style={{ animation: "scaleIn 0.4s ease both", filter: "drop-shadow(0 0 20px rgba(129,140,248,0.3))" }}>✦</div>
      <div style={{ animation: "fadeSlideUp 0.4s 0.15s ease both" }}>
        <h2 className="text-3xl font-black text-white mb-2">
          <AnimatedNumber value={count} duration={800} /> decision{count !== 1 ? "s" : ""} waiting
        </h2>
        <p className="text-white/35 text-sm">Your queue is ranked. Approve in one tap.</p>
      </div>
      <button onClick={onClose}
        className="text-white font-black text-base px-8 py-4 rounded-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group"
        style={{
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          boxShadow: "0 6px 28px rgba(99,102,241,0.4)",
          animation: "fadeSlideUp 0.4s 0.3s ease both",
        }}>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)", backgroundSize: "200% 100%", animation: "shimmer 1.5s ease infinite" }} />
        <span className="relative">Open my queue →</span>
      </button>
    </div>
  )
}
