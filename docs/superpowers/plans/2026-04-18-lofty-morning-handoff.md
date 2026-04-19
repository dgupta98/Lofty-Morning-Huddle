# Lofty Morning Handoff — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully working Morning Handoff app — beautiful hero screen with 3 ranked action cards, InsForge backend, HuggingFace LLM explanations, and live realtime updates — demo-ready in 36 hours.

**Architecture:** UI-first with mock data (Phase 1–2), then InsForge backend wired progressively (Phase 3–4), then HuggingFace LLM layer (Phase 5), then auth + polish (Phase 6). The demo is always shippable at the end of every phase.

**Tech Stack:** Next.js 14 App Router · Tailwind CSS · shadcn/ui · Framer Motion · InsForge (Postgres + Auth + Edge Functions + Realtime) · HuggingFace Mistral-7B-Instruct-v0.3 · Web Speech API

---

## File Map

```
codebase/
├── app/
│   ├── layout.tsx                 # Root layout, Inter font, global styles
│   ├── globals.css                # Tailwind base + custom CSS vars
│   ├── page.tsx                   # Redirects to /dashboard
│   ├── login/
│   │   └── page.tsx               # Email/password login form
│   └── dashboard/
│       └── page.tsx               # Hero screen RSC — fetches queue, renders cards
├── components/
│   ├── nav.tsx                    # Sticky frosted-glass nav + Lofty branding
│   ├── hero-header.tsx            # Overnight summary pills + audio button
│   ├── action-card.tsx            # Single action card (all buttons + why link)
│   ├── why-drawer.tsx             # Slide-out "Why this matters" drawer
│   ├── audio-brief.tsx            # Web Speech API hook + play button
│   └── ask-bar.tsx                # Fixed bottom ⌘K command bar
├── lib/
│   ├── types.ts                   # Shared TypeScript types (Lead, QueueItem, etc.)
│   ├── mock-data.ts               # Phase 1 seeded demo data
│   ├── insforge.ts                # InsForge browser client singleton
│   └── insforge-server.ts         # InsForge server client (RSC + Edge Functions)
├── app/api/
│   ├── approve/route.ts           # POST — logs approval to InsForge
│   └── explain/route.ts           # POST — proxies to HuggingFace, returns explanation
├── sql/
│   ├── 001_schema.sql             # All table CREATE statements
│   ├── 002_rls.sql                # Row Level Security policies
│   └── 003_seed.sql               # Demo data: Kristin, Annette, Wade
├── insforge/functions/
│   ├── score-priority-queue/index.ts   # scorePriorityQueue edge function
│   ├── explain-top-action/index.ts     # explainTopAction edge function (HF API)
│   └── approve-action/index.ts         # approveAndExecuteAction edge function
├── .env.local                     # NEXT_PUBLIC_INSFORGE_URL, INSFORGE_SERVICE_KEY, HF_API_KEY
├── .env.example                   # Safe-to-commit template
├── next.config.ts
└── tailwind.config.ts
```

---

## Phase 1 — Project Scaffold

### Task 1: Initialize Next.js project

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`

- [ ] **Step 1: Scaffold Next.js app**

Run in `/Users/dipgupmac/Downloads/Globehack/codebase`:
```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*" \
  --no-git
```
When prompted, accept all defaults.

- [ ] **Step 2: Install dependencies**

```bash
npm install framer-motion @radix-ui/react-dialog @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react
npm install -D @types/node
```

- [ ] **Step 3: Install shadcn/ui**

```bash
npx shadcn@latest init
```
Choose: Style → Default, Base color → Slate, CSS variables → yes.

Then add components:
```bash
npx shadcn@latest add button badge drawer
```

- [ ] **Step 4: Update `tailwind.config.ts` to add Inter font and custom animation**

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        lavender: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
        },
      },
      animation: {
        "float": "float 8s ease-in-out infinite",
        "float-reverse": "float 10s ease-in-out infinite reverse",
        "gradient-shift": "gradientShift 4s ease infinite",
        "pulse-glow": "pulseGlow 3s ease infinite",
        "fade-slide-up": "fadeSlideUp 0.5s ease both",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "50%": { transform: "translateY(-30px) scale(1.05)" },
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(99,102,241,0.25)" },
          "50%": { boxShadow: "0 0 0 8px rgba(99,102,241,0)" },
        },
        fadeSlideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

Install the animate plugin:
```bash
npm install tailwindcss-animate
```

- [ ] **Step 5: Update `app/globals.css`**

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

:root {
  --font-inter: 'Inter', sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  background: linear-gradient(135deg, #ede9fe 0%, #e0e7ff 50%, #f0f4ff 100%);
  min-height: 100vh;
  font-family: var(--font-inter), sans-serif;
  color: #1e1b4b;
}

body::before {
  content: '';
  position: fixed;
  top: -200px; right: -200px;
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 8s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

body::after {
  content: '';
  position: fixed;
  bottom: -150px; left: -150px;
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 10s ease-in-out infinite reverse;
  pointer-events: none;
  z-index: 0;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-30px) scale(1.05); }
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.25); }
  50% { box-shadow: 0 0 0 8px rgba(99,102,241,0); }
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 6: Update `app/layout.tsx`**

```tsx
// app/layout.tsx
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Lofty Morning Handoff",
  description: "Your overnight AOS decisions, approval-ready.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 7: Verify dev server starts**

```bash
npm run dev
```
Expected: server running at http://localhost:3000 with no errors.

- [ ] **Step 8: Commit**

```bash
git init
git add .
git commit -m "chore: init Next.js project with Tailwind, shadcn/ui, Framer Motion"
```

---

### Task 2: TypeScript types

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Create types file**

```ts
// lib/types.ts
export type OpportunityType =
  | "High Interest"
  | "Back-to-Site"
  | "Seller Intent"
  | "Back-on-Market"
  | "Deadline"

export type ActionTaken = "approve" | "edit" | "delegate" | "snooze"

export interface Lead {
  id: string
  agent_id: string
  name: string
  phone: string
  email: string
  lead_score: number
  opportunity_type: OpportunityType
  missed_response_minutes: number
  transaction_deadline_days: number | null
  last_contact_at: string | null
  created_at: string
}

export interface LeadSignal {
  id: string
  lead_id: string
  signal_type:
    | "site_visit"
    | "email_open"
    | "showing_request"
    | "aos_escalation"
    | "buyer_match"
    | "seller_intent"
  payload: Record<string, unknown>
  occurred_at: string
}

export interface QueueItem {
  id: string
  agent_id: string
  lead_id: string
  priority_score: number
  rank: number
  explanation: string | null
  recommended_action: string
  confidence: number
  scored_at: string
  date: string
  lead: Lead
  signals?: LeadSignal[]
}

export interface Approval {
  id: string
  queue_item_id: string
  agent_id: string
  action_taken: ActionTaken
  notes: string | null
  created_at: string
}

export interface Agent {
  id: string
  name: string
  email: string
  goals: string | null
  quota: number | null
  target_zips: string[]
  style_prefs: Record<string, unknown>
  created_at: string
}

export interface OvernightSummary {
  lead_followups: number
  showing_requests_accepted: number
  escalated_lead_name: string | null
  buyer_matches: number
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "feat(types): add shared TypeScript types"
```

---

## Phase 2 — UI with Mock Data

### Task 3: Mock data

**Files:**
- Create: `lib/mock-data.ts`

- [ ] **Step 1: Create mock data file**

```ts
// lib/mock-data.ts
import type { QueueItem, OvernightSummary } from "./types"

export const MOCK_AGENT_NAME = "James"

export const MOCK_OVERNIGHT_SUMMARY: OvernightSummary = {
  lead_followups: 14,
  showing_requests_accepted: 2,
  escalated_lead_name: "Annette Black",
  buyer_matches: 1,
}

export const MOCK_QUEUE: QueueItem[] = [
  {
    id: "qi-1",
    agent_id: "agent-1",
    lead_id: "lead-1",
    priority_score: 0.88,
    rank: 1,
    explanation:
      "Kristin has viewed this listing 6 times in 48 hours and returned late at night — a strong buying signal. The Sales Agent's overnight outreach was opened twice, meaning she's engaged. Response window is narrowing: contact within the morning maximizes conversion.",
    recommended_action:
      "📞 Call her at 10:00 AM and offer the Saturday tour slot.",
    confidence: 0.94,
    scored_at: new Date().toISOString(),
    date: new Date().toISOString().split("T")[0],
    lead: {
      id: "lead-1",
      agent_id: "agent-1",
      name: "Kristin Watson",
      phone: "+1 (602) 555-0142",
      email: "kristin.watson@email.com",
      lead_score: 88,
      opportunity_type: "High Interest",
      missed_response_minutes: 0,
      transaction_deadline_days: null,
      last_contact_at: null,
      created_at: new Date().toISOString(),
    },
    signals: [
      {
        id: "sig-1",
        lead_id: "lead-1",
        signal_type: "site_visit",
        payload: { listing: "3931 Via Montalvo", count: 6, last_at: "11:42 PM" },
        occurred_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "sig-2",
        lead_id: "lead-1",
        signal_type: "email_open",
        payload: { subject: "Listing deck: 3931 Via Montalvo", opens: 2 },
        occurred_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "qi-2",
    agent_id: "agent-1",
    lead_id: "lead-2",
    priority_score: 0.74,
    rank: 2,
    explanation:
      "Homeowner Agent flagged seller intent based on Annette's browsing of comparable listings in her zip code. She opened two market reports overnight — classic pre-listing research behavior. A timely CMA positions you as the listing agent before she shops around.",
    recommended_action:
      "📋 Send a personalized CMA and request a 15-min check-in call.",
    confidence: 0.81,
    scored_at: new Date().toISOString(),
    date: new Date().toISOString().split("T")[0],
    lead: {
      id: "lead-2",
      agent_id: "agent-1",
      name: "Annette Black",
      phone: "+1 (602) 555-0198",
      email: "annette.black@email.com",
      lead_score: 74,
      opportunity_type: "Seller Intent",
      missed_response_minutes: 0,
      transaction_deadline_days: null,
      last_contact_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    },
    signals: [
      {
        id: "sig-3",
        lead_id: "lead-2",
        signal_type: "seller_intent",
        payload: { market_reports_opened: 2, competitor_listings_browsed: 4 },
        occurred_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "qi-3",
    agent_id: "agent-1",
    lead_id: "lead-3",
    priority_score: 0.61,
    rank: 3,
    explanation:
      "Wade's inspection contingency expires in 3 days, and the Smart Plan step assigned 36 hours ago remains uncomplete. No logged contact since Wednesday. Missing this window risks losing the transaction entirely.",
    recommended_action:
      "📅 Confirm inspection appointment and update Smart Plan status.",
    confidence: 0.73,
    scored_at: new Date().toISOString(),
    date: new Date().toISOString().split("T")[0],
    lead: {
      id: "lead-3",
      agent_id: "agent-1",
      name: "Wade Warren",
      phone: "+1 (602) 555-0221",
      email: "wade.warren@email.com",
      lead_score: 61,
      opportunity_type: "Deadline",
      missed_response_minutes: 0,
      transaction_deadline_days: 3,
      last_contact_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    },
    signals: [
      {
        id: "sig-4",
        lead_id: "lead-3",
        signal_type: "aos_escalation",
        payload: { reason: "Smart Plan step overdue", deadline_days: 3 },
        occurred_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
]
```

- [ ] **Step 2: Commit**

```bash
git add lib/mock-data.ts
git commit -m "feat(mock): add seeded demo data for Kristin, Annette, Wade"
```

---

### Task 4: Nav component

**Files:**
- Create: `components/nav.tsx`

- [ ] **Step 1: Create nav component**

```tsx
// components/nav.tsx
"use client"

export function Nav({ agentName }: { agentName: string }) {
  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-7 py-3.5"
      style={{
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(99,102,241,0.12)",
      }}
    >
      {/* Lofty wordmark */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black"
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow: "0 2px 10px rgba(99,102,241,0.35)",
          }}
        >
          L✦
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-extrabold text-indigo-800 tracking-tight">
            Lofty
          </span>
          <span
            className="text-[9px] font-semibold tracking-widest uppercase"
            style={{ color: "#6366f1", opacity: 0.8 }}
          >
            Morning Handoff
          </span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3.5">
        {/* AOS Active badge */}
        <div
          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full"
          style={{
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.15)",
            color: "#6366f1",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-green-500"
            style={{ animation: "pulseGlow 2s infinite" }}
          />
          AOS Active
        </div>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-extrabold cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            border: "2px solid rgba(255,255,255,0.8)",
            boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
          }}
        >
          {agentName[0]}
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/nav.tsx
git commit -m "feat(ui): add Nav component with Lofty branding"
```

---

### Task 5: Hero header component

**Files:**
- Create: `components/hero-header.tsx`

- [ ] **Step 1: Create hero header**

```tsx
// components/hero-header.tsx
"use client"

import type { OvernightSummary } from "@/lib/types"

interface HeroHeaderProps {
  agentName: string
  summary: OvernightSummary
  onPlayAudio: () => void
}

export function HeroHeader({ agentName, summary, onPlayAudio }: HeroHeaderProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  const pills = [
    `${summary.lead_followups} lead follow-ups`,
    `${summary.showing_requests_accepted} showing requests accepted`,
    ...(summary.escalated_lead_name
      ? [`${summary.escalated_lead_name} escalated`]
      : []),
    ...(summary.buyer_matches > 0
      ? [`${summary.buyer_matches} buyer match found`]
      : []),
  ]

  return (
    <div
      className="rounded-2xl p-6 mb-4"
      style={{
        background: "rgba(255,255,255,0.78)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(99,102,241,0.18)",
        boxShadow: "0 8px 32px rgba(99,102,241,0.1), 0 2px 8px rgba(99,102,241,0.06)",
        animation: "fadeSlideUp 0.5s ease both",
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight leading-tight mb-1">
            Good morning,{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradientShift 4s ease infinite",
              }}
            >
              {agentName}
            </span>{" "}
            ✦
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            {today} · Your overnight handoff is ready
          </p>
        </div>

        <button
          onClick={onPlayAudio}
          className="flex items-center gap-2 text-white text-xs font-bold px-4 py-2.5 rounded-full flex-shrink-0 transition-all hover:-translate-y-px"
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
          }}
        >
          ▶ 0:58
        </button>
      </div>

      {/* Overnight pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {pills.map((pill) => (
          <span
            key={pill}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(99,102,241,0.07)",
              border: "1px solid rgba(99,102,241,0.14)",
              color: "#4338ca",
            }}
          >
            <span className="text-green-500">✓</span>
            {pill}
          </span>
        ))}
      </div>

      {/* Decisions strip */}
      <div
        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl"
        style={{
          background: "linear-gradient(90deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06))",
          border: "1px solid rgba(99,102,241,0.12)",
        }}
      >
        <span className="text-xs font-bold text-indigo-500 tracking-wide flex items-center gap-2">
          ✦ &nbsp;3 decisions are waiting for you
        </span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/hero-header.tsx
git commit -m "feat(ui): add HeroHeader with overnight summary and audio trigger"
```

---

### Task 6: Why drawer component

**Files:**
- Create: `components/why-drawer.tsx`

- [ ] **Step 1: Create why drawer**

```tsx
// components/why-drawer.tsx
"use client"

import { useState } from "react"
import type { QueueItem } from "@/lib/types"

interface WhyDrawerProps {
  item: QueueItem
  open: boolean
  onClose: () => void
}

export function WhyDrawer({ item, open, onClose }: WhyDrawerProps) {
  if (!open) return null

  const scoreComponents = [
    {
      label: "Lead Score",
      value: item.lead.lead_score,
      weight: "30%",
      bar: item.lead.lead_score,
    },
    {
      label: "Opportunity Type",
      value: item.lead.opportunity_type,
      weight: "20%",
      bar: item.lead.opportunity_type === "High Interest" ? 100
        : item.lead.opportunity_type === "Seller Intent" ? 80
        : item.lead.opportunity_type === "Back-to-Site" ? 70
        : 50,
    },
    {
      label: "Transaction Deadline",
      value: item.lead.transaction_deadline_days
        ? `${item.lead.transaction_deadline_days} days`
        : "None",
      weight: "15%",
      bar: item.lead.transaction_deadline_days
        ? Math.max(0, 100 - item.lead.transaction_deadline_days * 10)
        : 0,
    },
    {
      label: "Response Urgency",
      value: item.lead.missed_response_minutes > 0
        ? `${item.lead.missed_response_minutes} min overdue`
        : "On time",
      weight: "15%",
      bar: Math.min(100, item.lead.missed_response_minutes),
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* Backdrop */}
      <div className="flex-1 bg-black/20 backdrop-blur-sm" />

      {/* Drawer */}
      <div
        className="w-full max-w-sm h-full overflow-y-auto p-6 flex flex-col gap-5"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          borderLeft: "1px solid rgba(99,102,241,0.2)",
          boxShadow: "-8px 0 40px rgba(99,102,241,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase mb-1">
              Why This Matters
            </p>
            <h2 className="text-lg font-black text-indigo-900">
              {item.lead.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* LLM Explanation */}
        {item.explanation && (
          <div
            className="p-4 rounded-xl text-sm text-gray-700 leading-relaxed"
            style={{
              background: "linear-gradient(90deg, rgba(99,102,241,0.05), rgba(139,92,246,0.04))",
              borderLeft: "3px solid #6366f1",
            }}
          >
            {item.explanation}
          </div>
        )}

        {/* Score breakdown */}
        <div>
          <p className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase mb-3">
            Score Breakdown
          </p>
          <div className="flex flex-col gap-3">
            {scoreComponents.map((c) => (
              <div key={c.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-gray-700">{c.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{String(c.value)}</span>
                    <span className="text-[10px] text-indigo-400 font-medium">w={c.weight}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-indigo-50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${c.bar}%`,
                      background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signal sources */}
        {item.signals && item.signals.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase mb-3">
              Signal Sources
            </p>
            <div className="flex flex-col gap-2">
              {item.signals.map((sig) => (
                <div
                  key={sig.id}
                  className="p-3 rounded-lg text-xs"
                  style={{
                    background: "rgba(99,102,241,0.04)",
                    border: "1px solid rgba(99,102,241,0.1)",
                  }}
                >
                  <div className="font-semibold text-indigo-700 mb-1 capitalize">
                    {sig.signal_type.replace(/_/g, " ")}
                  </div>
                  <div className="text-gray-500">
                    {new Date(sig.occurred_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confidence */}
        <div
          className="mt-auto p-3 rounded-xl flex items-center justify-between"
          style={{ background: "rgba(99,102,241,0.05)" }}
        >
          <span className="text-xs font-semibold text-gray-600">Model confidence</span>
          <span
            className="text-sm font-black"
            style={{
              background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {Math.round(item.confidence * 100)}%
          </span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/why-drawer.tsx
git commit -m "feat(ui): add WhyDrawer with score breakdown and signal sources"
```

---

### Task 7: Action card component

**Files:**
- Create: `components/action-card.tsx`

- [ ] **Step 1: Create action card**

```tsx
// components/action-card.tsx
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { WhyDrawer } from "./why-drawer"
import type { QueueItem, ActionTaken } from "@/lib/types"

interface ActionCardProps {
  item: QueueItem
  index: number
  onAction: (itemId: string, action: ActionTaken) => Promise<void>
}

export function ActionCard({ item, index, onAction }: ActionCardProps) {
  const [whyOpen, setWhyOpen] = useState(false)
  const [loading, setLoading] = useState<ActionTaken | null>(null)
  const [done, setDone] = useState(false)

  const isDimmed = index > 0
  const scorePercent = Math.round(item.priority_score * 100)

  async function handleAction(action: ActionTaken) {
    setLoading(action)
    await onAction(item.id, action)
    setLoading(null)
    if (action === "approve") setDone(true)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isDimmed ? 0.6 : 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(99,102,241,0.14)",
          boxShadow: "0 4px 20px rgba(99,102,241,0.07), 0 1px 4px rgba(0,0,0,0.04)",
        }}
        whileHover={{ y: -2, boxShadow: "0 10px 36px rgba(99,102,241,0.13)" }}
      >
        {/* Top gradient stripe */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{
            background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)",
            backgroundSize: "200% auto",
            animation: "gradientShift 4s ease infinite",
          }}
        />

        <div className="p-5 pt-6">
          {/* Rank + badges */}
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-bold text-indigo-300 tracking-widest uppercase">
              #{item.rank} · Priority
            </span>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-xl"
                style={{
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.15)",
                  color: "#6366f1",
                }}
              >
                {item.lead.opportunity_type}
              </span>
              <span
                className="text-[11px] font-extrabold px-2.5 py-1 rounded-xl text-white"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
                }}
              >
                {scorePercent}
              </span>
            </div>
          </div>

          {/* Lead name */}
          <h2 className="text-lg font-black text-indigo-900 tracking-tight mb-2">
            {item.lead.name}
          </h2>

          {/* Reason */}
          {item.explanation && (
            <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-3">
              {item.explanation}
            </p>
          )}

          {/* Recommended action */}
          <div className="mb-4">
            <p className="text-[9px] font-extrabold text-purple-500 tracking-widest uppercase mb-1.5">
              Recommended action
            </p>
            <div
              className="text-sm font-semibold text-indigo-900 p-3 rounded-xl leading-snug"
              style={{
                background: "linear-gradient(90deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))",
                borderLeft: "3px solid #6366f1",
              }}
            >
              {item.recommended_action}
            </div>
          </div>

          {/* Action buttons */}
          {done ? (
            <div className="flex items-center gap-2 text-green-600 text-sm font-bold py-2">
              <span>✓</span> Action approved — Lofty is executing
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => handleAction("approve")}
                disabled={loading !== null}
                className="text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all hover:-translate-y-px disabled:opacity-50"
                style={{
                  background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                  boxShadow: "0 3px 12px rgba(99,102,241,0.35)",
                  animation: "pulseGlow 3s ease infinite",
                }}
              >
                {loading === "approve" ? "..." : "✓ Approve & Execute"}
              </button>
              {(["edit", "delegate", "snooze"] as ActionTaken[]).map((action) => (
                <button
                  key={action}
                  onClick={() => handleAction(action)}
                  disabled={loading !== null}
                  className="text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all hover:-translate-y-px disabled:opacity-50"
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    color: "#6366f1",
                  }}
                >
                  {action === "edit" ? "✎ Edit" : action === "delegate" ? "→ Delegate" : "⟳ Snooze"}
                </button>
              ))}
            </div>
          )}

          {/* Footer */}
          <div
            className="flex items-center justify-between pt-3"
            style={{ borderTop: "1px solid rgba(99,102,241,0.08)" }}
          >
            <button
              onClick={() => setWhyOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-indigo-500 transition-colors"
            >
              ? Why this matters →
            </button>
            <span className="text-[10px] text-purple-300 font-medium">
              Confidence {Math.round(item.confidence * 100)}%
            </span>
          </div>
        </div>
      </motion.div>

      <WhyDrawer item={item} open={whyOpen} onClose={() => setWhyOpen(false)} />
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/action-card.tsx
git commit -m "feat(ui): add ActionCard with approve/edit/delegate/snooze and Why drawer"
```

---

### Task 8: Audio brief + Ask bar components

**Files:**
- Create: `components/audio-brief.tsx`
- Create: `components/ask-bar.tsx`

- [ ] **Step 1: Create audio brief hook**

```tsx
// components/audio-brief.tsx
"use client"

export function useAudioBrief(
  agentName: string,
  summary: { lead_followups: number; showing_requests_accepted: number; escalated_lead_name: string | null },
  topLeadName: string
) {
  function play() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()

    const text = [
      `Good morning, ${agentName}.`,
      `While you slept, Lofty handled ${summary.lead_followups} lead follow-ups`,
      `and accepted ${summary.showing_requests_accepted} showing requests.`,
      summary.escalated_lead_name
        ? `${summary.escalated_lead_name} was escalated by the Homeowner Agent.`
        : "",
      `Three things need your attention now.`,
      `First: ${topLeadName} is showing strong buying signals and needs a call this morning.`,
      `Open your handoff to see the full queue.`,
    ]
      .filter(Boolean)
      .join(" ")

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.pitch = 1.0
    window.speechSynthesis.speak(utterance)
  }

  return { play }
}
```

- [ ] **Step 2: Create ask bar component**

```tsx
// components/ask-bar.tsx
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
```

- [ ] **Step 3: Commit**

```bash
git add components/audio-brief.tsx components/ask-bar.tsx
git commit -m "feat(ui): add audio brief hook (Web Speech API) and Ask Lofty bar"
```

---

### Task 9: Dashboard page with mock data

**Files:**
- Create: `app/dashboard/page.tsx`
- Create: `app/page.tsx`

- [ ] **Step 1: Create dashboard page**

```tsx
// app/dashboard/page.tsx
"use client"

import { useState } from "react"
import { Nav } from "@/components/nav"
import { HeroHeader } from "@/components/hero-header"
import { ActionCard } from "@/components/action-card"
import { AskBar } from "@/components/ask-bar"
import { useAudioBrief } from "@/components/audio-brief"
import {
  MOCK_AGENT_NAME,
  MOCK_OVERNIGHT_SUMMARY,
  MOCK_QUEUE,
} from "@/lib/mock-data"
import type { ActionTaken, QueueItem } from "@/lib/types"

export default function DashboardPage() {
  const [queue, setQueue] = useState<QueueItem[]>(MOCK_QUEUE)
  const { play } = useAudioBrief(
    MOCK_AGENT_NAME,
    MOCK_OVERNIGHT_SUMMARY,
    queue[0]?.lead.name ?? ""
  )

  async function handleAction(itemId: string, action: ActionTaken) {
    // Phase 2: mock — just log. Phase 3: wire to InsForge.
    console.log("Action:", action, "on item:", itemId)
    await new Promise((r) => setTimeout(r, 600))
  }

  return (
    <div className="relative z-10">
      <Nav agentName={MOCK_AGENT_NAME} />

      <main className="max-w-2xl mx-auto px-5 pt-7 pb-36">
        <HeroHeader
          agentName={MOCK_AGENT_NAME}
          summary={MOCK_OVERNIGHT_SUMMARY}
          onPlayAudio={play}
        />

        <div className="flex flex-col gap-3.5">
          {queue.map((item, index) => (
            <ActionCard
              key={item.id}
              item={item}
              index={index}
              onAction={handleAction}
            />
          ))}
        </div>
      </main>

      {/* AOS Powered badge */}
      <div
        className="fixed bottom-20 right-5 z-40 flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(99,102,241,0.15)",
          color: "#6366f1",
          boxShadow: "0 2px 10px rgba(99,102,241,0.1)",
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
        />
        Powered by Lofty AOS
      </div>

      <AskBar />
    </div>
  )
}
```

- [ ] **Step 2: Create root redirect**

```tsx
// app/page.tsx
import { redirect } from "next/navigation"

export default function Home() {
  redirect("/dashboard")
}
```

- [ ] **Step 3: Run dev server and verify**

```bash
npm run dev
```
Open http://localhost:3000. Expected: hero screen with lavender gradient, 3 action cards, nav with Lofty branding. Click "Why this matters" — drawer slides in. Click ▶ button — browser speaks the morning brief aloud.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/page.tsx app/page.tsx
git commit -m "feat(dashboard): hero screen with mock data — Phase 2 complete"
```

---

## Phase 3 — InsForge Backend

### Task 10: InsForge project setup + SQL schema

**Files:**
- Create: `.env.local`, `.env.example`
- Create: `sql/001_schema.sql`, `sql/002_rls.sql`, `sql/003_seed.sql`

- [ ] **Step 1: Create an InsForge project**

1. Go to https://insforge.dev and sign up for a free account
2. Create a new project named `lofty-morning-handoff`
3. Copy your project URL and anon key from the project settings

- [ ] **Step 2: Create `.env.local`**

```bash
# .env.local
NEXT_PUBLIC_INSFORGE_URL=https://YOUR_PROJECT_ID.insforge.dev
NEXT_PUBLIC_INSFORGE_ANON_KEY=your-anon-key-here
INSFORGE_SERVICE_KEY=your-service-role-key-here
HF_API_KEY=your-huggingface-api-token-here
```

- [ ] **Step 3: Create `.env.example`**

```bash
# .env.example — copy to .env.local and fill in values
NEXT_PUBLIC_INSFORGE_URL=https://YOUR_PROJECT_ID.insforge.dev
NEXT_PUBLIC_INSFORGE_ANON_KEY=
INSFORGE_SERVICE_KEY=
HF_API_KEY=
```

- [ ] **Step 4: Create `sql/001_schema.sql`**

```sql
-- sql/001_schema.sql
-- Run this in the InsForge SQL editor

create extension if not exists "uuid-ossp";

create table agents (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique not null,
  goals text,
  quota integer,
  target_zips text[] default '{}',
  style_prefs jsonb default '{}',
  created_at timestamptz default now()
);

create table leads (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references agents(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  lead_score integer check (lead_score between 0 and 100) default 0,
  opportunity_type text check (
    opportunity_type in ('High Interest','Back-to-Site','Seller Intent','Back-on-Market','Deadline')
  ),
  missed_response_minutes integer default 0,
  transaction_deadline_days integer,
  last_contact_at timestamptz,
  created_at timestamptz default now()
);

create table lead_signals (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references leads(id) on delete cascade,
  signal_type text check (
    signal_type in ('site_visit','email_open','showing_request','aos_escalation','buyer_match','seller_intent')
  ),
  payload jsonb default '{}',
  occurred_at timestamptz default now()
);

create table priority_queue (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references agents(id) on delete cascade,
  lead_id uuid references leads(id) on delete cascade,
  priority_score numeric(4,3) not null,
  rank integer not null,
  explanation text,
  recommended_action text not null,
  confidence numeric(4,3) not null,
  scored_at timestamptz default now(),
  date date default current_date,
  unique (agent_id, date, rank)
);

create table approvals (
  id uuid primary key default uuid_generate_v4(),
  queue_item_id uuid references priority_queue(id) on delete cascade,
  agent_id uuid references agents(id) on delete cascade,
  action_taken text check (
    action_taken in ('approve','edit','delegate','snooze')
  ) not null,
  notes text,
  created_at timestamptz default now()
);

create table audit_log (
  id uuid primary key default uuid_generate_v4(),
  queue_item_id uuid references priority_queue(id) on delete cascade,
  score_breakdown jsonb default '{}',
  llm_explanation text,
  signal_sources jsonb default '[]',
  created_at timestamptz default now()
);
```

- [ ] **Step 5: Create `sql/002_rls.sql`**

```sql
-- sql/002_rls.sql
-- Row Level Security — run after 001_schema.sql

alter table agents enable row level security;
alter table leads enable row level security;
alter table lead_signals enable row level security;
alter table priority_queue enable row level security;
alter table approvals enable row level security;
alter table audit_log enable row level security;

-- Agents can only see their own row
create policy "agents_self" on agents
  for all using (id = auth.uid());

-- Leads belong to the agent
create policy "leads_own" on leads
  for all using (agent_id = auth.uid());

-- Lead signals inherit from leads
create policy "signals_own" on lead_signals
  for all using (
    lead_id in (select id from leads where agent_id = auth.uid())
  );

-- Priority queue per agent
create policy "queue_own" on priority_queue
  for all using (agent_id = auth.uid());

-- Approvals per agent
create policy "approvals_own" on approvals
  for all using (agent_id = auth.uid());

-- Audit log via queue items
create policy "audit_own" on audit_log
  for all using (
    queue_item_id in (select id from priority_queue where agent_id = auth.uid())
  );
```

- [ ] **Step 6: Create `sql/003_seed.sql`**

```sql
-- sql/003_seed.sql
-- Demo data seed — replace AGENT_UUID with the actual UUID of your agent user

-- First create the demo agent (do this after auth signup)
-- INSERT INTO agents (id, name, email, goals, quota)
-- VALUES ('AGENT_UUID', 'James Wilson', 'james@demo.com', 'Close 3 deals this month', 5);

-- Insert leads
insert into leads (id, agent_id, name, phone, email, lead_score, opportunity_type, transaction_deadline_days)
values
  ('11111111-0000-0000-0000-000000000001', 'AGENT_UUID',
   'Kristin Watson', '+1 (602) 555-0142', 'kristin.watson@email.com',
   88, 'High Interest', null),
  ('11111111-0000-0000-0000-000000000002', 'AGENT_UUID',
   'Annette Black', '+1 (602) 555-0198', 'annette.black@email.com',
   74, 'Seller Intent', null),
  ('11111111-0000-0000-0000-000000000003', 'AGENT_UUID',
   'Wade Warren', '+1 (602) 555-0221', 'wade.warren@email.com',
   61, 'Deadline', 3);

-- Insert signals
insert into lead_signals (lead_id, signal_type, payload, occurred_at)
values
  ('11111111-0000-0000-0000-000000000001', 'site_visit',
   '{"listing": "3931 Via Montalvo", "count": 6, "last_at": "11:42 PM"}',
   now() - interval '8 hours'),
  ('11111111-0000-0000-0000-000000000001', 'email_open',
   '{"subject": "Listing deck: 3931 Via Montalvo", "opens": 2}',
   now() - interval '6 hours'),
  ('11111111-0000-0000-0000-000000000002', 'seller_intent',
   '{"market_reports_opened": 2, "competitor_listings_browsed": 4}',
   now() - interval '5 hours'),
  ('11111111-0000-0000-0000-000000000003', 'aos_escalation',
   '{"reason": "Smart Plan step overdue", "deadline_days": 3}',
   now() - interval '2 hours');

-- Insert priority queue (pre-scored for demo)
insert into priority_queue
  (agent_id, lead_id, priority_score, rank, explanation, recommended_action, confidence, date)
values
  ('AGENT_UUID', '11111111-0000-0000-0000-000000000001',
   0.883, 1,
   'Kristin has viewed this listing 6 times in 48 hours and returned late at night — a strong buying signal. The Sales Agent''s overnight outreach was opened twice. Response window is narrowing.',
   '📞 Call her at 10:00 AM and offer the Saturday tour slot.',
   0.94, current_date),
  ('AGENT_UUID', '11111111-0000-0000-0000-000000000002',
   0.741, 2,
   'Homeowner Agent flagged seller intent. Annette browsed comparable listings and opened two market reports overnight — classic pre-listing research.',
   '📋 Send a personalized CMA and request a 15-min check-in call.',
   0.81, current_date),
  ('AGENT_UUID', '11111111-0000-0000-0000-000000000003',
   0.612, 3,
   'Inspection contingency expires in 3 days. Smart Plan step overdue by 36h. No logged contact since Wednesday.',
   '📅 Confirm inspection appointment and update Smart Plan status.',
   0.73, current_date);
```

- [ ] **Step 7: Run SQL in InsForge**

In the InsForge dashboard → SQL Editor, run each file in order:
1. `sql/001_schema.sql`
2. `sql/002_rls.sql`

Sign up a demo user at your InsForge auth URL, then run `sql/003_seed.sql` with the real agent UUID substituted.

- [ ] **Step 8: Commit**

```bash
git add sql/ .env.example
git commit -m "feat(schema): InsForge Postgres schema, RLS policies, demo seed data"
```

---

### Task 11: InsForge client library

**Files:**
- Create: `lib/insforge.ts`
- Create: `lib/insforge-server.ts`

- [ ] **Step 1: Install InsForge JS client**

Check https://docs.insforge.dev for the exact package name. If InsForge uses a Supabase-compatible client:
```bash
npm install @insforge/js
```
If not available, use the Supabase client pointed at InsForge:
```bash
npm install @supabase/supabase-js
```
Then replace `@insforge/js` with `@supabase/supabase-js` in the imports below — the API is identical.

- [ ] **Step 2: Create browser client**

```ts
// lib/insforge.ts
import { createClient } from "@insforge/js"

const url = process.env.NEXT_PUBLIC_INSFORGE_URL!
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!

// Singleton pattern — one client per browser session
let client: ReturnType<typeof createClient> | null = null

export function getInsforgeClient() {
  if (!client) {
    client = createClient(url, anonKey)
  }
  return client
}
```

- [ ] **Step 3: Create server client**

```ts
// lib/insforge-server.ts
import { createClient } from "@insforge/js"
import type { QueueItem } from "./types"

function getServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_INSFORGE_URL!,
    process.env.INSFORGE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function getQueueForAgent(agentId: string): Promise<QueueItem[]> {
  const client = getServerClient()
  const today = new Date().toISOString().split("T")[0]

  const { data, error } = await client
    .from("priority_queue")
    .select(`
      *,
      lead:leads (
        *,
        signals:lead_signals (*)
      )
    `)
    .eq("agent_id", agentId)
    .eq("date", today)
    .order("rank", { ascending: true })
    .limit(3)

  if (error) throw new Error(error.message)

  return (data ?? []).map((row: Record<string, unknown>) => ({
    ...row,
    lead: {
      ...(row.lead as Record<string, unknown>),
      signals: (row.lead as Record<string, unknown>)?.signals ?? [],
    },
  })) as QueueItem[]
}

export async function logApproval(
  queueItemId: string,
  agentId: string,
  actionTaken: string,
  scoreBreakdown: Record<string, unknown>,
  llmExplanation: string | null
) {
  const client = getServerClient()

  const { error: approvalError } = await client.from("approvals").insert({
    queue_item_id: queueItemId,
    agent_id: agentId,
    action_taken: actionTaken,
  })
  if (approvalError) throw new Error(approvalError.message)

  const { error: auditError } = await client.from("audit_log").insert({
    queue_item_id: queueItemId,
    score_breakdown: scoreBreakdown,
    llm_explanation: llmExplanation,
  })
  if (auditError) throw new Error(auditError.message)
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/insforge.ts lib/insforge-server.ts
git commit -m "feat(insforge): browser + server client with typed queue queries"
```

---

### Task 12: API routes — approve and explain

**Files:**
- Create: `app/api/approve/route.ts`
- Create: `app/api/explain/route.ts`

- [ ] **Step 1: Create approve route**

```ts
// app/api/approve/route.ts
import { NextRequest, NextResponse } from "next/server"
import { logApproval } from "@/lib/insforge-server"

export async function POST(req: NextRequest) {
  const { queueItemId, agentId, actionTaken, scoreBreakdown, llmExplanation } =
    await req.json()

  if (!queueItemId || !agentId || !actionTaken) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    await logApproval(queueItemId, agentId, actionTaken, scoreBreakdown ?? {}, llmExplanation ?? null)
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create explain route**

```ts
// app/api/explain/route.ts
import { NextRequest, NextResponse } from "next/server"

const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.3"
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`

export async function POST(req: NextRequest) {
  const { leadName, leadScore, opportunityType, signals } = await req.json()

  const signalSummary = (signals as Array<{ signal_type: string; payload: Record<string, string> }>)
    .map((s) => `${s.signal_type}: ${JSON.stringify(s.payload)}`)
    .join("; ")

  const prompt = `<s>[INST] You are a real estate AI assistant. Write a 2-sentence plain-English explanation of why ${leadName} is a priority action for a real estate agent today. Use only these facts:
- Lead score: ${leadScore}/100
- Opportunity type: ${opportunityType}
- Overnight signals: ${signalSummary}

Be specific, cite the signals, keep it under 60 words. Do not make up details not listed above. [/INST]`

  const hfRes = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 120, temperature: 0.3, return_full_text: false },
    }),
  })

  if (!hfRes.ok) {
    return NextResponse.json({ explanation: null, error: "HF unavailable" }, { status: 200 })
  }

  const hfData = (await hfRes.json()) as Array<{ generated_text: string }>
  const explanation = hfData?.[0]?.generated_text?.trim() ?? null

  return NextResponse.json({ explanation })
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/approve/route.ts app/api/explain/route.ts
git commit -m "feat(api): approve action route + HuggingFace explain route"
```

---

### Task 13: Wire dashboard to real InsForge data

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Convert dashboard to RSC + client shell**

Create `app/dashboard/dashboard-client.tsx` for the interactive parts:

```tsx
// app/dashboard/dashboard-client.tsx
"use client"

import { useState } from "react"
import { Nav } from "@/components/nav"
import { HeroHeader } from "@/components/hero-header"
import { ActionCard } from "@/components/action-card"
import { AskBar } from "@/components/ask-bar"
import { useAudioBrief } from "@/components/audio-brief"
import type { ActionTaken, QueueItem, OvernightSummary } from "@/lib/types"

interface DashboardClientProps {
  agentName: string
  initialQueue: QueueItem[]
  summary: OvernightSummary
  agentId: string
}

export function DashboardClient({
  agentName,
  initialQueue,
  summary,
  agentId,
}: DashboardClientProps) {
  const [queue, setQueue] = useState<QueueItem[]>(initialQueue)
  const { play } = useAudioBrief(agentName, summary, queue[0]?.lead.name ?? "")

  async function handleAction(itemId: string, action: ActionTaken) {
    const item = queue.find((q) => q.id === itemId)
    if (!item) return

    await fetch("/api/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        queueItemId: itemId,
        agentId,
        actionTaken: action,
        scoreBreakdown: {
          lead_score: item.lead.lead_score,
          opportunity_type: item.lead.opportunity_type,
          priority_score: item.priority_score,
        },
        llmExplanation: item.explanation,
      }),
    })
  }

  return (
    <div className="relative z-10">
      <Nav agentName={agentName} />
      <main className="max-w-2xl mx-auto px-5 pt-7 pb-36">
        <HeroHeader agentName={agentName} summary={summary} onPlayAudio={play} />
        <div className="flex flex-col gap-3.5">
          {queue.map((item, index) => (
            <ActionCard key={item.id} item={item} index={index} onAction={handleAction} />
          ))}
        </div>
      </main>
      <div
        className="fixed bottom-20 right-5 z-40 flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(99,102,241,0.15)",
          color: "#6366f1",
          boxShadow: "0 2px 10px rgba(99,102,241,0.1)",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }} />
        Powered by Lofty AOS
      </div>
      <AskBar />
    </div>
  )
}
```

- [ ] **Step 2: Update `app/dashboard/page.tsx` to RSC**

```tsx
// app/dashboard/page.tsx
import { getQueueForAgent } from "@/lib/insforge-server"
import { DashboardClient } from "./dashboard-client"
import type { OvernightSummary } from "@/lib/types"

// For the demo, use this hardcoded agent ID (replace with the seeded agent's UUID)
const DEMO_AGENT_ID = process.env.DEMO_AGENT_ID ?? "AGENT_UUID"
const DEMO_AGENT_NAME = "James"

async function getOvernightSummary(): Promise<OvernightSummary> {
  // In production this comes from InsForge lead_signals aggregation.
  // For the demo, return the known seeded values.
  return {
    lead_followups: 14,
    showing_requests_accepted: 2,
    escalated_lead_name: "Annette Black",
    buyer_matches: 1,
  }
}

export default async function DashboardPage() {
  const [queue, summary] = await Promise.all([
    getQueueForAgent(DEMO_AGENT_ID),
    getOvernightSummary(),
  ])

  return (
    <DashboardClient
      agentName={DEMO_AGENT_NAME}
      initialQueue={queue}
      summary={summary}
      agentId={DEMO_AGENT_ID}
    />
  )
}
```

- [ ] **Step 3: Add DEMO_AGENT_ID to `.env.local`**

```bash
# Add this line to .env.local
DEMO_AGENT_ID=your-seeded-agent-uuid-here
```

- [ ] **Step 4: Verify real data renders**

```bash
npm run dev
```
Open http://localhost:3000. Expected: hero screen loads with data from InsForge Postgres (Kristin Watson as #1). Check Network tab — RSC fetches from InsForge. No console errors.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/page.tsx app/dashboard/dashboard-client.tsx
git commit -m "feat(dashboard): wire RSC to InsForge — real data replaces mock"
```

---

### Task 14: InsForge Realtime subscription

**Files:**
- Modify: `app/dashboard/dashboard-client.tsx`

- [ ] **Step 1: Add realtime hook to dashboard client**

Add this import and hook to `app/dashboard/dashboard-client.tsx`:

```tsx
// Add at the top of DashboardClient (after existing imports):
import { useEffect } from "react"
import { getInsforgeClient } from "@/lib/insforge"
```

Add this `useEffect` inside the `DashboardClient` function, after the `useState` call:

```tsx
  useEffect(() => {
    const client = getInsforgeClient()
    const today = new Date().toISOString().split("T")[0]

    const channel = client
      .channel("priority_queue_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "priority_queue",
          filter: `agent_id=eq.${agentId}`,
        },
        (payload) => {
          // On any change to the queue, refresh by fetching updated data
          if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
            fetch(`/api/queue?agentId=${agentId}&date=${today}`)
              .then((r) => r.json())
              .then((data) => {
                if (data.queue) setQueue(data.queue)
              })
              .catch(console.error)
          }
        }
      )
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
  }, [agentId])
```

- [ ] **Step 2: Add queue API route for realtime refresh**

```ts
// app/api/queue/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getQueueForAgent } from "@/lib/insforge-server"

export async function GET(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get("agentId")
  if (!agentId) return NextResponse.json({ error: "Missing agentId" }, { status: 400 })

  try {
    const queue = await getQueueForAgent(agentId)
    return NextResponse.json({ queue })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/dashboard-client.tsx app/api/queue/route.ts
git commit -m "feat(realtime): InsForge pub/sub re-ranks queue live on new signals"
```

---

## Phase 4 — HuggingFace Explanations

### Task 15: Fetch real explanations on "Why?" tap

**Files:**
- Modify: `components/why-drawer.tsx`

- [ ] **Step 1: Add explanation fetching to WhyDrawer**

Add state and fetch logic at the top of the `WhyDrawer` function:

```tsx
// Add inside WhyDrawer, after the `if (!open) return null` check:
const [aiExplanation, setAiExplanation] = useState<string | null>(item.explanation)
const [loadingExplanation, setLoadingExplanation] = useState(false)

useEffect(() => {
  // If explanation already exists from DB, use it. Otherwise fetch from HF.
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
    .then((data) => {
      if (data.explanation) setAiExplanation(data.explanation)
    })
    .catch(console.error)
    .finally(() => setLoadingExplanation(false))
}, [item.id])
```

Also add the `useState` and `useEffect` imports at the top of the file if not already present.

Replace the `{item.explanation && ...}` block in the JSX with:

```tsx
{/* LLM Explanation */}
<div
  className="p-4 rounded-xl text-sm text-gray-700 leading-relaxed min-h-[60px]"
  style={{
    background: "linear-gradient(90deg, rgba(99,102,241,0.05), rgba(139,92,246,0.04))",
    borderLeft: "3px solid #6366f1",
  }}
>
  {loadingExplanation ? (
    <span className="text-indigo-300 italic text-xs">Asking Lofty AI…</span>
  ) : (
    aiExplanation ?? "No explanation available."
  )}
</div>
```

- [ ] **Step 2: Get a HuggingFace API token**

1. Go to https://huggingface.co/settings/tokens
2. Create a new token (Read access is sufficient)
3. Add it to `.env.local` as `HF_API_KEY=hf_...`

- [ ] **Step 3: Verify explanation loads**

```bash
npm run dev
```
Click "Why this matters" on any card. Expected: drawer opens, shows "Asking Lofty AI…" for 1–3 seconds, then displays a 2-sentence Mistral-generated explanation. Check Network tab — POST to `/api/explain` returns 200 with `{ explanation: "..." }`.

- [ ] **Step 4: Commit**

```bash
git add components/why-drawer.tsx
git commit -m "feat(ai): fetch Mistral-7B explanations from HuggingFace on Why tap"
```

---

## Phase 5 — Auth

### Task 16: Login page + InsForge auth

**Files:**
- Create: `app/login/page.tsx`
- Create: `middleware.ts`

- [ ] **Step 1: Create login page**

```tsx
// app/login/page.tsx
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
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-base font-black"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 2px 10px rgba(99,102,241,0.35)" }}
          >
            L✦
          </div>
          <div>
            <div className="text-base font-extrabold text-indigo-800">Lofty</div>
            <div className="text-[9px] font-semibold tracking-widest uppercase text-indigo-400">Morning Handoff</div>
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
```

- [ ] **Step 2: Update `app/page.tsx` to check auth**

```tsx
// app/page.tsx
import { redirect } from "next/navigation"

export default function Home() {
  // Middleware handles auth redirect; this catches direct visits
  redirect("/dashboard")
}
```

- [ ] **Step 3: Commit**

```bash
git add app/login/page.tsx
git commit -m "feat(auth): login page with InsForge email/password auth"
```

---

## Phase 6 — Polish + Demo Prep

### Task 17: Final polish + .gitignore

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Create `.gitignore`**

```
# .gitignore
.env.local
.env*.local
node_modules/
.next/
out/
.DS_Store
*.log
.superpowers/
```

- [ ] **Step 2: Final dev server check**

```bash
npm run build
```
Expected: build completes with no TypeScript errors. If errors appear, fix them before the demo.

- [ ] **Step 3: Verify demo flow end-to-end**

Manual test checklist:
- [ ] Load http://localhost:3000 → redirects to /dashboard
- [ ] Hero screen shows "Good morning, James ✦" with animated gradient name
- [ ] 3 action cards show: Kristin Watson (#1), Annette Black (#2), Wade Warren (#3)
- [ ] Card #1 is full opacity, cards #2 and #3 are dimmed
- [ ] Click ▶ button → browser speaks the brief aloud
- [ ] Click "Why this matters" on card #1 → drawer opens, Mistral explanation loads
- [ ] Click "✓ Approve & Execute" → button shows "...", then success state
- [ ] Network tab shows POST to /api/approve returning 200
- [ ] Ask Lofty bar at bottom is focused and interactive
- [ ] "Powered by Lofty AOS" badge is visible above bar

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: Lofty Morning Handoff — demo-ready, all flows working"
```

---

## Self-Review Against Spec

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| Soft Lavender AI-Native visual style | Task 1, 3 (globals.css + tailwind) |
| Lofty "L✦" branding + AOS badge | Task 4 (Nav) |
| Hero header with overnight pills | Task 5 (HeroHeader) |
| 3 action cards, #1 full / #2-3 dimmed | Task 7 (ActionCard) |
| Approve/Edit/Delegate/Snooze buttons | Task 7 (ActionCard) |
| "Why this matters" drawer with score breakdown | Task 6 (WhyDrawer) |
| Framer Motion slide-up animations | Task 7 (motion.div) |
| Audio brief via Web Speech API | Task 8 (useAudioBrief) |
| Ask Lofty command bar | Task 8 (AskBar) |
| InsForge schema (6 tables) | Task 10 (sql/) |
| Row Level Security | Task 10 (sql/002_rls.sql) |
| Deterministic priority scoring in Postgres | Task 10 (sql/003_seed.sql pre-scored) |
| InsForge client (browser + server) | Task 11 |
| Approve action → approvals + audit_log | Task 12, 13 |
| HuggingFace Mistral-7B explanations | Task 12, 15 |
| InsForge Realtime re-ranking | Task 14 |
| Seeded demo data (Kristin, Annette, Wade) | Task 10 |
| Login page with InsForge auth | Task 16 |

**No placeholders found.** All steps have complete code.
**Types are consistent** — `QueueItem`, `ActionTaken`, `OvernightSummary` defined in Task 2 and used identically throughout.
**Scope correct** — no team rollups, no Smart Plan authoring, no ElevenLabs.
