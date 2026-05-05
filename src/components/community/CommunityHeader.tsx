"use client";

import { useState } from "react";
import { Pencil, Check, X, Rocket, FlaskConical, Palette, Code2, Globe, Sparkles, Users2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";

const CATEGORIES: { value: string; label: string; icon: LucideIcon; color: string; bg: string }[] = [
  { value: "startup",  label: "Startup",    icon: Rocket,       color: "#FB7141", bg: "rgba(251,113,65,0.15)"  },
  { value: "research", label: "Ricerca",    icon: FlaskConical, color: "#6D41FF", bg: "rgba(109,65,255,0.15)" },
  { value: "creative", label: "Creatività", icon: Palette,      color: "#C84FD0", bg: "rgba(200,79,208,0.15)" },
  { value: "tech",     label: "Tech",       icon: Code2,        color: "#0EA5E9", bg: "rgba(14,165,233,0.15)" },
  { value: "social",   label: "Sociale",    icon: Globe,        color: "#16A34A", bg: "rgba(22,163,74,0.15)"  },
  { value: "other",    label: "Altro",      icon: Sparkles,     color: "#D97706", bg: "rgba(217,119,6,0.15)"  },
];

const EMOJI_SUGGESTIONS = [
  "🚀","💡","🔬","🎨","💻","⚡","🌍","🤝","📊","🎯",
  "🏆","🌟","✨","🔥","💎","🧪","🌱","🎭","🎵","📚",
  "🏗️","🎲","🦋","🌊","🏔️","🎪","🦁","🐉","🎸","🌈",
];

interface Props {
  communityId: string;
  name: string;
  description: string | null;
  category: string | null;
  avatarEmoji: string | null;
  isCreator: boolean;
}

export function CommunityHeader({ communityId, name, description, category, avatarEmoji, isCreator }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);

  // live display values (updated on successful save)
  const [displayName,        setDisplayName]        = useState(name);
  const [displayDescription, setDisplayDescription] = useState(description);
  const [displayCategory,    setDisplayCategory]    = useState(category);
  const [displayEmoji,       setDisplayEmoji]       = useState(avatarEmoji ?? "");

  // edit form values
  const [editName,        setEditName]        = useState(name);
  const [editDescription, setEditDescription] = useState(description ?? "");
  const [editCategory,    setEditCategory]    = useState(category ?? "");
  const [editEmoji,       setEditEmoji]       = useState(avatarEmoji ?? "");

  const cat    = displayCategory ? CATEGORIES.find(c => c.value === displayCategory) ?? null : null;
  const CatIcon = cat?.icon ?? Users2;

  function openEdit() {
    setEditName(displayName);
    setEditDescription(displayDescription ?? "");
    setEditCategory(displayCategory ?? "");
    setEditEmoji(displayEmoji);
    setEditing(true);
  }

  async function save() {
    if (!editName.trim()) { toast.error("Il nome è obbligatorio"); return; }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("communities")
      .update({
        name:         editName.trim(),
        description:  editDescription.trim() || null,
        category:     editCategory || null,
        avatar_emoji: editEmoji.trim() || null,
      })
      .eq("id", communityId);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setDisplayName(editName.trim());
    setDisplayDescription(editDescription.trim() || null);
    setDisplayCategory(editCategory || null);
    setDisplayEmoji(editEmoji.trim());
    setEditing(false);
    toast.success("Community aggiornata!");
    router.refresh();
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="flex items-start gap-4">

        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl overflow-hidden"
            style={{
              background: displayEmoji ? "var(--surface)" : (cat?.bg ?? "linear-gradient(135deg,#FB7141,#1E386C)"),
              border: "2px solid var(--border)",
            }}
          >
            {displayEmoji
              ? <span style={{ lineHeight: 1 }}>{displayEmoji}</span>
              : <CatIcon className="w-6 h-6" style={{ color: cat ? cat.color : "white" }} />
            }
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold" style={{ color: "var(--fg)", fontFamily: "var(--fh)" }}>
              {displayName}
            </h1>
            {cat && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: cat.bg, color: cat.color }}>
                <CatIcon className="inline w-3 h-3 mr-1" />
                {displayCategory}
              </span>
            )}
          </div>
          {displayDescription && (
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{displayDescription}</p>
          )}
        </div>

        {/* Edit button for creator */}
        {isCreator && !editing && (
          <button
            type="button"
            onClick={openEdit}
            className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-black/6"
            style={{ color: "var(--muted)" }}
            title="Modifica community"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Full edit panel */}
      {editing && (
        <div className="mt-4 pt-4 border-t space-y-4" style={{ borderColor: "var(--border)" }}>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Nome community *
            </label>
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              maxLength={60}
              className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
              style={{ background: "var(--surface)", border: "1.5px solid var(--border)", color: "var(--fg)" }}
              placeholder="Nome della community"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Descrizione
            </label>
            <textarea
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              rows={3}
              maxLength={300}
              className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all resize-none"
              style={{ background: "var(--surface)", border: "1.5px solid var(--border)", color: "var(--fg)" }}
              placeholder="Descrivi la tua community…"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Categoria
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setEditCategory("")}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: !editCategory ? "var(--fg)" : "var(--surface)",
                  color: !editCategory ? "var(--bg)" : "var(--muted)",
                  border: "1px solid var(--border)",
                }}
              >
                Nessuna
              </button>
              {CATEGORIES.map(({ value, label, icon: Icon, color }) => {
                const active = editCategory === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setEditCategory(active ? "" : value)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{
                      background: active ? `${color}18` : "var(--surface)",
                      color: active ? color : "var(--muted)",
                      border: `1px solid ${active ? `${color}40` : "var(--border)"}`,
                    }}
                  >
                    <Icon className="w-3 h-3" strokeWidth={active ? 2.2 : 1.7} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Emoji */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Emoji icona
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_SUGGESTIONS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEditEmoji(e)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all hover:scale-110 active:scale-95"
                  style={{
                    background: editEmoji === e ? "var(--accent-soft)" : "var(--surface)",
                    border: `1.5px solid ${editEmoji === e ? "var(--accent)" : "transparent"}`,
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <input
                value={editEmoji}
                onChange={e => setEditEmoji(e.target.value)}
                placeholder="Oppure scrivi un'emoji…"
                maxLength={4}
                className="flex-1 px-3 py-2 rounded-xl text-sm focus:outline-none"
                style={{ border: "1.5px solid var(--border)", background: "var(--surface)", color: "var(--fg)" }}
              />
              {editEmoji && (
                <button
                  type="button"
                  onClick={() => setEditEmoji("")}
                  className="text-xs transition-colors whitespace-nowrap"
                  style={{ color: "var(--muted)" }}
                >
                  Rimuovi
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={save}
              disabled={saving || !editName.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: "var(--accent)" }}
            >
              <Check className="w-4 h-4" />
              {saving ? "Salvataggio…" : "Salva modifiche"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all"
              style={{ background: "var(--surface)", color: "var(--muted)" }}
            >
              <X className="w-4 h-4" />
              Annulla
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
