import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { AdminReportActions } from "@/components/admin/AdminReportActions";

export const metadata: Metadata = { title: "Admin — Segnalazioni" };

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const supabase = createAdminClient();
  const status = params.status ?? "pending";

  const { data: reports } = await supabase
    .from("reports")
    .select(`*, reporter:profiles!reporter_id(username, display_name)`)
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(100);

  const tabs = [
    { key: "pending",   label: "In attesa" },
    { key: "reviewed",  label: "Revisionate" },
    { key: "resolved",  label: "Risolte" },
    { key: "dismissed", label: "Ignorate" },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-black">Segnalazioni</h1>

      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <Link key={t.key} href={`/admin/reports?status=${t.key}`}
            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
            style={status === t.key
              ? { background: "#FF4A24", color: "white" }
              : { background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.4)" }
            }
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-black/6 rounded-2xl divide-y divide-black/4">
        {(reports ?? []).length === 0 && (
          <p className="text-center text-black/25 py-12 text-sm">Nessuna segnalazione</p>
        )}
        {(reports ?? []).map(r => (
          <div key={r.id} className="p-4 flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] bg-black/5 text-black/40 px-2 py-0.5 rounded-full uppercase tracking-wide font-medium">
                  {r.target_type}
                </span>
                <span className="text-sm font-medium text-black">{r.reason}</span>
              </div>
              {r.description && (
                <p className="text-sm text-black/50 mt-1">{r.description}</p>
              )}
              <p className="text-xs text-black/30 mt-1.5">
                Da @{(r.reporter as { username: string } | null)?.username ?? "—"} · {formatDate(r.created_at)}
              </p>
              <Link href={`/${r.target_type === "post" ? "post" : "u"}/${r.target_id}`}
                target="_blank"
                className="text-xs text-black/30 hover:text-black/60 underline transition-colors mt-0.5 inline-block"
              >
                Vedi contenuto →
              </Link>
            </div>
            {status === "pending" && <AdminReportActions reportId={r.id} />}
          </div>
        ))}
      </div>
    </div>
  );
}
