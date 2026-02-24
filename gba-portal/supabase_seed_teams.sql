-- Seed fixed teams (poles / categories / teams) for the club structure
-- Safe to run multiple times if you keep names unique (will insert duplicates otherwise).
-- Recommended: run once on a fresh database, or convert to upserts with a unique constraint.

-- OPTIONAL (recommended): enforce unique team names
-- ALTER TABLE public.teams ADD CONSTRAINT teams_name_unique UNIQUE (name);

-- POLE: FORMATION
insert into public.teams (name, pole, category, gender) values
  ('U18 D1', 'FORMATION', 'U18', 'M'),
  ('U16 D1', 'FORMATION', 'U16', 'M'),
  ('U15 D1', 'FORMATION', 'U15', 'M'),
  ('U14 D1', 'FORMATION', 'U14', 'M');

-- POLE: PRE_FORMATION
insert into public.teams (name, pole, category, gender) values
  ('U13 D1', 'PRE_FORMATION', 'U13', 'M'),
  ('U13 D2 (U12)', 'PRE_FORMATION', 'U13', 'M'),
  ('U13 D3', 'PRE_FORMATION', 'U13', 'M'),
  ('U13 D4', 'PRE_FORMATION', 'U13', 'M'),
  ('U11 D1', 'PRE_FORMATION', 'U11', 'M'),
  ('U11 D1 (U10)', 'PRE_FORMATION', 'U11', 'M'),
  ('U11 D2', 'PRE_FORMATION', 'U11', 'M'),
  ('U11 D3', 'PRE_FORMATION', 'U11', 'M');

-- POLE: ECOLE_DE_FOOT
insert into public.teams (name, pole, category, gender) values
  ('U9 USI', 'ECOLE_DE_FOOT', 'U9', 'Mixte'),
  ('U9 EBA', 'ECOLE_DE_FOOT', 'U9', 'Mixte'),
  ('U8 USI', 'ECOLE_DE_FOOT', 'U8', 'Mixte'),
  ('U7 USI', 'ECOLE_DE_FOOT', 'U7', 'Mixte'),
  ('U7 EBA', 'ECOLE_DE_FOOT', 'U7', 'Mixte'),
  ('U6 USI', 'ECOLE_DE_FOOT', 'U6', 'Mixte'),
  ('Babyfoot Mercredi', 'ECOLE_DE_FOOT', 'Babyfoot', 'Mixte'),
  ('Babyfoot Samedi', 'ECOLE_DE_FOOT', 'Babyfoot', 'Mixte');

-- POLE: FEMININES
insert into public.teams (name, pole, category, gender) values
  ('U18F R2', 'FEMININES', 'U18F', 'F'),
  ('U15F D2', 'FEMININES', 'U15F', 'F'),
  ('U13F D2', 'FEMININES', 'U13F', 'F'),
  ('U11F', 'FEMININES', 'U11F', 'F');
