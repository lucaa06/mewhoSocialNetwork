"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, Bell, X } from "lucide-react";
import type { Profile } from "@/types/database";
import { getAvatarFallback } from "@/lib/utils";
import { useState, useRef } from "react";

interface NavbarProps {
  user: Pick<Profile, "id" | "username" | "display_name" | "avatar_url" | "role"> | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/explore?q=${encodeURIComponent(q)}`);
    else router.push("/explore");
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white/95 backdrop-blur-xl border-b border-black/6">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-full flex items-center justify-between gap-2 sm:gap-4">

        <Link href="/" className="font-bold text-lg text-black tracking-tight shrink-0 select-none">
          me<span style={{ color: "var(--accent)", fontStyle: "italic" }}>&amp;</span>who
        </Link>

        {/* Search bar — desktop */}
        <form
          onSubmit={handleSearch}
          className="hidden sm:flex flex-1 max-w-xs items-center gap-2 bg-black/4 hover:bg-black/5 border border-black/8 rounded-full px-3.5 py-2 transition-colors focus-within:border-[var(--accent)] focus-within:bg-white focus-within:shadow-[0_0_0_3px_var(--accent-soft)]"
        >
          <Search className="w-3.5 h-3.5 text-black/30 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cerca..."
            className="flex-1 bg-transparent text-sm text-black placeholder:text-black/35 focus:outline-none min-w-0"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="text-black/30 hover:text-black/60 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Search icon — mobile only */}
          <Link
            href="/explore"
            className="sm:hidden w-9 h-9 flex items-center justify-center text-black/40 hover:text-black rounded-full hover:bg-black/5 transition-colors"
          >
            <Search className="w-5 h-5" />
          </Link>

          {user ? (
            <>
              <Link
                href="/create"
                className="flex items-center gap-1.5 bg-black text-white px-3 sm:px-3.5 py-1.5 rounded-full text-sm font-semibold hover:bg-black/85 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Post</span>
              </Link>
              <Link
                href="/notifications"
                className="w-9 h-9 flex items-center justify-center text-black/35 hover:text-black rounded-full hover:bg-black/5 transition-colors"
              >
                <Bell className="w-5 h-5" />
              </Link>
              <Link
                href={`/u/${user.username}`}
                className="w-8 h-8 rounded-full bg-black/8 border border-black/10 text-black flex items-center justify-center text-xs font-bold overflow-hidden"
              >
                {user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
                ) : (
                  getAvatarFallback(user.display_name)
                )}
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block text-sm text-black/50 hover:text-black px-3 py-1.5 transition-colors">
                Accedi
              </Link>
              <Link
                href="/register"
                className="bg-black text-white px-3.5 py-1.5 rounded-full text-sm font-semibold hover:bg-black/85 transition-colors"
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
