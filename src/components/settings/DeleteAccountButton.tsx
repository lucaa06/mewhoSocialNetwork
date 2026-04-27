"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function DeleteAccountButton({ className }: { className?: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const res = await fetch("/api/account/delete", { method: "POST" });
    setLoading(false);
    if (!res.ok) { toast.error("Errore durante la cancellazione"); return; }
    await createClient().auth.signOut();
    window.location.href = "/";
  }

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)}
        className={cn("px-4 py-2 border border-black/12 text-black/45 hover:text-black hover:border-black/25 rounded-xl text-sm transition-colors", className)}
      >
        Elimina account
      </button>
    );
  }

  return (
    <div className={cn("border border-black/8 rounded-xl p-4 space-y-3 bg-black/2", className)}>
      <p className="text-sm text-black/60">Sei sicuro? Questa azione è irreversibile dopo 30 giorni.</p>
      <div className="flex gap-2">
        <button onClick={handleDelete} disabled={loading}
          className="px-4 py-2 bg-black text-white rounded-xl text-sm font-semibold hover:bg-black/85 disabled:opacity-40 transition-colors"
        >
          {loading ? "Eliminando..." : "Sì, elimina"}
        </button>
        <button onClick={() => setConfirming(false)}
          className="px-4 py-2 border border-black/10 text-black/45 hover:text-black rounded-xl text-sm transition-colors"
        >
          Annulla
        </button>
      </div>
    </div>
  );
}
