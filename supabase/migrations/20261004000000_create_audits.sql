create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  keyword text not null,
  location text not null,
  input_type text not null check (input_type in ('text', 'url')),
  analysis jsonb not null check (jsonb_typeof(analysis) = 'object'),
  competitors jsonb not null default '[]'::jsonb check (jsonb_typeof(competitors) = 'array')
);

create index if not exists audits_user_created_at_idx
  on public.audits (user_id, created_at desc);

alter table public.audits enable row level security;

revoke all on table public.audits from anon, authenticated;
grant select, insert on table public.audits to authenticated;

drop policy if exists "Users can read their own audits" on public.audits;
create policy "Users can read their own audits"
  on public.audits
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own audits" on public.audits;
create policy "Users can insert their own audits"
  on public.audits
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
