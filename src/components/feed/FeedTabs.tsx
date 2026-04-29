"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Globe, Users, Hash } from "lucide-react";

const TABS = [
  { key: "all",       label: "Tutto",     icon: Globe  },
  { key: "following", label: "Seguiti",   icon: Users  },
  { key: "community", label: "Community", icon: Hash   },
] as const;

export function FeedTabs({ currentTab }: { currentTab: string }) {
  const searchParams = useSearchParams();

  function buildHref(tab: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "all") params.delete("tab");
    else params.set("tab", tab);
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  return (
    <div
      className="flex items-center gap-1 p-1 rounded-2xl"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      {TABS.map(({ key, label, icon: Icon }) => {
        const active = currentTab === key;
        return (
          <Link
            key={key}
            href={buildHref(key)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all"
            style={active
              ? { background: "var(--card)", color: "var(--accent)", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
              : { color: "var(--muted)" }
            }
          >
            <Icon className="w-4 h-4" strokeWidth={active ? 2.2 : 1.7} />
            <span className="hidden xs:inline sm:inline">{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
