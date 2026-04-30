"use client";

import { useState, useTransition } from "react";
import { adminCreateCommunity } from "@/app/actions/admin";
import { toast } from "sonner";
import { celebrate } from "@/lib/celebrate";
import { Rocket, FlaskConical, Palette, Code2, Globe, Sparkles } from "lucide-react";

const CATEGORIES = [
  { value: "startup",  label: "Startup",    icon: Rocket,       color: "#FF4A24" },
  { value: "research", label: "Ricerca",    icon: FlaskConical, color: "#6D41FF" },
  { value: "creative", label: "Creatività", icon: Palette,      color: "#C84FD0" },
  { value: "tech",     label: "Tech",       icon: Code2,        color: "#0EA5E9" },
  { value: "social",   label: "Sociale",    icon: Globe,        color: "#16A34A" },
  { value: "other",    label: "Altro",      icon: Sparkles,     color: "#D97706" },
];

export function AdminCreateCommunity() {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ name: "", slug: "", description: "", category: "", is_public: true });

  function handleNameChange(name: string) {
    setForm(f => ({
      ...f,
      name,
      slug: f.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) return;
    if (!form.category) { toast.error("Seleziona una categoria"); return; }
    startTransition(async () => {
      await adminCreateCommunity(form);
      setForm({ name: "", slug: "", description: "", category: "", is_public: true });
      toast.success("Community creata"); celebrate();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="text-[11px] font-medium text-black/40 uppercase tracking-widest block mb-1.5">Nome</label>
          <input value={form.name} onChange={e => handleNameChange(e.target.value)}
            placeholder="Nome community" required
            className="w-full px-3 py-2.5 bg-black/3 border border-black/10 rounded-xl text-sm text-black placeholder:text-black/25 focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-black/40 uppercase tracking-widest block mb-1.5">Slug (URL)</label>
          <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
            placeholder="nome-community" required
            className="w-full px-3 py-2.5 bg-black/3 border border-black/10 rounded-xl text-sm text-black placeholder:text-black/25 focus:outline-none focus:border-[var(--accent)] font-mono"
          />
        </div>
      </div>

      {/* Category picker */}
      <div>
        <label className="text-[11px] font-medium text-black/40 uppercase tracking-widest block mb-2">
          Categoria <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {CATEGORIES.map(({ value, label, icon: Icon, color }) => {
            const active = form.category === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setForm(f => ({ ...f, category: value }))}
                className="flex items-center gap-1.5 px-2 py-2 rounded-xl border-2 transition-all text-left"
                style={{
                  borderColor: active ? color : "rgba(0,0,0,0.08)",
                  background: active ? `${color}12` : "rgba(0,0,0,0.02)",
                }}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} strokeWidth={active ? 2.2 : 1.7} />
                <span className="text-[11px] font-semibold" style={{ color: active ? color : "rgba(0,0,0,0.5)" }}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-[11px] font-medium text-black/40 uppercase tracking-widest block mb-1.5">Descrizione</label>
        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Descrizione della community..." rows={2}
          className="w-full px-3 py-2.5 bg-black/3 border border-black/10 rounded-xl text-sm text-black placeholder:text-black/25 focus:outline-none focus:border-[var(--accent)] resize-none"
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_public} onChange={e => setForm(f => ({ ...f, is_public: e.target.checked }))}
            className="w-4 h-4 rounded accent-[#FF4A24]" />
          <span className="text-sm text-black/50">Pubblica</span>
        </label>
        <button type="submit" disabled={isPending || !form.name.trim() || !form.category}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-40"
          style={{ background: "#FF4A24" }}>
          {isPending ? "Creando..." : "Crea community"}
        </button>
      </div>
    </form>
  );
}
