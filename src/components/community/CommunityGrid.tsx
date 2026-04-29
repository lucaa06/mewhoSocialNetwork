"use client";

import Link from "next/link";
import { Rocket, FlaskConical, Palette, Code2, Globe, Sparkles, Users2 } from "lucide-react";

const CATEGORIES = [
  { value: "startup",  label: "Startup",    icon: Rocket,       color: "#FF4A24" },
  { value: "research", label: "Ricerca",    icon: FlaskConical, color: "#6D41FF" },
  { value: "creative", label: "Creatività", icon: Palette,      color: "#C84FD0" },
  { value: "tech",     label: "Tech",       icon: Code2,        color: "#0EA5E9" },
  { value: "social",   label: "Sociale",    icon: Globe,        color: "#16A34A" },
  { value: "other",    label: "Altro",      icon: Sparkles,     color: "#D97706" },
];

interface Community {
  id: string; slug: string; name: string; description: string | null;
  category: string | null; avatar_emoji?: string | null;
}

export function CommunityGrid({ communities, emptyMessage = "Nessuna community" }: {
  communities: Community[];
  emptyMessage?: string;
}) {
  if (communities.length === 0) {
    return (
      <div className="rounded-2xl border p-10 text-center"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <p className="text-sm" style={{ color: "var(--muted)" }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {communities.map(c => {
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
                background: c.avatar_emoji ? "var(--surface)" : (cat ? `${cat.color}18` : "linear-gradient(135deg,#FF4A24,#6D41FF)"),
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
  );
}
