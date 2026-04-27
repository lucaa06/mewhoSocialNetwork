import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Impostazioni" };

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Impostazioni piattaforma</h1>
      <p className="text-sm text-gray-500">
        Configurazioni globali della piattaforma (in sviluppo).
      </p>
    </div>
  );
}
