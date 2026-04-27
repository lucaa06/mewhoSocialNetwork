"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Users, Bookmark, Settings, MessageCircle } from "lucide-react";
import type { Profile } from "@/types/database";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: Pick<Profile, "id" | "username" | "role"> | null;
  className?: string;
}

const NAV_ITEMS = [
  { href: "/",           label: "Home",         icon: Home },
  { href: "/explore",    label: "Esplora",       icon: Compass },
  { href: "/community",  label: "Community",     icon: Users },
  { href: "/messages",   label: "Messaggi",      icon: MessageCircle, auth: true },
  { href: "/saved",      label: "Salvati",       icon: Bookmark,      auth: true },
  { href: "/settings",   label: "Impostazioni",  icon: Settings,      auth: true },
];

export function Sidebar({ user, className }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside className={cn("space-y-0.5", className)}>
      {NAV_ITEMS.filter(item => !item.auth || user).map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
              active
                ? "nav-active"
                : "text-black/45 hover:text-black hover:bg-black/4"
            )}
          >
            <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={active ? 2.2 : 1.8} />
            {label}
          </Link>
        );
      })}
      {user?.role === "admin" && (
        <Link
          href="/admin"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors mt-6",
            pathname.startsWith("/admin") ? "nav-active" : "text-black/30 hover:text-black hover:bg-black/4"
          )}
        >
          Admin
        </Link>
      )}
    </aside>
  );
}
