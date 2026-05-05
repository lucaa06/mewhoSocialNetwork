import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminCreateCommunity } from "@/components/admin/AdminCreateCommunity";
import { AdminCommunityRequests } from "@/components/admin/AdminCommunityRequests";
import { AdminCommunityCard } from "@/components/admin/AdminCommunityCard";
import { AdminReviewedToggle } from "@/components/admin/AdminReviewedToggle";
import { Clock, Globe } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Community" };

export default async function AdminCommunityPage() {
  const supabase = createAdminClient();

  const [{ data: communities }, { data: requests }] = await Promise.all([
    supabase
      .from("communities")
      .select("id, slug, name, description, category, is_public, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("community_requests")
      .select("id, name, description, category, reason, status, admin_notes, created_at, user:profiles!user_id(username, display_name)")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const pending  = (requests ?? []).filter(r => r.status === "pending");
  const reviewed = (requests ?? []).filter(r => r.status !== "pending");

  return (
    <div className="space-y-6">

      {/* Header + stats */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-black">Community</h1>
        <div className="flex items-center gap-2">
          <Stat icon={Globe}  label="Totale"      value={communities?.length ?? 0} color="#0EA5E9" />
          <Stat icon={Clock}  label="In attesa"   value={pending.length}           color="#D97706" highlight={pending.length > 0} />
          <Stat icon={Clock}  label="Revisionate" value={reviewed.length}          color="#16A34A" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 items-start">

        {/* LEFT — Richieste */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white border border-black/6 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
              <p className="text-sm font-semibold text-black">Richieste in attesa</p>
              {pending.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FB7141] text-white">
                  {pending.length}
                </span>
              )}
            </div>
            <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
              {pending.length === 0
                ? <p className="text-sm text-black/30 py-6 text-center">Nessuna richiesta in attesa</p>
                : pending.map(r => <AdminCommunityRequests key={r.id} request={r as AdminRequest} />)
              }
            </div>
          </div>

          {/* Già revisionate — collassabile */}
          {reviewed.length > 0 && (
            <AdminReviewedToggle count={reviewed.length}>
              {reviewed.map(r => <AdminCommunityRequests key={r.id} request={r as AdminRequest} readOnly />)}
            </AdminReviewedToggle>
          )}
        </div>

        {/* RIGHT — Crea + Lista */}
        <div className="xl:col-span-3 space-y-5">

          {/* Create */}
          <div className="bg-white border border-black/6 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-black/5">
              <p className="text-sm font-semibold text-black">Crea nuova community</p>
            </div>
            <div className="p-5">
              <AdminCreateCommunity />
            </div>
          </div>

          {/* Community list */}
          <div className="bg-white border border-black/6 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-black/5">
              <p className="text-sm font-semibold text-black">
                Community esistenti
                {(communities?.length ?? 0) > 0 && (
                  <span className="ml-2 text-black/30 font-normal">({communities!.length})</span>
                )}
              </p>
            </div>
            {(communities ?? []).length === 0
              ? <p className="text-center text-black/25 py-12 text-sm">Nessuna community ancora</p>
              : <div className="max-h-[520px] overflow-y-auto">
                  {(communities ?? []).map(c => (
                    <AdminCommunityCard key={c.id} community={c as never} />
                  ))}
                </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color, highlight }: {
  icon: React.ElementType; label: string; value: number; color: string; highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border"
      style={{ background: highlight ? `${color}10` : "white", borderColor: highlight ? `${color}30` : "rgba(0,0,0,0.07)" }}>
      <Icon className="w-3.5 h-3.5" style={{ color }} />
      <span className="text-xs text-black/40">{label}</span>
      <span className="text-sm font-bold" style={{ color: highlight ? color : "black" }}>{value}</span>
    </div>
  );
}

export type AdminRequest = {
  id: string; name: string; description: string; category: string;
  reason: string; status: string; admin_notes: string | null; created_at: string;
  user: { username: string; display_name: string } | { username: string; display_name: string }[] | null;
};
