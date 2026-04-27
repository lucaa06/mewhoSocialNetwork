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
      await supabase.from("profiles").upsert({
        id: user.id,
        username: user.user_metadata?.username ?? "user_" + user.id.slice(0, 8),
        display_name: user.user_metadata?.display_name ?? "New User",
      }, { onConflict: "id", ignoreDuplicates: true });
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
