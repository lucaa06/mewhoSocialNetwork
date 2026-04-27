"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff, QrCode, Check } from "lucide-react";
import Image from "next/image";

interface MfaSectionProps {
  isEnrolled: boolean;
  factorId?: string;
}

export function MfaSection({ isEnrolled: initialEnrolled, factorId: initialFactorId }: MfaSectionProps) {
  const [enrolled, setEnrolled] = useState(initialEnrolled);
  const [factorId, setFactorId] = useState(initialFactorId);
  const [step, setStep] = useState<"idle" | "qr" | "verify">("idle");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [enrollId, setEnrollId] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function startEnroll() {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", issuer: "me&who", friendlyName: "Authenticator" });
    setLoading(false);
    if (error || !data) { toast.error("Errore durante la configurazione"); return; }
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setEnrollId(data.id);
    const { data: challenge, error: chErr } = await supabase.auth.mfa.challenge({ factorId: data.id });
    if (chErr || !challenge) { toast.error("Errore durante la configurazione"); return; }
    setChallengeId(challenge.id);
    setStep("qr");
  }

  async function confirmEnroll() {
    if (code.length < 6) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.mfa.verify({ factorId: enrollId, challengeId, code });
    setLoading(false);
    if (error) { toast.error("Codice non valido, riprova"); setCode(""); return; }
    setEnrolled(true);
    setFactorId(enrollId);
    setStep("idle");
    toast.success("Autenticazione a due fattori attivata");
  }

  async function handleUnenroll() {
    if (!factorId) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    setLoading(false);
    if (error) { toast.error("Errore durante la disattivazione"); return; }
    setEnrolled(false);
    setFactorId(undefined);
    toast.success("Autenticazione a due fattori disattivata");
  }

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${enrolled ? "bg-black text-white" : "bg-black/6 text-black/40"}`}>
            {enrolled ? <ShieldCheck className="w-5 h-5" /> : <ShieldOff className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-black">Autenticazione a due fattori</p>
            <p className="text-xs text-black/40 mt-0.5">
              {enrolled ? "Attiva — il tuo account è protetto" : "Non attiva — consigliato per maggiore sicurezza"}
            </p>
          </div>
        </div>
        {step === "idle" && (
          enrolled ? (
            <button
              onClick={handleUnenroll}
              disabled={loading}
              className="text-xs font-medium text-black/40 hover:text-red-500 transition-colors disabled:opacity-40 shrink-0"
            >
              Disattiva
            </button>
          ) : (
            <button
              onClick={startEnroll}
              disabled={loading}
              className="btn-primary px-4 py-2 text-sm shrink-0"
            >
              {loading ? "..." : "Attiva"}
            </button>
          )
        )}
      </div>

      {step === "qr" && (
        <div className="border-t border-black/6 pt-4 space-y-4">
          <p className="text-sm text-black/60">
            Scansiona il QR code con la tua app di autenticazione (Google Authenticator, Authy, ecc.)
          </p>
          <div className="flex justify-center">
            {qrCode && (
              <Image src={qrCode} alt="QR Code 2FA" width={160} height={160} className="rounded-xl border border-black/8" />
            )}
          </div>
          <details className="text-center">
            <summary className="text-xs text-black/30 cursor-pointer hover:text-black/50 transition-colors">
              Non riesci a scansionare? Inserisci il codice manualmente
            </summary>
            <p className="mt-2 text-xs font-mono text-black/60 bg-black/3 rounded-xl px-4 py-3 break-all select-all">{secret}</p>
          </details>
          <div>
            <label className="block text-[11px] font-medium text-black/40 mb-1.5 uppercase tracking-widest">
              Codice di verifica
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="input-base text-center text-lg tracking-[0.4em] font-semibold"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setStep("idle"); setCode(""); }}
              className="btn-secondary flex-1 py-2.5 text-sm"
            >
              Annulla
            </button>
            <button
              onClick={confirmEnroll}
              disabled={loading || code.length < 6}
              className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              {loading ? "Verifica..." : <><Check className="w-4 h-4" />Conferma</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
