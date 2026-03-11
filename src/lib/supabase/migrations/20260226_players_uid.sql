-- Stable technical identifier for players updates

alter table public.players
  add column if not exists player_uid uuid;

update public.players
set player_uid = gen_random_uuid()
where player_uid is null;

alter table public.players
  alter column player_uid set not null;

create unique index if not exists uq_players_player_uid
  on public.players(player_uid);
