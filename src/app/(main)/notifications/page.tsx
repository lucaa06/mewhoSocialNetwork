import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Notifiche",
  robots: { index: false, follow: false },
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return (
    <div className="max-w-2xl mx-auto space-y-2">
      <h1 className="text-xl font-bold text-black mb-4">Notifiche</h1>
      {(notifications ?? []).length === 0 && (
        <p className="text-center text-black/40 py-12">Nessuna notifica.</p>
      )}
      {(notifications ?? []).map((n) => (
        <div
          key={n.id}
          className={`bg-white rounded-xl border p-4 ${
            !n.is_read ? "border-black/20 bg-black/2" : "border-black/6"
          }`}
        >
          <p className="text-sm text-black">{String(n.type)}</p>
          <p className="text-xs text-black/35 mt-1">{formatDate(n.created_at)}</p>
        </div>
      ))}
    </div>
  );
}
