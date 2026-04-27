import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminCreateCommunity } from "@/components/admin/AdminCreateCommunity";

export const metadata: Metadata = { title: "Admin — Community" };

export default async function AdminCommunityPage() {
  const supabase = createAdminClient();
  const { data: communities } = await supabase
    .from("communities")
    .select("id, slug, name, description, is_public, created_at, members_count")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Community</h1>

      {/* Create form */}
      <div className="bg-white/3 border border-white/6 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white/70 mb-4">Crea nuova community</h2>
        <AdminCreateCommunity />
      </div>

      {/* List */}
      <div className="bg-white/3 border border-white/6 rounded-2xl divide-y divide-white/5">
        {(communities ?? []).length === 0 && (
          <p className="text-center text-white/30 py-10 text-sm">Nessuna community</p>
        )}
        {(communities ?? []).map(c => (
          <div key={c.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white/80">{c.name}</p>
              <p className="text-xs text-white/30">/{c.slug} · {c.members_count ?? 0} membri · {c.is_public ? "Pubblica" : "Privata"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
