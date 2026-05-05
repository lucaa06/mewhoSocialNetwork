import Link from "next/link";
import { Rocket, FlaskConical, Palette, Code2, Globe, Sparkles, Users2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CATEGORY_ICONS: Record<string, { icon: LucideIcon; color: string; bg: string; label: string }> = {
  startup:  { icon: Rocket,       color: "#FB7141", bg: "rgba(251,113,65,0.15)",  label: "Startup"    },
  research: { icon: FlaskConical, color: "#6D41FF", bg: "rgba(109,65,255,0.15)", label: "Ricerca"    },
  creative: { icon: Palette,      color: "#C84FD0", bg: "rgba(200,79,208,0.15)", label: "Creatività" },
  tech:     { icon: Code2,        color: "#0EA5E9", bg: "rgba(14,165,233,0.15)", label: "Tech"       },
  social:   { icon: Globe,        color: "#16A34A", bg: "rgba(22,163,74,0.15)",  label: "Sociale"    },
  other:    { icon: Sparkles,     color: "#D97706", bg: "rgba(217,119,6,0.15)",  label: "Altro"      },
};

interface Community {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  avatar_emoji: string | null;
}

interface Props {
  communities: Community[];
}

export function ProfileCommunities({ communities }: Props) {
  if (communities.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
        Comunità create
      </h2>

      <div className="space-y-2">
        {communities.map((c) => {
          const cat = c.category ? CATEGORY_ICONS[c.category] : null;
          const CatIcon = cat?.icon ?? Users2;

          return (
            <Link
              key={c.id}
              href={`/community/${c.slug}`}
              className="flex items-center gap-3 rounded-2xl p-3 transition-all hover:border-black/15 active:scale-[.99]"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
                style={{
                  background: c.avatar_emoji ? "var(--surface)" : (cat?.bg ?? "linear-gradient(135deg,#FB7141,#1E386C)"),
                  border: "1.5px solid var(--border)",
                }}
              >
                {c.avatar_emoji
                  ? <span style={{ lineHeight: 1 }}>{c.avatar_emoji}</span>
                  : <CatIcon className="w-5 h-5" style={{ color: cat ? cat.color : "white" }} />
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight truncate" style={{ color: "var(--fg)" }}>
                  {c.name}
                </p>
                {c.description && (
                  <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--muted)" }}>
                    {c.description}
                  </p>
                )}
              </div>

              {/* Category badge */}
              {cat && (
                <span
                  className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: cat.bg, color: cat.color }}
                >
                  {cat.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
