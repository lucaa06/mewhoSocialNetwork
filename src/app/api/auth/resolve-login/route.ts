import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { identifier } = await req.json();
  if (!identifier) return NextResponse.json({ error: "Missing identifier" }, { status: 400 });

  // If it's an email, return it directly
  if (identifier.includes("@")) return NextResponse.json({ email: identifier });

  // Otherwise treat as username — look up the email via admin client
  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", identifier.toLowerCase().trim())
    .single();

  if (!profile) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

  // Get the email from auth.users via admin
  const { data: { user } } = await supabase.auth.admin.getUserById(profile.id);
  if (!user?.email) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

  return NextResponse.json({ email: user.email });
}
