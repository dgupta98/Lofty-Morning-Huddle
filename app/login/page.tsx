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
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(99,102,241,0.18)",
          boxShadow: "0 8px 32px rgba(99,102,241,0.1)",
        }}
      >
        <div className="flex items-center gap-2.5 mb-8">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-base font-black"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              boxShadow: "0 2px 10px rgba(99,102,241,0.35)",
            }}
          >
            L✦
          </div>
          <div>
            <div className="text-base font-extrabold text-indigo-800">Lofty</div>
            <div className="text-[9px] font-semibold tracking-widest uppercase text-indigo-400">
              Morning Handoff
            </div>
          </div>
        </div>

        <h1 className="text-xl font-black text-indigo-900 mb-1">Good morning ✦</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to see your handoff.</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="px-4 py-3 rounded-xl text-sm outline-none"
            style={{ border: "1.5px solid rgba(99,102,241,0.25)", background: "rgba(255,255,255,0.9)" }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="px-4 py-3 rounded-xl text-sm outline-none"
            style={{ border: "1.5px solid rgba(99,102,241,0.25)", background: "rgba(255,255,255,0.9)" }}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="py-3 rounded-xl text-white text-sm font-bold transition-all hover:-translate-y-px disabled:opacity-50"
            style={{
              background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
              boxShadow: "0 3px 12px rgba(99,102,241,0.35)",
            }}
          >
            {loading ? "Signing in…" : "Sign in →"}
          </button>
        </form>
      </div>
    </div>
  )
}
