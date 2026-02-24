-- Add pole and category columns to teams table
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS pole text CHECK (pole IN ('FORMATION', 'PRE_FORMATION', 'ECOLE_DE_FOOT', 'FEMININES')),
ADD COLUMN IF NOT EXISTS category text;

-- Optional: Add a comment to describe the column usage
COMMENT ON COLUMN public.teams.pole IS 'Structure pole: FORMATION, PRE_FORMATION, ECOLE_DE_FOOT, FEMININES';
COMMENT ON COLUMN public.teams.category IS 'Age category: U18, U16, U15, U14, U13, U11, U9, U8, U7, U6, BABY';

-- Update RLS policies if needed (usually not required for adding columns, existing policies apply)
