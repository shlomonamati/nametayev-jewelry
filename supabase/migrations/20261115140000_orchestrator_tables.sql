-- Namatiev AI Orchestrator: run log + outputs. Server-only (RLS on, no anon/auth policies).
create table if not exists public.orchestrator_runs (
  id uuid primary key default gen_random_uuid(),
  flow text not null check (flow in ('order','dev')),
  source_id uuid,
  status text not null default 'in_progress'
    check (status in ('in_progress','qa_failed','awaiting_price','awaiting_approval','ready_to_send','sent','approved','rejected','failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz
);
create table if not exists public.agent_steps (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.orchestrator_runs(id) on delete cascade,
  agent text not null, model text, attempt int not null default 1,
  input_json jsonb, output_json jsonb,
  status text not null default 'ok' check (status in ('ok','invalid_output','failed')),
  created_at timestamptz not null default now()
);
create table if not exists public.qa_results (
  id uuid primary key default gen_random_uuid(),
  step_id uuid not null references public.agent_steps(id) on delete cascade,
  criterion text not null, passed boolean not null, reason text
);
create table if not exists public.design_briefs (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references public.contact_submissions(id) on delete cascade,
  run_id uuid references public.orchestrator_runs(id),
  brief_json jsonb not null, concepts_json jsonb, pricing_card_json jsonb,
  final_price numeric(10,2) check (final_price is null or final_price > 0),
  whatsapp_text text,
  status text not null default 'awaiting_price'
    check (status in ('needs_info','awaiting_price','ready_to_send','sent','rejected')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.change_requests (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.orchestrator_runs(id),
  request_text text not null, story_md text, branch text, pr_url text, preview_url text,
  status text not null default 'draft'
    check (status in ('draft','spec_approved','in_dev','qa_failed','in_review','merged','rejected')),
  created_at timestamptz not null default now()
);
alter table public.orchestrator_runs enable row level security;
alter table public.agent_steps      enable row level security;
alter table public.qa_results       enable row level security;
alter table public.design_briefs    enable row level security;
alter table public.change_requests  enable row level security;
create index if not exists agent_steps_run_idx on public.agent_steps(run_id);
create index if not exists design_briefs_status_idx on public.design_briefs(status);
