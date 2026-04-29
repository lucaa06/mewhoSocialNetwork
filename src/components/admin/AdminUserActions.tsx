"use client";

import type { Profile } from "@/types/database";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminUserActions({
  profile,
  currentAdminId,
}: {
  profile: Profile;
  currentAdminId: string;
}) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const isSelf = profile.id === currentAdminId;

  async function performAction(action: string) {
    if (!reason.trim()) { toast.error("Inserisci un motivo"); return; }
    setLoading(action);
    const res = await fetch(`/api/admin/users/${profile.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });
    setLoading(null);
    if (!res.ok) { const d = await res.json(); toast.error(d.error ?? "Errore"); }
    else { toast.success("Azione eseguita"); setReason(""); router.refresh(); }
  }

  const actions = [
    { id: "remove_avatar",   label: "Rimuovi avatar",      danger: false, show: !!profile.avatar_url },
    { id: "verify_user",     label: "Verifica",             danger: false, show: !profile.is_verified },
    { id: profile.is_suspended ? "unsuspend_user" : "suspend_user",
      label: profile.is_suspended ? "Riattiva" : "Sospendi", danger: !profile.is_suspended,
      show: !profile.is_banned },
    { id: profile.is_banned ? "unban_user" : "ban_user",
      label: profile.is_banned ? "Rimuovi ban" : "Banna",   danger: true, show: true },
    // Beta tester — disabled when targeting self
    { id: (profile as Profile & { is_beta?: boolean }).is_beta ? "revoke_beta" : "assign_beta",
      label: (profile as Profile & { is_beta?: boolean }).is_beta ? "Revoca Beta" : "Assegna Beta",
      danger: false,
      show: !isSelf,
      beta: true,
    },
  ].filter(a => a.show);

  return (
    <div className="bg-white border border-black/6 rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-black mb-4">Azioni admin</h2>
      <div className="mb-4">
        <label className="block text-[11px] text-black/40 mb-1.5 uppercase tracking-widest font-medium">
          Motivo (obbligatorio)
        </label>
        <input
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Descrivi il motivo..."
          className="w-full px-3 py-2.5 bg-black/3 border border-black/10 rounded-xl text-sm text-black placeholder:text-black/25 focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map(({ id, label, danger, beta }) => (
          <button
            key={id}
            onClick={() => performAction(id)}
            disabled={loading === id}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40"
            style={
              beta
                ? { background: "rgba(109,65,255,0.08)", color: "#6D41FF" }
                : danger
                ? { background: "rgba(220,38,38,0.08)", color: "#dc2626" }
                : { background: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.7)" }
            }
          >
            {loading === id ? "..." : label}
          </button>
        ))}
      </div>
      {isSelf && (
        <p className="mt-3 text-[11px]" style={{ color: "rgba(0,0,0,0.35)" }}>
          Non puoi modificare il tuo stesso stato beta.
        </p>
      )}
    </div>
  );
}
