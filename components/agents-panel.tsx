"use client"

import type { OvernightSummary, QueueItem } from "@/lib/types"

const AOS_AGENTS = [
  { icon: "📬", name: "Sales Agent", status: "Completed", action: "Sent 8 lead follow-up emails", color: "#6366f1", bg: "rgba(99,102,241,0.07)" },
  { icon: "🏠", name: "Homeowner Agent", status: "Flagged", action: "Detected seller intent — Annette Black", color: "#8b5cf6", bg: "rgba(139,92,246,0.07)" },
  { icon: "⚡", name: "AOS Coordinator", status: "Ranked", action: "Scored & ranked 3 priority actions", color: "#0ea5e9", bg: "rgba(14,165,233,0.07)" },
  { icon: "📋", name: "Smart Plan Bot", status: "Updated", action: "Advanced 5 Smart Plan steps", color: "#10b981", bg: "rgba(16,185,129,0.07)" },
]

const SHARED = [
  { name: "Kristin Watson", sharedWith: "Mike T.", type: "Buyer tour" },
  { name: "Wade Warren", sharedWith: "Ashley R.", type: "Inspection follow-up" },
]

// Hourly activity data for bar chart (last 8 hours)
const HOURLY_ACTIVITY = [
  { hour: "9pm", emails: 2, visits: 1 },
  { hour: "10pm", emails: 3, visits: 3 },
  { hour: "11pm", emails: 1, visits: 6 },
  { hour: "12am", emails: 4, visits: 2 },
  { hour: "1am", emails: 2, visits: 1 },
  { hour: "2am", emails: 3, visits: 0 },
  { hour: "3am", emails: 5, visits: 2 },
  { hour: "4am", emails: 1, visits: 1 },
]

// Lead score sparkline data
const LEAD_SCORES = [
  { name: "Kristin", score: 88, color: "#6366f1" },
  { name: "Annette", score: 74, color: "#8b5cf6" },
  { name: "Wade", score: 61, color: "#0ea5e9" },
]

function BarChart() {
  const maxVal = Math.max(...HOURLY_ACTIVITY.map(d => d.emails + d.visits))
  const chartH = 72
  const barW = 20
  const gap = 8
  const totalW = HOURLY_ACTIVITY.length * (barW + gap) - gap

  return (
    <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(99,102,241,0.1)" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-extrabold text-indigo-800">Overnight Activity</p>
        <div className="flex items-center gap-3 text-[10px] font-semibold text-gray-400">
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm" style={{ background: "#6366f1" }} />Emails</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm" style={{ background: "#c4b5fd" }} />Visits</span>
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${totalW + 4} ${chartH + 20}`} style={{ overflow: "visible" }}>
        {HOURLY_ACTIVITY.map((d, i) => {
          const x = i * (barW + gap)
          const emailH = (d.emails / maxVal) * chartH
          const visitH = (d.visits / maxVal) * chartH
          const stackH = emailH + visitH
          return (
            <g key={d.hour}>
              {/* visits (bottom) */}
              <rect x={x} y={chartH - visitH} width={barW} height={visitH} rx={3}
                fill="#c4b5fd" opacity={0.85} />
              {/* emails (top) */}
              <rect x={x} y={chartH - stackH} width={barW} height={emailH} rx={3}
                fill="url(#barGrad)" />
              <text x={x + barW / 2} y={chartH + 14} textAnchor="middle"
                fontSize={8} fill="#9ca3af" fontWeight={600}>{d.hour}</text>
            </g>
          )
        })}
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

function LeadScoreChart({ queue }: { queue: QueueItem[] }) {
  const leads = queue.length > 0
    ? queue.slice(0, 3).map((item, i) => ({
        name: item.lead.name.split(" ")[0],
        score: item.lead.lead_score,
        color: ["#6366f1", "#8b5cf6", "#0ea5e9"][i],
      }))
    : LEAD_SCORES

  return (
    <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(99,102,241,0.1)" }}>
      <p className="text-xs font-extrabold text-indigo-800 mb-3">Lead Score Ranking</p>
      <div className="flex flex-col gap-2.5">
        {leads.map((lead, i) => (
          <div key={lead.name} className="flex items-center gap-2.5">
            <span className="text-[10px] font-bold text-gray-400 w-3">{i + 1}</span>
            <span className="text-xs font-semibold text-indigo-700 w-14 truncate">{lead.name}</span>
            <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: "rgba(99,102,241,0.08)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${lead.score}%`,
                  background: `linear-gradient(90deg, ${lead.color}, ${lead.color}99)`,
                  transition: "width 1s ease",
                }}
              />
            </div>
            <span className="text-xs font-black" style={{ color: lead.color, minWidth: 24 }}>{lead.score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SignalDonut({ summary }: { summary: OvernightSummary }) {
  const total = summary.lead_followups + summary.showing_requests_accepted + summary.buyer_matches
  const slices = [
    { label: "Follow-ups", value: summary.lead_followups, color: "#6366f1" },
    { label: "Showings", value: summary.showing_requests_accepted, color: "#8b5cf6" },
    { label: "Matches", value: summary.buyer_matches, color: "#0ea5e9" },
  ]

  const r = 32
  const cx = 44
  const cy = 44
  const circumference = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(99,102,241,0.1)" }}>
      <p className="text-xs font-extrabold text-indigo-800 mb-3">Signal Breakdown</p>
      <div className="flex items-center gap-4">
        <svg width={88} height={88} viewBox="0 0 88 88">
          <circle cx={cx} cy={cy} r={r} fill="none" strokeWidth={14} stroke="rgba(99,102,241,0.08)" />
          {slices.map((slice) => {
            const dashLen = total > 0 ? (slice.value / total) * circumference : 0
            const el = (
              <circle
                key={slice.label}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={slice.color}
                strokeWidth={14}
                strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }}
              />
            )
            offset += dashLen
            return el
          })}
          <text x={cx} y={cy - 5} textAnchor="middle" fontSize={16} fontWeight={900} fill="#4338ca">{total}</text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize={7} fontWeight={700} fill="#9ca3af">TOTAL</text>
        </svg>
        <div className="flex flex-col gap-2">
          {slices.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
              <span className="text-[11px] font-semibold text-gray-500">{s.label}</span>
              <span className="text-[11px] font-black ml-auto" style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface AgentsPanelProps {
  agentName: string
  summary: OvernightSummary
  queue: QueueItem[]
}

export function AgentsPanel({ agentName, summary, queue }: AgentsPanelProps) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1" style={{ paddingBottom: "6rem" }}>
      {/* Greeting */}
      <div className="rounded-2xl p-5" style={{
        background: "rgba(255,255,255,0.85)",
        border: "1px solid rgba(99,102,241,0.13)",
        boxShadow: "0 2px 12px rgba(99,102,241,0.06)",
      }}>
        <p className="text-[10px] font-bold text-indigo-300 tracking-widest uppercase mb-1">{today}</p>
        <h2 className="text-xl font-black text-indigo-900 leading-tight">
          Good morning,{" "}
          <span style={{
            background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            {agentName}
          </span>{" "}✦
        </h2>
        <p className="text-xs text-gray-400 mt-1 font-medium">Your overnight handoff is ready</p>
      </div>

      {/* Overnight stat grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { n: summary.lead_followups, label: "Follow-ups", icon: "📬", color: "#6366f1" },
          { n: summary.showing_requests_accepted, label: "Showings", icon: "🏠", color: "#8b5cf6" },
          { n: summary.buyer_matches, label: "Buyer matches", icon: "🎯", color: "#0ea5e9" },
          { n: queue.length, label: "Decisions", icon: "⚡", color: "#f59e0b" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3.5 flex items-center gap-2.5" style={{
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(99,102,241,0.1)",
          }}>
            <span className="text-xl">{s.icon}</span>
            <div>
              <div className="text-xl font-black" style={{
                background: `linear-gradient(135deg,${s.color},${s.color}aa)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>{s.n}</div>
              <div className="text-[10px] font-semibold text-gray-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <BarChart />

      {/* Lead score chart */}
      <LeadScoreChart queue={queue} />

      {/* Signal donut */}
      <SignalDonut summary={summary} />

      {/* AOS Agents */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2 px-0.5">AOS agents · overnight</p>
        <div className="flex flex-col gap-2">
          {AOS_AGENTS.map((agent) => (
            <div key={agent.name} className="rounded-xl p-3.5 flex items-start gap-3" style={{
              background: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(99,102,241,0.08)",
            }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                style={{ background: agent.bg, border: `1px solid ${agent.color}22` }}>
                {agent.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-extrabold text-indigo-800">{agent.name}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: agent.bg, color: agent.color }}>
                    {agent.status}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 font-medium leading-tight">{agent.action}</p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 bg-green-400" />
            </div>
          ))}
        </div>
      </div>

      {/* Shared leads */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2 px-0.5">Shared with team</p>
        <div className="flex flex-col gap-2">
          {SHARED.map((s) => (
            <div key={s.name} className="rounded-xl px-3.5 py-3 flex items-center justify-between" style={{
              background: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(99,102,241,0.08)",
            }}>
              <div>
                <div className="text-xs font-extrabold text-indigo-800">{s.name}</div>
                <div className="text-[10px] text-gray-400 font-medium">{s.type}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-black"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                  {s.sharedWith[0]}
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{s.sharedWith}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Escalation alert */}
      {summary.escalated_lead_name && (
        <div className="rounded-xl p-3.5 flex items-center gap-3" style={{
          background: "rgba(251,191,36,0.08)",
          border: "1px solid rgba(251,191,36,0.25)",
        }}>
          <span className="text-lg">🚨</span>
          <div>
            <div className="text-xs font-extrabold text-amber-700">Escalation</div>
            <div className="text-[11px] text-amber-600 font-medium">
              {summary.escalated_lead_name} flagged by Homeowner Agent
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
