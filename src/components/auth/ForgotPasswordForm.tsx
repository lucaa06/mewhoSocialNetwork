"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/settings/security?reset=1`,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center mx-auto mb-3">
          <span className="text-white text-lg">@</span>
        </div>
        <p className="text-sm text-black/55">
          Se l&apos;email è registrata, riceverai un link per reimpostare la password.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label-xs block mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-base"
          placeholder="la-tua@email.com"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3"
      >
        {loading ? "Inviando..." : "Invia link di reset"}
      </button>
    </form>
  );
}
