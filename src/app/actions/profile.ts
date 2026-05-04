"use server";

import { createClient } from "@/lib/supabase/server";
import { profileUpdateSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function saveProfile(
  raw: unknown,
  avatar_emoji: string | null,
  banner_color: string | null,
  avatar_url?: string,
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessione non valida — rieffettua il login" };

  const parsed = profileUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors.map(e => e.message).join(", ") };
  }

  const { display_name, bio, role, country_code, city } = parsed.data;

  const updatePayload: Record<string, unknown> = {
    display_name,
    bio:          bio          ?? null,
    role,
    country_code: country_code ?? null,
    city:         city         ?? null,
    avatar_emoji: avatar_emoji ?? null,
    banner_color: banner_color ?? null,
  };
  if (avatar_url) updatePayload.avatar_url = avatar_url;

  const { error, count } = await supabase
    .from("profiles")
    .update(updatePayload, { count: "exact" })
    .eq("id", user.id);

  if (error) return { error: "Errore DB: " + error.message };
  if (count === 0) return { error: "Nessuna riga aggiornata — controlla le policy RLS su Supabase › profiles." };

  // Get the username to redirect to
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  // Invalidate layout + profile page so fresh data is shown everywhere
  revalidatePath("/", "layout");
  revalidatePath(`/u/${profile?.username}`, "page");

  return { ok: true, username: profile?.username };
}
