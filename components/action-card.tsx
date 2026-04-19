"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { WhyDrawer } from "./why-drawer"
import type { QueueItem, ActionTaken } from "@/lib/types"

interface ActionCardProps {
  item: QueueItem
  index: number
  onAction: (itemId: string, action: ActionTaken) => Promise<void>
}

export function ActionCard({ item, index, onAction }: ActionCardProps) {
  const [whyOpen, setWhyOpen] = useState(false)
  const [loading, setLoading] = useState<ActionTaken | null>(null)
  const [done, setDone] = useState(false)

  const isDimmed = index > 0
  const scorePercent = Math.round(item.priority_score * 100)

  async function handleAction(action: ActionTaken) {
    setLoading(action)
    await onAction(item.id, action)
    setLoading(null)
    if (action === "approve") setDone(true)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isDimmed ? 0.6 : 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(99,102,241,0.14)",
          boxShadow: "0 4px 20px rgba(99,102,241,0.07), 0 1px 4px rgba(0,0,0,0.04)",
        }}
        whileHover={{ y: -2, boxShadow: "0 10px 36px rgba(99,102,241,0.13)" }}
      >
        {/* Top gradient stripe */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{
            background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)",
            backgroundSize: "200% auto",
            animation: "gradientShift 4s ease infinite",
          }}
        />

        <div className="p-5 pt-6">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-bold text-indigo-300 tracking-widest uppercase">
              #{item.rank} · Priority
            </span>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-xl"
                style={{
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.15)",
                  color: "#6366f1",
                }}
              >
                {item.lead.opportunity_type}
              </span>
              <span
                className="text-[11px] font-extrabold px-2.5 py-1 rounded-xl text-white"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
                }}
              >
                {scorePercent}
              </span>
            </div>
          </div>

          <h2 className="text-lg font-black text-indigo-900 tracking-tight mb-2">
            {item.lead.name}
          </h2>

          {item.explanation && (
            <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-3">
              {item.explanation}
            </p>
          )}

          <div className="mb-4">
            <p className="text-[9px] font-extrabold text-purple-500 tracking-widest uppercase mb-1.5">
              Recommended action
            </p>
            <div
              className="text-sm font-semibold text-indigo-900 p-3 rounded-xl leading-snug"
              style={{
                background: "linear-gradient(90deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))",
                borderLeft: "3px solid #6366f1",
              }}
            >
              {item.recommended_action}
            </div>
          </div>

          {done ? (
            <div className="flex items-center gap-2 text-green-600 text-sm font-bold py-2">
              <span>✓</span> Action approved — Lofty is executing
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => handleAction("approve")}
                disabled={loading !== null}
                className="text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all hover:-translate-y-px disabled:opacity-50"
                style={{
                  background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                  boxShadow: "0 3px 12px rgba(99,102,241,0.35)",
                  animation: "pulseGlow 3s ease infinite",
                }}
              >
                {loading === "approve" ? "..." : "✓ Approve & Execute"}
              </button>
              {(["edit", "delegate", "snooze"] as ActionTaken[]).map((action) => (
                <button
                  key={action}
                  onClick={() => handleAction(action)}
                  disabled={loading !== null}
                  className="text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all hover:-translate-y-px disabled:opacity-50"
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    color: "#6366f1",
                  }}
                >
                  {action === "edit" ? "✎ Edit" : action === "delegate" ? "→ Delegate" : "⟳ Snooze"}
                </button>
              ))}
            </div>
          )}

          <div
            className="flex items-center justify-between pt-3"
            style={{ borderTop: "1px solid rgba(99,102,241,0.08)" }}
          >
            <button
              onClick={() => setWhyOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-indigo-500 transition-colors"
            >
              ? Why this matters →
            </button>
            <span className="text-[10px] text-purple-300 font-medium">
              Confidence {Math.round(item.confidence * 100)}%
            </span>
          </div>
        </div>
      </motion.div>

      <WhyDrawer item={item} open={whyOpen} onClose={() => setWhyOpen(false)} />
    </>
  )
}
