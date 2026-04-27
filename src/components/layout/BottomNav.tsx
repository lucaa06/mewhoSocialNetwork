"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Users, MessageCircle, User } from "lucide-react";
import type { Profile } from "@/types/database";

interface BottomNavProps {
  user: Pick<Profile, "username"> | null;
}

export function BottomNav({ user }: BottomNavProps) {
  const pathname = usePathname();

  const items = [
    { href: "/messages",                              icon: MessageCircle },
    { href: "/community",                             icon: Users         },
    { href: "/",                                      icon: Home          },
    { href: "/explore",                               icon: Search        },
    { href: user ? `/u/${user.username}` : "/login",  icon: User          },
  ];

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav
      className="
        fixed bottom-3 left-1/2 -translate-x-1/2 z-50
        flex items-center gap-0.5
        px-2 py-2
        rounded-full
        bg-black
        shadow-[0_8px_32px_rgba(0,0,0,0.22)]
      "
    >
      {items.map(({ href, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={`
              relative w-12 h-12 flex items-center justify-center rounded-full
              transition-all duration-150
              ${active
                ? "bg-white"
                : "text-white/50 hover:text-white/80 hover:bg-white/10"
              }
            `}
          >
            <Icon
              className="w-[20px] h-[20px] transition-colors"
              strokeWidth={active ? 2.4 : 1.7}
              style={{ color: active ? "var(--accent)" : undefined }}
            />
          </Link>
        );
      })}
    </nav>
  );
}
