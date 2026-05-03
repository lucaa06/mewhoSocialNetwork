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
      // Check if profile already exists (returning user)
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (existing) {
        // Returning user — go straight to destination
        return NextResponse.redirect(`${origin}${next}`);
      }

      // New user — create minimal profile and send to onboarding
      const meta = user.user_metadata ?? {};
      const avatarUrl: string | null = meta.avatar_url ?? meta.picture ?? null;
      const displayName: string = meta.full_name ?? meta.name ?? "";

      // Reserve a temporary unique username so the profile row can be created
      const tempUsername = `user_${user.id.slice(0, 8)}`;
      await supabase.from("profiles").insert({
        id: user.id,
        username: tempUsername,
        display_name: displayName,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      });

      // Encode prefill data for onboarding form
      const params = new URLSearchParams({ next });
      if (displayName) params.set("name", displayName);
      return NextResponse.redirect(`${origin}/onboarding?${params}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
