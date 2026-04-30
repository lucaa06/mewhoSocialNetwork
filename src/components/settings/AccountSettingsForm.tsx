"use client";

import type { Profile } from "@/types/database";
import { toast } from "sonner";
import { useState } from "react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { Sun, Moon, Monitor, HeadphonesIcon, X, Send } from "lucide-react";
import { celebrate } from "@/lib/celebrate";

const THEMES = [
  { value: "light", label: "Chiaro",    icon: Sun     },
  { value: "dark",  label: "Scuro",     icon: Moon    },
  { value: "system",label: "Sistema",   icon: Monitor },
] as const;

export function AccountSettingsForm({ profile, email }: { profile: Profile | null; email: string }) {
  const [username, setUsername]       = useState(profile?.username ?? "");
  const [loading, setLoading]         = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [newEmail, setNewEmail]       = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const { theme, setTheme } = useTheme();

  async function handleEmailChange() {
    if (!newEmail || !newEmail.includes("@")) { toast.error("Inserisci un'email valida"); return; }
    if (newEmail === email) { toast.error("È già la tua email attuale"); return; }
    setEmailSending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setEmailSending(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Controlla la tua nuova email per confermare il cambio!");
    setShowEmailForm(false);
    setNewEmail("");
  }

  async function handleSave() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ username: username.toLowerCase().trim() }).eq("id", profile!.id);
    setLoading(false);
    if (error) toast.error(error.message.includes("unique") ? "Username già in uso" : error.message);
    else { toast.success("Username aggiornato"); celebrate(); }
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div>
        <p className="label-xs mb-1.5">Email</p>
        <input value={email} disabled className="input-base opacity-40 cursor-not-allowed" />

        {!showEmailForm ? (
          <div className="flex items-center gap-2 mt-1.5">
            <p className="text-xs" style={{ color: "var(--subtle)" }}>Per cambiare email contatta il supporto.</p>
            <button
              type="button"
              onClick={() => setShowEmailForm(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all hover:scale-105 active:scale-95"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              <HeadphonesIcon className="w-3 h-3" />
              Supporto
            </button>
          </div>
        ) : (
          <div className="mt-2 p-3 rounded-2xl space-y-2" style={{ background: "var(--surface)", border: "1.5px solid var(--accent)" }}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold" style={{ color: "var(--accent)" }}>Richiedi cambio email</p>
              <button type="button" onClick={() => { setShowEmailForm(false); setNewEmail(""); }}
                className="w-5 h-5 flex items-center justify-center rounded-full transition-colors"
                style={{ color: "var(--muted)" }}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleEmailChange()}
              placeholder="Nuova email…"
              className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
              style={{ background: "var(--card)", border: "1.5px solid var(--border)", color: "var(--fg)" }}
            />
            <button
              type="button"
              onClick={handleEmailChange}
              disabled={emailSending || !newEmail}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
              style={{ background: "var(--accent)", color: "white" }}
            >
              <Send className="w-3.5 h-3.5" />
              {emailSending ? "Invio…" : "Invia richiesta"}
            </button>
            <p className="text-[11px] text-center" style={{ color: "var(--subtle)" }}>
              Riceverai un link di conferma alla nuova email.
            </p>
          </div>
        )}
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

      <div>
        <p className="label-xs mb-3">Tema</p>
        <div className="grid grid-cols-3 gap-1.5">
          {THEMES.map(({ value, label, icon: Icon }) => {
            const active = theme === value;
            return (
              <button key={value} type="button" onClick={() => setTheme(value)}
                className="flex flex-col items-center gap-2 p-2 sm:p-4 rounded-2xl border-2 transition-all"
                style={{
                  borderColor: active ? "var(--accent)" : "var(--border-strong)",
                  background: active ? "var(--accent-soft)" : "var(--card)",
                }}
              >
                <Icon className="w-5 h-5" strokeWidth={1.8}
                  style={{ color: active ? "var(--accent)" : "var(--muted)" }}
                />
                <span className="text-xs font-medium"
                  style={{ color: active ? "var(--accent)" : "var(--muted)" }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
