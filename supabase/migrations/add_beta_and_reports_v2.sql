-- ================================================================
-- Beta tester flag + beta feedback + report restrictions
-- ================================================================

-- 1. Beta tester flag on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_beta BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Beta feedback table
CREATE TABLE IF NOT EXISTS beta_feedback (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message     TEXT NOT NULL,
  priority    TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','critical')),
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "beta_feedback_insert_own" ON beta_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "beta_feedback_select_own" ON beta_feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Admin can see all
CREATE POLICY "beta_feedback_admin_all" ON beta_feedback
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. Reports: add appeal + restrictions fields
ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS appeal_message TEXT,
  ADD COLUMN IF NOT EXISTS appeal_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS appeal_status  TEXT DEFAULT NULL
    CHECK (appeal_status IN ('pending','accepted','rejected', NULL));

-- 4. User restrictions (what an admin can limit on a user)
CREATE TABLE IF NOT EXISTS user_restrictions (
  user_id          UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  can_comment      BOOLEAN NOT NULL DEFAULT TRUE,
  can_post         BOOLEAN NOT NULL DEFAULT TRUE,
  can_react        BOOLEAN NOT NULL DEFAULT TRUE,
  restricted_by    UUID REFERENCES profiles(id),
  restricted_at    TIMESTAMPTZ,
  restriction_note TEXT
);

ALTER TABLE user_restrictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "restrictions_admin_all" ON user_restrictions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "restrictions_select_own" ON user_restrictions
  FOR SELECT USING (auth.uid() = user_id);
