-- Add profile customization columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS avatar_emoji text,
  ADD COLUMN IF NOT EXISTS banner_color text;
