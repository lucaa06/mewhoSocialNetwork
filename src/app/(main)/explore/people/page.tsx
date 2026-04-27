import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProfileCard } from "@/components/profile/ProfileCard";

export const metadata: Metadata = {
  title: "Esplora persone",
  description: "Trova startupper, ricercatori e persone con idee vicino a te.",
};

export default async function ExplorePeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; country?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, role, country_code, city, bio, is_verified")
    .eq("is_banned", false)
    .is("deleted_at", null)
    .limit(30);

  if (params.q) {
    query = query.or(
      `username.ilike.%${params.q}%,display_name.ilike.%${params.q}%,bio.ilike.%${params.q}%`
    );
  }
  if (params.role) query = query.eq("role", params.role);
  if (params.country) query = query.eq("country_code", params.country);

  const { data: profiles } = await query;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-black">Persone</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(profiles ?? []).map((p) => (
          <ProfileCard key={p.id} profile={p} />
        ))}
        {!profiles?.length && (
          <p className="col-span-2 text-center text-black/40 py-12">Nessun risultato.</p>
        )}
      </div>
    </div>
  );
}
