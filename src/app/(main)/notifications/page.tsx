import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackButton } from "@/components/layout/BackButton";
import { NotificationList } from "@/components/notifications/NotificationList";

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
    .limit(60);

  // Mark all as read
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BackButton href="/" />
        <h1 className="text-xl font-bold" style={{ color: "var(--fg)", fontFamily: "var(--fh)" }}>
          Notifiche
        </h1>
      </div>
      <NotificationList notifications={notifications ?? []} />
    </div>
  );
}
