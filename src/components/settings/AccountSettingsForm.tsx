"use client";

import type { Profile } from "@/types/database";
import { toast } from "sonner";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AccountSettingsForm({ profile, email }: { profile: Profile | null; email: string }) {
  const [username, setUsername] = useState(profile?.username ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ username: username.toLowerCase().trim() }).eq("id", profile!.id);
    setLoading(false);
    if (error) toast.error(error.message.includes("unique") ? "Username già in uso" : error.message);
    else toast.success("Username aggiornato");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="label-xs mb-1.5">Email</p>
        <input value={email} disabled className="input-base opacity-40 cursor-not-allowed" />
        <p className="text-xs text-black/30 mt-1">Per cambiare email contatta il supporto.</p>
      </div>
      <div>
        <p className="label-xs mb-1.5">Username</p>
        <div className="flex gap-2">
          <input value={username} onChange={e => setUsername(e.target.value)} className="input-base flex-1" />
          <button onClick={handleSave} disabled={loading}
            className="px-4 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-black/85 disabled:opacity-40 transition-colors"
          >
            {loading ? "..." : "Salva"}
          </button>
        </div>
      </div>
    </div>
  );
}
