"use client";

import type { Profile } from "@/types/database";
import { toast } from "sonner";
import { useState } from "react";

export function AdminUserActions({ profile }: { profile: Profile }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

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
    else { toast.success("Azione eseguita"); setReason(""); }
  }

  const actions = [
    { id: "remove_avatar",   label: "Rimuovi avatar",  show: !!profile.avatar_url },
    { id: "verify_user",     label: "Verifica",         show: !profile.is_verified },
    { id: profile.is_suspended ? "unsuspend_user" : "suspend_user",
      label: profile.is_suspended ? "Riattiva" : "Sospendi", show: !profile.is_banned },
    { id: profile.is_banned ? "unban_user" : "ban_user",
      label: profile.is_banned ? "Rimuovi ban" : "Banna", show: true },
  ].filter(a => a.show);

  return (
    <div className="bg-[#0f0f0f] rounded-2xl border border-white/6 p-6">
      <h2 className="text-base font-semibold text-white mb-4">Azioni admin</h2>
      <div className="mb-4">
        <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Motivo (obbligatorio)</label>
        <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Descrivi il motivo..."
          className="w-full px-4 py-2.5 bg-white/5 border border-white/8 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map(({ id, label }) => (
          <button key={id} onClick={() => performAction(id)} disabled={loading === id}
            className="px-4 py-2 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90 disabled:opacity-40 transition-colors"
          >
            {loading === id ? "..." : label}
          </button>
        ))}
      </div>
    </div>
  );
}
