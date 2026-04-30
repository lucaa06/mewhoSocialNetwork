"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bell, Users2, MessageCircle, User } from "lucide-react";
import type { Profile } from "@/types/database";

interface BottomNavProps {
  user: Pick<Profile, "username"> | null;
  unreadCount?: number;
  unreadMessages?: number;
}

export function BottomNav({ user, unreadCount = 0, unreadMessages = 0 }: BottomNavProps) {
  const pathname = usePathname();

  // Hide in individual chat pages so keyboard doesn't push nav up
  if (/^\/messages\/.+/.test(pathname)) return null;

  const items = [
    { href: "/",                                     icon: Home,          label: "Home"      },
    { href: "/community",                            icon: Users2,        label: "Community" },
    { href: "/notifications",                        icon: Bell,          label: "Notifiche", badge: unreadCount  },
    { href: "/messages",                             icon: MessageCircle, label: "Messaggi",  badge: unreadMessages },
    { href: user ? `/u/${user.username}` : "/login", icon: User,          label: "Profilo"   },
  ];

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 px-2 py-2 rounded-full"
      style={{
        background: "color-mix(in srgb, var(--fg) 88%, transparent)",
        backdropFilter: "blur(24px) saturate(1.8)",
        WebkitBackdropFilter: "blur(24px) saturate(1.8)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.08)",
        border: "1px solid color-mix(in srgb, var(--fg) 25%, transparent)",
      }}
    >
      {items.map(({ href, icon: Icon, label, badge }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={`
              relative w-12 h-12 flex items-center justify-center rounded-full
              transition-all duration-150
              ${active ? "" : "hover:bg-white/10 active:scale-95"}
            `}
            style={active ? { background: "rgba(255,255,255,0.15)" } : undefined}
          >
            <Icon
              className="w-[20px] h-[20px] transition-colors"
              strokeWidth={active ? 2.4 : 1.7}
              style={{ color: active ? "var(--accent)" : "rgba(255,255,255,0.55)" }}
            />
            {/* Notification badge */}
            {badge != null && badge > 0 && (
              <span
                className="absolute top-1.5 right-1.5 min-w-[14px] h-3.5 flex items-center justify-center rounded-full text-[9px] font-bold text-white px-0.5"
                style={{ background: "#FF4A24", lineHeight: 1 }}
              >
                {badge > 99 ? "99+" : badge}
              </span>
            )}
            {active && (
              <span
                className="absolute bottom-2 w-1 h-1 rounded-full"
                style={{ background: "var(--accent)" }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
