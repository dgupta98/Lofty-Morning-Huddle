"use client"

import { useState } from "react"

export function AskBar() {
  const [focused, setFocused] = useState(false)

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-5 pb-5 pt-3"
      style={{
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(24px) saturate(1.8)",
        WebkitBackdropFilter: "blur(24px) saturate(1.8)",
        borderTop: "1px solid rgba(255,255,255,0.5)",
        boxShadow: "0 -2px 20px rgba(99,102,241,0.05)",
      }}
    >
      <div className="max-w-2xl mx-auto">
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300"
          style={{
            background: focused ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.8)",
            border: focused
              ? "1.5px solid rgba(99,102,241,0.35)"
              : "1.5px solid rgba(99,102,241,0.12)",
            boxShadow: focused
              ? "0 4px 24px rgba(99,102,241,0.1), 0 0 0 4px rgba(99,102,241,0.04)"
              : "0 1px 8px rgba(99,102,241,0.04)",
          }}
        >
          <span className="text-base font-black gradient-text">✦</span>
          <input
            type="text"
            placeholder="Ask Lofty anything — draft an email, find a listing, reassign a lead…"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="flex-1 text-sm text-gray-600 font-medium bg-transparent outline-none placeholder:text-gray-400/70"
          />
          <kbd className="text-[10px] text-gray-300 bg-gray-50/80 border border-gray-200/60 rounded-md px-1.5 py-0.5 font-mono">
            ⌘K
          </kbd>
        </div>
      </div>
    </div>
  )
}
