-- ── Trigger: notifica quando qualcuno ti segue ──────────────────────
CREATE OR REPLACE FUNCTION notify_follow()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, payload)
  VALUES (
    NEW.following_id,
    'follow',
    jsonb_build_object(
      'actor_id',           NEW.follower_id,
      'actor_username',     (SELECT username     FROM profiles WHERE id = NEW.follower_id),
      'actor_display_name', (SELECT display_name FROM profiles WHERE id = NEW.follower_id),
      'actor_avatar_url',   (SELECT avatar_url   FROM profiles WHERE id = NEW.follower_id),
      'actor_avatar_emoji', (SELECT avatar_emoji FROM profiles WHERE id = NEW.follower_id)
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_follow ON follows;
CREATE TRIGGER on_new_follow
  AFTER INSERT ON follows
  FOR EACH ROW EXECUTE FUNCTION notify_follow();

-- ── Trigger: notifica i follower quando pubblica un post ─────────────
CREATE OR REPLACE FUNCTION notify_new_post()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  community_name TEXT;
BEGIN
  IF NEW.visibility <> 'public' OR NEW.deleted_at IS NOT NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.community_id IS NOT NULL THEN
    SELECT name INTO community_name FROM communities WHERE id = NEW.community_id;
  END IF;

  -- Notifica tutti i follower dell'autore
  INSERT INTO notifications (user_id, type, payload)
  SELECT
    f.follower_id,
    'new_post',
    jsonb_build_object(
      'post_id',            NEW.id,
      'post_title',         NEW.title,
      'actor_id',           NEW.author_id,
      'actor_username',     (SELECT username     FROM profiles WHERE id = NEW.author_id),
      'actor_display_name', (SELECT display_name FROM profiles WHERE id = NEW.author_id),
      'actor_avatar_url',   (SELECT avatar_url   FROM profiles WHERE id = NEW.author_id),
      'actor_avatar_emoji', (SELECT avatar_emoji FROM profiles WHERE id = NEW.author_id),
      'community_id',       NEW.community_id,
      'community_name',     community_name
    )
  FROM follows f
  WHERE f.following_id = NEW.author_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_post ON posts;
CREATE TRIGGER on_new_post
  AFTER INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION notify_new_post();

-- ── Trigger: notifica quando reagiscono al tuo post ──────────────────
CREATE OR REPLACE FUNCTION notify_reaction()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  post_author UUID;
  post_title  TEXT;
BEGIN
  SELECT author_id, title INTO post_author, post_title FROM posts WHERE id = NEW.post_id;
  -- Non notificare se stai reagendo al tuo stesso post
  IF post_author = NEW.user_id THEN RETURN NEW; END IF;

  INSERT INTO notifications (user_id, type, payload)
  VALUES (
    post_author,
    'reaction',
    jsonb_build_object(
      'post_id',            NEW.post_id,
      'post_title',         post_title,
      'reaction_type',      NEW.type,
      'actor_id',           NEW.user_id,
      'actor_username',     (SELECT username     FROM profiles WHERE id = NEW.user_id),
      'actor_display_name', (SELECT display_name FROM profiles WHERE id = NEW.user_id),
      'actor_avatar_url',   (SELECT avatar_url   FROM profiles WHERE id = NEW.user_id),
      'actor_avatar_emoji', (SELECT avatar_emoji FROM profiles WHERE id = NEW.user_id)
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_reaction ON reactions;
CREATE TRIGGER on_new_reaction
  AFTER INSERT ON reactions
  FOR EACH ROW EXECUTE FUNCTION notify_reaction();

-- ── Trigger: notifica quando commentano il tuo post ──────────────────
CREATE OR REPLACE FUNCTION notify_comment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  post_author UUID;
  post_title  TEXT;
BEGIN
  SELECT author_id, title INTO post_author, post_title FROM posts WHERE id = NEW.post_id;
  IF post_author = NEW.author_id THEN RETURN NEW; END IF;

  INSERT INTO notifications (user_id, type, payload)
  VALUES (
    post_author,
    'comment',
    jsonb_build_object(
      'post_id',            NEW.post_id,
      'post_title',         post_title,
      'comment_preview',    LEFT(NEW.content, 80),
      'actor_id',           NEW.author_id,
      'actor_username',     (SELECT username     FROM profiles WHERE id = NEW.author_id),
      'actor_display_name', (SELECT display_name FROM profiles WHERE id = NEW.author_id),
      'actor_avatar_url',   (SELECT avatar_url   FROM profiles WHERE id = NEW.author_id),
      'actor_avatar_emoji', (SELECT avatar_emoji FROM profiles WHERE id = NEW.author_id)
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_comment ON comments;
CREATE TRIGGER on_new_comment
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION notify_comment();
