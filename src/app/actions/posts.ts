"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleLike(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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
    await supabase.from("reactions").insert({ post_id: postId, user_id: user.id, type: "like" });
  }

  revalidatePath("/");
  revalidatePath(`/post/${postId}`);
  return { liked: !existing };
}

export async function addComment(postId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non autenticato" };
  if (!content.trim()) return { error: "Commento vuoto" };

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    author_id: user.id,
    content: content.trim(),
  });

  if (error) return { error: error.message };
  revalidatePath(`/post/${postId}`);
  return { success: true };
}

export async function toggleSave(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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
    await supabase.from("reactions").insert({ post_id: postId, user_id: user.id, type: "idea" });
  }

  revalidatePath("/saved");
  return { saved: !existing };
}
