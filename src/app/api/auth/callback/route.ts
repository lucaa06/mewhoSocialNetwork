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
      const meta = user.user_metadata ?? {};

      // Extract username from provider (GitHub/X use user_name, Google uses email prefix)
      const rawUsername =
        meta.user_name ??
        meta.preferred_username ??
        meta.email?.split("@")[0];
      const baseUsername = rawUsername
        ? rawUsername.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 28)
        : `user_${user.id.slice(0, 8)}`;

      // Display name: providers expose full_name or name
      const displayName =
        meta.full_name ??
        meta.name ??
        baseUsername;

      // Avatar from provider (Google uses picture, others use avatar_url)
      const avatarUrl: string | null = meta.avatar_url ?? meta.picture ?? null;

      // Upsert profile — ignoreDuplicates keeps existing profile intact on re-login
      const { error: upsertError } = await supabase.from("profiles").upsert({
        id: user.id,
        username: baseUsername,
        display_name: displayName,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      }, { onConflict: "id", ignoreDuplicates: true });

      // If username was taken, retry with unique ID-based fallback
      if (upsertError) {
        await supabase.from("profiles").upsert({
          id: user.id,
          username: `user_${user.id.slice(0, 8)}`,
          display_name: displayName,
          ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
        }, { onConflict: "id", ignoreDuplicates: true });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
