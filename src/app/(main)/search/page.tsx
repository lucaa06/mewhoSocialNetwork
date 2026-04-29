"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, X, User, Hash, Users2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getAvatarFallback } from "@/lib/utils";

interface Suggestion {
  type: "user" | "community";
  id: string;
  label: string;
  sublabel?: string;
  href: string;
  avatar_url?: string | null;
  avatar_emoji?: string | null;
  color?: string;
}

const ROLE_COLOR: Record<string, string> = {
  startupper: "#FF4A24",
  researcher: "#6D41FF",
  user: "#D97706",
  admin: "#374151",
};

export default function SearchPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return; }
    setLoading(true);
    const sb = createClient();
    const [{ data: people }, { data: communities }] = await Promise.all([
      sb.from("profiles")
        .select("id, username, display_name, avatar_url, avatar_emoji, role")
        .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
        .eq("is_banned", false)
        .is("deleted_at", null)
        .limit(6),
      sb.from("communities")
        .select("id, slug, name, avatar_url, avatar_emoji")
        .ilike("name", `%${q}%`)
        .eq("is_public", true)
        .limit(4),
    ]);

    const results: Suggestion[] = [];

    (people ?? []).forEach(p => results.push({
      type: "user",
      id: p.id,
      label: p.display_name,
      sublabel: `@${p.username}`,
      href: `/u/${p.username}`,
      avatar_url: p.avatar_url,
      avatar_emoji: p.avatar_emoji,
      color: ROLE_COLOR[p.role] ?? "#D97706",
    }));

    (communities ?? []).forEach(c => results.push({
      type: "community",
      id: c.id,
      label: c.name,
      sublabel: "Community",
      href: `/community/${c.slug}`,
      avatar_url: c.avatar_url,
      avatar_emoji: (c as { avatar_emoji?: string | null }).avatar_emoji,
    }));

    setSuggestions(results);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(() => fetchSuggestions(query.trim()), 220);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchSuggestions]);

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (q) router.push(`/explore?q=${encodeURIComponent(q)}`);
  }

  function handleSelect(href: string) {
    router.push(href);
  }

  return (
    <div className="space-y-0 -mt-2">
      {/* Header con back + input */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center squircle-sm transition-colors shrink-0"
          style={{ color: "var(--muted)", background: "var(--surface)", border: "1px solid var(--border)" }}
          aria-label="Indietro"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearch} className="flex-1">
          <div
            className="flex items-center gap-2 rounded-2xl px-3.5 py-2.5 transition-all"
            style={{
              background: "var(--card)",
              border: "1.5px solid var(--accent)",
              boxShadow: "0 0 0 3px var(--accent-soft)",
            }}
          >
            <Search className="w-4 h-4 shrink-0" style={{ color: "var(--accent)" }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Cerca persone, community, post…"
              className="flex-1 bg-transparent text-[15px] focus:outline-none"
              style={{ color: "var(--fg)" }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {query ? (
              <button
                type="button"
                onClick={() => { setQuery(""); setSuggestions([]); inputRef.current?.focus(); }}
                className="w-6 h-6 flex items-center justify-center rounded-full transition-colors"
                style={{ background: "var(--surface)", color: "var(--muted)" }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </form>
      </div>

      {/* Risultati */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div
              className="w-5 h-5 rounded-full border-2 animate-spin"
              style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }}
            />
          </div>
        )}

        {/* Placeholder vuoto */}
        {!loading && !query && (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--surface)" }}
            >
              <Search className="w-6 h-6" style={{ color: "var(--subtle)" }} />
            </div>
            <p className="text-sm" style={{ color: "var(--muted)" }}>Inizia a digitare per cercare</p>
            <div className="flex gap-2 mt-1">
              <span className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: "var(--surface)", color: "var(--subtle)" }}>
                <User className="w-3 h-3" /> Persone
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: "var(--surface)", color: "var(--subtle)" }}>
                <Users2 className="w-3 h-3" /> Community
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: "var(--surface)", color: "var(--subtle)" }}>
                <Hash className="w-3 h-3" /> Post
              </span>
            </div>
          </div>
        )}

        {/* Nessun risultato */}
        {!loading && query.length >= 2 && suggestions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <p className="text-sm font-medium" style={{ color: "var(--fg)" }}>Nessun risultato</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>per &ldquo;{query}&rdquo;</p>
          </div>
        )}

        {/* Suggerimenti */}
        {!loading && suggestions.length > 0 && (
          <div>
            {suggestions.map((s, i) => (
              <button
                key={s.id}
                onClick={() => handleSelect(s.href)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-black/4"
                style={{
                  borderBottom: i < suggestions.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 squircle flex items-center justify-center shrink-0 overflow-hidden"
                  style={{ background: s.color ? `${s.color}18` : "var(--surface)" }}
                >
                  {s.avatar_emoji ? (
                    <span style={{ fontSize: 20, lineHeight: 1 }}>{s.avatar_emoji}</span>
                  ) : s.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : s.type === "community" ? (
                    <Hash className="w-4 h-4" style={{ color: "var(--muted)" }} />
                  ) : (
                    <span className="text-sm font-bold" style={{ color: s.color ?? "var(--muted)" }}>
                      {getAvatarFallback(s.label)}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--fg)" }}>{s.label}</p>
                  {s.sublabel && (
                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--muted)" }}>{s.sublabel}</p>
                  )}
                </div>

                <div className="shrink-0" style={{ color: "var(--subtle)" }}>
                  {s.type === "user" && <User className="w-4 h-4" />}
                  {s.type === "community" && <Users2 className="w-4 h-4" />}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Footer — cerca tutto */}
        {query.length >= 1 && !loading && (
          <button
            onClick={() => handleSearch()}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold transition-colors"
            style={{
              borderTop: suggestions.length > 0 ? "1px solid var(--border)" : "none",
              background: "var(--accent-soft)",
              color: "var(--accent)",
            }}
          >
            <Search className="w-4 h-4 shrink-0" />
            Cerca &ldquo;{query}&rdquo; in tutti i post
          </button>
        )}
      </div>
    </div>
  );
}
