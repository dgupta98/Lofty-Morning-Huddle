"use client"

export function Nav({ agentName }: { agentName: string }) {
  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-7 py-3.5"
      style={{
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(99,102,241,0.12)",
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
          <span
            className="text-[9px] font-semibold tracking-widest uppercase"
            style={{ color: "#6366f1", opacity: 0.8 }}
          >
            Morning Handoff
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        <div
          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full"
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
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-extrabold cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            border: "2px solid rgba(255,255,255,0.8)",
            boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
          }}
        >
          {agentName[0]}
        </div>
      </div>
    </nav>
  )
}
