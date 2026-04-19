# Lofty Morning Handoff — Design Spec

**Date:** 2026-04-18  
**Builder:** Samir (solo) + Claude Code  
**Hackathon:** GlobeHack S1, ASU, April 18–19 2026  
**Tracks:** Lofty (main) · InsForge (side) · Vector (side) · Tamagrow (side)

---

## One-Line Pitch

> Lofty Morning Handoff turns overnight AOS activity into an explainable, approval-ready action queue — so agents start the day with decisions already made, and know exactly why.

---

## Build Strategy

**Approach A — UI-first, backend-wired progressively.**  
Build the full hero screen with seeded mock data first (hours 0–3). Lock the visual design. Then wire InsForge behind it (hours 3–8). Then add LLM explanations (hours 8–12). Demo is always shippable at every stage.

---

## Visual Design

- **Style:** Soft Lavender AI-Native — light purple-to-white gradient background, frosted-glass white cards, indigo/purple gradient accents
- **Typography:** Inter (800–900 weight for headings, 500–600 for body)
- **Motion:** Framer Motion — cards slide up on load, gradient animates on name/accent stripe/Approve button, background orbs float
- **Branding:** Lofty "L✦" icon + "Morning Handoff" wordmark in nav; "Powered by Lofty AOS" badge; green pulse dot for AOS Active status
- **Key UI elements:**
  - Sticky frosted-glass nav
  - Hero header: greeting + overnight summary pills + audio brief button
  - 3 action cards (card #1 full opacity, cards 2–3 dimmed 60%)
  - Each card: rank badge, score badge, opportunity type, name, reason, recommended action, Approve/Edit/Delegate/Snooze buttons, "Why this matters" link, confidence %
  - Fixed "Ask Lofty" command bar at bottom (⌘K)

---

## System Architecture

### Frontend
| Tech | Purpose |
|---|---|
| Next.js 14 (App Router) | Framework, RSC for data fetching |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Component primitives |
| Framer Motion | Card animations, entrance effects |
| Web Speech API | Audio brief narration (free, instant, browser-native) |

### Backend — InsForge
| Tech | Purpose |
|---|---|
| Postgres | Primary database with RLS |
| InsForge Auth | JWT auth with role claims (agent / team_lead) |
| Edge Functions | Scoring, explanation, approval logic |
| Realtime (pub/sub) | Live queue re-ranking without refresh |
| Storage | Audio brief assets (optional) |

### AI Layer
| Tech | Purpose |
|---|---|
| HuggingFace Inference API | Free tier, no cost |
| Mistral-7B-Instruct-v0.3 | "Why this matters" explanation generation |
| Deterministic Postgres SQL | Priority scoring — no LLM involved |

---

## Database Schema

### `agents`
```sql
id uuid PK, name, email, goals, quota, target_zips, style_prefs, created_at
```

### `leads`
```sql
id uuid PK, agent_id FK, name, phone, email,
lead_score int (0–100), opportunity_type text,
missed_response_minutes int, transaction_deadline_days int,
last_contact_at timestamptz, created_at
```

### `lead_signals`
```sql
id uuid PK, lead_id FK, signal_type text,
payload jsonb, occurred_at timestamptz
```
Signal types: `site_visit`, `email_open`, `showing_request`, `aos_escalation`, `buyer_match`, `seller_intent`

### `priority_queue`
```sql
id uuid PK, agent_id FK, lead_id FK,
priority_score numeric, rank int,
explanation text, recommended_action text,
confidence numeric, scored_at timestamptz, date date
```

### `approvals`
```sql
id uuid PK, queue_item_id FK, agent_id FK,
action_taken text, -- 'approve' | 'edit' | 'delegate' | 'snooze'
notes text, created_at timestamptz
```

### `audit_log`
```sql
id uuid PK, queue_item_id FK,
score_breakdown jsonb, llm_explanation text,
signal_sources jsonb, created_at timestamptz
```

---

## Priority Scoring Function

Deterministic — runs entirely in Postgres, no LLM:

```
priority_score =
    0.30 × lead_score_normalized          -- 0–100 → 0.0–1.0
  + 0.20 × opportunity_weight[type]       -- High Interest=1.0, Back-to-Site=0.7, Sell=0.8, Back-on-Market=0.5
  + 0.15 × response_window_urgency        -- minutes since inbound, decays over 12h
  + 0.15 × transaction_deadline_urgency   -- days until deadline, spikes under 3 days
  + 0.10 × aos_escalation_flag            -- 1.0 if AOS agent escalated, else 0
  + 0.10 × buyer_match_freshness          -- 1.0 if match in last 8h, else 0
```

Top 3 results written to `priority_queue` for the agent's current date.

---

## InsForge Edge Functions

| Function | Trigger | What it does |
|---|---|---|
| `ingestOvernightSignals()` | Cron 5 AM agent-local | Seeds `lead_signals` from last 12h of activity |
| `scorePriorityQueue(agent_id)` | After ingest / on-demand | Runs scoring SQL, writes top 3 to `priority_queue` |
| `explainTopAction(queue_item_id)` | On "Why?" tap | Calls Mistral-7B with score components, returns explanation string |
| `approveAndExecuteAction(approval_id)` | On Approve/Edit/Delegate/Snooze | Atomically logs to `approvals` + `audit_log` |

---

## Request Flow

```
Agent logs in at 7 AM
  → Next.js RSC fetches priority_queue for today (InsForge Postgres)
  → Hero screen renders 3 ranked action cards from real data
  → Agent taps "Why this matters"
    → explainTopAction() → Mistral-7B → explanation string displayed
  → Agent taps "Approve & Execute"
    → approveAndExecuteAction() → approvals + audit_log written
    → InsForge Realtime pushes update → card marked done live
  → Audio brief (optional)
    → Web Speech API reads the hero summary aloud in the browser
```

---

## Auth & Security

- InsForge JWT auth. Agents log in with email/password.
- Row-Level Security: each agent sees only their own `leads`, `priority_queue`, `approvals`.
- `agent_id` injected server-side from JWT claims — never trusted from client.
- HuggingFace API key stored in InsForge Edge Function env vars, never exposed to browser.

---

## Seeded Demo Data

For the hackathon demo, the database is pre-seeded with realistic data:

| Lead | Score | Type | Signal |
|---|---|---|---|
| Kristin Watson | 88 | High Interest | 6 site visits + listing deck opened twice overnight |
| Annette Black | 74 | Seller Intent | Competitor listing browsing + market reports opened |
| Wade Warren | 61 | Deadline | Inspection contingency in 3 days, Smart Plan overdue |

---

## What's Explicitly Out of Scope (Hackathon)

- Multi-agent team rollups (in the 30/60/90 roadmap slide, not the demo)
- Full Smart Plan authoring UI
- ElevenLabs TTS (replaced by Web Speech API — same demo effect, free)
- Multi-broker role views
- Mobile app (responsive web only)

---

## Success Metrics (cite in pitch)

| Metric | Target |
|---|---|
| Time-to-first-action after login | < 2 min (vs ~15–20 min baseline) |
| AI trust score | ≥ 70% approve-without-edit |
| Overnight lead recovery | +1–2 leads/week recovered |
| Waitlist price signal | ≥ 60% at $25+/seat |

---

## AI Tool Disclosure

- **Claude Sonnet 4.6** — design spec, LLM prompt engineering, architecture planning
- **HuggingFace / Mistral-7B** — "why this matters" explanation generation
- **Next.js + shadcn/ui + Framer Motion** — frontend framework and components
- **InsForge** — backend, database, auth, realtime, edge functions
- **Web Speech API** — browser-native TTS for audio brief
