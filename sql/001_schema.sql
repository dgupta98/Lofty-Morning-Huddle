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
