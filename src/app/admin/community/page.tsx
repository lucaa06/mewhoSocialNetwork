import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminCreateCommunity } from "@/components/admin/AdminCreateCommunity";
import { AdminCommunityRequests } from "@/components/admin/AdminCommunityRequests";
import { AdminDeleteCommunity } from "@/components/admin/AdminDeleteCommunity";
import { Users, Clock, CheckCircle, Globe, Lock } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Community" };

const CATEGORY_COLOR: Record<string, string> = {
  startup:  "#FF4A24",
  research: "#6D41FF",
  creative: "#C84FD0",
  tech:     "#0EA5E9",
  social:   "#16A34A",
  other:    "#D97706",
};

const CATEGORY_LABEL: Record<string, string> = {
  startup:  "Startup",
  research: "Ricerca",
  creative: "Creatività",
  tech:     "Tech",
  social:   "Sociale",
  other:    "Altro",
};

export default async function AdminCommunityPage() {
  const supabase = createAdminClient();

  const [{ data: communities }, { data: requests }] = await Promise.all([
    supabase
      .from("communities")
      .select("id, slug, name, description, category, is_public, created_at, members_count")
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

      {/* ── Header + stats ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-black">Community</h1>
        <div className="flex items-center gap-3">
          <Stat icon={Globe} label="Totale" value={communities?.length ?? 0} color="#0EA5E9" />
          <Stat icon={Clock} label="In attesa" value={pending.length} color="#D97706" highlight={pending.length > 0} />
          <Stat icon={CheckCircle} label="Revisionate" value={reviewed.length} color="#16A34A" />
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 items-start">

        {/* LEFT col (2/5): Richieste */}
        <div className="xl:col-span-2 space-y-4">

          {/* Pending */}
          <div className="bg-white border border-black/6 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
              <p className="text-sm font-semibold text-black">Richieste in attesa</p>
              {pending.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF4A24] text-white">
                  {pending.length}
                </span>
              )}
            </div>
            <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
              {pending.length === 0 ? (
                <p className="text-sm text-black/30 py-6 text-center">Nessuna richiesta in attesa</p>
              ) : pending.map(r => (
                <AdminCommunityRequests key={r.id} request={r as AdminRequest} />
              ))}
            </div>
          </div>

          {/* Reviewed */}
          {reviewed.length > 0 && (
            <div className="bg-white border border-black/6 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-black/5">
                <p className="text-sm font-semibold text-black">Già revisionate <span className="text-black/30 font-normal">({reviewed.length})</span></p>
              </div>
              <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                {reviewed.map(r => (
                  <AdminCommunityRequests key={r.id} request={r as AdminRequest} readOnly />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT col (3/5): Create + List */}
        <div className="xl:col-span-3 space-y-5">

          {/* Create form */}
          <div className="bg-white border border-black/6 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-black/5">
              <p className="text-sm font-semibold text-black">Crea nuova community</p>
            </div>
            <div className="p-5">
              <AdminCreateCommunity />
            </div>
          </div>

          {/* Existing communities */}
          <div className="bg-white border border-black/6 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-black/5">
              <p className="text-sm font-semibold text-black">Community esistenti</p>
            </div>
            {(communities ?? []).length === 0 ? (
              <p className="text-center text-black/25 py-12 text-sm">Nessuna community ancora creata</p>
            ) : (
              <div className="divide-y divide-black/4 max-h-[480px] overflow-y-auto">
                {(communities ?? []).map(c => {
                  const color = CATEGORY_COLOR[c.category ?? "other"] ?? "#6b7280";
                  return (
                    <div key={c.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-black/[0.015] transition-colors">
                      {/* Color dot */}
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
                        style={{ background: `${color}18`, color }}>
                        {c.name[0]?.toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-black truncate">{c.name}</p>
                          {c.category && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                              style={{ background: `${color}15`, color }}>
                              {CATEGORY_LABEL[c.category] ?? c.category}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-black/35">/{c.slug}</span>
                          <span className="text-black/20">·</span>
                          <span className="flex items-center gap-1 text-xs text-black/35">
                            <Users className="w-3 h-3" />{c.members_count ?? 0}
                          </span>
                          <span className="text-black/20">·</span>
                          <span className="flex items-center gap-1 text-xs text-black/35">
                            {c.is_public
                              ? <><Globe className="w-3 h-3" /> Pubblica</>
                              : <><Lock className="w-3 h-3" /> Privata</>}
                          </span>
                        </div>
                      </div>

                      <AdminDeleteCommunity id={c.id} name={c.name} />
                    </div>
                  );
                })}
              </div>
            )}
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
      style={{
        background: highlight ? `${color}10` : "white",
        borderColor: highlight ? `${color}30` : "rgba(0,0,0,0.07)",
      }}>
      <Icon className="w-3.5 h-3.5" style={{ color }} />
      <span className="text-xs text-black/40">{label}</span>
      <span className="text-sm font-bold" style={{ color: highlight ? color : "black" }}>{value}</span>
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
