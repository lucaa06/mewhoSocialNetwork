import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/connections — swipe right (connect) or skip
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { target_id, action } = await req.json() as { target_id: string; action: "connect" | "skip" };
  if (!target_id || !action) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const status = action === "connect" ? "pending" : "skipped";

  // Upsert the sender's side
  const { error: upsertError } = await supabase
    .from("connections")
    .upsert({ sender_id: user.id, receiver_id: target_id, status }, { onConflict: "sender_id,receiver_id" });

  if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 });

  if (action !== "connect") return NextResponse.json({ matched: false });

  // Check if the other person already sent a pending/accepted connection to us
  const { data: reverse } = await supabase
    .from("connections")
    .select("id, status")
    .eq("sender_id", target_id)
    .eq("receiver_id", user.id)
    .single();

  if (reverse && reverse.status === "pending") {
    // Mutual! Accept both
    await supabase.from("connections").update({ status: "accepted" }).eq("id", reverse.id);
    await supabase
      .from("connections")
      .update({ status: "accepted" })
      .eq("sender_id", user.id)
      .eq("receiver_id", target_id);

    // Fire notifications for both sides
    await supabase.from("notifications").insert([
      { user_id: user.id,   type: "connection_match", payload: { with_user_id: target_id } },
      { user_id: target_id, type: "connection_match", payload: { with_user_id: user.id   } },
    ]);

    return NextResponse.json({ matched: true });
  }

  return NextResponse.json({ matched: false });
}

// GET /api/connections — fetch candidates (profiles not yet swiped)
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // IDs already interacted with
  const { data: seen } = await supabase
    .from("connections")
    .select("receiver_id")
    .eq("sender_id", user.id);

  const seenIds = (seen ?? []).map(r => r.receiver_id);
  seenIds.push(user.id); // exclude self

  let q = supabase
    .from("profiles")
    .select("id, username, display_name, bio, avatar_url, avatar_emoji, role, city, country_code, is_verified, is_beta")
    .eq("is_suspended", false)
    .eq("is_banned", false)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(20);

  if (seenIds.length > 0) q = q.not("id", "in", `(${seenIds.join(",")})`);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ profiles: data ?? [] });
}
