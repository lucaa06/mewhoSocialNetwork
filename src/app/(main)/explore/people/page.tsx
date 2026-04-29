import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { BackButton } from "@/components/layout/BackButton";

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
      <div className="flex items-center gap-2">
        <BackButton href="/explore" />
        <h1 className="text-xl font-bold" style={{ color: "var(--fg)" }}>Persone</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(profiles ?? []).map((p) => (
          <ProfileCard key={p.id} profile={p} />
        ))}
        {!profiles?.length && (
          <p className="col-span-2 text-center py-12" style={{ color: "var(--muted)" }}>Nessun risultato.</p>
        )}
      </div>
    </div>
  );
}
