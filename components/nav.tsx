"use client"

interface NavProps {
  agentName: string
  onLogout?: () => void
  onPlayVideo?: () => void
}

export function Nav({ agentName, onLogout, onPlayVideo }: NavProps) {
  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-7 py-3 glass-card"
      style={{ borderRadius: 0, borderTop: "none", borderLeft: "none", borderRight: "none" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black"
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow: "0 2px 12px rgba(99,102,241,0.3)",
          }}
        >
          L✦
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-extrabold text-indigo-900 tracking-tight">Lofty</span>
          <span className="text-[9px] font-semibold tracking-[0.15em] uppercase text-indigo-400/70">
            Morning Handoff
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div
          className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-full"
          style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.1)", color: "#6366f1" }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" style={{ animation: "pulseGlow 2s infinite" }} />
          AOS Active
        </div>
        {onPlayVideo && (
          <button
            onClick={onPlayVideo}
            title="Replay morning briefing"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-indigo-400 hover:text-indigo-600 transition-all duration-200 hover:bg-indigo-50"
            style={{ border: "1px solid rgba(99,102,241,0.1)" }}
          >
            ▶
          </button>
        )}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-extrabold"
          style={{
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            border: "2.5px solid rgba(255,255,255,0.9)",
            boxShadow: "0 2px 10px rgba(99,102,241,0.25)",
          }}
        >
          {agentName[0]}
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="text-xs font-semibold text-gray-400 hover:text-indigo-500 transition-colors duration-200 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50/50"
          >
            Switch →
          </button>
        )}
      </div>
    </nav>
  )
}
