import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata: Metadata = { title: "Utenti bloccati" };

export default async function BlockedUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: blocked } = await supabase
    .from("blocked_users")
    .select(`profile:profiles!blocked_id(id, username, display_name, avatar_url)`)
    .eq("blocker_id", user!.id);

  return (
    <div>
      <h2 className="text-lg font-semibold text-black mb-4">Utenti bloccati</h2>
      {!blocked?.length && (
        <p className="text-sm text-black/45">Non hai bloccato nessun utente.</p>
      )}
      <div className="space-y-3">
        {(blocked ?? []).map((b) => {
          const p = b.profile as unknown as { id: string; username: string; display_name: string } | null;
          return p ? (
            <div key={p.id} className="flex items-center justify-between">
              <Link href={`/u/${p.username}`} className="text-sm font-medium text-black/80 hover:text-black transition-colors">
                {p.display_name} (@{p.username})
              </Link>
              <button className="text-xs text-black/45 hover:text-black transition-colors">Sblocca</button>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}
