alter table public.audits
  add column if not exists source_url text;
