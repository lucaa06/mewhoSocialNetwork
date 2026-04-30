"use client";

import { useState } from "react";
import { toast } from "sonner";

interface AdminPasswordResetProps {
  userId: string;
  email: string | null;
}

export function AdminPasswordReset({ userId, email }: AdminPasswordResetProps) {
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error ?? "Errore durante l'invio del link.");
        return;
      }
      toast.success(`Link inviato a ${email}!`);
    } catch {
      toast.error("Errore di rete. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-black/6 rounded-2xl p-5">
      <p className="text-[11px] font-semibold text-black/35 uppercase tracking-widest mb-1">
        Assistenza password
      </p>
      <p className="text-sm text-black/50 mb-4">
        Invia un link di reset password all&apos;utente via email.
      </p>
      {email ? (
        <button
          onClick={handleReset}
          disabled={loading}
          className="text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "rgba(109,65,255,0.08)", color: "#6D41FF" }}
        >
          {loading ? "Invio in corso…" : "Invia reset password"}
        </button>
      ) : (
        <button
          disabled
          className="text-sm font-semibold px-4 py-2 rounded-xl opacity-40 cursor-not-allowed"
          style={{ background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.4)" }}
        >
          Email non disponibile
        </button>
      )}
    </div>
  );
}
