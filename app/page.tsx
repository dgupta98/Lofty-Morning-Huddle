"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const USERS = [
  {
    id: "3b6e5282-dc35-4f89-b33f-fe464d627408",
    name: "James Doe",
    role: "Senior Agent",
    tag: "Heavy load",
    tagColor: "#dc2626",
    tagBg: "rgba(220,38,38,0.1)",
    decisions: 3,
    followups: 14,
    desc: "3 ranked decisions · 14 overnight follow-ups · 4 signals",
    avatar: "J",
    avatarGrad: "linear-gradient(135deg,#6366f1,#8b5cf6)",
  },
  {
    id: "a7c9e1f3-b5d7-4892-8e6a-2c4f68901234",
    name: "Sara Chen",
    role: "Buyer's Agent",
    tag: "Standard",
    tagColor: "#059669",
    tagBg: "rgba(5,150,105,0.1)",
    decisions: 2,
    followups: 6,
    desc: "2 ranked decisions · 6 overnight follow-ups · 2 signals",
    avatar: "S",
    avatarGrad: "linear-gradient(135deg,#0ea5e9,#6366f1)",
  },
]

const BOOT_STEPS = [
  "Connecting to AOS agents…",
  "Pulling overnight emails & notes…",
  "Analyzing lead signals…",
  "Calculating priority scores…",
  "Generating your morning briefing…",
]

export default function LandingPage() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [booting, setBooting] = useState(false)
  const [bootStep, setBootStep] = useState(0)
  const [bootDone, setBootDone] = useState(false)
  const [counts, setCounts] = useState([0, 0])

  useEffect(() => { setVisible(true) }, [])

  useEffect(() => {
    if (!visible) return
    const targets = [14, 2]
    let step = 0
    const timer = setInterval(() => {
      step++
      const ease = 1 - Math.pow(1 - step / 40, 3)
      setCounts(targets.map((t) => Math.round(t * ease)))
      if (step >= 40) clearInterval(timer)
    }, 30)
    return () => clearInterval(timer)
  }, [visible])

  async function handleLaunch(userId: string) {
    setSelected(userId)
    setBooting(true)
    setBootStep(0)

    for (let i = 0; i < BOOT_STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 300))
      setBootStep(i + 1)
    }
    setBootDone(true)
    await new Promise((r) => setTimeout(r, 700))

    if (typeof window !== "undefined") {
      sessionStorage.setItem("lofty_agent_id", userId)
      sessionStorage.setItem("lofty_agent_name", USERS.find((u) => u.id === userId)?.name.split(" ")[0] ?? "")
    }
    // window global — the only mechanism that survives Next.js code-splitting
    console.log("[LOFTY] landing: setting __lofty_play_video = true")
    ;(window as any).__lofty_play_video = true
    sessionStorage.setItem("lofty_play_video", "1")
    console.log("[LOFTY] landing: pushing to /dashboard")
    router.push("/dashboard")
  }

  return (
    <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease", minHeight: "100vh" }}>
      {/* Boot overlay */}
      {booting && (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
          style={{ background: "rgba(15,10,30,0.96)", backdropFilter: "blur(16px)" }}
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl font-black mb-8"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 0 40px rgba(99,102,241,0.5)" }}
          >
            L✦
          </div>
          <div className="w-72 flex flex-col gap-3 mb-8">
            {BOOT_STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                  style={{
                    background: bootStep > i ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.08)",
                    transition: "background 0.3s ease",
                  }}
                >
                  {bootStep > i ? "✓" : ""}
                </div>
                <span
                  className="text-sm font-medium"
                  style={{
                    color: bootStep > i ? "rgba(255,255,255,0.9)" : bootStep === i ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)",
                    transition: "color 0.3s ease",
                  }}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
          {bootDone && (
            <div className="text-indigo-300 font-bold text-sm" style={{ animation: "fadeSlideUp 0.4s ease both" }}>
              ✦ Handoff ready — opening your queue…
            </div>
          )}
          {!bootDone && bootStep < BOOT_STEPS.length && (
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                  style={{ animation: `bounce 0.8s ${i * 0.15}s ease-in-out infinite` }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-7 py-3.5"
        style={{
          background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(99,102,241,0.1)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 2px 10px rgba(99,102,241,0.35)" }}
          >
            L✦
          </div>
          <div>
            <div className="text-sm font-extrabold text-indigo-800 tracking-tight">Lofty</div>
            <div className="text-[9px] font-semibold tracking-widest uppercase text-indigo-400">Morning Handoff</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", color: "#6366f1" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" style={{ animation: "pulseGlow 2s infinite" }} />
          AOS Active
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-2xl mx-auto px-6 pt-16 pb-12 text-center">
        <div
          className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full mb-7"
          style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#6366f1", animation: "fadeSlideUp 0.4s ease both" }}
        >
          <span style={{ animation: "pulseGlow 2s infinite" }}>✦</span>
          GlobeHack S1 · Lofty AOS Integration
        </div>

        <h1
          className="text-4xl font-black tracking-tight leading-tight mb-4"
          style={{ color: "#1e1b4b", animation: "fadeSlideUp 0.4s 0.08s ease both" }}
        >
          Your overnight decisions,{" "}
          <span style={{
            background: "linear-gradient(90deg,#6366f1,#8b5cf6,#a78bfa)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "gradientShift 4s ease infinite",
          }}>
            approval-ready
          </span>
          {" "}✦
        </h1>

        <p className="text-base text-gray-500 mb-10 leading-relaxed" style={{ animation: "fadeSlideUp 0.4s 0.16s ease both" }}>
          Lofty&apos;s AOS agents handled {counts[0]} follow-ups and {counts[1]} showings overnight.
          Your ranked queue is ready — approve in one tap.
        </p>

        {/* User picker */}
        <div className="flex flex-col gap-4 mb-10 text-left" style={{ animation: "fadeSlideUp 0.4s 0.24s ease both" }}>
          <p className="text-xs font-bold text-gray-400 text-center tracking-widest uppercase">Choose your agent</p>
          {USERS.map((user) => (
            <button
              key={user.id}
              onClick={() => handleLaunch(user.id)}
              disabled={booting}
              className="w-full rounded-2xl p-5 text-left transition-all hover:-translate-y-0.5 group disabled:opacity-50"
              style={{
                background: "rgba(255,255,255,0.82)",
                backdropFilter: "blur(16px)",
                border: selected === user.id ? "2px solid #6366f1" : "1px solid rgba(99,102,241,0.15)",
                boxShadow: selected === user.id
                  ? "0 4px 24px rgba(99,102,241,0.2)"
                  : "0 2px 12px rgba(99,102,241,0.07)",
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-black flex-shrink-0"
                  style={{ background: user.avatarGrad }}
                >
                  {user.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-extrabold text-indigo-900">{user.name}</span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: user.tagBg, color: user.tagColor }}
                    >
                      {user.tag}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 font-medium">{user.role}</div>
                  <div className="text-[11px] text-indigo-400 font-semibold mt-1">{user.desc}</div>
                </div>
                <div
                  className="text-white text-xs font-bold px-4 py-2.5 rounded-xl flex-shrink-0 group-hover:-translate-y-px transition-all"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 3px 12px rgba(99,102,241,0.3)" }}
                >
                  Open ✦
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Features strip */}
        <div className="grid grid-cols-3 gap-3" style={{ animation: "fadeSlideUp 0.4s 0.32s ease both" }}>
          {[
            { icon: "✦", label: "AI-ranked queue" },
            { icon: "▶", label: "Audio brief" },
            { icon: "⚡", label: "One-tap approve" },
          ].map((f) => (
            <div
              key={f.label}
              className="rounded-xl p-3 text-center"
              style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(99,102,241,0.1)" }}
            >
              <div className="text-lg mb-1" style={{ color: "#6366f1" }}>{f.icon}</div>
              <div className="text-[11px] font-semibold text-gray-500">{f.label}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 py-5 text-center">
        <p className="text-xs text-gray-400 font-medium">
          Powered by <span className="text-indigo-400 font-semibold">Lofty AOS</span>
          {" · "}<span className="text-indigo-400 font-semibold">InsForge</span>
          {" · "}<span className="text-indigo-400 font-semibold">Llama 3.3</span>
        </p>
      </footer>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}
