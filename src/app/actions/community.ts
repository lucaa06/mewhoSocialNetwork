"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const requestSchema = z.object({
  name:        z.string().min(3, "Minimo 3 caratteri").max(60),
  description: z.string().min(10, "Minimo 10 caratteri").max(500),
  category:    z.string().min(1, "Seleziona una categoria"),
  reason:      z.string().min(10, "Minimo 10 caratteri").max(500),
});

export async function submitCommunityRequest(raw: unknown) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Devi essere loggato per inviare una richiesta" };

  const parsed = requestSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.errors.map(e => e.message).join(", ") };

  const { error } = await supabase.from("community_requests").insert({
    user_id:     user.id,
    name:        parsed.data.name,
    description: parsed.data.description,
    category:    parsed.data.category,
    reason:      parsed.data.reason,
  });

  if (error) return { error: error.message };
  return { ok: true };
}

export async function updateCommunityRequestStatus(id: string, status: "approved" | "rejected", admin_notes?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };

  const admin = createAdminClient();

  // If approving, create the actual community
  if (status === "approved") {
    const { data: req, error: fetchErr } = await admin
      .from("community_requests")
      .select("name, description, category, user_id")
      .eq("id", id)
      .single();

    if (fetchErr || !req) return { error: "Richiesta non trovata" };

    // Generate unique slug from name
    const baseSlug = req.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);

    // Check for conflicts and append suffix if needed
    let slug = baseSlug;
    let attempt = 0;
    while (true) {
      const { data: existing } = await admin
        .from("communities")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!existing) break;
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    const { error: insertErr } = await admin.from("communities").insert({
      slug,
      name:         req.name,
      description:  req.description ?? null,
      category:     req.category ?? null,
      created_by:   req.user_id,
      is_public:    true,
      avatar_url:   null,
      country_code: null,
    });

    if (insertErr) return { error: insertErr.message };
  }

  const { error } = await admin
    .from("community_requests")
    .update({ status, admin_notes: admin_notes ?? null })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/community");
  revalidatePath("/admin/community");
  return { ok: true };
}
