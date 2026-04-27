import type { Metadata } from "next";
import { BugReportForm } from "@/components/modals/BugReportForm";

export const metadata: Metadata = {
  title: "Segnala bug",
  description: "Aiutaci a migliorare me&who segnalando i bug che trovi.",
};

export default function BugReportPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-black/6 shadow-[0_2px_24px_rgba(0,0,0,0.06)] p-8 max-w-lg w-full">
        <h1 className="text-xl font-bold text-black mb-2">Segnala un bug</h1>
        <p className="text-sm text-black/45 mb-6">
          Descrivi il problema in dettaglio. Raccogliamo automaticamente informazioni sul browser.
        </p>
        <BugReportForm />
      </div>
    </div>
  );
}
