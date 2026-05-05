"use client";

import { useState, useTransition } from "react";
import { adminCreatePost } from "@/app/actions/admin";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { celebrate } from "@/lib/celebrate";

const CATEGORIES = ["Startup", "Ricerca", "Tecnologia", "Design", "Business", "Sociale", "Altro"];

export function AdminCreatePostForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ title: "", content: "", category: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.content.trim()) return;
    startTransition(async () => {
      await adminCreatePost(form);
      toast.success("Post pubblicato"); celebrate();
      setForm({ title: "", content: "", category: "" });
      router.push("/admin/posts");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-[11px] font-medium text-black/40 uppercase tracking-widest block mb-1.5">Titolo (opzionale)</label>
        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="Titolo del post..."
          className="w-full px-3 py-2.5 bg-black/3 border border-black/10 rounded-xl text-sm text-black placeholder:text-black/25 focus:outline-none focus:border-[var(--accent)]"
        />
      </div>
      <div>
        <label className="text-[11px] font-medium text-black/40 uppercase tracking-widest block mb-1.5">Contenuto *</label>
        <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          placeholder="Scrivi il contenuto..." rows={6} required
          className="w-full px-3 py-2.5 bg-black/3 border border-black/10 rounded-xl text-sm text-black placeholder:text-black/25 focus:outline-none focus:border-[var(--accent)] resize-none"
        />
      </div>
      <div>
        <label className="text-[11px] font-medium text-black/40 uppercase tracking-widest block mb-1.5">Categoria</label>
        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          className="w-full px-3 py-2.5 bg-black/3 border border-black/10 rounded-xl text-sm text-black focus:outline-none focus:border-[var(--accent)]"
        >
          <option value="">Nessuna categoria</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <button type="submit" disabled={isPending || !form.content.trim()}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-40"
        style={{ background: "#FB7141" }}>
        {isPending ? "Pubblicando..." : "Pubblica post"}
      </button>
    </form>
  );
}
