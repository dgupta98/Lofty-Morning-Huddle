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
