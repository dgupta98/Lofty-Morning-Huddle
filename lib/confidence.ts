import type { QueueItem } from "./types"

export interface ConfidenceWeights {
  signalVolume: number   // how much raw signal count matters
  recency: number        // how much freshness of signals matters
  leadScore: number      // how much base CRM lead score matters
  diversity: number      // how much variety of signal types matters
  urgency: number        // how much deadline / response urgency matters
}

export const DEFAULT_WEIGHTS: ConfidenceWeights = {
  signalVolume: 20,
  recency: 25,
  leadScore: 25,
  diversity: 15,
  urgency: 15,
}

export const WEIGHT_META: Record<
  keyof ConfidenceWeights,
  { label: string; description: string; icon: string; color: string }
> = {
  signalVolume: {
    label: "Signal Volume",
    description: "More overnight signals → higher confidence",
    icon: "📊",
    color: "#818cf8",
  },
  recency: {
    label: "Recency",
    description: "Fresher signals → higher confidence",
    icon: "⏱",
    color: "#a78bfa",
  },
  leadScore: {
    label: "Lead Score",
    description: "Higher CRM score → higher confidence",
    icon: "🎯",
    color: "#c084fc",
  },
  diversity: {
    label: "Signal Diversity",
    description: "Multiple signal types → higher confidence",
    icon: "🔀",
    color: "#60a5fa",
  },
  urgency: {
    label: "Urgency",
    description: "Deadline / response pressure → higher confidence",
    icon: "⚡",
    color: "#f59e0b",
  },
}

/** Normalize weights so they sum to 1, proportionally */
function normalize(w: ConfidenceWeights): ConfidenceWeights {
  const total = Object.values(w).reduce((a, b) => a + b, 0)
  if (total === 0) return { signalVolume: 0.2, recency: 0.25, leadScore: 0.25, diversity: 0.15, urgency: 0.15 }
  return {
    signalVolume: w.signalVolume / total,
    recency: w.recency / total,
    leadScore: w.leadScore / total,
    diversity: w.diversity / total,
    urgency: w.urgency / total,
  }
}

export interface ConfidenceBreakdown {
  total: number
  factors: Record<keyof ConfidenceWeights, { raw: number; weighted: number; pct: number }>
}

export function calculateConfidence(
  item: QueueItem,
  weights: ConfidenceWeights
): ConfidenceBreakdown {
  const w = normalize(weights)
  const signals = item.signals ?? []
  const now = Date.now()

  // ── Factor 1: Signal Volume ──
  // 0 signals → 0, 1 → 0.4, 2 → 0.65, 3 → 0.82, 4+ → 1.0
  const signalVolume = Math.min(1, signals.length === 0 ? 0 : 0.3 + (signals.length / 4) * 0.7)

  // ── Factor 2: Recency ──
  const mostRecentMs = signals.reduce((latest, sig) => {
    const t = new Date(sig.occurred_at).getTime()
    return t > latest ? t : latest
  }, 0)
  const hoursAgo = mostRecentMs > 0 ? (now - mostRecentMs) / 3_600_000 : 999
  const recency =
    hoursAgo < 6  ? 1.0 :
    hoursAgo < 12 ? 0.9 :
    hoursAgo < 24 ? 0.75 :
    hoursAgo < 48 ? 0.55 :
    hoursAgo < 72 ? 0.35 : 0.15

  // ── Factor 3: Lead Score ──
  const leadScore = item.lead.lead_score / 100

  // ── Factor 4: Signal Diversity ──
  // Unique signal types out of 6 possible; 3+ = max
  const uniqueTypes = new Set(signals.map((s) => s.signal_type)).size
  const diversity = Math.min(uniqueTypes / 3, 1)

  // ── Factor 5: Urgency ──
  let urgency = 0.25
  const dl = item.lead.transaction_deadline_days
  if (dl !== null && dl <= 3) urgency = 1.0
  else if (dl !== null && dl <= 7) urgency = 0.85
  else if (signals.some((s) => s.signal_type === "aos_escalation")) urgency = 0.9
  else if (item.lead.missed_response_minutes > 240) urgency = 0.75
  else if (item.lead.missed_response_minutes > 60) urgency = 0.6

  const raw: Record<keyof ConfidenceWeights, number> = {
    signalVolume,
    recency,
    leadScore,
    diversity,
    urgency,
  }

  const factors = {} as ConfidenceBreakdown["factors"]
  let total = 0
  for (const key of Object.keys(raw) as (keyof ConfidenceWeights)[]) {
    const weighted = raw[key] * w[key]
    total += weighted
    factors[key] = {
      raw: Math.round(raw[key] * 100),
      weighted: Math.round(weighted * 100),
      pct: Math.round(w[key] * 100),
    }
  }

  return {
    total: Math.round(Math.min(Math.max(total, 0.1), 0.99) * 100) / 100,
    factors,
  }
}

export function loadWeights(): ConfidenceWeights {
  if (typeof window === "undefined") return DEFAULT_WEIGHTS
  try {
    const stored = localStorage.getItem("lofty_confidence_weights")
    if (stored) return { ...DEFAULT_WEIGHTS, ...JSON.parse(stored) }
  } catch (_) { /* ignore */ }
  return DEFAULT_WEIGHTS
}

export function saveWeights(w: ConfidenceWeights) {
  if (typeof window === "undefined") return
  localStorage.setItem("lofty_confidence_weights", JSON.stringify(w))
}
