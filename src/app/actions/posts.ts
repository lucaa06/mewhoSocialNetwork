"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

// ─── helpers ────────────────────────────────────────────────────────────────

function extractMentions(content: string): string[] {
  const matches = content.match(/@([a-z0-9_]+)/gi) ?? [];
  const usernames = matches.map((m) => m.slice(1).toLowerCase());
  return [...new Set(usernames)];
}

async function sendMentionNotifications(
  supabase: SupabaseClient,
  actorId: string,
  actor: { display_name: string; username: string; avatar_url: string | null },
  contextId: string,
  contextTitle: string | null,
  content: string,
  type: "post" | "comment",
) {
  const usernames = extractMentions(content);
  if (usernames.length === 0) return;

  // Resolve usernames → user IDs, excluding the actor themselves
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username")
    .in("username", usernames)
    .neq("id", actorId);

  if (!profiles || profiles.length === 0) return;

  const notifications = profiles.map((p: { id: string; username: string }) => ({
    user_id: p.id,
    type: "mention",
    payload: {
      actor_id: actorId,
      actor_display_name: actor.display_name,
      actor_username: actor.username,
      actor_avatar_url: actor.avatar_url,
      post_id: type === "post" ? contextId : undefined,
      comment_id: type === "comment" ? contextId : undefined,
      post_title: contextTitle,
      type: "mention",
    },
    is_read: false,
  }));

  await supabase.from("notifications").insert(notifications);
}

// ─── createPost ─────────────────────────────────────────────────────────────

export async function createPost(data: {
  title?: string;
  content: string;
  visibility: "public" | "followers";
  linkUrl?: string;
  poll?: { question: string; options: string[] };
}): Promise<{ error?: string; postId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autenticato" };

  if (!data.content.trim()) return { error: "Il contenuto non può essere vuoto" };

  // Validate poll if present
  if (data.poll) {
    if (!data.poll.question.trim()) return { error: "La domanda del sondaggio non può essere vuota" };
    const validOptions = data.poll.options.filter((o) => o.trim().length > 0);
    if (validOptions.length < 2) return { error: "Il sondaggio richiede almeno 2 opzioni" };
  }

  // Fetch actor profile for mention notifications
  const { data: actor } = await supabase
    .from("profiles")
    .select("display_name, username, avatar_url")
    .eq("id", user.id)
    .single();

  if (!actor) return { error: "Profilo non trovato" };

  // Insert post
  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      title: data.title?.trim() || null,
      content: data.content.trim(),
      visibility: data.visibility,
      link_url: data.linkUrl?.trim() || null,
      tags: [],
    })
    .select("id")
    .single();

  if (postError || !post) return { error: postError?.message ?? "Errore nella pubblicazione" };

  const postId = post.id as string;

  // Insert poll if valid
  if (data.poll) {
    const validOptions = data.poll.options
      .filter((o) => o.trim().length > 0)
      .map((text, idx) => ({ id: `opt_${idx}`, text: text.trim() }));

    const { error: pollError } = await supabase.from("polls").insert({
      post_id: postId,
      question: data.poll.question.trim(),
      options: validOptions,
    });

    if (pollError) {
      // Non-fatal: post was created, poll failed — log but don't block
      console.error("Poll insert error:", pollError.message);
    }
  }

  // Send mention notifications
  await sendMentionNotifications(
    supabase,
    user.id,
    actor as { display_name: string; username: string; avatar_url: string | null },
    postId,
    data.title?.trim() || null,
    data.content,
    "post",
  );

  revalidatePath("/");
  return { postId };
}

// ─── votePoll ────────────────────────────────────────────────────────────────

export async function votePoll(
  pollId: string,
  optionId: string,
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autenticato" };

  // Delete any existing vote from this user on this poll
  await supabase
    .from("poll_votes")
    .delete()
    .eq("poll_id", pollId)
    .eq("user_id", user.id);

  // Insert new vote
  const { error } = await supabase.from("poll_votes").insert({
    poll_id: pollId,
    option_id: optionId,
    user_id: user.id,
  });

  if (error) return { error: error.message };
  return { success: true };
}

// ─── toggleLike ──────────────────────────────────────────────────────────────

export async function toggleLike(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autenticato" };

  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .eq("type", "like")
    .single();

  if (existing) {
    await supabase.from("reactions").delete().eq("id", existing.id);
  } else {
    await supabase
      .from("reactions")
      .insert({ post_id: postId, user_id: user.id, type: "like" });
  }

  revalidatePath("/");
  revalidatePath(`/post/${postId}`);
  return { liked: !existing };
}

// ─── addComment ──────────────────────────────────────────────────────────────

export async function addComment(
  postId: string,
  content: string,
  parentId?: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autenticato" };
  if (!content.trim()) return { error: "Commento vuoto" };

  const { data: comment, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      author_id: user.id,
      content: content.trim(),
      parent_id: parentId ?? null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  // Send mention notifications
  const { data: actor } = await supabase
    .from("profiles")
    .select("display_name, username, avatar_url")
    .eq("id", user.id)
    .single();

  if (actor && comment) {
    const { data: post } = await supabase
      .from("posts")
      .select("title")
      .eq("id", postId)
      .single();

    await sendMentionNotifications(
      supabase,
      user.id,
      actor as { display_name: string; username: string; avatar_url: string | null },
      comment.id as string,
      (post?.title as string | null) ?? null,
      content,
      "comment",
    );
  }

  revalidatePath(`/post/${postId}`);
  return { success: true };
}

// ─── toggleSave ──────────────────────────────────────────────────────────────

export async function toggleSave(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autenticato" };

  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .eq("type", "idea")
    .single();

  if (existing) {
    await supabase.from("reactions").delete().eq("id", existing.id);
  } else {
    await supabase
      .from("reactions")
      .insert({ post_id: postId, user_id: user.id, type: "idea" });
  }

  revalidatePath("/saved");
  return { saved: !existing };
}
