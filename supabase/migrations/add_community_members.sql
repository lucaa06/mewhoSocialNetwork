-- Community members table (join/leave communities)
CREATE TABLE IF NOT EXISTS community_members (
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id)  ON DELETE CASCADE,
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (community_id, user_id)
);

ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members visible to all" ON community_members
  FOR SELECT USING (true);

CREATE POLICY "Users manage own membership" ON community_members
  FOR ALL USING (auth.uid() = user_id);

-- Add members_count column to communities if not present
ALTER TABLE communities ADD COLUMN IF NOT EXISTS members_count INTEGER NOT NULL DEFAULT 0;

-- Trigger to keep members_count in sync
CREATE OR REPLACE FUNCTION update_community_members_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities SET members_count = members_count + 1 WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities SET members_count = GREATEST(members_count - 1, 0) WHERE id = OLD.community_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_community_members_count ON community_members;
CREATE TRIGGER trg_community_members_count
  AFTER INSERT OR DELETE ON community_members
  FOR EACH ROW EXECUTE FUNCTION update_community_members_count();
