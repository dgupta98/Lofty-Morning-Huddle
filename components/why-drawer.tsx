"use client"

import { useState, useEffect } from "react"
import type { QueueItem } from "@/lib/types"

interface WhyDrawerProps {
  item: QueueItem
  open: boolean
  onClose: () => void
}

export function WhyDrawer({ item, open, onClose }: WhyDrawerProps) {
  const [aiExplanation, setAiExplanation] = useState<string | null>(item.explanation)
  const [loadingExplanation, setLoadingExplanation] = useState(false)

  useEffect(() => {
    if (!open) return
    if (item.explanation) {
      setAiExplanation(item.explanation)
      return
    }
    setLoadingExplanation(true)
    fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadName: item.lead.name,
        leadScore: item.lead.lead_score,
        opportunityType: item.lead.opportunity_type,
        signals: item.signals ?? [],
      }),
    })
      .then((r) => r.json())
      .then((data: { explanation?: string }) => {
        if (data.explanation) setAiExplanation(data.explanation)
      })
      .catch(console.error)
      .finally(() => setLoadingExplanation(false))
  }, [open, item.id, item.explanation])

  if (!open) return null

  const scoreComponents = [
    { label: "Lead Score", value: String(item.lead.lead_score), weight: "30%", bar: item.lead.lead_score },
    {
      label: "Opportunity Type", value: item.lead.opportunity_type, weight: "20%",
      bar: item.lead.opportunity_type === "High Interest" ? 100 : item.lead.opportunity_type === "Seller Intent" ? 80 : item.lead.opportunity_type === "Back-to-Site" ? 70 : 50,
    },
    {
      label: "Transaction Deadline",
      value: item.lead.transaction_deadline_days ? `${item.lead.transaction_deadline_days} days` : "None",
      weight: "15%",
      bar: item.lead.transaction_deadline_days ? Math.max(0, 100 - item.lead.transaction_deadline_days * 10) : 0,
    },
    {
      label: "Response Urgency",
      value: item.lead.missed_response_minutes > 0 ? `${item.lead.missed_response_minutes} min overdue` : "On time",
      weight: "15%",
      bar: Math.min(100, item.lead.missed_response_minutes),
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1" style={{ background: "rgba(0,0,0,0.15)", backdropFilter: "blur(4px)" }} />
      <div
        className="w-full max-w-sm h-full overflow-y-auto p-6 flex flex-col gap-5"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(24px) saturate(1.8)",
          borderLeft: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "-12px 0 48px rgba(99,102,241,0.1)",
          animation: "slideInRight 0.3s ease both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-indigo-400/80 tracking-[0.15em] uppercase mb-1">Why This Matters</p>
            <h2 className="text-lg font-black text-indigo-950">{item.lead.name}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 transition-all duration-200 text-lg">
            ×
          </button>
        </div>

        <div
          className="p-4 rounded-xl text-sm text-gray-700 leading-relaxed min-h-[60px]"
          style={{
            background: "linear-gradient(90deg, rgba(99,102,241,0.04), rgba(139,92,246,0.02))",
            borderLeft: "3px solid #6366f1",
          }}
        >
          {loadingExplanation ? (
            <span className="text-indigo-300 italic text-xs" style={{ animation: "breathe 1.5s ease infinite" }}>Asking Lofty AI…</span>
          ) : (
            aiExplanation ?? "No explanation available."
          )}
        </div>

        <div>
          <p className="text-[10px] font-bold text-indigo-400/80 tracking-[0.15em] uppercase mb-3">Score Breakdown</p>
          <div className="flex flex-col gap-3.5">
            {scoreComponents.map((c) => (
              <div key={c.label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-gray-700">{c.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{c.value}</span>
                    <span className="text-[10px] text-indigo-400/70 font-medium">w={c.weight}</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(99,102,241,0.06)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${c.bar}%`, background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {item.signals && item.signals.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-indigo-400/80 tracking-[0.15em] uppercase mb-3">Signal Sources</p>
            <div className="flex flex-col gap-2">
              {item.signals.map((sig) => (
                <div
                  key={sig.id}
                  className="p-3 rounded-xl text-xs transition-all duration-200 hover:-translate-y-px"
                  style={{ background: "rgba(99,102,241,0.03)", border: "1px solid rgba(99,102,241,0.08)" }}
                >
                  <div className="font-semibold text-indigo-700 mb-1 capitalize">{sig.signal_type.replace(/_/g, " ")}</div>
                  <div className="text-gray-400">{new Date(sig.occurred_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className="mt-auto p-3.5 rounded-xl flex items-center justify-between"
          style={{ background: "rgba(99,102,241,0.03)", border: "1px solid rgba(99,102,241,0.08)" }}
        >
          <span className="text-xs font-semibold text-gray-600">Model confidence</span>
          <span className="text-sm font-black gradient-text">{Math.round(item.confidence * 100)}%</span>
        </div>
      </div>
    </div>
  )
}
