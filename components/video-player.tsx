"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import type { QueueItem, OvernightSummary } from "@/lib/types"

interface VideoPlayerProps {
  agentName: string
  summary: OvernightSummary
  queue: QueueItem[]
  onComplete: () => void
}

const SLIDE_DURATION = 6000
const TRANSITION_MS = 500

const signalIcons: Record<string, string> = {
  site_visit: "👁", email_open: "📧", showing_request: "🏠",
  aos_escalation: "🚨", buyer_match: "🎯", seller_intent: "📋",
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

// ── Particle canvas background ──
function ParticleCanvas({ slideIndex }: { slideIndex: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; r: number; a: number; hue: number }[]>([])
  const frameRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2
      canvas.height = canvas.offsetHeight * 2
      ctx.scale(2, 2)
    }
    resize()

    // Initialize particles
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 60; i++) {
        particlesRef.current.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 2 + 0.5, a: Math.random() * 0.4 + 0.1,
          hue: 240 + Math.random() * 40,
        })
      }
    }

    let running = true
    const animate = () => {
      if (!running) return
      frameRef.current++
      const cw = canvas.offsetWidth
      const ch = canvas.offsetHeight
      ctx.clearRect(0, 0, cw, ch)

      // Animated gradient background
      const t = frameRef.current * 0.002
      const grd = ctx.createRadialGradient(
        cw * 0.3 + Math.sin(t) * 80, ch * 0.3 + Math.cos(t * 0.7) * 60, 0,
        cw * 0.5, ch * 0.5, cw * 0.8
      )
      grd.addColorStop(0, `hsla(${250 + slideIndex * 8}, 60%, 12%, 1)`)
      grd.addColorStop(0.5, `hsla(${260 + slideIndex * 5}, 50%, 8%, 1)`)
      grd.addColorStop(1, `hsla(${230 + slideIndex * 3}, 55%, 6%, 1)`)
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, cw, ch)

      // Nebula glow
      for (let i = 0; i < 3; i++) {
        const nx = cw * (0.3 + i * 0.2) + Math.sin(t * (0.5 + i * 0.2)) * 60
        const ny = ch * (0.4 + i * 0.15) + Math.cos(t * (0.3 + i * 0.15)) * 40
        const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, 120 + i * 40)
        ng.addColorStop(0, `hsla(${250 + i * 20 + slideIndex * 10}, 70%, 50%, 0.06)`)
        ng.addColorStop(1, "transparent")
        ctx.fillStyle = ng
        ctx.fillRect(0, 0, cw, ch)
      }

      // Particles
      particlesRef.current.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = cw
        if (p.x > cw) p.x = 0
        if (p.y < 0) p.y = ch
        if (p.y > ch) p.y = 0

        const pulse = Math.sin(frameRef.current * 0.02 + p.hue) * 0.15 + 0.85
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * pulse, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 70%, 70%, ${p.a * pulse})`
        ctx.fill()

        // Glow
        const glowGrd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6)
        glowGrd.addColorStop(0, `hsla(${p.hue}, 70%, 60%, ${p.a * 0.15})`)
        glowGrd.addColorStop(1, "transparent")
        ctx.fillStyle = glowGrd
        ctx.fillRect(p.x - p.r * 6, p.y - p.r * 6, p.r * 12, p.r * 12)
      })

      // Connection lines between nearby particles
      const ps = particlesRef.current
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x
          const dy = ps[i].y - ps[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(ps[i].x, ps[i].y)
            ctx.lineTo(ps[j].x, ps[j].y)
            ctx.strokeStyle = `hsla(250, 60%, 60%, ${(1 - dist / 100) * 0.08})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      requestAnimationFrame(animate)
    }
    animate()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    return () => { running = false; ro.disconnect() }
  }, [slideIndex])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

// ── Animated counter ──
function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    startRef.current = null
    const animate = (ts: number) => {
      if (startRef.current === null) startRef.current = ts
      const elapsed = ts - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(value * eased))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value, duration])

  return <>{display}</>
}

// ── Waveform visualizer ──
function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-[2px] h-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="w-[2px] rounded-full transition-all"
          style={{
            height: active ? `${6 + Math.sin(Date.now() * 0.005 + i) * 6}px` : "3px",
            background: active ? "rgba(129,140,248,0.8)" : "rgba(255,255,255,0.2)",
            animation: active ? `waveBar 0.6s ${i * 0.1}s ease-in-out infinite alternate` : "none",
          }}
        />
      ))}
    </div>
  )
}

// ── Score ring ──
function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const r = (size - 6) / 2
  const circumference = 2 * Math.PI * r

  useEffect(() => {
    let start: number | null = null
    const animate = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / 1000, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setAnimatedScore(Math.round(score * eased))
      if (p < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [score])

  const dashLen = (animatedScore / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={3}
          stroke="rgba(99,102,241,0.15)" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={3}
          stroke="url(#scoreGrad)" strokeLinecap="round"
          strokeDasharray={`${dashLen} ${circumference - dashLen}`}
          style={{ transition: "stroke-dasharray 0.05s linear" }} />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-black text-sm">{animatedScore}</span>
      </div>
    </div>
  )
}

// ── Signal timeline ──
function SignalTimeline({ signals }: { signals: QueueItem["signals"] }) {
  if (!signals || signals.length === 0) return null
  return (
    <div className="flex flex-col gap-1.5 mt-1">
      {signals.slice(0, 3).map((sig, i) => (
        <div
          key={i}
          className="flex items-center gap-2"
          style={{ animation: `fadeSlideUp 0.4s ${0.3 + i * 0.15}s ease both` }}
        >
          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#818cf8", boxShadow: "0 0 6px rgba(129,140,248,0.5)" }} />
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(129,140,248,0.3), transparent)" }} />
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
            style={{ background: "rgba(99,102,241,0.1)", color: "#c4b5fd", border: "1px solid rgba(99,102,241,0.15)" }}>
            {signalIcons[sig.signal_type] || "•"} {sig.signal_type.replace(/_/g, " ")}
          </span>
          <span className="text-[9px] text-white/25 font-mono">
            {new Date(sig.occurred_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Main VideoPlayer ──
export function VideoPlayer({ agentName, summary, queue, onComplete }: VideoPlayerProps) {
  const slides: Slide[] = useMemo(() => [
    { type: "intro" },
    { type: "stats" },
    ...queue.map((item, i) => ({ type: "lead" as const, item, rank: i + 1 })),
    { type: "cta" },
  ], [queue])
  const total = slides.length

  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const agentNameRef = useRef(agentName)
  const summaryRef = useRef(summary)
  const slidesRef = useRef(slides)
  agentNameRef.current = agentName
  summaryRef.current = summary
  slidesRef.current = slides

  const [slide, setSlide] = useState(0)
  const [progress, setProgress] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [muted, setMuted] = useState(false)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pausedRef = useRef(false)
  const startTimeRef = useRef(0)
  const elapsedBeforePauseRef = useRef(0)

  const advance = useCallback(() => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null }
    if (slide >= total - 1) { onCompleteRef.current(); return }
    setTransitioning(true)
    setTimeout(() => { setSlide((s) => s + 1); setProgress(0); setTransitioning(false); elapsedBeforePauseRef.current = 0 }, TRANSITION_MS)
  }, [slide, total])

  const goToSlide = useCallback((idx: number) => {
    if (idx < 0 || idx >= total || idx === slide) return
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null }
    setTransitioning(true)
    elapsedBeforePauseRef.current = 0
    setTimeout(() => { setSlide(idx); setProgress(0); setTransitioning(false) }, 300)
  }, [total, slide])

  // Timer
  useEffect(() => {
    if (paused) return
    startTimeRef.current = Date.now()
    tickRef.current = setInterval(() => {
      if (pausedRef.current) return
      const elapsed = elapsedBeforePauseRef.current + (Date.now() - startTimeRef.current)
      setProgress(Math.min(100, (elapsed / SLIDE_DURATION) * 100))
      if (elapsed >= SLIDE_DURATION) advance()
    }, 30)
    return () => { if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null } }
  }, [slide, advance, paused])

  // Pause/resume
  useEffect(() => {
    pausedRef.current = paused
    if (paused) {
      elapsedBeforePauseRef.current += Date.now() - startTimeRef.current
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null }
    }
  }, [paused])

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "k") { e.preventDefault(); setPaused(p => !p) }
      if (e.key === "ArrowRight" || e.key === "l") goToSlide(slide + 1)
      if (e.key === "ArrowLeft" || e.key === "j") goToSlide(slide - 1)
      if (e.key === "m") setMuted(m => !m)
      if (e.key === "Escape") { window.speechSynthesis?.cancel(); onCompleteRef.current() }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [slide, goToSlide])

  // Audio narration
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    if (muted) return
    const currentSlide = slidesRef.current[slide]
    if (!currentSlide) return
    const text = buildSpeechScript(currentSlide, agentNameRef.current, summaryRef.current)
    if (!text) return
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = 1.05
    utter.pitch = 1.0
    utter.volume = 1
    utter.onstart = () => setIsSpeaking(true)
    utter.onend = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utter)
    return () => { window.speechSynthesis.cancel(); setIsSpeaking(false) }
  }, [slide, muted]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => { if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel() }
  }, [])

  const s = slides[Math.min(slide, slides.length - 1)]
  if (!s) return null

  const elapsed = slide * SLIDE_DURATION + (progress / 100) * SLIDE_DURATION
  const totalMs = total * SLIDE_DURATION
  const formatTime = (ms: number) => {
    const sec = Math.floor(ms / 1000)
    const m = Math.floor(sec / 60)
    const ss = sec % 60
    return `${m}:${ss.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden relative select-none" style={{
      height: "100%",
      border: "1px solid rgba(99,102,241,0.15)",
      boxShadow: "0 8px 48px rgba(99,102,241,0.12), 0 2px 8px rgba(0,0,0,0.2)",
    }}>
      {/* Animated canvas background */}
      <ParticleCanvas slideIndex={slide} />

      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)",
      }} />

      {/* Top bar: progress segments + controls */}
      <div className="relative z-10 flex items-center gap-3 px-5 pt-4 pb-2">
        <div className="flex gap-1 flex-1">
          {slides.map((_, i) => (
            <button key={i} onClick={() => goToSlide(i)}
              className="h-1 flex-1 rounded-full overflow-hidden cursor-pointer transition-all hover:h-1.5"
              style={{ background: "rgba(255,255,255,0.1)" }}>
              {i < slide && <div className="h-full w-full rounded-full" style={{ background: "rgba(255,255,255,0.5)" }} />}
              {i === slide && (
                <div className="h-full rounded-full" style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg,#818cf8,#c084fc)",
                  transition: "width 30ms linear",
                }} />
              )}
            </button>
          ))}
        </div>
        <button onClick={() => { window.speechSynthesis?.cancel(); onComplete() }}
          className="text-white/25 hover:text-white/70 transition-colors text-xs font-semibold shrink-0 px-2 py-1 rounded-lg hover:bg-white/5">
          Skip ✕
        </button>
      </div>

      {/* Header bar */}
      <div className="relative z-10 flex items-center gap-2.5 px-5 pb-3">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-black"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 2px 8px rgba(99,102,241,0.4)" }}>
          L
        </div>
        <span className="text-white/30 text-[10px] font-semibold tracking-[0.2em] uppercase">Morning Briefing</span>
        <div className="ml-auto flex items-center gap-3">
          <Waveform active={isSpeaking} />
          <button onClick={() => setMuted(m => !m)}
            className="text-white/30 hover:text-white/60 transition-colors text-xs"
            title={muted ? "Unmute (M)" : "Mute (M)"}>
            {muted ? "🔇" : "🔊"}
          </button>
        </div>
      </div>

      {/* Slide content */}
      <div className="relative z-10 flex items-center justify-center px-8" style={{
        flex: "1 1 0",
        minHeight: 0,
        opacity: transitioning ? 0 : 1,
        transform: transitioning ? "scale(0.95) translateY(8px)" : "scale(1) translateY(0)",
        transition: `all ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      }}>
        {s.type === "intro" && <IntroSlide agentName={agentName} />}
        {s.type === "stats" && <StatsSlide summary={summary} queueLen={queue.length} />}
        {s.type === "lead" && "item" in s && <LeadSlide item={s.item} rank={s.rank} total={queue.length} />}
        {s.type === "cta" && <CTASlide count={queue.length} onComplete={() => { window.speechSynthesis?.cancel(); onComplete() }} />}
      </div>

      {/* Bottom controls */}
      <div className="relative z-10 flex items-center justify-between px-5 pb-4 pt-2">
        {/* Nav dots */}
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => goToSlide(i)}
              className="rounded-full transition-all duration-300 hover:opacity-80"
              style={{
                width: i === slide ? 20 : 5,
                height: 5,
                background: i === slide
                  ? "linear-gradient(90deg, #818cf8, #c084fc)"
                  : i < slide ? "rgba(129,140,248,0.4)" : "rgba(255,255,255,0.12)",
                boxShadow: i === slide ? "0 0 8px rgba(129,140,248,0.4)" : "none",
              }} />
          ))}
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-3">
          <button onClick={() => goToSlide(slide - 1)}
            className="text-white/20 hover:text-white/60 transition-colors text-sm" title="Previous (←)">
            ⏮
          </button>
          <button onClick={() => setPaused(p => !p)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all hover:scale-105"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
            title={paused ? "Play (Space)" : "Pause (Space)"}>
            {paused ? "▶" : "⏸"}
          </button>
          <button onClick={() => goToSlide(slide + 1)}
            className="text-white/20 hover:text-white/60 transition-colors text-sm" title="Next (→)">
            ⏭
          </button>
        </div>

        {/* Time */}
        <div className="text-[10px] font-mono text-white/25">
          {formatTime(elapsed)} / {formatTime(totalMs)}
        </div>
      </div>

      {/* Pause overlay */}
      {paused && (
        <div className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer"
          onClick={() => setPaused(false)}
          style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.2)", animation: "scaleIn 0.2s ease both" }}>
            <span className="text-white text-2xl ml-1">▶</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Slide Components ──

function IntroSlide({ agentName }: { agentName: string }) {
  const [show, setShow] = useState(false)
  useEffect(() => { const t = setTimeout(() => setShow(true), 100); return () => clearTimeout(t) }, [])

  return (
    <div className="text-center flex flex-col items-center gap-5 w-full max-w-md">
      {/* Animated logo */}
      <div style={{ animation: "scaleIn 0.6s ease both" }}>
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black relative"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 0 60px rgba(99,102,241,0.5), 0 0 120px rgba(99,102,241,0.2)" }}>
          L✦
          {/* Orbiting dot */}
          <div className="absolute w-2 h-2 rounded-full" style={{
            background: "#c084fc",
            boxShadow: "0 0 8px rgba(192,132,252,0.6)",
            animation: "orbit 3s linear infinite",
            transformOrigin: "40px 40px",
            top: -4, left: "calc(50% - 4px)",
          }} />
        </div>
      </div>

      <div style={{ opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(12px)", transition: "all 0.6s 0.2s ease" }}>
        <p className="text-white/35 text-xs font-semibold mb-3 tracking-[0.25em] uppercase">Good morning</p>
        <h2 className="text-4xl font-black leading-tight" style={{
          background: "linear-gradient(90deg,#fff 30%,#c4b5fd 70%,#818cf8)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          {agentName} ✦
        </h2>
        <p className="text-white/25 text-xs mt-3 font-medium">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      <p className="text-white/40 text-sm max-w-xs leading-relaxed"
        style={{ opacity: show ? 1 : 0, transition: "opacity 0.6s 0.5s ease" }}>
        Lofty AOS worked through the night. Here&apos;s your briefing.
      </p>

      {/* Decorative line */}
      <div className="w-16 h-px mt-2" style={{
        background: "linear-gradient(90deg, transparent, rgba(129,140,248,0.4), transparent)",
        animation: show ? "fadeSlideUp 0.5s 0.7s ease both" : "none",
      }} />
    </div>
  )
}

function StatsSlide({ summary, queueLen }: { summary: OvernightSummary; queueLen: number }) {
  const stats = [
    { n: summary.lead_followups, label: "Follow-ups", icon: "📬", color: "#818cf8" },
    { n: summary.showing_requests_accepted, label: "Showings", icon: "🏠", color: "#a78bfa" },
    { n: summary.buyer_matches, label: "Matches", icon: "🎯", color: "#c084fc" },
    { n: queueLen, label: "Waiting", icon: "⚡", color: "#f59e0b" },
  ]

  return (
    <div className="w-full max-w-lg flex flex-col gap-5 text-center">
      <p className="text-white/30 text-xs font-bold tracking-[0.25em] uppercase"
        style={{ animation: "fadeSlideUp 0.4s ease both" }}>
        Overnight activity
      </p>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="rounded-2xl p-4 text-center relative overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(8px)",
              animation: `fadeSlideUp 0.5s ${0.1 + i * 0.1}s ease both`,
            }}>
            {/* Accent glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-px" style={{ background: `linear-gradient(90deg, transparent, ${s.color}60, transparent)` }} />
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-3xl font-black text-white mb-0.5">
              <AnimatedNumber value={s.n} duration={1000 + i * 200} />
            </div>
            <div className="text-white/30 text-[10px] font-semibold">{s.label}</div>
          </div>
        ))}
      </div>

      {summary.escalated_lead_name && (
        <div className="flex items-center justify-center gap-2 text-xs rounded-xl px-4 py-2.5 mx-auto"
          style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.15)", animation: "fadeSlideUp 0.5s 0.6s ease both" }}>
          <span>🚨</span>
          <span className="text-orange-300/80 font-medium">{summary.escalated_lead_name} escalated by Homeowner Agent</span>
        </div>
      )}
    </div>
  )
}

function LeadSlide({ item, rank, total }: { item: QueueItem; rank: number; total: number }) {
  return (
    <div className="w-full max-w-lg flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center justify-between" style={{ animation: "fadeSlideUp 0.4s ease both" }}>
        <div className="flex items-center gap-2">
          <span className="text-white/20 text-[10px] font-bold tracking-[0.2em] uppercase">#{rank} of {total}</span>
          <div className="w-px h-3 bg-white/10" />
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: "rgba(99,102,241,0.12)", color: "#a78bfa", border: "1px solid rgba(99,102,241,0.15)" }}>
            {item.lead.opportunity_type}
          </span>
        </div>
        <ScoreRing score={item.lead.lead_score} />
      </div>

      {/* Lead info */}
      <div className="flex items-center gap-4" style={{ animation: "fadeSlideUp 0.4s 0.1s ease both" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shrink-0 relative"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 0 30px rgba(99,102,241,0.35)" }}>
          {item.lead.name[0]}
          {/* Status ring */}
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px]"
            style={{ background: "#1a1040", border: "2px solid #6366f1" }}>
            {rank <= 2 ? "🔥" : "•"}
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-black text-white leading-tight">{item.lead.name}</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-white/30 text-xs">{item.lead.phone}</span>
            <span className="text-white/15">·</span>
            <span className="text-white/30 text-xs">{item.lead.email.split("@")[0]}@…</span>
          </div>
        </div>
      </div>

      {/* Signal timeline */}
      <div style={{ animation: "fadeSlideUp 0.4s 0.2s ease both" }}>
        <SignalTimeline signals={item.signals} />
      </div>

      {/* Recommended action */}
      <div className="rounded-xl p-4 relative overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(99,102,241,0.1)",
          animation: "fadeSlideUp 0.4s 0.35s ease both",
        }}>
        <div className="absolute top-0 left-0 w-0.5 h-full" style={{ background: "linear-gradient(180deg, #818cf8, #c084fc)" }} />
        <p className="text-[9px] font-bold text-indigo-400/50 tracking-[0.15em] uppercase mb-2">Recommended</p>
        <p className="text-sm text-white/70 leading-relaxed">{item.recommended_action}</p>
      </div>

      {/* Confidence bar */}
      <div className="flex items-center gap-3" style={{ animation: "fadeSlideUp 0.4s 0.45s ease both" }}>
        <span className="text-[10px] text-white/20 font-medium">Confidence</span>
        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div className="h-full rounded-full" style={{
            width: `${Math.round(item.confidence * 100)}%`,
            background: "linear-gradient(90deg, #818cf8, #c084fc)",
            transition: "width 1s ease",
          }} />
        </div>
        <span className="text-[10px] text-indigo-300/60 font-bold">{Math.round(item.confidence * 100)}%</span>
      </div>
    </div>
  )
}

function CTASlide({ count, onComplete }: { count: number; onComplete: () => void }) {
  const [show, setShow] = useState(false)
  useEffect(() => { const t = setTimeout(() => setShow(true), 200); return () => clearTimeout(t) }, [])

  return (
    <div className="text-center flex flex-col items-center gap-6 max-w-md">
      {/* Animated sparkle */}
      <div className="relative" style={{ animation: "scaleIn 0.5s ease both" }}>
        <div className="text-5xl font-black" style={{
          background: "linear-gradient(135deg,#818cf8,#c084fc,#818cf8)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          animation: "gradientShift 3s ease infinite",
          filter: "drop-shadow(0 0 20px rgba(129,140,248,0.3))",
        }}>✦</div>
        {/* Radiating rings */}
        {[0, 1, 2].map(i => (
          <div key={i} className="absolute inset-0 rounded-full border"
            style={{
              borderColor: `rgba(129,140,248,${0.1 - i * 0.03})`,
              transform: `scale(${1.5 + i * 0.8})`,
              animation: `pulseGlow ${2 + i * 0.5}s ${i * 0.3}s ease infinite`,
            }} />
        ))}
      </div>

      <div style={{ opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(12px)", transition: "all 0.6s 0.1s ease" }}>
        <h2 className="text-3xl font-black text-white mb-2">
          <AnimatedNumber value={count} duration={800} /> decision{count !== 1 ? "s" : ""} waiting
        </h2>
        <p className="text-white/35 text-sm">Your queue is ranked and ready.</p>
      </div>

      <button onClick={onComplete}
        className="text-white font-black text-sm px-8 py-4 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(99,102,241,0.5)] relative overflow-hidden group"
        style={{
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          boxShadow: "0 4px 24px rgba(99,102,241,0.4)",
          opacity: show ? 1 : 0,
          transform: show ? "translateY(0)" : "translateY(8px)",
          transition: "all 0.6s 0.3s ease",
        }}>
        {/* Shimmer effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)", backgroundSize: "200% 100%", animation: "shimmer 1.5s ease infinite" }} />
        <span className="relative">Open my queue →</span>
      </button>

      <p className="text-white/15 text-[10px] font-medium" style={{ opacity: show ? 1 : 0, transition: "opacity 0.5s 0.6s ease" }}>
        Press Space to pause · Arrow keys to navigate · Esc to skip
      </p>
    </div>
  )
}
