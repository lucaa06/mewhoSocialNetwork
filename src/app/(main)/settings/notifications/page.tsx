import type { Metadata } from "next";
import { NotificationToggles } from "@/components/settings/NotificationToggles";

export const metadata: Metadata = { title: "Notifiche" };

export default function NotificationsSettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-black">Notifiche</h2>
      <NotificationToggles />
    </div>
  );
}
