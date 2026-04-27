"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, FileText, Flag, MessageSquare,
  Bug, BarChart2, ScrollText, Users2, PenSquare,
} from "lucide-react";

const ADMIN_NAV = [
  { href: "/admin/dashboard",   label: "Dashboard",    icon: LayoutDashboard },
  { href: "/admin/users",       label: "Utenti",        icon: Users },
  { href: "/admin/posts",       label: "Post",          icon: FileText },
  { href: "/admin/comments",    label: "Commenti",      icon: MessageSquare },
  { href: "/admin/reports",     label: "Segnalazioni",  icon: Flag },
  { href: "/admin/community",   label: "Community",     icon: Users2 },
  { href: "/admin/create-post", label: "Crea Post",     icon: PenSquare },
  { href: "/admin/bugs",        label: "Bug",           icon: Bug },
  { href: "/admin/analytics",   label: "Analytics",     icon: BarChart2 },
  { href: "/admin/audit-log",   label: "Audit Log",     icon: ScrollText },
];

export function AdminNavActive() {
  const pathname = usePathname();

  return (
    <>
      {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
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
            {label}
          </Link>
        );
      })}
    </>
  );
}
