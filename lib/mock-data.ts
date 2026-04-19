import type { QueueItem, OvernightSummary } from "./types"

export const MOCK_AGENT_NAME = "James"

export const MOCK_OVERNIGHT_SUMMARY: OvernightSummary = {
  lead_followups: 31,
  showing_requests_accepted: 7,
  escalated_lead_name: "Annette Black",
  buyer_matches: 4,
}

const d = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString()

export const MOCK_QUEUE: QueueItem[] = [
  {
    id: "qi-1", agent_id: "agent-1", lead_id: "lead-1",
    priority_score: 0.95, rank: 1, confidence: 0.97,
    scored_at: d(0), date: new Date().toISOString().split("T")[0],
    explanation: "Kristin viewed 3931 Via Montalvo 9 times in 48 hours — including three visits after midnight. She opened your follow-up email twice and clicked the virtual tour link. Response window is closing fast: a morning call converts at 3× the rate of an afternoon call at this engagement level.",
    recommended_action: "📞 Call Kristin at 9:30 AM. Offer the Saturday 11am private tour. Mention you noticed her late-night visits — it builds rapport.",
    lead: {
      id: "lead-1", agent_id: "agent-1", name: "Kristin Watson",
      phone: "+1 (602) 555-0142", email: "kristin.watson@email.com",
      lead_score: 95, opportunity_type: "High Interest",
      missed_response_minutes: 0, transaction_deadline_days: null,
      last_contact_at: null, created_at: d(72),
    },
    signals: [
      { id: "s1", lead_id: "lead-1", signal_type: "site_visit", payload: { listing: "3931 Via Montalvo", count: 9, last_at: "2:17 AM" }, occurred_at: d(6) },
      { id: "s2", lead_id: "lead-1", signal_type: "email_open", payload: { subject: "Your personalized listing deck", opens: 2, clicked_tour: true }, occurred_at: d(8) },
      { id: "s3", lead_id: "lead-1", signal_type: "showing_request", payload: { property: "3931 Via Montalvo", requested_time: "Saturday 11am" }, occurred_at: d(3) },
    ],
  },
  {
    id: "qi-2", agent_id: "agent-1", lead_id: "lead-2",
    priority_score: 0.87, rank: 2, confidence: 0.91,
    scored_at: d(0), date: new Date().toISOString().split("T")[0],
    explanation: "Annette browsed 7 competitor listings and opened two Q2 market reports overnight — textbook pre-listing research. The Homeowner Agent flagged her as high-intent to sell within 60 days. She hasn't been contacted in 5 days. First agent to reach her with a CMA wins the listing.",
    recommended_action: "📋 Email a personalized CMA by 10 AM. Subject: 'What your Scottsdale home is worth in April 2026'. Follow up with a call at noon.",
    lead: {
      id: "lead-2", agent_id: "agent-1", name: "Annette Black",
      phone: "+1 (602) 555-0198", email: "annette.black@email.com",
      lead_score: 87, opportunity_type: "Seller Intent",
      missed_response_minutes: 0, transaction_deadline_days: null,
      last_contact_at: d(120), created_at: d(200),
    },
    signals: [
      { id: "s4", lead_id: "lead-2", signal_type: "seller_intent", payload: { market_reports_opened: 2, competitor_listings_browsed: 7 }, occurred_at: d(5) },
      { id: "s5", lead_id: "lead-2", signal_type: "email_open", payload: { opens: 3, subject: "Phoenix Market Report Q2" }, occurred_at: d(7) },
    ],
  },
  {
    id: "qi-3", agent_id: "agent-1", lead_id: "lead-3",
    priority_score: 0.79, rank: 3, confidence: 0.83,
    scored_at: d(0), date: new Date().toISOString().split("T")[0],
    explanation: "Marcus submitted a pre-approval letter last night and has toured 4 properties with you. He favorited two listings at the $680K price point. The Smart Plan step to negotiate an offer hasn't been started and he's been comparing agents online.",
    recommended_action: "🏠 Text Marcus now: 'Saw your pre-approval came through — let's lock in a strategy call before the weekend rush.' Strike while the iron is hot.",
    lead: {
      id: "lead-3", agent_id: "agent-1", name: "Marcus Rivera",
      phone: "+1 (602) 555-0307", email: "marcus.rivera@email.com",
      lead_score: 79, opportunity_type: "Buyer Match",
      missed_response_minutes: 240, transaction_deadline_days: null,
      last_contact_at: d(48), created_at: d(300),
    },
    signals: [
      { id: "s6", lead_id: "lead-3", signal_type: "buyer_match", payload: { listings_favorited: 2, price_point: "$680K", pre_approval: true }, occurred_at: d(9) },
      { id: "s7", lead_id: "lead-3", signal_type: "site_visit", payload: { listing: "4812 Desert Bloom Dr", count: 4, last_at: "10:55 PM" }, occurred_at: d(9) },
    ],
  },
  {
    id: "qi-4", agent_id: "agent-1", lead_id: "lead-4",
    priority_score: 0.68, rank: 4, confidence: 0.76,
    scored_at: d(0), date: new Date().toISOString().split("T")[0],
    explanation: "Wade's inspection contingency expires in 72 hours. Smart Plan step overdue by 44 hours. No logged contact since Tuesday. If the contingency lapses without action, the transaction collapses and you lose a $740K deal.",
    recommended_action: "📅 Call Wade's lender first, confirm inspection report status, then call Wade to align on next steps before noon.",
    lead: {
      id: "lead-4", agent_id: "agent-1", name: "Wade Warren",
      phone: "+1 (602) 555-0221", email: "wade.warren@email.com",
      lead_score: 68, opportunity_type: "Deadline",
      missed_response_minutes: 0, transaction_deadline_days: 3,
      last_contact_at: d(72), created_at: d(400),
    },
    signals: [
      { id: "s8", lead_id: "lead-4", signal_type: "aos_escalation", payload: { reason: "Inspection contingency expires in 72h", deadline_days: 3 }, occurred_at: d(2) },
      { id: "s9", lead_id: "lead-4", signal_type: "aos_escalation", payload: { reason: "Smart Plan step overdue 44h" }, occurred_at: d(4) },
    ],
  },
  {
    id: "qi-5", agent_id: "agent-1", lead_id: "lead-5",
    priority_score: 0.55, rank: 5, confidence: 0.68,
    scored_at: d(0), date: new Date().toISOString().split("T")[0],
    explanation: "Jennifer requested a showing for a $1.1M property. AOS confirmed Sunday 2pm. She's a referred client from your top-producing partner — high relationship stakes. She hasn't signed the buyer's agreement yet.",
    recommended_action: "✉️ Send Jennifer a pre-showing briefing email with neighborhood comps and parking info. Include the buyer's agreement for e-signature.",
    lead: {
      id: "lead-5", agent_id: "agent-1", name: "Jennifer Huang",
      phone: "+1 (602) 555-0445", email: "jennifer.huang@email.com",
      lead_score: 55, opportunity_type: "Showing",
      missed_response_minutes: 0, transaction_deadline_days: null,
      last_contact_at: d(24), created_at: d(168),
    },
    signals: [
      { id: "s10", lead_id: "lead-5", signal_type: "showing_request", payload: { property: "8820 N Camelback Rd #12", time: "Sunday 2pm", price: "$1.1M" }, occurred_at: d(11) },
    ],
  },
]
