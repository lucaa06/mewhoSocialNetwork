-- Allow anyone to read community memberships (public community data)
CREATE POLICY IF NOT EXISTS "community_members_select_all"
  ON community_members FOR SELECT
  USING (TRUE);

-- Allow users to insert/delete their own memberships
CREATE POLICY IF NOT EXISTS "community_members_own"
  ON community_members FOR ALL
  USING (user_id = auth.uid());
