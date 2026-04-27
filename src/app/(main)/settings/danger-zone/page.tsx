import type { Metadata } from "next";
import { DeleteAccountButton } from "@/components/settings/DeleteAccountButton";

export const metadata: Metadata = { title: "Zona pericolosa" };

export default function DangerZonePage() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-black mb-4">Zona pericolosa</h2>
      <div className="border border-black/8 rounded-xl p-4 space-y-4">
        <div>
          <h3 className="font-medium text-black">Elimina account</h3>
          <p className="text-sm text-black/50 mt-1">
            Il tuo account verrà disattivato immediatamente. Hai 30 giorni per fare appello prima che
            i dati vengano eliminati definitivamente (GDPR).
          </p>
          <DeleteAccountButton className="mt-3" />
        </div>
      </div>
    </div>
  );
}
