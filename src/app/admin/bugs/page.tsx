import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = { title: "Admin — Bug" };

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export default async function AdminBugsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const supabase = createAdminClient();
  const status = params.status ?? "open";

  const { data: bugs } = await supabase
    .from("bug_reports")
    .select(`*, reporter:profiles!user_id(username)`)
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bug Reports</h1>
      <div className="flex gap-2 mb-4">
        {["open", "in_progress", "resolved", "wontfix"].map((s) => (
          <Link
            key={s}
            href={`/admin/bugs?status=${s}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              status === s ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            {s.replace("_", " ")}
          </Link>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {(bugs ?? []).map((b) => (
          <div key={b.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 text-sm">{b.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${SEVERITY_COLORS[b.severity]}`}>
                    {b.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{b.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {(b.reporter as { username: string } | null)?.username ?? "Anonimo"} · {formatDate(b.created_at)}
                </p>
              </div>
            </div>
          </div>
        ))}
        {!bugs?.length && (
          <p className="text-center text-gray-500 py-12">Nessun bug.</p>
        )}
      </div>
    </div>
  );
}
