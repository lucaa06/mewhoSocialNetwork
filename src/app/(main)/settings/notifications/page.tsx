import type { Metadata } from "next";

export const metadata: Metadata = { title: "Impostazioni notifiche" };

export default function NotificationsSettingsPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-black mb-4">Notifiche</h2>
      <p className="text-sm text-black/50">
        Configura quali notifiche vuoi ricevere via email e in app.
      </p>
    </div>
  );
}
