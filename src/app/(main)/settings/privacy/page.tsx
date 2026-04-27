import type { Metadata } from "next";

export const metadata: Metadata = { title: "Impostazioni privacy" };

export default function PrivacySettingsPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-black mb-4">Privacy</h2>
      <p className="text-sm text-black/50">
        Impostazioni di visibilità profilo, post di default e blocco utenti.
      </p>
    </div>
  );
}
