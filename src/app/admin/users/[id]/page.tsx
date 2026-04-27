import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminUserActions } from "@/components/admin/AdminUserActions";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Admin — Gestisci utente" };

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  const { data: recentActions } = await supabase
    .from("admin_actions")
    .select(`*, admin:profiles!admin_id(username)`)
    .eq("target_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Gestisci: {profile.display_name}
      </h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ["Username", `@${profile.username}`],
            ["Email", "—"],
            ["Ruolo", profile.role],
            ["Paese", profile.country_code ?? "—"],
            ["Verificato", profile.is_verified ? "Sì" : "No"],
            ["Sospeso", profile.is_suspended ? "Sì" : "No"],
            ["Bannato", profile.is_banned ? "Sì" : "No"],
            ["Registrato", formatDate(profile.created_at)],
          ].map(([label, value]) => (
            <div key={label}>
              <span className="text-gray-500">{label}: </span>
              <span className="font-medium text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </div>
      <AdminUserActions profile={profile} />
      {recentActions && recentActions.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Azioni precedenti</h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {recentActions.map((a) => (
              <div key={a.id} className="px-4 py-3 text-sm">
                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded mr-2">{a.action}</span>
                <span className="text-gray-600">{a.reason}</span>
                <span className="text-gray-400 ml-2 text-xs">
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
