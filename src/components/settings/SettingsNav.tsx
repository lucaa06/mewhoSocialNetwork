"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const SETTINGS_NAV = [
  { href: "/settings/account",       label: "Account" },
  { href: "/settings/profile",       label: "Profilo" },
  { href: "/settings/privacy",       label: "Privacy" },
  { href: "/settings/notifications", label: "Notifiche" },
  { href: "/settings/security",      label: "Sicurezza" },
  { href: "/settings/blocked",       label: "Bloccati" },
  { href: "/settings/danger-zone",   label: "Zona pericolosa" },
];

export function SettingsNav({ mobile }: { mobile?: boolean }) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {SETTINGS_NAV.map(({ href, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "shrink-0 px-3.5 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                active
                  ? "text-white"
                  : "bg-black/5 text-black/50 hover:text-black hover:bg-black/8"
              )}
              style={active ? { background: "var(--accent)", color: "white" } : undefined}
            >
              {label}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <nav className="space-y-0.5">
      {SETTINGS_NAV.map(({ href, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "block px-3 py-2 rounded-xl text-sm transition-colors",
              active ? "nav-active" : "text-black/40 hover:text-black hover:bg-black/4"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
