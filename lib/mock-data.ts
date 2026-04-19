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
    recommended_action: "📞 Call her at 10:00 AM and offer the Saturday tour slot.",
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
    recommended_action: "📋 Send a personalized CMA and request a 15-min check-in call.",
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
    recommended_action: "📅 Confirm inspection appointment and update Smart Plan status.",
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
