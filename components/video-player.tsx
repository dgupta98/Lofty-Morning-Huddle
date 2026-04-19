"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { QueueItem, OvernightSummary } from "@/lib/types"

interface VideoPlayerProps {
  agentName: string
  summary: OvernightSummary
  queue: QueueItem[]
  onComplete: () => void
}

const SLIDE_DURATION = 5000

const signalIcons: Record<string, string> = {
  site_visit: "👁",
  email_open: "📧",
  showing_request: "🏠",
  aos_escalation: "🚨",
  buyer_match: "🎯",
  seller_intent: "📋",
}

type Slide =
  | { type: "intro" }
  | { type: "stats" }
  | { type: "lead"; item: QueueItem; rank: number }
  | { type: "cta" }

function buildSpeechScript(s: Slide, agentName: string, summary: OvernightSummary): string {
  if (s.type === "intro")
    return `Good morning ${agentName}. Lofty AOS worked through the night and your morning briefing is ready.`
  if (s.type === "stats")
    return `Overnight, AOS completed ${summary.lead_followups} lead follow-ups, accepted ${summary.showing_requests_accepted} showings, and found ${summary.buyer_matches} buyer matches.${summary.escalated_lead_name ? ` ${summary.escalated_lead_name} has been escalated by the Homeowner Agent.` : ""}`
  if (s.type === "lead") {
    const first = s.item.lead.name.split(" ")[0]
    const sentence = (s.item.explanation ?? "").split(".")[0]
    return `Priority ${s.rank}: ${first}. Lead score ${s.item.lead.lead_score}. ${sentence}.`
  }
  if (s.type === "cta")
    return `That's your briefing. Your queue is ranked and ready. Time to make it happen.`
  return ""
}

export function VideoPlayer({ agentName, summary, queue, onComplete }: VideoPlayerProps) {
  const slides: Slide[] = [
    { type: "intro" },
    { type: "stats" },
    ...queue.map((item, i) => ({ type: "lead" as const, item, rank: i + 1 })),
    { type: "cta" },
  ]
  const total = slides.length

  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  // Stable refs so speech effect doesn't need them in deps
  const agentNameRef = useRef(agentName)
  const summaryRef = useRef(summary)
  const slidesRef = useRef(slides)
  agentNameRef.current = agentName
  summaryRef.current = summary
  slidesRef.current = slides

  const [slide, setSlide] = useState(0)
  const [progress, setProgress] = useState(0)
  const [fading, setFading] = useState(false)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const advance = useCallback(() => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null }
    if (slide >= total - 1) { onCompleteRef.current(); return }
    setFading(true)
    setTimeout(() => { setSlide((s) => s + 1); setProgress(0); setFading(false) }, 300)
  }, [slide, total])

  useEffect(() => {
    const start = Date.now()
    tickRef.current = setInterval(() => {
      const elapsed = Date.now() - start
      setProgress(Math.min(100, (elapsed / SLIDE_DURATION) * 100))
      if (elapsed >= SLIDE_DURATION) advance()
    }, 40)
    return () => { if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null } }
  }, [slide, advance])

  // Audio narration — fires on each slide change
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const currentSlide = slidesRef.current[slide]
    if (!currentSlide) return
    const text = buildSpeechScript(currentSlide, agentNameRef.current, summaryRef.current)
    if (!text) return
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = 1.08
    utter.pitch = 1.0
    utter.volume = 1
    window.speechSynthesis.speak(utter)
    return () => { window.speechSynthesis.cancel() }
  }, [slide]) // eslint-disable-line react-hooks/exhaustive-deps

  // Stop speech when video is skipped / unmounted
  useEffect(() => {
    return () => { if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel() }
  }, [])

  const s = slides[Math.min(slide, slides.length - 1)]
  if (!s) return null

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden" style={{
      height: "100%",
      background: "linear-gradient(160deg,#0f0a1e 0%,#1a1040 50%,#0d1530 100%)",
      border: "1px solid rgba(99,102,241,0.2)",
      boxShadow: "0 8px 40px rgba(99,102,241,0.15)",
    }}>
      {/* Top bar: progress + skip */}
      <div className="flex items-center gap-2 px-4 pt-3.5 pb-2">
        <div className="flex gap-1 flex-1">
          {slides.map((_, i) => (
            <div key={i} className="h-0.5 flex-1 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.12)" }}>
              {i < slide && <div className="h-full w-full" style={{ background: "rgba(255,255,255,0.5)" }} />}
              {i === slide && (
                <div className="h-full" style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg,#818cf8,#a78bfa)",
                  transition: "width 40ms linear",
                }} />
              )}
            </div>
          ))}
        </div>
        <button onClick={() => { window.speechSynthesis?.cancel(); onComplete() }}
          className="text-white/30 hover:text-white/70 transition-colors text-xs font-semibold flex-shrink-0">
          Skip ✕
        </button>
      </div>

      {/* Lofty badge */}
      <div className="flex items-center gap-2 px-4 pb-3">
        <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-black"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
          L
        </div>
        <span className="text-white/30 text-[10px] font-semibold tracking-widest uppercase">Morning Briefing</span>
        <span className="ml-auto text-white/20 text-[10px]">🔊 narrated</span>
      </div>

      {/* Slide content */}
      <div className="flex items-center justify-center px-6" style={{
        flex: "1 1 0",
        minHeight: 0,
        opacity: fading ? 0 : 1,
        transition: "opacity 0.3s ease",
      }}>
        {s.type === "intro" && <IntroSlide agentName={agentName} />}
        {s.type === "stats" && <StatsSlide summary={summary} queueLen={queue.length} />}
        {s.type === "lead" && "item" in s && <LeadSlide item={s.item} rank={s.rank} />}
        {s.type === "cta" && <CTASlide count={queue.length} onComplete={() => { window.speechSynthesis?.cancel(); onComplete() }} />}
      </div>

      {/* Bottom nav dots */}
      <div className="flex justify-center gap-1.5 pb-4">
        {slides.map((_, i) => (
          <div key={i} className="rounded-full transition-all"
            style={{
              width: i === slide ? 16 : 4,
              height: 4,
              background: i === slide ? "rgba(129,140,248,0.9)" : "rgba(255,255,255,0.15)",
            }} />
        ))}
      </div>
    </div>
  )
}

function IntroSlide({ agentName }: { agentName: string }) {
  return (
    <div className="text-center flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black"
        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 0 40px rgba(99,102,241,0.5)", animation: "pulseGlow 2s ease infinite" }}>
        L✦
      </div>
      <div>
        <p className="text-white/40 text-xs font-semibold mb-2 tracking-widest uppercase">Good morning</p>
        <h2 className="text-3xl font-black leading-tight" style={{
          background: "linear-gradient(90deg,#fff,#c4b5fd)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          {agentName} ✦
        </h2>
        <p className="text-white/30 text-xs mt-2">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>
      <p className="text-white/50 text-sm max-w-xs leading-relaxed">Lofty AOS worked through the night. Here&apos;s your briefing.</p>
    </div>
  )
}

function StatsSlide({ summary, queueLen }: { summary: OvernightSummary; queueLen: number }) {
  return (
    <div className="w-full flex flex-col gap-4 text-center">
      <p className="text-white/40 text-xs font-bold tracking-widest uppercase">Overnight activity</p>
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { n: summary.lead_followups, label: "Follow-ups", icon: "📬" },
          { n: summary.showing_requests_accepted, label: "Showings", icon: "🏠" },
          { n: summary.buyer_matches, label: "Matches", icon: "🎯" },
          { n: queueLen, label: "Waiting", icon: "⚡" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl p-3 text-center"
            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-2xl font-black text-white">{s.n}</div>
            <div className="text-white/40 text-[10px] font-semibold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
      {summary.escalated_lead_name && (
        <div className="text-xs text-orange-300/80 font-medium">
          🚨 {summary.escalated_lead_name} escalated by Homeowner Agent
        </div>
      )}
    </div>
  )
}

function LeadSlide({ item, rank }: { item: QueueItem; rank: number }) {
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-white/30 text-[10px] font-bold tracking-widest uppercase">#{rank} Priority</span>
        <span className="text-[10px] font-bold px-2 py-1 rounded-full"
          style={{ background: "rgba(99,102,241,0.2)", color: "#a78bfa" }}>
          {item.lead.opportunity_type}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-black flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 0 24px rgba(99,102,241,0.4)" }}>
          {item.lead.name[0]}
        </div>
        <div>
          <h3 className="text-xl font-black text-white">{item.lead.name}</h3>
          <div className="text-white/40 text-xs">{item.lead.phone}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-2xl font-black" style={{
            background: "linear-gradient(90deg,#818cf8,#a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>{item.lead.lead_score}</div>
          <div className="text-white/30 text-[10px]">score</div>
        </div>
      </div>
      {item.signals && item.signals.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.signals.slice(0, 3).map((sig, i) => (
            <span key={i} className="text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize"
              style={{ background: "rgba(99,102,241,0.12)", color: "#c4b5fd", border: "1px solid rgba(99,102,241,0.2)" }}>
              {signalIcons[sig.signal_type] || "•"} {sig.signal_type.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}
      <div className="text-xs text-white/60 leading-relaxed rounded-xl p-3"
        style={{ background: "rgba(255,255,255,0.04)", borderLeft: "2px solid rgba(99,102,241,0.5)" }}>
        {item.recommended_action}
      </div>
    </div>
  )
}

function CTASlide({ count, onComplete }: { count: number; onComplete: () => void }) {
  return (
    <div className="text-center flex flex-col items-center gap-5">
      <div className="text-4xl" style={{
        background: "linear-gradient(135deg,#6366f1,#a78bfa)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}>✦</div>
      <div>
        <h2 className="text-2xl font-black text-white mb-1">
          {count} decision{count !== 1 ? "s" : ""} waiting
        </h2>
        <p className="text-white/40 text-sm">Your queue is ranked and ready.</p>
      </div>
      <button onClick={onComplete}
        className="text-white font-black text-sm px-7 py-3.5 rounded-xl hover:-translate-y-0.5 transition-all"
        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.4)" }}>
        Open my queue →
      </button>
    </div>
  )
}
