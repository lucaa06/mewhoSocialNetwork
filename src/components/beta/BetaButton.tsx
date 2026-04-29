"use client";

import { useState } from "react";
import { X, FlaskConical, Send, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const PRIORITIES = [
  { value: "low",      label: "Bassa",     color: "#D97706" },
  { value: "normal",   label: "Normale",   color: "#6D41FF" },
  { value: "high",     label: "Alta",      color: "#FF4A24" },
  { value: "critical", label: "Critica",   color: "#DC2626" },
] as const;

export function BetaButton({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "critical">("normal");
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    const sb = createClient();
    const { error } = await sb.from("beta_feedback").insert({
      user_id: userId,
      message: message.trim(),
      priority,
    });
    setSending(false);
    if (error) { toast.error("Errore nell'invio"); return; }
    toast.success("Feedback inviato!");
    setMessage("");
    setPriority("normal");
    setOpen(false);
  }

  const prioInfo = PRIORITIES.find(p => p.value === priority)!;

  return (
    <>
      {/* Floating beta button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all hover:scale-105"
        style={{ background: "linear-gradient(135deg,#6D41FF,#C84FD0)" }}
      >
        <FlaskConical className="w-3.5 h-3.5" />
        Beta
      </button>

      {/* Popup form */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed bottom-36 right-4 z-50 w-80 rounded-2xl overflow-hidden"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ background: "linear-gradient(135deg,#6D41FF,#C84FD0)", color: "white" }}
            >
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4" />
                <span className="text-sm font-bold">Beta Feedback</span>
              </div>
              <button onClick={() => setOpen(false)}>
                <X className="w-4 h-4 opacity-80" />
              </button>
            </div>

            <form onSubmit={submit} className="p-4 space-y-3">
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Descrivi cosa vorresti implementare o migliorare..."
                rows={4}
                className="w-full text-sm resize-none rounded-xl px-3 py-2.5 focus:outline-none"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--fg)",
                  fontFamily: "var(--fh)",
                }}
              />

              {/* Priority */}
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "var(--muted)" }}>Priorità:</span>
                <div className="flex gap-1">
                  {PRIORITIES.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      className="text-xs px-2 py-1 rounded-lg transition-all"
                      style={{
                        background: priority === p.value ? `${p.color}20` : "var(--surface)",
                        color: priority === p.value ? p.color : "var(--muted)",
                        border: `1px solid ${priority === p.value ? p.color : "var(--border)"}`,
                        fontWeight: priority === p.value ? 600 : 400,
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!message.trim() || sending}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
                style={{ background: "linear-gradient(135deg,#6D41FF,#C84FD0)" }}
              >
                <Send className="w-3.5 h-3.5" />
                {sending ? "Invio..." : "Invia feedback"}
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
}
