"use client";

import { useState } from "react";
import { X, Send, Users2, Rocket, FlaskConical, Palette, Code2, Globe, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { submitCommunityRequest } from "@/app/actions/community";

const CATEGORIES = [
  { value: "startup",  label: "Startup",   sublabel: "Imprenditoria",  icon: Rocket,        color: "#FF4A24", bg: "rgba(255,74,36,0.10)"   },
  { value: "research", label: "Ricerca",   sublabel: "Innovazione",    icon: FlaskConical,  color: "#6D41FF", bg: "rgba(109,65,255,0.10)"  },
  { value: "creative", label: "Creatività",sublabel: "Design & Arte",  icon: Palette,       color: "#C84FD0", bg: "rgba(200,79,208,0.10)"  },
  { value: "tech",     label: "Tech",      sublabel: "Sviluppo",       icon: Code2,         color: "#0EA5E9", bg: "rgba(14,165,233,0.10)"  },
  { value: "social",   label: "Sociale",   sublabel: "Impatto",        icon: Globe,         color: "#16A34A", bg: "rgba(22,163,74,0.10)"   },
  { value: "other",    label: "Altro",     sublabel: "Libero",         icon: Sparkles,      color: "#D97706", bg: "rgba(217,119,6,0.10)"   },
];

export function CommunityRequestButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-white transition-all"
        style={{ background: "linear-gradient(135deg,#FF4A24,#C84FD0)", boxShadow: "0 4px 16px rgba(255,74,36,0.30)" }}
      >
        <Users2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
        <span className="hidden sm:inline">Richiedi una community</span>
        <span className="sm:hidden">Richiedi</span>
      </button>

      {open && <CommunityRequestModal onClose={() => setOpen(false)} />}
    </>
  );
}

function CommunityRequestModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", category: "", reason: "" });

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await submitCommunityRequest(form);
    setLoading(false);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Richiesta inviata! La valuteremo presto 🚀");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-3xl p-6 space-y-5"
        style={{ background: "var(--card)", boxShadow: "var(--shadow-md)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--fg)", fontFamily: "var(--fh)" }}>
              Richiedi una community
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              Descrivici la community che vorresti creare
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors"
            style={{ background: "var(--surface)", color: "var(--muted)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="label-xs mb-1.5 block">Nome community</label>
            <input
              className="input-base"
              placeholder="Es. AI Founders Italia"
              value={form.name}
              onChange={set("name")}
              maxLength={60}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="label-xs mb-1.5 block">Categoria</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(({ value, label, sublabel, icon: Icon, color, bg }) => {
                const active = form.category === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: value }))}
                    className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2 transition-all"
                    style={{
                      borderColor: active ? color : "var(--border)",
                      background: active ? bg : "var(--surface)",
                      boxShadow: active ? `0 0 0 1px ${color}30` : "none",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: active ? bg : "var(--card)", color }}
                    >
                      <Icon className="w-4 h-4" strokeWidth={active ? 2.2 : 1.7} />
                    </div>
                    <span className="text-[11px] font-semibold leading-tight" style={{ color: active ? color : "var(--fg)" }}>{label}</span>
                    <span className="text-[10px] leading-tight" style={{ color: "var(--muted)" }}>{sublabel}</span>
                  </button>
                );
              })}
            </div>
            {/* hidden input for form validation */}
            <input type="text" className="sr-only" value={form.category} readOnly required tabIndex={-1} />
          </div>

          {/* Description */}
          <div>
            <label className="label-xs mb-1.5 block">Descrizione</label>
            <textarea
              className="input-base resize-none"
              rows={3}
              placeholder="Di cosa si occupa questa community?"
              value={form.description}
              onChange={set("description")}
              maxLength={500}
              required
            />
          </div>

          {/* Reason */}
          <div>
            <label className="label-xs mb-1.5 block">Perché questa community?</label>
            <textarea
              className="input-base resize-none"
              rows={2}
              placeholder="Motivazione e valore che porterebbe alla piattaforma..."
              value={form.reason}
              onChange={set("reason")}
              maxLength={500}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-all"
            style={{
              background: loading ? "#ccc" : "linear-gradient(135deg,#FF4A24,#C84FD0)",
              boxShadow: loading ? "none" : "0 4px 16px rgba(255,74,36,0.30)",
            }}
          >
            <Send className="w-4 h-4" />
            {loading ? "Invio in corso…" : "Invia richiesta"}
          </button>
        </form>
      </div>
    </div>
  );
}
