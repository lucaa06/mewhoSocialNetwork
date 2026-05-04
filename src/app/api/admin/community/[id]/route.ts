import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();

  // 1. Detach posts (set community_id = null)
  const { error: postsErr } = await admin
    .from("posts")
    .update({ community_id: null })
    .eq("community_id", id);
  if (postsErr) return NextResponse.json({ error: `posts: ${postsErr.message}` }, { status: 500 });

  // 2. Remove community members
  const { error: membersErr } = await admin
    .from("community_members")
    .delete()
    .eq("community_id", id);
  if (membersErr) return NextResponse.json({ error: `members: ${membersErr.message}` }, { status: 500 });

  // 3. Delete the community
  const { error } = await admin.from("communities").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 4. Log (best-effort)
  await admin.from("admin_actions").insert({
    admin_id: user.id,
    action: "delete_community",
    target_type: "community",
    target_id: id,
    reason: "Admin deleted",
    metadata: {},
  }).then(() => {});

  return NextResponse.json({ ok: true });
}
