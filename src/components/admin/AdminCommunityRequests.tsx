"use client";

import { useState } from "react";
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { updateCommunityRequestStatus } from "@/app/actions/community";
import type { AdminRequest } from "@/app/admin/community/page";
import { useRouter } from "next/navigation";

const CATEGORY_LABEL: Record<string, string> = {
  startup:  "🚀 Startup",
  research: "🔬 Ricerca",
  creative: "🎨 Creatività",
  tech:     "💻 Tech",
  social:   "🌍 Sociale",
  other:    "✨ Altro",
};

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: "In attesa",  color: "#D97706", bg: "rgba(217,119,6,0.10)"  },
  approved: { label: "Approvata",  color: "#16a34a", bg: "rgba(22,163,74,0.10)"  },
  rejected: { label: "Rifiutata",  color: "#dc2626", bg: "rgba(220,38,38,0.10)"  },
};

export function AdminCommunityRequests({ request, readOnly }: { request: AdminRequest; readOnly?: boolean }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(!readOnly);
  const [notes, setNotes]       = useState(request.admin_notes ?? "");
  const [loading, setLoading]   = useState(false);

  const status = STATUS_STYLE[request.status] ?? STATUS_STYLE.pending;

  async function handle(newStatus: "approved" | "rejected") {
    setLoading(true);
    const result = await updateCommunityRequestStatus(request.id, newStatus, notes || undefined);
    setLoading(false);
    if (result.error) { toast.error(result.error); return; }
    toast.success(newStatus === "approved" ? "Richiesta approvata" : "Richiesta rifiutata");
    router.refresh();
  }

  return (
    <div className="bg-white border border-black/6 rounded-2xl overflow-hidden">
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-black/2 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-black">{request.name}</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: status.bg, color: status.color }}>
              {status.label}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 text-black/40">
              {CATEGORY_LABEL[request.category] ?? request.category}
            </span>
          </div>
          <p className="text-xs text-black/35 mt-0.5">
            da @{Array.isArray(request.user) ? request.user[0]?.username : request.user?.username ?? "?"} · {new Date(request.created_at).toLocaleDateString("it-IT")}
          </p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-black/30 shrink-0" /> : <ChevronDown className="w-4 h-4 text-black/30 shrink-0" />}
      </button>

      {/* Detail */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-black/4">
          <div className="mt-3 space-y-2">
            <Detail label="Descrizione" text={request.description} />
            <Detail label="Motivazione" text={request.reason} />
          </div>

          {!readOnly && (
            <>
              <div>
                <label className="text-[11px] font-semibold text-black/35 uppercase tracking-widest block mb-1">
                  Note admin (opzionale)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Motivo approvazione/rifiuto..."
                  className="w-full text-sm px-3 py-2 rounded-xl resize-none"
                  style={{ border: "1px solid rgba(0,0,0,0.10)", background: "#f7f7f5", color: "black" }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handle("approved")}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{ background: "#16a34a", opacity: loading ? 0.6 : 1 }}
                >
                  <Check className="w-4 h-4" /> Approva
                </button>
                <button
                  onClick={() => handle("rejected")}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{ background: "#dc2626", opacity: loading ? 0.6 : 1 }}
                >
                  <X className="w-4 h-4" /> Rifiuta
                </button>
              </div>
            </>
          )}

          {readOnly && request.admin_notes && (
            <Detail label="Note admin" text={request.admin_notes} />
          )}
        </div>
      )}
    </div>
  );
}

function Detail({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-black/30 mb-0.5">{label}</p>
      <p className="text-sm text-black/70 leading-relaxed">{text}</p>
    </div>
  );
}
