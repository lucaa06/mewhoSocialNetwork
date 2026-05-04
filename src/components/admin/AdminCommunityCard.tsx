"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Check, X, AlertTriangle, Loader2, Globe, Lock } from "lucide-react";
import { toast } from "sonner";

interface Community {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  is_public: boolean;
}

const CATEGORY_COLOR: Record<string, string> = {
  startup: "#FF4A24", research: "#6D41FF", creative: "#C84FD0",
  tech: "#0EA5E9", social: "#16A34A", other: "#D97706",
};
const CATEGORY_LABEL: Record<string, string> = {
  startup: "Startup", research: "Ricerca", creative: "Creatività",
  tech: "Tech", social: "Sociale", other: "Altro",
};

export function AdminCommunityCard({ community }: { community: Community }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState(community.name);
  const [description, setDescription] = useState(community.description ?? "");
  const [emoji, setEmoji] = useState("");

  const color = CATEGORY_COLOR[community.category ?? "other"] ?? "#6b7280";

  async function handleSave() {
    if (!name.trim()) { toast.error("Il nome è obbligatorio"); return; }
    setSaving(true);
    const res = await fetch(`/api/admin/community/${community.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
    });
    setSaving(false);
    if (!res.ok) { const d = await res.json(); toast.error(d.error ?? "Errore"); return; }
    toast.success("Community aggiornata");
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/admin/community/${community.id}`, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) { const d = await res.json(); toast.error(d.error ?? "Errore eliminazione"); return; }
    toast.success(`"${community.name}" eliminata`);
    router.refresh();
  }

  function handleCancel() {
    setName(community.name);
    setDescription(community.description ?? "");
    setEmoji("");
    setEditing(false);
    setConfirmDelete(false);
  }

  if (editing) {
    return (
      <div className="px-5 py-4 bg-black/[0.015] border-b border-black/5 last:border-0">
        <div className="space-y-3">
          {/* Name */}
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nome community"
            className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-sm text-black focus:outline-none focus:border-[#FF4A24]"
          />
          {/* Description */}
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descrizione (opzionale)"
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-sm text-black resize-none focus:outline-none focus:border-[#FF4A24]"
          />
          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white"
              style={{ background: "#FF4A24", opacity: saving ? 0.6 : 1 }}
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Salva
            </button>
            <button onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-black/50 hover:bg-black/5">
              <X className="w-3.5 h-3.5" /> Annulla
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-black/[0.015] transition-colors border-b border-black/5 last:border-0">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg font-bold"
        style={{ background: `${color}18`, color }}>
        {community.name[0]?.toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-black truncate">{community.name}</p>
          {community.category && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ background: `${color}15`, color }}>
              {CATEGORY_LABEL[community.category] ?? community.category}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-black/35 font-mono">/{community.slug}</span>
          <span className="text-black/20">·</span>
          <span className="flex items-center gap-1 text-xs text-black/35">
            {community.is_public ? <><Globe className="w-3 h-3" />Pubblica</> : <><Lock className="w-3 h-3" />Privata</>}
          </span>
          {community.description && (
            <span className="text-xs text-black/30 truncate max-w-[160px]">{community.description}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => { setEditing(true); setConfirmDelete(false); }}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 transition-colors"
          title="Modifica">
          <Pencil className="w-3.5 h-3.5 text-blue-400" />
        </button>

        {confirmDelete ? (
          <div className="flex items-center gap-1.5 ml-1">
            <span className="text-[11px] text-red-500 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />Sicuro?
            </span>
            <button onClick={handleDelete} disabled={deleting}
              className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-red-600 text-white disabled:opacity-40">
              {deleting ? "…" : "Sì"}
            </button>
            <button onClick={() => setConfirmDelete(false)}
              className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/5">
              <X className="w-3 h-3 text-black/40" />
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
            title="Elimina">
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        )}
      </div>
    </div>
  );
}
