import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      // Check if profile already exists and has completed onboarding
      const { data: existing } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("id", user.id)
        .single();

      const tempUsername = `user_${user.id.slice(0, 8)}`;

      if (existing && existing.username !== tempUsername) {
        // Returning user with a real username — go straight to destination
        return NextResponse.redirect(`${origin}${next}`);
      }

      // New user or user with incomplete onboarding
      const meta = user.user_metadata ?? {};
      const avatarUrl: string | null = meta.avatar_url ?? meta.picture ?? null;
      const displayName: string = meta.full_name ?? meta.name ?? "";

      if (!existing) {
        // First time — create minimal profile with temp username
        await supabase.from("profiles").insert({
          id: user.id,
          username: tempUsername,
          display_name: displayName,
          ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
        });
      }

      // Encode prefill data for onboarding form
      const params = new URLSearchParams({ next });
      if (displayName) params.set("name", displayName);
      return NextResponse.redirect(`${origin}/onboarding?${params}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
