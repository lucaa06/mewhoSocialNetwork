"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { APP_VERSION_LABEL } from "@/lib/version";

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
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

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
                active ? "" : "hover:opacity-80"
              )}
              style={active
                ? { background: "var(--accent)", color: "white" }
                : { background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }
              }
            >
              {label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
          style={{ background: "rgba(220,38,38,0.10)", color: "#ef4444" }}
        >
          <LogOut className="w-3.5 h-3.5" />
          Esci
        </button>
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
              "block px-3 py-2.5 rounded-xl text-sm transition-colors",
              active ? "nav-active" : "hover:bg-black/4"
            )}
            style={active ? undefined : { color: "var(--muted)" }}
          >
            {label}
          </Link>
        );
      })}

      <div className="pt-2 mt-2 border-t" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-red-50"
          style={{ color: "#ef4444" }}
        >
          <LogOut className="w-4 h-4" />
          Esci dall&apos;account
        </button>
        <p className="text-[10px] text-center mt-3 font-medium" style={{ color: "var(--subtle)" }}>
          {APP_VERSION_LABEL}
        </p>
      </div>
    </nav>
  );
}
