import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { AdminUserActions } from "@/components/admin/AdminUserActions";
import { AdminUserRestrictions } from "@/components/admin/AdminUserRestrictions";
import { AdminEditUserForm } from "@/components/admin/AdminEditUserForm";
import { AdminPasswordReset } from "@/components/admin/AdminPasswordReset";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Admin — Gestisci utente" };

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  // Get current admin's ID to prevent self-assignment
  const serverClient = await createClient();
  const { data: { user: currentAdmin } } = await serverClient.auth.getUser();

  const [{ data: profile }, { data: reports }, { data: restrictions }, { data: recentActions }, { data: authUserData }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", id).single(),
      supabase.from("reports")
        .select(`*, reporter:profiles!reporter_id(username)`)
        .eq("target_id", id)
        .eq("target_type", "user")
        .order("created_at", { ascending: false }),
      supabase.from("user_restrictions").select("*").eq("user_id", id).single(),
      supabase.from("admin_actions")
        .select(`*, admin:profiles!admin_id(username)`)
        .eq("target_id", id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase.auth.admin.getUserById(id),
    ]);

  const authUser = authUserData?.user;

  if (!profile) notFound();

  const reportCount = reports?.length ?? 0;
  const pendingAppeals = reports?.filter(r => r.appeal_status === "pending") ?? [];

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-xl font-bold text-black">Gestisci: {profile.display_name}</h1>

      {/* Info */}
      <div className="bg-white border border-black/6 rounded-2xl p-5">
        <p className="text-[11px] font-semibold text-black/35 uppercase tracking-widest mb-3">Info profilo</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["Email", authUser?.email ?? "—"],
            ["Username", `@${profile.username}`],
            ["Ruolo", profile.role],
            ["Paese", profile.country_code ?? "—"],
            ["Verificato", profile.is_verified ? "Sì" : "No"],
            ["Beta Tester", (profile as { is_beta?: boolean }).is_beta ? "Sì" : "No"],
            ["Sospeso", profile.is_suspended ? "Sì" : "No"],
            ["Bannato", profile.is_banned ? "Sì" : "No"],
            ["Registrato", formatDate(profile.created_at)],
          ].map(([label, value]) => (
            <div key={label} className="bg-black/[0.02] rounded-xl px-3 py-2">
              <p className="text-[10px] text-black/35 uppercase tracking-widest font-medium mb-0.5">{label}</p>
              <p className="text-sm font-medium text-black">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reports counter */}
      <div className="bg-white border border-black/6 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold text-black/35 uppercase tracking-widest">Segnalazioni ricevute</p>
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              background: reportCount >= 3 ? "rgba(220,38,38,0.1)" : reportCount >= 2 ? "rgba(255,74,36,0.1)" : "rgba(0,0,0,0.05)",
              color: reportCount >= 3 ? "#dc2626" : reportCount >= 2 ? "#FF4A24" : "rgba(0,0,0,0.4)",
            }}
          >
            {reportCount} / 3
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full bg-black/6 mb-4 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min((reportCount / 3) * 100, 100)}%`,
              background: reportCount >= 3 ? "#dc2626" : reportCount >= 2 ? "#FF4A24" : "#D97706",
            }}
          />
        </div>

        {/* Appeals */}
        {pendingAppeals.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-black/40 uppercase tracking-widest">Ricorsi in attesa ({pendingAppeals.length})</p>
            {pendingAppeals.map(r => (
              <div key={r.id} className="rounded-xl p-3" style={{ background: "rgba(255,74,36,0.06)", border: "1px solid rgba(255,74,36,0.15)" }}>
                <p className="text-xs font-medium text-black/70 mb-1">{r.appeal_message}</p>
                <p className="text-[10px] text-black/35">Motivo originale: {r.reason}</p>
                <div className="flex gap-2 mt-2">
                  <AppealAction reportId={r.id} action="accepted" label="Accetta ricorso" />
                  <AppealAction reportId={r.id} action="rejected" label="Rifiuta" />
                </div>
              </div>
            ))}
          </div>
        )}

        {reports && reports.length > 0 && (
          <div className="space-y-1 mt-3">
            {reports.map(r => (
              <div key={r.id} className="flex items-center gap-2 text-xs text-black/50 py-1">
                <span className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: r.status === "resolved" ? "#22c55e" : r.status === "dismissed" ? "#9ca3af" : "#FF4A24" }} />
                <span className="flex-1 truncate">{r.reason}</span>
                <span className="text-black/30 shrink-0">{formatDate(r.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit profile */}
      <AdminEditUserForm profile={profile} />

      {/* Restrictions */}
      <AdminUserRestrictions userId={id} current={restrictions} />

      {/* Actions */}
      <AdminUserActions profile={profile} currentAdminId={currentAdmin?.id ?? ""} />

      {/* Password reset */}
      <AdminPasswordReset userId={id} email={authUser?.email ?? null} />

      {/* History */}
      {recentActions && recentActions.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-black/35 uppercase tracking-widest mb-2">Storico azioni</p>
          <div className="bg-white border border-black/6 rounded-2xl divide-y divide-black/4">
            {recentActions.map(a => (
              <div key={a.id} className="px-4 py-3 text-sm">
                <span className="font-mono text-[10px] bg-black/5 text-black/50 px-2 py-0.5 rounded mr-2">{a.action}</span>
                <span className="text-black/60">{a.reason}</span>
                <span className="text-black/30 ml-2 text-xs">
                  da {(a.admin as { username: string } | null)?.username} · {formatDate(a.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AppealAction({ reportId, action, label }: { reportId: string; action: string; label: string }) {
  return (
    <form action={`/api/admin/reports/${reportId}/appeal`} method="POST">
      <input type="hidden" name="action" value={action} />
      <button
        type="submit"
        className="text-xs px-3 py-1 rounded-lg font-medium transition-colors"
        style={action === "accepted"
          ? { background: "rgba(34,197,94,0.1)", color: "#15803d" }
          : { background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.5)" }
        }
      >
        {label}
      </button>
    </form>
  );
}
