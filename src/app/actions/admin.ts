"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");
  return user;
}

async function logAdminAction(adminId: string, action: string, targetType: string, targetId: string, reason: string) {
  const supabase = createAdminClient();
  await supabase.from("admin_actions").insert({
    admin_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    reason,
    metadata: {},
  });
}

export async function adminEditPost(postId: string, title: string, content: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("posts").update({ title: title || null, content }).eq("id", postId);
  revalidatePath("/admin/posts");
}

export async function adminDeletePost(postId: string, reason: string) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("posts")
    .update({ deleted_at: new Date().toISOString(), is_hidden: true })
    .eq("id", postId);
  await logAdminAction(admin.id, "delete_post", "post", postId, reason);
  revalidatePath("/admin/posts");
}

export async function adminDeleteComment(commentId: string, reason: string) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("comments")
    .update({ deleted_at: new Date().toISOString(), is_hidden: true })
    .eq("id", commentId);
  await logAdminAction(admin.id, "delete_comment", "comment", commentId, reason);
  revalidatePath("/admin/comments");
}

export async function adminEditProfile(userId: string, data: { display_name: string; username: string; bio: string; role: string }) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("profiles").update(data).eq("id", userId);
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function adminCreateCommunity(data: { name: string; slug: string; description: string; is_public: boolean; category?: string }) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("communities").insert({ ...data, created_by: admin.id });
  revalidatePath("/admin/community");
}

export async function adminCreatePost(data: { title: string; content: string; category: string }) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("posts").insert({
    author_id: admin.id,
    title: data.title || null,
    content: data.content,
    category: data.category || null,
    visibility: "public",
    tags: [],
  });
  revalidatePath("/admin/posts");
  revalidatePath("/");
}

export async function adminResolveReport(reportId: string) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("reports")
    .update({ status: "resolved", reviewed_by: admin.id, reviewed_at: new Date().toISOString() })
    .eq("id", reportId);
  revalidatePath("/admin/reports");
}

export async function adminDismissReport(reportId: string) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("reports")
    .update({ status: "dismissed", reviewed_by: admin.id, reviewed_at: new Date().toISOString() })
    .eq("id", reportId);
  revalidatePath("/admin/reports");
}
