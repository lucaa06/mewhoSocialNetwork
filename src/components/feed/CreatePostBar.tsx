"use client";

import { useRouter } from "next/navigation";
import { Feather } from "lucide-react";
import { getAvatarFallback } from "@/lib/utils";

interface CreatePostBarProps {
  user: {
    display_name: string;
    avatar_url: string | null;
    avatar_emoji?: string | null;
    role: string;
  } | null;
}

const ROLE_COLOR: Record<string, string> = {
  startupper: "#FF4A24",
  researcher: "#6D41FF",
  user: "#D97706",
  admin: "#374151",
};

export function CreatePostBar({ user }: CreatePostBarProps) {
  const router = useRouter();
  if (!user) return null;

  const color = ROLE_COLOR[user.role] ?? "#D97706";

  return (
    <div
      className="sticky z-40 -mx-3 sm:-mx-4 px-3 sm:px-4 py-2"
      style={{ top: 56, background: "var(--bg)" }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--card)",
          border: "1.5px solid var(--accent)",
          boxShadow: "0 4px 20px rgba(255,74,36,0.10)",
        }}
      >
        {/* Top gradient stripe */}
        <div
          className="h-1"
          style={{ background: "linear-gradient(90deg,#FF4A24,#C84FD0,#6D41FF)" }}
        />

        <div className="flex items-center gap-3 px-4 py-3">
          {/* Avatar */}
          <div
            className="w-9 h-9 squircle flex items-center justify-center shrink-0 overflow-hidden"
            style={{ background: `${color}18`, border: `1.5px solid ${color}30` }}
          >
            {user.avatar_emoji ? (
              <span style={{ fontSize: 18 }}>{user.avatar_emoji}</span>
            ) : user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold" style={{ color }}>
                {getAvatarFallback(user.display_name)}
              </span>
            )}
          </div>

          {/* Fake input → click navigates to /create */}
          <button
            onClick={() => router.push("/create")}
            className="flex-1 text-left px-4 py-2 rounded-xl transition-colors"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--subtle)",
              fontSize: 14,
              fontFamily: "var(--fh)",
            }}
          >
            Condividi un&apos;idea, progetto o domanda...
          </button>

          {/* Post button */}
          <button
            onClick={() => router.push("/create")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white shrink-0 transition-all"
            style={{
              background: "#FF4A24",
              boxShadow: "0 2px 10px rgba(255,74,36,0.30)",
            }}
          >
            <Feather className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Posta</span>
          </button>
        </div>
      </div>
    </div>
  );
}

