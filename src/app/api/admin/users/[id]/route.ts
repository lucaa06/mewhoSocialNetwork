import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import type { AdminActionType } from "@/types/database";

const ALLOWED_ACTIONS: AdminActionType[] = [
  "remove_avatar", "suspend_user", "unsuspend_user", "ban_user",
  "unban_user", "verify_user",
];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: targetId } = await params;

  // Verify admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (adminProfile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { action, reason } = await request.json();

  if (!ALLOWED_ACTIONS.includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  if (!reason?.trim()) {
    return NextResponse.json({ error: "Reason required" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  // Apply the action
  const updates: Record<string, unknown> = {};
  if (action === "remove_avatar") updates.avatar_url = null;
  if (action === "suspend_user") updates.is_suspended = true;
  if (action === "unsuspend_user") updates.is_suspended = false;
  if (action === "ban_user") { updates.is_banned = true; updates.is_suspended = false; }
  if (action === "unban_user") updates.is_banned = false;
  if (action === "verify_user") updates.is_verified = true;

  const { error } = await adminClient
    .from("profiles")
    .update(updates)
    .eq("id", targetId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Audit log
  await adminClient.from("admin_actions").insert({
    admin_id: user.id,
    action,
    target_type: "user",
    target_id: targetId,
    reason,
  });

  return NextResponse.json({ ok: true });
}
