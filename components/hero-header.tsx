"use client"

import type { OvernightSummary } from "@/lib/types"

interface HeroHeaderProps {
  agentName: string
  summary: OvernightSummary
  onPlayAudio: () => void
}

export function HeroHeader({ agentName, summary, onPlayAudio }: HeroHeaderProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  const pills = [
    `${summary.lead_followups} lead follow-ups`,
    `${summary.showing_requests_accepted} showing requests accepted`,
    ...(summary.escalated_lead_name ? [`${summary.escalated_lead_name} escalated`] : []),
    ...(summary.buyer_matches > 0 ? [`${summary.buyer_matches} buyer match found`] : []),
  ]

  return (
    <div
      className="rounded-2xl p-6 mb-4"
      style={{
        background: "rgba(255,255,255,0.78)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(99,102,241,0.18)",
        boxShadow: "0 8px 32px rgba(99,102,241,0.1), 0 2px 8px rgba(99,102,241,0.06)",
        animation: "fadeSlideUp 0.5s ease both",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight leading-tight mb-1">
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
              {agentName}
            </span>{" "}
            ✦
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            {today} · Your overnight handoff is ready
          </p>
        </div>
        <button
          onClick={onPlayAudio}
          className="flex items-center gap-2 text-white text-xs font-bold px-4 py-2.5 rounded-full flex-shrink-0 transition-all hover:-translate-y-px"
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
          }}
        >
          ▶ 0:58
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {pills.map((pill) => (
          <span
            key={pill}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(99,102,241,0.07)",
              border: "1px solid rgba(99,102,241,0.14)",
              color: "#4338ca",
            }}
          >
            <span className="text-green-500">✓</span>
            {pill}
          </span>
        ))}
      </div>

      <div
        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl"
        style={{
          background: "linear-gradient(90deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06))",
          border: "1px solid rgba(99,102,241,0.12)",
        }}
      >
        <span className="text-xs font-bold text-indigo-500 tracking-wide flex items-center gap-2">
          ✦ &nbsp;3 decisions are waiting for you
        </span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
