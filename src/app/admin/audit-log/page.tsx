import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin — Audit Log" };

export default async function AdminAuditLogPage() {
  const supabase = createAdminClient();

  const { data: actions } = await supabase
    .from("admin_actions")
    .select(`
      *, admin:profiles!admin_id(username, display_name)
    `)
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Audit Log</h1>
      <div className="bg-white rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-4 py-3 text-gray-500 font-medium">Admin</th>
              <th className="px-4 py-3 text-gray-500 font-medium">Azione</th>
              <th className="px-4 py-3 text-gray-500 font-medium">Target</th>
              <th className="px-4 py-3 text-gray-500 font-medium">Motivo</th>
              <th className="px-4 py-3 text-gray-500 font-medium">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(actions ?? []).map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {(a.admin as { username: string } | null)?.username ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                    {a.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {a.target_type} · {String(a.target_id).slice(0, 8)}…
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{a.reason}</td>
                <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                  {formatDate(a.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!actions?.length && (
          <p className="text-center text-gray-500 py-12">Nessuna azione registrata.</p>
        )}
      </div>
    </div>
  );
}
