"use client"

import { useState } from "react"

export function AskBar() {
  const [focused, setFocused] = useState(false)

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-5 pb-5 pt-3"
      style={{
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(99,102,241,0.12)",
        boxShadow: "0 -4px 24px rgba(99,102,241,0.08)",
      }}
    >
      <div className="max-w-2xl mx-auto">
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
          style={{
            background: "rgba(255,255,255,0.9)",
            border: focused
              ? "1.5px solid rgba(99,102,241,0.5)"
              : "1.5px solid rgba(99,102,241,0.22)",
            boxShadow: focused
              ? "0 4px 20px rgba(99,102,241,0.14)"
              : "0 2px 12px rgba(99,102,241,0.08)",
          }}
        >
          <span
            className="text-base font-black"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ✦
          </span>
          <input
            type="text"
            placeholder="Ask Lofty anything — draft an email, find a listing, reassign a lead…"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="flex-1 text-sm text-gray-500 font-medium bg-transparent outline-none placeholder:text-gray-400"
          />
          <kbd className="text-xs text-gray-300 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 font-mono">
            ⌘K
          </kbd>
        </div>
      </div>
    </div>
  )
}
