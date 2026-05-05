"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, Users, FileText, Flag, MessageSquare,
  Bug, BarChart2, ScrollText, Users2, PenSquare, FlaskConical,
} from "lucide-react";

const ADMIN_NAV = [
  { href: "/admin/dashboard",   label: "Dashboard",    icon: LayoutDashboard, table: null },
  { href: "/admin/users",       label: "Utenti",        icon: Users,           table: "profiles" },
  { href: "/admin/posts",       label: "Post",          icon: FileText,        table: "posts" },
  { href: "/admin/comments",    label: "Commenti",      icon: MessageSquare,   table: "comments" },
  { href: "/admin/reports",     label: "Segnalazioni",  icon: Flag,            table: "reports" },
  { href: "/admin/community",   label: "Community",     icon: Users2,          table: "community_requests" },
  { href: "/admin/beta",        label: "Beta",          icon: FlaskConical,    table: "beta_feedback" },
  { href: "/admin/create-post", label: "Crea Post",     icon: PenSquare,       table: null },
  { href: "/admin/bugs",        label: "Bug",           icon: Bug,             table: "bug_reports" },
  { href: "/admin/analytics",   label: "Analytics",     icon: BarChart2,       table: null },
  { href: "/admin/audit-log",   label: "Audit Log",     icon: ScrollText,      table: null },
] as const;

type NavItem = (typeof ADMIN_NAV)[number];

const LAST_VISIT_KEY = (href: string) => `adminLastVisit_${href.replace(/\//g, "_")}`;

function useAdminCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  const fetch = useCallback(async () => {
    const sb = createClient();
    const results: Record<string, number> = {};

    for (const item of ADMIN_NAV) {
      if (!item.table) continue;
      const lastVisitRaw = localStorage.getItem(LAST_VISIT_KEY(item.href));
      if (!lastVisitRaw) continue;

      const lastVisit = new Date(lastVisitRaw).toISOString();

      const { count } = await (sb as ReturnType<typeof createClient>)
        .from(item.table as "profiles")
        .select("*", { count: "exact", head: true })
        .gt("created_at", lastVisit);

      results[item.href] = count ?? 0;
    }

    setCounts(results);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return counts;
}

export function AdminNavActive() {
  const pathname = usePathname();
  const counts = useAdminCounts();

  // When visiting a section, record the timestamp
  useEffect(() => {
    const match = ADMIN_NAV.find(
      item => pathname === item.href || pathname.startsWith(item.href + "/") || (pathname.startsWith(item.href) && item.href.length > "/admin".length)
    );
    if (match) localStorage.setItem(LAST_VISIT_KEY(match.href), new Date().toISOString());
  }, [pathname]);

  return (
    <>
      {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/") || (pathname.startsWith(href) && href.length > "/admin".length);
        const count = counts[href] ?? 0;
        return (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-colors"
            style={active
              ? { background: "var(--accent-soft)", color: "var(--accent)", fontWeight: 500 }
              : { color: "rgba(0,0,0,0.4)" }
            }
          >
            <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={active ? 2.2 : 1.7} />
            <span className="flex-1">{label}</span>
            {count > 0 && !active && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                style={{ background: "#FB7141", color: "white" }}
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
        );
      })}
    </>
  );
}
