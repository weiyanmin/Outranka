grant delete on table public.audits to authenticated;

drop policy if exists "Users can delete their own audits" on public.audits;
create policy "Users can delete their own audits"
  on public.audits
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
