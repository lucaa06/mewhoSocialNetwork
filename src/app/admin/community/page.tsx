import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminCreateCommunity } from "@/components/admin/AdminCreateCommunity";
import { AdminCommunityRequests } from "@/components/admin/AdminCommunityRequests";

export const metadata: Metadata = { title: "Admin — Community" };

export default async function AdminCommunityPage() {
  const supabase = createAdminClient();

  const [{ data: communities }, { data: requests }] = await Promise.all([
    supabase
      .from("communities")
      .select("id, slug, name, description, is_public, created_at, members_count")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("community_requests")
      .select("id, name, description, category, reason, status, admin_notes, created_at, user:profiles!user_id(username, display_name)")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const pending  = (requests ?? []).filter(r => r.status === "pending");
  const reviewed = (requests ?? []).filter(r => r.status !== "pending");

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-black">Community</h1>

      {/* ── Richieste in attesa ─────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <p className="text-[11px] font-semibold text-black/35 uppercase tracking-widest">
            Richieste in attesa
          </p>
          {pending.length > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#FF4A24", color: "white" }}>
              {pending.length}
            </span>
          )}
        </div>
        {pending.length === 0 ? (
          <p className="text-sm text-black/30 py-4">Nessuna richiesta in attesa</p>
        ) : (
          <div className="space-y-3">
            {pending.map(r => (
              <AdminCommunityRequests key={r.id} request={r as AdminRequest} />
            ))}
          </div>
        )}
      </div>

      {/* ── Crea nuova community ────────────────────────────────── */}
      <div className="bg-white border border-black/6 rounded-2xl p-5">
        <p className="text-[11px] font-semibold text-black/35 uppercase tracking-widest mb-4">Crea nuova community</p>
        <AdminCreateCommunity />
      </div>

      {/* ── Community esistenti ─────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-semibold text-black/35 uppercase tracking-widest mb-3">Community esistenti</p>
        <div className="bg-white border border-black/6 rounded-2xl divide-y divide-black/4">
          {(communities ?? []).length === 0 && (
            <p className="text-center text-black/25 py-10 text-sm">Nessuna community</p>
          )}
          {(communities ?? []).map(c => (
            <div key={c.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-black">{c.name}</p>
                <p className="text-xs text-black/30">/{c.slug} · {c.members_count ?? 0} membri · {c.is_public ? "Pubblica" : "Privata"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Richieste già revisionate ───────────────────────────── */}
      {reviewed.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-black/35 uppercase tracking-widest mb-3">Già revisionate</p>
          <div className="space-y-2">
            {reviewed.map(r => (
              <AdminCommunityRequests key={r.id} request={r as AdminRequest} readOnly />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export type AdminRequest = {
  id: string;
  name: string;
  description: string;
  category: string;
  reason: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  user: { username: string; display_name: string } | { username: string; display_name: string }[] | null;
};
