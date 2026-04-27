"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export function TwoFactorForm() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { inputs.current[0]?.focus(); }, []);

  function handleChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...code];
    next[index] = value;
    setCode(next);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      inputs.current[5]?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const otp = code.join("");
    if (otp.length < 6) return;

    setLoading(true);
    const supabase = createClient();

    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const factor = factorsData?.totp?.[0];
    if (!factor) { toast.error("Nessun fattore 2FA trovato"); setLoading(false); return; }

    const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId: factor.id });
    if (challengeErr || !challenge) { toast.error("Errore durante la verifica"); setLoading(false); return; }

    const { error } = await supabase.auth.mfa.verify({ factorId: factor.id, challengeId: challenge.id, code: otp });
    setLoading(false);

    if (error) {
      toast.error("Codice non valido");
      setCode(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center gap-2 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-black/60" />
        </div>
        <p className="text-sm text-black/45 text-center">
          Inserisci il codice a 6 cifre dalla tua app di autenticazione
        </p>
      </div>

      <div className="flex justify-center gap-2" onPaste={handlePaste}>
        {code.map((digit, i) => (
          <input
            key={i}
            ref={el => { inputs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            className="w-11 h-14 text-center text-xl font-semibold rounded-xl border border-black/12 focus:border-black/40 focus:outline-none bg-white transition-colors"
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={loading || code.join("").length < 6}
        className="btn-primary w-full py-3"
      >
        {loading ? "Verifica..." : "Verifica"}
      </button>
    </form>
  );
}
