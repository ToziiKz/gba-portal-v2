-- Allow admins to delete profiles (required for full removal from dashboard)
-- Note: This deletes only public.profiles row. Deleting auth.users requires service role / admin API.

drop policy if exists "Admin can delete profiles" on public.profiles;
create policy "Admin can delete profiles"
  on public.profiles for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
