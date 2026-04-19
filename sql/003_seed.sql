-- sql/003_seed.sql
-- Replace AGENT_UUID with your actual agent user UUID after signing up

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

insert into priority_queue
  (agent_id, lead_id, priority_score, rank, explanation, recommended_action, confidence, date)
values
  ('AGENT_UUID', '11111111-0000-0000-0000-000000000001',
   0.883, 1,
   'Kristin has viewed this listing 6 times in 48 hours and returned late at night — a strong buying signal. The Sales Agent''s overnight outreach was opened twice.',
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
