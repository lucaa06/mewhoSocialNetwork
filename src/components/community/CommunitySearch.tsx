"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, X, Rocket, FlaskConical, Palette, Code2, Globe, Sparkles, Users2 } from "lucide-react";

const CATEGORIES = [
  { value: "startup",  label: "Startup",    icon: Rocket,       color: "#FB7141" },
  { value: "research", label: "Ricerca",    icon: FlaskConical, color: "#6D41FF" },
  { value: "creative", label: "Creatività", icon: Palette,      color: "#C84FD0" },
  { value: "tech",     label: "Tech",       icon: Code2,        color: "#0EA5E9" },
  { value: "social",   label: "Sociale",    icon: Globe,        color: "#16A34A" },
  { value: "other",    label: "Altro",      icon: Sparkles,     color: "#D97706" },
];

interface Community {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  avatar_emoji?: string | null;
}

export function CommunitySearch({ communities }: { communities: Community[] }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return communities
      .filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [communities, query]);

  const filtered = useMemo(() => {
    return communities.filter(c => {
      const matchesQuery = !query || c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.description?.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = !activeCategory || c.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [communities, query, activeCategory]);

  return (
    <div className="space-y-3">
      {/* Search input with autocomplete dropdown */}
      <div className="relative" ref={containerRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--subtle)" }} />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setShowDropdown(true); }}
          onFocus={() => { if (query.trim()) setShowDropdown(true); }}
          placeholder="Cerca community…"
          className="w-full pl-9 pr-9 py-2.5 rounded-2xl text-sm transition-all focus:outline-none"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--fg)",
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setShowDropdown(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full transition-colors"
            style={{ color: "var(--muted)" }}
          >
            <X className="w-3 h-3" />
          </button>
        )}

        {/* Autocomplete dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div
            className="absolute left-0 right-0 top-full mt-1.5 rounded-2xl overflow-hidden z-50"
            style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}
          >
            {suggestions.map(c => {
              const cat = CATEGORIES.find(x => x.value === c.category);
              const Icon = cat?.icon ?? Users2;
              return (
                <Link
                  key={c.id}
                  href={`/community/${c.slug}`}
                  onClick={() => { setShowDropdown(false); setQuery(""); }}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-black/4 first:pt-3.5 last:pb-3.5"
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 overflow-hidden"
                    style={{
                      background: c.avatar_emoji ? "var(--surface)" : (cat ? `${cat.color}18` : "linear-gradient(135deg,#FB7141,#1E386C)"),
                      border: "1px solid var(--border)",
                    }}
                  >
                    {c.avatar_emoji
                      ? <span style={{ lineHeight: 1 }}>{c.avatar_emoji}</span>
                      : <Icon className="w-4 h-4" strokeWidth={1.7} style={{ color: cat?.color ?? "white" }} />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--fg)" }}>{c.name}</p>
                    {c.description && (
                      <p className="text-xs truncate" style={{ color: "var(--muted)" }}>{c.description}</p>
                    )}
                  </div>
                  {cat && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: `${cat.color}15`, color: cat.color }}>
                      {cat.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
          style={{
            background: !activeCategory ? "var(--fg)" : "var(--surface)",
            color: !activeCategory ? "var(--bg)" : "var(--muted)",
            border: "1px solid var(--border)",
          }}
        >
          Tutte
        </button>
        {CATEGORIES.map(({ value, label, icon: Icon, color }) => {
          const active = activeCategory === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setActiveCategory(active ? null : value)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
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

      {/* Results grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {communities.length === 0
              ? "Nessuna community ancora — sii il primo a richiederla!"
              : "Nessuna community trovata"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((c) => {
            const cat = CATEGORIES.find(x => x.value === c.category);
            const Icon = cat?.icon ?? Users2;
            return (
              <Link
                key={c.id}
                href={`/community/${c.slug}`}
                className="flex items-start gap-3 rounded-2xl border p-4 transition-all hover:border-black/15 active:scale-[.99]"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl overflow-hidden"
                  style={{
                    background: c.avatar_emoji ? "var(--surface)" : (cat ? `${cat.color}18` : "linear-gradient(135deg,#FB7141,#1E386C)"),
                    border: "1.5px solid var(--border)",
                  }}
                >
                  {c.avatar_emoji
                    ? <span style={{ lineHeight: 1 }}>{c.avatar_emoji}</span>
                    : <Icon className="w-5 h-5" strokeWidth={1.7} style={{ color: cat?.color ?? "white" }} />
                  }
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm leading-tight" style={{ color: "var(--fg)" }}>{c.name}</p>
                  {c.description && (
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--muted)" }}>{c.description}</p>
                  )}
                  {cat && (
                    <span className="inline-block text-[10px] font-medium mt-1.5 px-2 py-0.5 rounded-full"
                      style={{ background: `${cat.color}15`, color: cat.color }}>
                      {cat.label}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
