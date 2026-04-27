import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin — Feedback" };

const CATEGORY_ICONS: Record<string, string> = {
  suggestion: "💡", compliment: "❤️", problem: "⚠️", idea: "🚀",
};

export default async function AdminFeedbackPage() {
  const supabase = createAdminClient();
  const { data: items } = await supabase
    .from("feedback")
    .select(`*, user:profiles!user_id(username)`)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Feedback</h1>
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {(items ?? []).map((item) => (
          <div key={item.id} className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-lg">{CATEGORY_ICONS[item.category] ?? "📝"}</span>
              <div>
                <p className="text-sm text-gray-800">{item.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {(item.user as { username: string } | null)?.username ?? "Anonimo"} · {formatDate(item.created_at)}
                </p>
              </div>
            </div>
          </div>
        ))}
        {!items?.length && (
          <p className="text-center text-gray-500 py-12">Nessun feedback.</p>
        )}
      </div>
    </div>
  );
}
