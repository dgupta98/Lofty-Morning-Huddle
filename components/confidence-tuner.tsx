"use client"

import { useState, useCallback } from "react"
import type { QueueItem } from "@/lib/types"
import {
  type ConfidenceWeights,
  DEFAULT_WEIGHTS,
  WEIGHT_META,
  calculateConfidence,
  saveWeights,
} from "@/lib/confidence"

interface ConfidenceTunerProps {
  weights: ConfidenceWeights
  queue: QueueItem[]
  onWeightsChange: (w: ConfidenceWeights) => void
  onClose: () => void
}

function totalWeight(w: ConfidenceWeights) {
  return Object.values(w).reduce((a, b) => a + b, 0)
}

export function ConfidenceTuner({ weights, queue, onWeightsChange, onClose }: ConfidenceTunerProps) {
  const [local, setLocal] = useState<ConfidenceWeights>(weights)
  const total = totalWeight(local)

  const update = useCallback((key: keyof ConfidenceWeights, value: number) => {
    setLocal((prev) => {
      const next = { ...prev, [key]: value }
      onWeightsChange(next)
      saveWeights(next)
      return next
    })
  }, [onWeightsChange])

  const reset = () => {
    setLocal(DEFAULT_WEIGHTS)
    onWeightsChange(DEFAULT_WEIGHTS)
    saveWeights(DEFAULT_WEIGHTS)
  }

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* Backdrop */}
      <div className="flex-1" style={{ background: "rgba(0,0,0,0.15)", backdropFilter: "blur(4px)" }} />

      {/* Panel */}
      <div
        className="w-full max-w-[400px] h-full overflow-y-auto flex flex-col"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(24px) saturate(1.8)",
          borderLeft: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "-12px 0 48px rgba(99,102,241,0.12)",
          animation: "slideInRight 0.3s ease both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-indigo-50/80">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                ⚙
              </div>
              <h2 className="text-base font-black text-indigo-950">Confidence Model</h2>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100/60 transition-all text-lg">
              ×
            </button>
          </div>
          <p className="text-[11px] text-gray-400 font-medium ml-9">
            Adjust how AOS weights each factor when calculating confidence scores.
            Changes apply instantly across all leads.
          </p>
        </div>

        {/* Weight sliders */}
        <div className="px-6 py-5 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-300 tracking-[0.15em] uppercase">Factor Weights</span>
            <button onClick={reset}
              className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors hover:bg-indigo-50"
              style={{ color: "#6366f1", border: "1px solid rgba(99,102,241,0.2)" }}>
              Reset defaults
            </button>
          </div>

          {(Object.keys(local) as (keyof ConfidenceWeights)[]).map((key) => {
            const meta = WEIGHT_META[key]
            const pct = total > 0 ? Math.round((local[key] / total) * 100) : 0

            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{meta.icon}</span>
                    <div>
                      <div className="text-xs font-black text-indigo-900">{meta.label}</div>
                      <div className="text-[10px] text-gray-400 font-medium">{meta.description}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <div className="text-sm font-black" style={{ color: meta.color }}>{pct}%</div>
                    <div className="text-[9px] text-gray-400 font-mono">raw {local[key]}</div>
                  </div>
                </div>

                {/* Slider */}
                <div className="relative">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={local[key]}
                    onChange={(e) => update(key, Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(90deg, ${meta.color} ${pct}%, rgba(99,102,241,0.08) ${pct}%)`,
                      accentColor: meta.color,
                    }}
                  />
                </div>
              </div>
            )
          })}

          {/* Total bar */}
          <div className="flex items-center gap-2 pt-1">
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(99,102,241,0.06)" }}>
              <div className="h-full rounded-full" style={{
                width: `${Math.min((total / 200) * 100, 100)}%`,
                background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
              }} />
            </div>
            <span className="text-[10px] font-mono text-gray-400 flex-shrink-0">
              Σ {total} → normalized to 100%
            </span>
          </div>
        </div>

        <div className="mx-6 border-t border-indigo-50" />

        {/* Live preview */}
        <div className="px-6 py-5 flex flex-col gap-3 flex-1">
          <span className="text-[10px] font-bold text-indigo-300 tracking-[0.15em] uppercase">Live Preview</span>

          {queue.map((item) => {
            const { total: score, factors } = calculateConfidence(item, local)
            const topFactor = (Object.keys(factors) as (keyof ConfidenceWeights)[])
              .reduce((a, b) => factors[a].weighted > factors[b].weighted ? a : b)

            return (
              <div key={item.id} className="rounded-xl p-3.5"
                style={{ background: "rgba(99,102,241,0.03)", border: "1px solid rgba(99,102,241,0.08)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-black"
                      style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                      {item.lead.name[0]}
                    </div>
                    <span className="text-xs font-black text-indigo-900">{item.lead.name.split(" ")[0]}</span>
                    <span className="text-[10px] text-gray-400">#{item.rank}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Old vs new */}
                    {score !== item.confidence && (
                      <span className="text-[10px] text-gray-400 line-through font-mono">
                        {Math.round(item.confidence * 100)}%
                      </span>
                    )}
                    <span className="text-sm font-black" style={{
                      background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}>
                      {Math.round(score * 100)}%
                    </span>
                  </div>
                </div>

                {/* Factor mini-bars */}
                <div className="flex gap-1 h-1.5">
                  {(Object.keys(factors) as (keyof ConfidenceWeights)[]).map((k) => {
                    const meta = WEIGHT_META[k]
                    const widthPct = factors[k].weighted
                    return (
                      <div key={k} className="rounded-full flex-shrink-0"
                        style={{ width: `${widthPct}%`, minWidth: widthPct > 0 ? 2 : 0, background: meta.color, opacity: 0.7 }}
                        title={`${meta.label}: ${factors[k].raw}% raw → ${factors[k].weighted}% contribution`}
                      />
                    )
                  })}
                </div>

                <div className="mt-1.5 text-[9px] text-gray-400 font-medium">
                  Top driver: {WEIGHT_META[topFactor].icon} {WEIGHT_META[topFactor].label} ({factors[topFactor].weighted}pts)
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-indigo-50/80">
          <p className="text-[10px] text-gray-400 font-medium text-center">
            Weights saved automatically to your browser · applied to all rankings
          </p>
        </div>
      </div>
    </div>
  )
}
