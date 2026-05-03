"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Sparkles, User, AtSign, ArrowRight, Loader2 } from "lucide-react";
import { celebrate } from "@/lib/celebrate";

export function OnboardingForm({
  userId,
  prefillName,
  next,
}: {
  userId: string;
  prefillName: string;
  next: string;
}) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(() => {
    const parts = prefillName.trim().split(" ");
    return parts[0] ?? "";
  });
  const [lastName, setLastName] = useState(() => {
    const parts = prefillName.trim().split(" ");
    return parts.slice(1).join(" ");
  });
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const displayName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");

  function sanitizeUsername(v: string) {
    return v.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 28);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim()) { toast.error("Inserisci il tuo nome"); return; }
    if (!username.trim()) { toast.error("Scegli un username"); return; }
    if (username.length < 3) { toast.error("Username troppo corto (min 3 caratteri)"); return; }

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({ username, display_name: displayName || username })
      .eq("id", userId);

    setLoading(false);

    if (error) {
      if (error.message.includes("unique") || error.message.includes("duplicate")) {
        toast.error("Username già in uso, scegline un altro");
      } else {
        toast.error(error.message);
      }
      return;
    }

    celebrate();
    router.replace(next || "/");
  }

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)" }}>
          <Sparkles className="w-8 h-8" style={{ color: "var(--accent)" }} />
        </div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--fg)", fontFamily: "var(--fh)" }}>
          Benvenuto su me&who!
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Completa il tuo profilo per iniziare
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome + Cognome */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-xs mb-1.5 block">Nome *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: "var(--muted)" }} />
              <input
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Luca"
                className="input-base pl-9"
                autoComplete="given-name"
                autoFocus
              />
            </div>
          </div>
          <div>
            <label className="label-xs mb-1.5 block">Cognome</label>
            <input
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Rossi"
              className="input-base"
              autoComplete="family-name"
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="label-xs mb-1.5 block">Username *</label>
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: "var(--muted)" }} />
            <input
              value={username}
              onChange={e => setUsername(sanitizeUsername(e.target.value))}
              placeholder="luca_rossi"
              className="input-base pl-9 font-mono"
              autoComplete="username"
              maxLength={28}
            />
          </div>
          <p className="text-[11px] mt-1" style={{ color: "var(--subtle)" }}>
            Solo lettere minuscole, numeri e underscore. Non potrai cambiarlo facilmente.
          </p>
        </div>

        {/* Preview */}
        {(displayName || username) && (
          <div className="flex items-center gap-3 p-3 rounded-2xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
              {(displayName || username)[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
                {displayName || username}
              </p>
              {username && (
                <p className="text-xs" style={{ color: "var(--muted)" }}>@{username}</p>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !firstName.trim() || !username.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all disabled:opacity-40 mt-2"
          style={{ background: "var(--accent)", color: "white" }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Inizia a esplorare
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
