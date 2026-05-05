"use client";

import { useRouter } from "next/navigation";
import { BarChart2, Link2, AtSign, PenLine } from "lucide-react";

interface CreatePostBarProps {
  user: {
    display_name: string;
    role: string;
  } | null;
}

const ROLE_META: Record<string, { label: string; color: string }> = {
  startupper: { label: "Startupper", color: "#FB7141" },
  researcher: { label: "Ricercatore", color: "#6D41FF" },
  user:       { label: "Maker",       color: "#D97706" },
  admin:      { label: "Admin",        color: "#374151" },
};

const QUICK_ACTIONS = [
  { icon: BarChart2, label: "Sondaggio", mode: "poll"    },
  { icon: Link2,     label: "Link",      mode: "link"    },
  { icon: AtSign,    label: "Menzione",  mode: "mention" },
] as const;

export function CreatePostBar({ user }: CreatePostBarProps) {
  const router = useRouter();
  if (!user) return null;

  const meta = ROLE_META[user.role] ?? ROLE_META.user;

  return (
    <div
      className="sticky z-40 -mx-1.5 sm:-mx-5 lg:-mx-8 px-1.5 sm:px-5 lg:px-8 py-2"
      style={{ top: 56, background: "var(--bg)" }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--card)",
          border: "1.5px solid var(--border)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        {/* Accent bar */}
        <div className="h-[3px]" style={{ background: `linear-gradient(90deg,${meta.color},#C84FD0,#6D41FF)` }} />

        {/* Main row */}
        <div className="flex items-center gap-2.5 px-3.5 pt-3 pb-2">
          {/* Role badge */}
          <span
            className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}30` }}
          >
            {meta.label}
          </span>

          {/* Fake input */}
          <button
            onClick={() => router.push("/create")}
            className="flex-1 text-left px-3 py-2 rounded-xl text-sm transition-colors"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--subtle)",
            }}
          >
            Cosa vuoi condividere?
          </button>

          {/* Post button */}
          <button
            onClick={() => router.push("/create")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold text-white shrink-0"
            style={{ background: meta.color }}
          >
            <PenLine className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Posta</span>
          </button>
        </div>

        {/* Quick-action chips */}
        <div className="flex items-center gap-2 px-3.5 pb-3 pt-0.5">
          {QUICK_ACTIONS.map(({ icon: Icon, label, mode }) => (
            <button
              key={mode}
              onClick={() => router.push(`/create?mode=${mode}`)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105 active:scale-95"
              style={{
                background: "var(--surface)",
                color: "var(--muted)",
                border: "1px solid var(--border)",
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
