-- Add avatar_emoji and category to communities
ALTER TABLE communities ADD COLUMN IF NOT EXISTS avatar_emoji text;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS category     text;

-- Allow creators to update their own community
CREATE POLICY IF NOT EXISTS "Creators can update their community"
  ON communities FOR UPDATE
  USING (auth.uid() = created_by);
