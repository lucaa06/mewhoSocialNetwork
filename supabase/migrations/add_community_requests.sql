CREATE TABLE IF NOT EXISTS community_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT community_requests_status_check CHECK (status IN ('pending','approved','rejected'))
);

ALTER TABLE community_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cr_insert_own" ON community_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "cr_select_own" ON community_requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "cr_admin_all" ON community_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
