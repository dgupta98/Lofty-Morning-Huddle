"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getInsforgeClient } from "@/lib/insforge"

export default function LoginPage() {
  const [email, setEmail] = useState("james@demo.com")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const client = getInsforgeClient()
    const { error } = await client.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 relative z-10">
      <div className="w-full max-w-sm glass-card-elevated rounded-2xl p-8" style={{ animation: "scaleIn 0.4s ease both" }}>
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-black"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              boxShadow: "0 3px 14px rgba(99,102,241,0.3)",
            }}
          >
            L✦
          </div>
          <div>
            <div className="text-base font-extrabold text-indigo-900">Lofty</div>
            <div className="text-[9px] font-semibold tracking-[0.15em] uppercase text-indigo-400/70">
              Morning Handoff
            </div>
          </div>
        </div>

        <h1 className="text-xl font-black text-indigo-950 mb-1">Good morning ✦</h1>
        <p className="text-sm text-gray-500/80 mb-6">Sign in to see your handoff.</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-200"
            style={{ border: "1.5px solid rgba(99,102,241,0.15)", background: "rgba(255,255,255,0.8)" }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-200"
            style={{ border: "1.5px solid rgba(99,102,241,0.15)", background: "rgba(255,255,255,0.8)" }}
          />
          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="gradient-btn py-3 rounded-xl text-white text-sm font-bold disabled:opacity-50 mt-1"
          >
            {loading ? "Signing in…" : "Sign in →"}
          </button>
        </form>
      </div>
    </div>
  )
}
