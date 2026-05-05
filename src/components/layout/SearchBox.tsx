"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, User, Hash } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { getAvatarFallback } from "@/lib/utils";

interface Suggestion {
  type: "user" | "community" | "tag";
  id: string;
  label: string;
  sublabel?: string;
  href: string;
  avatar_url?: string | null;
  avatar_emoji?: string | null;
  color?: string;
}

const ROLE_COLOR: Record<string, string> = {
  startupper: "#FB7141", researcher: "#6D41FF", user: "#D97706", admin: "#374151",
};

export function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return; }
    setLoading(true);
    const sb = createClient();
    const [{ data: people }, { data: communities }] = await Promise.all([
      sb.from("profiles")
        .select("id, username, display_name, avatar_url, avatar_emoji, role")
        .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
        .eq("is_banned", false).is("deleted_at", null).limit(4),
      sb.from("communities")
        .select("id, slug, name, avatar_url")
        .ilike("name", `%${q}%`).eq("is_public", true).limit(3),
    ]);

    const results: Suggestion[] = [];

    (people ?? []).forEach(p => results.push({
      type: "user", id: p.id,
      label: p.display_name, sublabel: `@${p.username}`,
      href: `/u/${p.username}`,
      avatar_url: p.avatar_url, avatar_emoji: p.avatar_emoji,
      color: ROLE_COLOR[p.role] ?? "#D97706",
    }));

    (communities ?? []).forEach(c => results.push({
      type: "community", id: c.id,
      label: c.name, sublabel: "Community",
      href: `/community/${c.slug}`,
      avatar_url: c.avatar_url,
    }));

    setSuggestions(results);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(() => fetchSuggestions(query.trim()), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchSuggestions]);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    setOpen(false);
    if (q) router.push(`/explore?q=${encodeURIComponent(q)}`);
    else router.push("/explore");
  }

  function handleSelect(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  const showDropdown = open && (query.length >= 2 || suggestions.length > 0);

  return (
    <div ref={boxRef} className="relative flex-1 max-w-xs hidden sm:block">
      <form onSubmit={handleSearch}>
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all"
          style={{
            background: "var(--surface)",
            border: `1px solid ${open ? "var(--accent)" : "var(--border)"}`,
            boxShadow: open ? "0 0 0 3px var(--accent-soft)" : "none",
          }}
        >
          <Search className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--subtle)" }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Cerca..."
            className="flex-1 bg-transparent text-sm focus:outline-none min-w-0"
            style={{ color: "var(--fg)", fontFamily: "var(--fh)" }}
          />
          {query && (
            <button type="button" onClick={() => { setQuery(""); setSuggestions([]); }} style={{ color: "var(--subtle)" }}>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="submit"
            className="shrink-0 w-6 h-6 flex items-center justify-center squircle-sm transition-colors"
            style={{ background: "var(--accent)", color: "white" }}
          >
            <Search className="w-3 h-3" />
          </button>
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-[60]"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}
        >
          {loading && (
            <div className="flex justify-center py-4">
              <div className="w-4 h-4 rounded-full border-2 animate-spin"
                style={{ borderColor: "var(--border)", borderTopColor: "#FB7141" }} />
            </div>
          )}

          {!loading && suggestions.length === 0 && query.length >= 2 && (
            <p className="text-sm text-center py-4 px-4" style={{ color: "var(--muted)" }}>
              Nessun risultato per &quot;{query}&quot;
            </p>
          )}

          {!loading && suggestions.length > 0 && (
            <div className="py-1">
              {suggestions.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSelect(s.href)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-black/3"
                >
                  {/* Avatar */}
                  <div
                    className="w-8 h-8 squircle-sm flex items-center justify-center shrink-0 overflow-hidden text-sm"
                    style={{ background: s.color ? `${s.color}18` : "var(--surface)" }}
                  >
                    {s.avatar_emoji ? (
                      <span style={{ fontSize: 16 }}>{s.avatar_emoji}</span>
                    ) : s.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : s.type === "community" ? (
                      <Hash className="w-4 h-4" style={{ color: "var(--muted)" }} />
                    ) : (
                      <span className="text-xs font-bold" style={{ color: s.color ?? "var(--muted)" }}>
                        {getAvatarFallback(s.label)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--fg)" }}>{s.label}</p>
                    {s.sublabel && <p className="text-xs truncate" style={{ color: "var(--muted)" }}>{s.sublabel}</p>}
                  </div>
                  <div className="ml-auto shrink-0">
                    {s.type === "user" && <User className="w-3.5 h-3.5" style={{ color: "var(--subtle)" }} />}
                    {s.type === "community" && <Hash className="w-3.5 h-3.5" style={{ color: "var(--subtle)" }} />}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Footer — search all */}
          {query.length >= 1 && (
            <button
              onClick={() => handleSearch()}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-t"
              style={{
                borderColor: "var(--border)",
                color: "var(--accent)",
                background: "var(--accent-soft)",
              }}
            >
              <Search className="w-4 h-4" />
              Cerca &quot;{query}&quot; in tutto me&amp;who
            </button>
          )}
        </div>
      )}
    </div>
  );
}
