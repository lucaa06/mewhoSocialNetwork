"use client";

import { useTransition } from "react";
import { adminResolveReport, adminDismissReport } from "@/app/actions/admin";
import { Check, X } from "lucide-react";

export function AdminReportActions({ reportId }: { reportId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2 shrink-0">
      <button onClick={() => startTransition(() => adminResolveReport(reportId))} disabled={isPending}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-100 rounded-xl text-xs font-medium transition-colors disabled:opacity-40">
        <Check className="w-3.5 h-3.5" /> Risolvi
      </button>
      <button onClick={() => startTransition(() => adminDismissReport(reportId))} disabled={isPending}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-black/4 hover:bg-black/8 text-black/50 rounded-xl text-xs font-medium transition-colors disabled:opacity-40">
        <X className="w-3.5 h-3.5" /> Ignora
      </button>
    </div>
  );
}
