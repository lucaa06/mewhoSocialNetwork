-- ═══════════════════════════════════════════════════════════════════
-- me&who — Initial Schema
-- Run in Supabase SQL Editor or via supabase db push
-- ═══════════════════════════════════════════════════════════════════

-- ─── Extensions ────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── Enums ─────────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('user', 'startupper', 'researcher', 'admin');
CREATE TYPE post_visibility AS ENUM ('public', 'followers');
CREATE TYPE reaction_type AS ENUM ('like', 'support', 'idea');
CREATE TYPE report_target AS ENUM ('user', 'post', 'comment');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
CREATE TYPE bug_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE bug_status AS ENUM ('open', 'in_progress', 'resolved', 'wontfix');
CREATE TYPE project_stage AS ENUM ('idea', 'mvp', 'growth', 'scaling', 'acquired');
CREATE TYPE feedback_category AS ENUM ('suggestion', 'compliment', 'problem', 'idea');
CREATE TYPE admin_action_type AS ENUM (
  'remove_avatar', 'edit_username', 'suspend_user', 'unsuspend_user',
  'ban_user', 'unban_user', 'verify_user', 'hide_post', 'show_post',
  'delete_post', 'resolve_report', 'dismiss_report', 'close_bug'
);

-- ─── Profiles ──────────────────────────────────────────────────────
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT UNIQUE NOT NULL,
  display_name    TEXT NOT NULL,
  bio             TEXT,
  avatar_url      TEXT,
  role            user_role NOT NULL DEFAULT 'user',
  country_code    CHAR(2),                    -- ISO 3166-1 alpha-2
  city            TEXT,
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,
  location_point  GEOGRAPHY(POINT, 4326),     -- PostGIS
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  is_suspended    BOOLEAN NOT NULL DEFAULT FALSE,
  is_banned       BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMPTZ,                -- soft delete
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Keep location_point in sync with lat/lng
CREATE OR REPLACE FUNCTION sync_location_point()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.location_point := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::GEOGRAPHY;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_location_point
  BEFORE INSERT OR UPDATE OF lat, lng ON profiles
  FOR EACH ROW EXECUTE FUNCTION sync_location_point();

-- Auto-set updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::TEXT, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'New User')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── Posts ─────────────────────────────────────────────────────────
CREATE TABLE posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title        TEXT,
  content      TEXT NOT NULL,
  category     TEXT,
  tags         TEXT[] DEFAULT '{}',
  country_code CHAR(2),
  city         TEXT,
  lat          DOUBLE PRECISION,
  lng          DOUBLE PRECISION,
  visibility   post_visibility NOT NULL DEFAULT 'public',
  is_hidden    BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_country ON posts(country_code);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX idx_posts_content_trgm ON posts USING GIN(content gin_trgm_ops);
CREATE INDEX idx_posts_title_trgm ON posts USING GIN(title gin_trgm_ops);

CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Comments ──────────────────────────────────────────────────────
CREATE TABLE comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  parent_id  UUID REFERENCES comments(id) ON DELETE CASCADE,
  is_hidden  BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_author ON comments(author_id);

-- ─── Reactions ─────────────────────────────────────────────────────
CREATE TABLE reactions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       reaction_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

CREATE INDEX idx_reactions_post ON reactions(post_id);

-- ─── Saved Posts ───────────────────────────────────────────────────
CREATE TABLE saved_posts (
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- ─── Follows ───────────────────────────────────────────────────────
CREATE TABLE follows (
  follower_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE INDEX idx_follows_following ON follows(following_id);

-- ─── Blocked Users ─────────────────────────────────────────────────
CREATE TABLE blocked_users (
  blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

-- ─── Notifications ─────────────────────────────────────────────────
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,    -- 'follow', 'reaction', 'comment', 'mention', 'admin'
  payload    JSONB NOT NULL DEFAULT '{}',
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- ─── Projects ──────────────────────────────────────────────────────
CREATE TABLE projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  stage        project_stage NOT NULL DEFAULT 'idea',
  country_code CHAR(2),
  looking_for  TEXT[] DEFAULT '{}',
  is_public    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_country ON projects(country_code);

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE project_members (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'member',
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (project_id, user_id)
);

-- ─── Communities ───────────────────────────────────────────────────
CREATE TABLE communities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  avatar_url  TEXT,
  country_code CHAR(2),
  is_public   BOOLEAN NOT NULL DEFAULT TRUE,
  created_by  UUID NOT NULL REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE community_members (
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT 'member',
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (community_id, user_id)
);

-- ─── Reports ───────────────────────────────────────────────────────
CREATE TABLE reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type   report_target NOT NULL,
  target_id     UUID NOT NULL,
  reason        TEXT NOT NULL,
  description   TEXT,
  status        report_status NOT NULL DEFAULT 'pending',
  reviewed_by   UUID REFERENCES profiles(id),
  reviewed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_status ON reports(status, created_at DESC);
CREATE INDEX idx_reports_target ON reports(target_type, target_id);

-- ─── Feedback ──────────────────────────────────────────────────────
CREATE TABLE feedback (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category   feedback_category NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Bug Reports ───────────────────────────────────────────────────
CREATE TABLE bug_reports (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title          TEXT NOT NULL,
  description    TEXT NOT NULL,
  browser_info   JSONB NOT NULL DEFAULT '{}',
  screenshot_url TEXT,
  severity       bug_severity NOT NULL DEFAULT 'medium',
  status         bug_status NOT NULL DEFAULT 'open',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_bugs_updated_at
  BEFORE UPDATE ON bug_reports
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Admin Actions (Audit Log) ─────────────────────────────────────
CREATE TABLE admin_actions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID NOT NULL REFERENCES profiles(id),
  action      admin_action_type NOT NULL,
  target_type TEXT NOT NULL,
  target_id   UUID NOT NULL,
  reason      TEXT NOT NULL,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_actions_admin ON admin_actions(admin_id, created_at DESC);
CREATE INDEX idx_admin_actions_target ON admin_actions(target_type, target_id);

-- ═══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows           ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities       ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports           ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback          ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_reports       ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions     ENABLE ROW LEVEL SECURITY;

-- Helper: is current user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ─── Profiles RLS ──────────────────────────────────────────────────
CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT USING (deleted_at IS NULL AND is_banned = FALSE);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (is_admin());

-- ─── Posts RLS ─────────────────────────────────────────────────────
CREATE POLICY "posts_select_public" ON posts
  FOR SELECT USING (
    visibility = 'public'
    AND is_hidden = FALSE
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = posts.author_id
        AND p.is_banned = FALSE AND p.deleted_at IS NULL
    )
  );

CREATE POLICY "posts_select_own" ON posts
  FOR SELECT USING (author_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "posts_insert_own" ON posts
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "posts_update_own" ON posts
  FOR UPDATE USING (author_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "posts_delete_own" ON posts
  FOR DELETE USING (author_id = auth.uid());

CREATE POLICY "posts_admin_all" ON posts
  FOR ALL USING (is_admin());

-- ─── Comments RLS ──────────────────────────────────────────────────
CREATE POLICY "comments_select_public" ON comments
  FOR SELECT USING (is_hidden = FALSE AND deleted_at IS NULL);

CREATE POLICY "comments_insert_auth" ON comments
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "comments_update_own" ON comments
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "comments_delete_own" ON comments
  FOR DELETE USING (author_id = auth.uid());

CREATE POLICY "comments_admin_all" ON comments
  FOR ALL USING (is_admin());

-- ─── Reactions RLS ─────────────────────────────────────────────────
CREATE POLICY "reactions_select_all" ON reactions FOR SELECT USING (TRUE);
CREATE POLICY "reactions_insert_auth" ON reactions
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "reactions_delete_own" ON reactions
  FOR DELETE USING (user_id = auth.uid());

-- ─── Saved Posts RLS ───────────────────────────────────────────────
CREATE POLICY "saved_posts_own" ON saved_posts
  FOR ALL USING (user_id = auth.uid());

-- ─── Follows RLS ───────────────────────────────────────────────────
CREATE POLICY "follows_select_all" ON follows FOR SELECT USING (TRUE);
CREATE POLICY "follows_insert_own" ON follows
  FOR INSERT WITH CHECK (follower_id = auth.uid());
CREATE POLICY "follows_delete_own" ON follows
  FOR DELETE USING (follower_id = auth.uid());

-- ─── Blocked Users RLS ─────────────────────────────────────────────
CREATE POLICY "blocked_users_own" ON blocked_users
  FOR ALL USING (blocker_id = auth.uid());

-- ─── Notifications RLS ─────────────────────────────────────────────
CREATE POLICY "notifications_own" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- ─── Projects RLS ──────────────────────────────────────────────────
CREATE POLICY "projects_select_public" ON projects
  FOR SELECT USING (is_public = TRUE);
CREATE POLICY "projects_select_member" ON projects
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid())
  );
CREATE POLICY "projects_insert_auth" ON projects
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "projects_update_owner" ON projects
  FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "projects_delete_owner" ON projects
  FOR DELETE USING (owner_id = auth.uid());
CREATE POLICY "projects_admin_all" ON projects
  FOR ALL USING (is_admin());

-- ─── Communities RLS ───────────────────────────────────────────────
CREATE POLICY "communities_select_public" ON communities
  FOR SELECT USING (is_public = TRUE);
CREATE POLICY "communities_insert_auth" ON communities
  FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "communities_admin_all" ON communities
  FOR ALL USING (is_admin());

-- ─── Reports RLS ───────────────────────────────────────────────────
CREATE POLICY "reports_insert_auth" ON reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "reports_select_own" ON reports
  FOR SELECT USING (reporter_id = auth.uid());
CREATE POLICY "reports_admin_all" ON reports
  FOR ALL USING (is_admin());

-- ─── Feedback / Bug Reports RLS ────────────────────────────────────
CREATE POLICY "feedback_insert_all" ON feedback
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "feedback_select_own" ON feedback
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "feedback_admin_all" ON feedback
  FOR ALL USING (is_admin());

CREATE POLICY "bug_reports_insert_all" ON bug_reports
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "bug_reports_select_own" ON bug_reports
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "bug_reports_admin_all" ON bug_reports
  FOR ALL USING (is_admin());

-- ─── Admin Actions RLS ─────────────────────────────────────────────
CREATE POLICY "admin_actions_admin_all" ON admin_actions
  FOR ALL USING (is_admin());

-- ═══════════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- Run these manually in Supabase Dashboard → Storage
-- ═══════════════════════════════════════════════════════════════════
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('screenshots', 'screenshots', false);
--
-- Storage policies (run after creating buckets):
-- CREATE POLICY "avatars_select_all" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
-- CREATE POLICY "avatars_insert_own" ON storage.objects FOR INSERT WITH CHECK (
--   bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
-- );
-- CREATE POLICY "avatars_update_own" ON storage.objects FOR UPDATE USING (
--   bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
-- );
-- CREATE POLICY "avatars_delete_own" ON storage.objects FOR DELETE USING (
--   bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
-- );
