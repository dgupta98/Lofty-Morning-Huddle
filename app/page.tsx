"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const AGENT_NAME = "James"

const agentStats = [
  { label: "Lead follow-ups handled overnight", value: "14" },
  { label: "Showing requests accepted", value: "2" },
  { label: "Buyer matches found", value: "1" },
  { label: "Decisions waiting for you", value: "3" },
]

const features = [
  {
    icon: "✦",
    title: "Overnight AOS recap",
    desc: "Every lead touched, every signal captured while you slept.",
  },
  {
    icon: "⚡",
    title: "AI-ranked action queue",
    desc: "3 decisions, ranked by urgency. Approve in one tap.",
  },
  {
    icon: "▶",
    title: "Audio morning brief",
    desc: "60-second spoken summary — hands-free, on your commute.",
  },
]

export default function LandingPage() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [launching, setLaunching] = useState(false)
  const [counts, setCounts] = useState([0, 0, 0, 0])

  useEffect(() => {
    setVisible(true)
  }, [])

  // Animate the stat counters once visible
  useEffect(() => {
    if (!visible) return
    const targets = [14, 2, 1, 3]
    const duration = 1200
    const steps = 40
    const interval = duration / steps
    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps
      const eased = 1 - Math.pow(1 - progress, 3)
      setCounts(targets.map((t) => Math.round(t * eased)))
      if (step >= steps) clearInterval(timer)
    }, interval)
    return () => clearInterval(timer)
  }, [visible])

  function handleLaunch() {
    setLaunching(true)
    setTimeout(() => router.push("/dashboard"), 600)
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.6s ease" }}
    >
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-7 py-3.5"
        style={{
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(99,102,241,0.1)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              boxShadow: "0 2px 10px rgba(99,102,241,0.35)",
            }}
          >
            L✦
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-extrabold text-indigo-800 tracking-tight">Lofty</span>
            <span className="text-[9px] font-semibold tracking-widest uppercase text-indigo-400">
              Morning Handoff
            </span>
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.15)",
            color: "#6366f1",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-green-500"
            style={{ animation: "pulseGlow 2s infinite" }}
          />
          AOS Active
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-16">
        {/* Pill badge */}
        <div
          className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full mb-8"
          style={{
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.2)",
            color: "#6366f1",
            animation: "fadeSlideUp 0.5s ease both",
          }}
        >
          <span style={{ animation: "pulseGlow 2s infinite" }}>✦</span>
          GlobeHack S1 · Lofty AOS Integration
        </div>

        {/* Headline */}
        <h1
          className="text-5xl font-black tracking-tight leading-tight max-w-2xl mb-4"
          style={{
            color: "#1e1b4b",
            animation: "fadeSlideUp 0.5s 0.1s ease both",
          }}
        >
          Good morning,{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gradientShift 4s ease infinite",
            }}
          >
            {AGENT_NAME}
          </span>{" "}
          ✦
        </h1>

        <p
          className="text-lg text-gray-500 max-w-lg mb-10 leading-relaxed"
          style={{ animation: "fadeSlideUp 0.5s 0.2s ease both" }}
        >
          While you slept, Lofty&apos;s AI agents handled your leads, tracked every signal, and
          ranked your 3 most important actions for today.
        </p>

        {/* CTA */}
        <div
          className="flex flex-col sm:flex-row items-center gap-3 mb-16"
          style={{ animation: "fadeSlideUp 0.5s 0.3s ease both" }}
        >
          <button
            onClick={handleLaunch}
            disabled={launching}
            className="text-white font-black text-base px-8 py-4 rounded-2xl transition-all hover:-translate-y-1 disabled:opacity-70 flex items-center gap-2.5"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              boxShadow: "0 6px 28px rgba(99,102,241,0.45)",
              animation: "pulseGlow 3s ease infinite",
              minWidth: 220,
              justifyContent: "center",
            }}
          >
            {launching ? (
              <>
                <span
                  className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white inline-block"
                  style={{ animation: "spin 0.7s linear infinite" }}
                />
                Opening…
              </>
            ) : (
              <>
                ✦ Open my handoff
              </>
            )}
          </button>
          <button
            onClick={() => router.push("/login")}
            className="text-indigo-500 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            Sign in instead →
          </button>
        </div>

        {/* Stat counters */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl w-full mb-16"
          style={{ animation: "fadeSlideUp 0.5s 0.4s ease both" }}
        >
          {agentStats.map((stat, i) => (
            <div
              key={stat.label}
              className="rounded-2xl p-4 text-center"
              style={{
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(99,102,241,0.12)",
                boxShadow: "0 4px 16px rgba(99,102,241,0.07)",
              }}
            >
              <div
                className="text-3xl font-black mb-1"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {counts[i]}
              </div>
              <div className="text-[10px] font-semibold text-gray-400 leading-tight">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full"
          style={{ animation: "fadeSlideUp 0.5s 0.5s ease both" }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl p-5 text-left relative overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.78)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(99,102,241,0.13)",
                boxShadow: "0 4px 20px rgba(99,102,241,0.07)",
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6)", animation: "gradientShift 4s ease infinite", backgroundSize: "200% auto" }}
              />
              <div
                className="text-xl font-black mb-3"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {f.icon}
              </div>
              <h3 className="text-sm font-extrabold text-indigo-900 mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mt-auto py-6 text-center">
        <p className="text-xs text-gray-400 font-medium">
          Powered by{" "}
          <span className="text-indigo-400 font-semibold">Lofty AOS</span>
          {" · "}
          <span className="text-indigo-400 font-semibold">InsForge</span>
          {" · "}
          <span className="text-indigo-400 font-semibold">Llama-3.3</span>
        </p>
      </footer>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
