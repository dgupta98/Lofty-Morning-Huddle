"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import type { QueueItem } from "@/lib/types"

interface AskBarProps {
  queue?: QueueItem[]
  agentName?: string
}

const SUGGESTIONS = [
  "Draft a follow-up email for my top lead",
  "Why is my #1 priority urgent?",
  "What should I do first this morning?",
  "Reassign Wade's inspection to my team",
]

export function AskBar({ queue = [], agentName = "James" }: AskBarProps) {
  const [focused, setFocused] = useState(false)
  const [query, setQuery] = useState("")
  const [answer, setAnswer] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // ⌘K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
        setShowSuggestions(true)
      }
      if (e.key === "Escape") {
        setPanelOpen(false)
        setShowSuggestions(false)
        setAnswer(null)
        setQuery("")
        inputRef.current?.blur()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const submit = useCallback(async (q: string) => {
    if (!q.trim() || loading) return
    setLoading(true)
    setPanelOpen(true)
    setShowSuggestions(false)
    setAnswer(null)

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          agentName,
          queue: queue.map((item) => ({
            rank: item.rank,
            lead: {
              name: item.lead.name,
              opportunity_type: item.lead.opportunity_type,
              phone: item.lead.phone,
              email: item.lead.email,
              lead_score: item.lead.lead_score,
            },
            recommended_action: item.recommended_action,
            explanation: item.explanation,
          })),
        }),
      })
      const data = await res.json() as { answer: string }
      setAnswer(data.answer ?? "I couldn't find an answer. Try rephrasing.")
    } catch {
      setAnswer("Connection issue — please try again.")
    } finally {
      setLoading(false)
    }
  }, [queue, agentName, loading])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") submit(query)
    if (e.key === "Escape") { setPanelOpen(false); setShowSuggestions(false) }
  }

  const isEmail = answer?.toLowerCase().includes("subject:")

  return (
    <>
      {/* Click-outside overlay */}
      {(panelOpen || showSuggestions) && (
        <div className="fixed inset-0 z-40" onClick={() => { setPanelOpen(false); setShowSuggestions(false); setAnswer(null); setQuery("") }} />
      )}

      <div className="fixed bottom-0 left-0 right-0 z-50 px-5 pb-5 pt-3"
        style={{
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(24px) saturate(1.8)",
          WebkitBackdropFilter: "blur(24px) saturate(1.8)",
          borderTop: "1px solid rgba(255,255,255,0.5)",
          boxShadow: "0 -2px 20px rgba(99,102,241,0.06)",
        }}>

        {/* Response panel — slides up above bar */}
        {panelOpen && (
          <div ref={panelRef}
            className="max-w-2xl mx-auto mb-3 rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.97)",
              border: "1px solid rgba(99,102,241,0.15)",
              boxShadow: "0 -8px 40px rgba(99,102,241,0.12), 0 4px 20px rgba(0,0,0,0.06)",
              animation: "fadeSlideUp 0.25s ease both",
            }}>

            {/* Panel header */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-indigo-50">
              <div className="w-5 h-5 rounded-lg flex items-center justify-center text-white text-[9px] font-black"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                ✦
              </div>
              <span className="text-xs font-black text-indigo-900">Lofty AOS</span>
              <span className="text-[10px] text-indigo-300 font-medium ml-1">· {query}</span>
              <button onClick={() => { setPanelOpen(false); setAnswer(null); setQuery("") }}
                className="ml-auto text-gray-300 hover:text-gray-500 transition-colors text-base leading-none">
                ×
              </button>
            </div>

            {/* Panel body */}
            <div className="px-4 py-4 max-h-64 overflow-y-auto">
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                        style={{ animation: `bounce 0.8s ${i * 0.15}s ease-in-out infinite` }} />
                    ))}
                  </div>
                  <span className="text-xs text-indigo-300 font-medium">Lofty is thinking…</span>
                </div>
              ) : answer ? (
                isEmail ? (
                  // Email draft — monospace card
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase">Email Draft</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(answer ?? "")}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors hover:bg-indigo-50"
                        style={{ color: "#6366f1", border: "1px solid rgba(99,102,241,0.2)" }}>
                        Copy
                      </button>
                    </div>
                    <pre className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-mono bg-indigo-50/50 rounded-xl p-3">
                      {answer}
                    </pre>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed">{answer}</p>
                )
              ) : null}
            </div>
          </div>
        )}

        {/* Suggestions dropdown */}
        {showSuggestions && !panelOpen && (
          <div className="max-w-2xl mx-auto mb-2 rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.97)",
              border: "1px solid rgba(99,102,241,0.12)",
              boxShadow: "0 -8px 32px rgba(99,102,241,0.1)",
              animation: "fadeSlideUp 0.2s ease both",
            }}>
            <div className="px-3 py-2 border-b border-indigo-50">
              <span className="text-[10px] font-bold text-indigo-300 tracking-widest uppercase">Try asking</span>
            </div>
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => { setQuery(s); submit(s) }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-600 font-medium hover:bg-indigo-50/60 transition-colors flex items-center gap-2.5">
                <span className="text-indigo-300 text-xs">✦</span>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300"
            style={{
              background: focused ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.85)",
              border: focused ? "1.5px solid rgba(99,102,241,0.35)" : "1.5px solid rgba(99,102,241,0.12)",
              boxShadow: focused
                ? "0 4px 24px rgba(99,102,241,0.1), 0 0 0 4px rgba(99,102,241,0.04)"
                : "0 1px 8px rgba(99,102,241,0.04)",
            }}>
            <span className="text-base font-black gradient-text flex-shrink-0">✦</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKey}
              onFocus={() => { setFocused(true); setShowSuggestions(true) }}
              onBlur={() => setFocused(false)}
              placeholder="Ask Lofty — draft an email, explain a lead, reassign a task…"
              className="flex-1 text-sm text-gray-700 font-medium bg-transparent outline-none placeholder:text-gray-400/60"
            />
            {query ? (
              <button
                onClick={() => submit(query)}
                disabled={loading}
                className="flex-shrink-0 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:-translate-y-px disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                {loading ? "…" : "Ask →"}
              </button>
            ) : (
              <kbd className="text-[10px] text-gray-300 bg-gray-50/80 border border-gray-200/60 rounded-md px-1.5 py-0.5 font-mono flex-shrink-0">
                ⌘K
              </kbd>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  )
}
