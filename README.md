# Lofty Morning Handoff ✦

> **GlobeHack S1 — Built in 36 hours**

An AI-powered morning briefing system for real estate agents. Lofty's AOS (Agent Operating System) handles overnight lead follow-ups, showing requests, and buyer matching — then hands off a ranked, narrated, approval-ready queue every morning.

---

## The Problem

Real estate agents lose deals in the overnight window. Leads browse listings at 2 AM, submit pre-approval letters before dawn, and start comparing agents by 9 AM. By the time an agent opens their laptop, the window has closed.

## The Solution

Lofty AOS works overnight so agents don't have to. Every morning, it delivers:

- **A narrated video briefing** — each lead's situation read aloud with AI-generated context
- **A ranked priority queue** — 5 ranked decisions with confidence scores and signal explanations
- **One-tap actions** — approve, edit, delegate, or snooze each item
- **Ask Lofty (⌘K)** — ask anything in natural language: draft an email, explain a priority, reassign a task

---

## Demo Flow

1. **Landing** — pick an agent (James or Sara), watch the boot sequence
2. **Video Briefing** — narrated slide show with particle canvas background, animated stats, per-lead summaries with buyer/seller indicators
3. **Transcript View** — staggered reveal of all action items before the queue
4. **Priority Queue** — drag to reorder, approve/delegate/snooze each card
5. **Why This Matters** — AI-generated explanation of each lead's score breakdown
6. **Ask Lofty** — ⌘K to open, ask in plain English, get contextual AI answers

---

## Features

### Morning Briefing Video
- Animated particle canvas background with nebula glows
- Web Speech API narration — slides advance when speech completes
- Pause/play, arrow key navigation, mute (M), skip (Esc)
- Per-lead slides with character emoji, buyer/seller badge, score ring, signal timeline

### Priority Queue
- 5 AI-ranked leads with priority scores and confidence percentages
- Signal-driven explanations (site visits, email opens, pre-approvals, deadline urgency)
- Drag-to-reorder with custom order saved to sessionStorage
- Action modes: Approve & Execute, Edit recommendation, Delegate to team, Snooze

### Ask Lofty (⌘K)
- Natural language AI assistant powered by Llama 3.3-70B
- Passes live queue context — answers are specific to your current leads
- Email drafts detected and rendered in monospace with a Copy button
- Suggestion chips on focus, instant fallback if LLM is unavailable

### Confidence Score Engine
- 5-factor weighted model: Signal Volume, Recency, Lead Score, Signal Diversity, Urgency
- All weights are user-adjustable in real time via the **⚙ Tune Model** drawer (queue header)
- Sliders normalize automatically — changes apply instantly across every lead card
- Per-factor breakdown visible in the **Why This Matters** drawer (icon, raw score, weighted contribution)
- Weights persist to `localStorage` and survive page refreshes

### Agents Panel
- Overnight activity charts (bar + donut SVG)
- Lead score ranking with animated bars
- AOS agent status (Sales Agent, Homeowner Agent, Smart Plan Bot)
- Escalation alerts for high-priority leads

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, Framer Motion, shadcn/ui |
| AI / LLM | Llama 3.3-70B via HuggingFace Together Router |
| Backend | InsForge (Postgres + Auth + Edge Functions) |
| Audio | Web Speech API (speechSynthesis) |
| Deploy | Docker + docker-compose |

---

## Running Locally

### With Docker (recommended)

```bash
cp .env.example .env         # fill in HF_API_KEY and InsForge credentials
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000)

### Without Docker

```bash
npm install
cp .env.example .env
npm run dev
```

---

## Environment Variables

```env
HF_API_KEY=hf_...                        # HuggingFace API key (free tier works)
INSFORGE_URL=https://...                 # InsForge project URL
INSFORGE_SERVICE_KEY=...                 # InsForge service role key
DEMO_AGENT_ID=3b6e5282-dc35-4f89-...    # Default agent for demo
```

> The app works fully with mock data if InsForge is not configured — all 5 leads and overnight signals are seeded in `lib/mock-data.ts`.

---

## Project Structure

```
app/
  page.tsx              # Landing — agent picker + boot sequence
  dashboard/page.tsx    # Main dashboard — video → transcript → queue
  login/page.tsx        # Auth (InsForge)
  api/
    ask/route.ts        # Ask Lofty — LLM with queue context
    explain/route.ts    # Why This Matters — per-lead AI explanation
    queue/route.ts      # Priority queue from InsForge
    approve/route.ts    # Log approvals + audit trail

components/
  video-player.tsx      # Narrated briefing player (particle canvas, speech)
  action-card.tsx       # Ranked lead card with full action suite
  agents-panel.tsx      # Left sidebar with overnight stats + charts
  transcript-view.tsx   # Post-video action item reveal
  ask-bar.tsx           # ⌘K AI assistant bar
  why-drawer.tsx        # Score breakdown + signal sources drawer
  confidence-tuner.tsx  # Adjustable confidence weight sliders drawer
  nav.tsx               # Sticky header

lib/
  mock-data.ts          # 5 realistic leads with overnight signals
  types.ts              # Shared TypeScript types
  confidence.ts         # 5-factor confidence model, weight persistence
  insforge-server.ts    # Server-side InsForge client
```

---

## Video Player Controls

| Key | Action |
|---|---|
| `Space` | Pause / Resume |
| `←` / `→` | Previous / Next slide |
| `M` | Toggle mute |
| `Esc` | Skip briefing |

Slides advance automatically when narration completes.

---

## Built By

Samir Shah — GlobeHack S1, April 2026

Powered by **Lofty AOS** · **InsForge** · **Llama 3.3-70B** · **HuggingFace**
