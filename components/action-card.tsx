"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { WhyDrawer } from "./why-drawer"
import type { QueueItem, ActionTaken } from "@/lib/types"
import type { ConfidenceWeights } from "@/lib/confidence"

interface ActionCardProps {
  item: QueueItem
  index: number
  onAction: (itemId: string, action: ActionTaken) => Promise<void>
  isDragOver?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  onDragEnd?: (e: React.DragEvent) => void
  weights?: ConfidenceWeights
}

const TEAM = ["Mike Torres", "Ashley Rivera", "Your manager"]

const SNOOZE_OPTS = [
  { label: "30 min", value: 30 },
  { label: "2 hours", value: 120 },
  { label: "Tomorrow 8 AM", value: -1 },
]

function emailDraft(item: QueueItem): string {
  const firstName = item.lead.name.split(" ")[0]
  if (item.lead.opportunity_type === "High Interest") {
    return `Hi ${firstName},\n\nI noticed you've been checking out the listing — great taste! I'd love to set up a private tour.\n\nAre you free Saturday morning? I have a slot at 10:00 AM that would work perfectly.\n\nLooking forward to connecting!\nJames`
  }
  if (item.lead.opportunity_type === "Seller Intent") {
    return `Hi ${firstName},\n\nI've been watching the market in your area closely and think now is a great time.\n\nI'd love to share a complimentary CMA showing what homes like yours are selling for. Would a quick 15-minute call work this week?\n\nBest, James`
  }
  return `Hi ${firstName},\n\nJust following up to make sure we're on track. Please let me know if you need anything — I want to make sure we don't miss any important deadlines.\n\nBest, James`
}

type Mode = "idle" | "executing" | "approved" | "edit" | "delegate" | "snooze" | "done"

export function ActionCard({ item, index, onAction, isDragOver, onDragStart, onDragOver, onDrop, onDragEnd, weights }: ActionCardProps) {
  const [whyOpen, setWhyOpen] = useState(false)
  const [mode, setMode] = useState<Mode>("idle")
  const [editText, setEditText] = useState(item.recommended_action)
  const [delegateTo, setDelegateTo] = useState<string | null>(null)
  const [snoozedTo, setSnoozedTo] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const isDimmed = index > 0 && mode === "idle"
  const scorePercent = Math.round(item.priority_score * 100)

  async function executeAction(action: ActionTaken) {
    setMode("executing")
    await new Promise((r) => setTimeout(r, 1400))
    await onAction(item.id, action)
    if (action === "approve") setMode("approved")
  }

  async function handleDelegate(name: string) {
    setDelegateTo(name)
    await new Promise((r) => setTimeout(r, 800))
    await onAction(item.id, "delegate")
    setMode("done")
  }

  async function handleSnooze(opt: { label: string; value: number }) {
    setSnoozedTo(opt.label)
    await new Promise((r) => setTimeout(r, 700))
    await onAction(item.id, "snooze")
    setMode("done")
  }

  function copyEmail() {
    navigator.clipboard.writeText(emailDraft(item)).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <AnimatePresence>
        <div
          draggable={mode === "idle" && !isDragOver}
          onDragStart={mode === "idle" ? onDragStart : undefined}
          onDragOver={mode === "idle" ? onDragOver : undefined}
          onDrop={mode === "idle" ? onDrop : undefined}
          onDragEnd={mode === "idle" ? onDragEnd : undefined}
          style={{ cursor: mode === "idle" ? "grab" : "default" }}
        >
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: mode === "done" ? 0 : isDimmed ? 0.5 : 1,
            y: 0,
            scale: mode === "done" ? 0.96 : 1,
          }}
          exit={{ opacity: 0, y: -12, scale: 0.96 }}
          transition={{ duration: 0.4, delay: index * 0.06, ease: [0.4, 0, 0.2, 1] }}
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: isDragOver ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.75)",
            backdropFilter: "blur(20px) saturate(1.8)",
            WebkitBackdropFilter: "blur(20px) saturate(1.8)",
            border: isDragOver
              ? "2px solid rgba(99,102,241,0.5)"
              : mode === "approved"
              ? "1.5px solid rgba(34,197,94,0.4)"
              : "1px solid rgba(255,255,255,0.5)",
            boxShadow: isDragOver
              ? "0 0 0 4px rgba(99,102,241,0.08), 0 12px 40px rgba(99,102,241,0.12)"
              : "0 1px 3px rgba(99,102,241,0.04), 0 4px 20px rgba(99,102,241,0.06), inset 0 1px 0 rgba(255,255,255,0.6)",
            pointerEvents: mode === "done" ? "none" : "auto",
          }}
          whileHover={mode === "idle" ? { y: -2, boxShadow: "0 8px 32px rgba(99,102,241,0.1), 0 2px 8px rgba(99,102,241,0.06)" } : {}}
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
            background: "linear-gradient(90deg,#6366f1,#8b5cf6,#a78bfa)",
            backgroundSize: "200% auto",
            animation: "gradientShift 4s ease infinite",
            opacity: 0.8,
          }} />

          {/* Drag handle */}
          {mode === "idle" && (
            <div className="absolute top-3.5 right-3.5 text-indigo-200/60 text-sm select-none" title="Drag to reorder">
              ⠿
            </div>
          )}

          <div className="p-5 pt-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-black shrink-0"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 3px 12px rgba(99,102,241,0.25)" }}>
                  {item.lead.name[0]}
                </div>
                <div>
                  <div className="text-[10px] font-bold text-indigo-300/80 tracking-[0.15em] uppercase">#{item.rank} · Priority</div>
                  <h2 className="text-base font-black text-indigo-950 leading-tight">{item.lead.name}</h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg hidden sm:block"
                  style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.1)", color: "#6366f1" }}>
                  {item.lead.opportunity_type}
                </span>
                <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-xl text-white"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 2px 8px rgba(99,102,241,0.25)" }}>
                  {scorePercent}
                </span>
              </div>
            </div>

            {/* Contact row */}
            <div className="flex gap-4 mb-3 flex-wrap">
              <a href={`tel:${item.lead.phone}`} className="text-xs font-semibold text-indigo-400/80 hover:text-indigo-600 transition-colors duration-200">
                📞 {item.lead.phone}
              </a>
              <a href={`mailto:${item.lead.email}`} className="text-xs font-semibold text-indigo-400/80 hover:text-indigo-600 transition-colors duration-200">
                ✉ {item.lead.email}
              </a>
            </div>

            {item.explanation && (
              <p className="text-sm text-gray-600/90 leading-relaxed mb-3.5 line-clamp-2">{item.explanation}</p>
            )}

            {(mode === "idle" || mode === "executing") && (
              <div className="mb-4">
                <p className="text-[9px] font-bold text-purple-400/80 tracking-[0.15em] uppercase mb-2">Recommended action</p>
                <div className="text-sm font-semibold text-indigo-950 p-3.5 rounded-xl leading-snug"
                  style={{ background: "linear-gradient(90deg,rgba(99,102,241,0.04),rgba(139,92,246,0.03))", borderLeft: "3px solid #6366f1" }}>
                  {item.recommended_action}
                </div>
              </div>
            )}

            {/* EXECUTING */}
            {mode === "executing" && (
              <div className="flex items-center gap-2.5 text-sm text-indigo-500 font-semibold py-2">
                <span className="w-4 h-4 rounded-full border-2 border-indigo-200 border-t-indigo-500 inline-block" style={{ animation: "spin 0.7s linear infinite" }} />
                Lofty is executing…
              </div>
            )}

            {/* APPROVED */}
            {mode === "approved" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs">✓</span>
                  Action executed — here&apos;s what Lofty did:
                </div>
                <div className="rounded-xl p-3.5 text-xs flex flex-col gap-1.5"
                  style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }}>
                  <div className="text-emerald-700 font-semibold">📧 Email draft queued for {item.lead.name}</div>
                  <div className="text-emerald-600/50 font-mono text-[11px] italic">{emailDraft(item).split("\n")[2]?.trim()}</div>
                </div>
                <div className="rounded-xl p-3.5 text-xs"
                  style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }}>
                  <div className="text-emerald-700 font-semibold">📋 Smart Plan step marked complete</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={copyEmail} className="text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-200"
                    style={{ background: copied ? "#22c55e" : "rgba(99,102,241,0.06)", border: "1px solid " + (copied ? "#22c55e" : "rgba(99,102,241,0.15)"), color: copied ? "white" : "#6366f1" }}>
                    {copied ? "✓ Copied!" : "Copy email"}
                  </button>
                  <button onClick={() => setMode("done")} className="text-xs font-semibold px-3.5 py-2 rounded-xl text-gray-400 hover:text-gray-600 transition-colors duration-200">
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* EDIT */}
            {mode === "edit" && (
              <div className="flex flex-col gap-3">
                <p className="text-[9px] font-bold text-purple-400/80 tracking-[0.15em] uppercase">Customize action</p>
                <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3}
                  className="w-full text-sm text-indigo-950 p-3.5 rounded-xl resize-none outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-200"
                  style={{ background: "rgba(99,102,241,0.03)", border: "1.5px solid rgba(99,102,241,0.2)" }} />
                <div className="flex gap-2">
                  <button onClick={() => executeAction("approve")} className="gradient-btn text-white text-xs font-bold px-4 py-2.5 rounded-xl">
                    Save & Execute →
                  </button>
                  <button onClick={() => setMode("idle")} className="text-xs font-semibold px-3 py-2.5 rounded-xl text-gray-400 hover:text-gray-600 transition-colors duration-200">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* DELEGATE */}
            {mode === "delegate" && (
              <div className="flex flex-col gap-3">
                <p className="text-[9px] font-bold text-purple-400/80 tracking-[0.15em] uppercase">Delegate to</p>
                <div className="flex flex-col gap-2">
                  {TEAM.map((name) => (
                    <button key={name} onClick={() => handleDelegate(name)} disabled={delegateTo !== null}
                      className="flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 hover:scale-[1.01] disabled:opacity-60"
                      style={{
                        background: delegateTo === name ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.7)",
                        border: `1px solid ${delegateTo === name ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.1)"}`,
                      }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                        {name[0]}
                      </div>
                      <span className="text-sm font-semibold text-indigo-800">{name}</span>
                      {delegateTo === name && <span className="ml-auto text-indigo-400 text-xs font-semibold">Delegating…</span>}
                    </button>
                  ))}
                </div>
                {!delegateTo && (
                  <button onClick={() => setMode("idle")} className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors duration-200">Cancel</button>
                )}
              </div>
            )}

            {/* SNOOZE */}
            {mode === "snooze" && (
              <div className="flex flex-col gap-3">
                <p className="text-[9px] font-bold text-purple-400/80 tracking-[0.15em] uppercase">Snooze until</p>
                <div className="flex gap-2 flex-wrap">
                  {SNOOZE_OPTS.map((opt) => (
                    <button key={opt.label} onClick={() => handleSnooze(opt)} disabled={snoozedTo !== null}
                      className="text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-px disabled:opacity-60"
                      style={{
                        background: snoozedTo === opt.label ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.8)",
                        border: `1.5px solid ${snoozedTo === opt.label ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.15)"}`,
                        color: "#6366f1",
                      }}>
                      {snoozedTo === opt.label ? "⟳ Snoozing…" : opt.label}
                    </button>
                  ))}
                </div>
                {snoozedTo && <div className="text-xs text-indigo-400 font-medium">Snoozed until {snoozedTo} ✓</div>}
                {!snoozedTo && (
                  <button onClick={() => setMode("idle")} className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors duration-200">Cancel</button>
                )}
              </div>
            )}

            {/* IDLE — action buttons */}
            {mode === "idle" && (
              <>
                <div className="flex flex-wrap gap-2 mb-3">
                  <button onClick={() => executeAction("approve")}
                    className="gradient-btn text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all hover:-translate-y-px active:scale-95">
                    ✓ Approve & Execute
                  </button>
                  {(["edit", "delegate", "snooze"] as const).map((action) => (
                    <button key={action} onClick={() => setMode(action)}
                      className="text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-px"
                      style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(99,102,241,0.12)", color: "#6366f1" }}>
                      {action === "edit" ? "✎ Edit" : action === "delegate" ? "→ Delegate" : "⟳ Snooze"}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(99,102,241,0.06)" }}>
                  <button onClick={() => setWhyOpen(true)}
                    className="text-xs font-semibold text-indigo-300 hover:text-indigo-500 transition-colors duration-200">
                    ? Why this matters →
                  </button>
                  <span className="text-[10px] text-purple-300/80 font-medium">Confidence {Math.round(item.confidence * 100)}%</span>
                </div>
              </>
            )}
          </div>
        </motion.div>
        </div>
      </AnimatePresence>

      <WhyDrawer item={item} open={whyOpen} onClose={() => setWhyOpen(false)} weights={weights} />
    </>
  )
}
