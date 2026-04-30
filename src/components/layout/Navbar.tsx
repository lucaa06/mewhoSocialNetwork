"use client";

import Link from "next/link";
import { Search, Plus, Bell, MessageCircle, LayoutDashboard, Settings } from "lucide-react";
import type { Profile } from "@/types/database";
import { getAvatarFallback } from "@/lib/utils";
import { SearchBox } from "./SearchBox";

interface NavbarProps {
  user: Pick<Profile, "id" | "username" | "display_name" | "avatar_url" | "avatar_emoji" | "role"> | null;
  unreadCount?: number;
  unreadMessages?: number;
}

export function Navbar({ user, unreadCount = 0, unreadMessages = 0 }: NavbarProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 backdrop-blur-xl"
      style={{
        background: "color-mix(in srgb, var(--bg) 90%, transparent)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        className="max-w-6xl mx-auto px-3 sm:px-4 h-full flex items-center justify-between gap-2 sm:gap-4"
        style={{ overflow: "visible" }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center select-none shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logoNoText.svg" alt="me&who" className="h-9 sm:h-11 w-auto block" />
        </Link>

        {/* Search box — desktop only */}
        <SearchBox />

        <div className="flex items-center gap-1 sm:gap-1.5">

          {/* Search page — mobile only (desktop has SearchBox) */}
          <Link
            href="/search"
            className="sm:hidden w-10 h-10 flex items-center justify-center squircle-sm transition-colors"
            style={{ color: "var(--muted)" }}
            aria-label="Cerca"
          >
            <Search className="w-5 h-5" />
          </Link>

          {user ? (
            <>
              {/* Centro di Comando — desktop ONLY, admin ONLY */}
              {user.role === "admin" && (
                <Link
                  href="/admin/dashboard"
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors"
                  style={{ borderColor: "rgba(255,74,36,0.25)", color: "#FF4A24", background: "var(--accent-soft)" }}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Centro di Comando
                </Link>
              )}

              {/* Create post */}
              <Link
                href="/create"
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-1.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
                style={{ background: "#FF4A24", boxShadow: "0 2px 10px rgba(255,74,36,0.30)" }}
                aria-label="Crea post"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Post</span>
              </Link>

              {/* Notifications — desktop only */}
              <Link
                href="/notifications"
                className="relative hidden sm:flex w-9 h-9 items-center justify-center squircle-sm transition-colors"
                style={{ color: "var(--muted)" }}
                aria-label="Notifiche"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span
                    className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1"
                    style={{ background: "#FF4A24", lineHeight: 1 }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>

              {/* Messages — desktop only */}
              <Link
                href="/messages"
                className="relative hidden sm:flex w-9 h-9 items-center justify-center squircle-sm transition-colors"
                style={{ color: "var(--muted)" }}
                aria-label="Messaggi"
              >
                <MessageCircle className="w-5 h-5" />
                {unreadMessages > 0 && (
                  <span
                    className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1"
                    style={{ background: "#FF4A24", lineHeight: 1 }}
                  >
                    {unreadMessages > 99 ? "99+" : unreadMessages}
                  </span>
                )}
              </Link>

              {/* Avatar / profile */}
              <Link
                href={`/u/${user.username}`}
                className="w-9 h-9 squircle flex items-center justify-center text-xs font-bold overflow-hidden"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--fg)" }}
                aria-label="Il mio profilo"
              >
                {user.avatar_emoji ? (
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{user.avatar_emoji}</span>
                ) : user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
                ) : (
                  getAvatarFallback(user.display_name)
                )}
              </Link>

              {/* Settings — desktop only */}
              <Link
                href="/settings/profile"
                className="hidden sm:flex w-9 h-9 items-center justify-center squircle-sm transition-colors"
                style={{ color: "var(--muted)" }}
                aria-label="Impostazioni"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:block text-sm px-3 py-1.5 transition-colors"
                style={{ color: "var(--muted)" }}
              >
                Accedi
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: "#FF4A24", boxShadow: "0 2px 10px rgba(255,74,36,0.30)" }}
              >
                Registrati
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
