-- sql/002_rls.sql
-- Row Level Security — run after 001_schema.sql

alter table agents enable row level security;
alter table leads enable row level security;
alter table lead_signals enable row level security;
alter table priority_queue enable row level security;
alter table approvals enable row level security;
alter table audit_log enable row level security;

create policy "agents_self" on agents
  for all using (id = auth.uid());

create policy "leads_own" on leads
  for all using (agent_id = auth.uid());

create policy "signals_own" on lead_signals
  for all using (
    lead_id in (select id from leads where agent_id = auth.uid())
  );

create policy "queue_own" on priority_queue
  for all using (agent_id = auth.uid());

create policy "approvals_own" on approvals
  for all using (agent_id = auth.uid());

create policy "audit_own" on audit_log
  for all using (
    queue_item_id in (select id from priority_queue where agent_id = auth.uid())
  );
