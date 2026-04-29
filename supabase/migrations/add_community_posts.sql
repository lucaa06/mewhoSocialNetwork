-- Add community_id to posts so posts can belong to a community
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS community_id uuid REFERENCES communities(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS posts_community_id_idx ON posts(community_id);
