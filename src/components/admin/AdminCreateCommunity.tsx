"use client";

import { useState, useTransition } from "react";
import { adminCreateCommunity } from "@/app/actions/admin";
import { toast } from "sonner";

export function AdminCreateCommunity() {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ name: "", slug: "", description: "", is_public: true });

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
    startTransition(async () => {
      await adminCreateCommunity(form);
      setForm({ name: "", slug: "", description: "", is_public: true });
      toast.success("Community creata");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
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
            className="w-4 h-4 rounded accent-[#DD4132]" />
          <span className="text-sm text-black/50">Pubblica</span>
        </label>
        <button type="submit" disabled={isPending || !form.name.trim()}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-40"
          style={{ background: "#DD4132" }}>
          {isPending ? "Creando..." : "Crea community"}
        </button>
      </div>
    </form>
  );
}
