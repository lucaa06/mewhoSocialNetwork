"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { celebrate } from "@/lib/celebrate";
import { Send } from "lucide-react";

export function CommunityPostForm({ communityId, communityName }: { communityId: string; communityName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { error } = await supabase.from("posts").insert({
      author_id: user.id,
      community_id: communityId,
      title: title.trim() || null,
      content: content.trim(),
      visibility: "public",
      tags: [],
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Post pubblicato nella community!");
    celebrate();
    setTitle(""); setContent(""); setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-dashed text-sm font-medium transition-all hover:border-solid"
        style={{ borderColor: "var(--border)", color: "var(--muted)", background: "var(--card)" }}
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--surface)" }}>
          <Send className="w-3.5 h-3.5" />
        </div>
        Scrivi qualcosa in <span className="font-semibold" style={{ color: "var(--fg)" }}>{communityName}</span>…
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border p-4 space-y-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Titolo (opzionale)"
        maxLength={120}
        className="input-base text-sm"
      />
      <div>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={`Condividi qualcosa con la community…`}
          rows={4}
          maxLength={5000}
          required
          autoFocus
          className="input-base resize-none text-sm"
        />
        <p className="text-right text-xs mt-1" style={{ color: "var(--subtle)" }}>{content.length}/5000</p>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => { setOpen(false); setTitle(""); setContent(""); }}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{ color: "var(--muted)", background: "var(--surface)" }}
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
          style={{ background: "#FF4A24", boxShadow: "0 2px 10px rgba(255,74,36,0.30)" }}
        >
          <Send className="w-3.5 h-3.5" />
          {loading ? "Pubblicando…" : "Pubblica"}
        </button>
      </div>
    </form>
  );
}
