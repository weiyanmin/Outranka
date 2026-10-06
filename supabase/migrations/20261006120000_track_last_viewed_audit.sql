alter table public.audits
  add column if not exists last_viewed_at timestamptz;

create or replace function public.mark_audit_viewed(target_audit_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.audits
  set last_viewed_at = clock_timestamp()
  where id = target_audit_id
    and user_id = (select auth.uid());

  return found;
end;
$$;

revoke all on function public.mark_audit_viewed(uuid) from public, anon;
grant execute on function public.mark_audit_viewed(uuid) to authenticated;
