"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function ChangePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { toast.error("Le password non corrispondono"); return; }
    if (password.length < 8) { toast.error("Minimo 8 caratteri"); return; }
    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Password aggiornata"); setPassword(""); setConfirm(""); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <div>
        <label className="label-xs block mb-1.5">Nuova password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-base" />
      </div>
      <div>
        <label className="label-xs block mb-1.5">Conferma</label>
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="input-base" />
      </div>
      <button type="submit" disabled={loading}
        className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-black/85 disabled:opacity-40 transition-colors"
      >
        {loading ? "Aggiornando..." : "Aggiorna password"}
      </button>
    </form>
  );
}
