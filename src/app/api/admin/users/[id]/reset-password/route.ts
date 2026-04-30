import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
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

  const adminClient = createAdminClient();

  // Get target user's email
  const { data: targetUserData, error: targetError } = await adminClient.auth.admin.getUserById(targetId);
  if (targetError) {
    return NextResponse.json({ error: targetError.message }, { status: 500 });
  }

  const email = targetUserData?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "L'utente non ha un'email associata." }, { status: 400 });
  }

  // Generate password reset link
  const { error: linkError } = await adminClient.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: (process.env.NEXT_PUBLIC_SITE_URL ?? "") + "/reset-password",
    },
  });

  if (linkError) {
    return NextResponse.json({ error: linkError.message }, { status: 500 });
  }

  // Audit log
  await adminClient.from("admin_actions").insert({
    admin_id: user.id,
    action: "send_password_reset",
    target_type: "user",
    target_id: targetId,
    reason: `Password reset link sent to ${email}`,
    metadata: {},
  });

  return NextResponse.json({ ok: true });
}
