-- Migration to support pre-assigning teams during invitation
alter table public.coach_invitations 
add column if not exists target_team_ids uuid[] default '{}';

-- Migration to ensure deletion from profiles works and is clean
-- (Note: Actual Auth deletion still needs to be done via Supabase Dash if Service Key is not present)
