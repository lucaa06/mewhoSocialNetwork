"use client";

import { useState } from "react";
import { Grid3x3, Heart, Bookmark } from "lucide-react";
import type { Post } from "@/types/database";
import { PostFeed } from "@/components/feed/PostFeed";

type Tab = "posts" | "liked" | "saved";

interface Props {
  posts: Post[];
  likedPosts?: Post[];
  savedPosts?: Post[];
  isOwn: boolean;
}

const TABS = [
  { id: "posts",  icon: Grid3x3,  label: "Post"     },
  { id: "liked",  icon: Heart,    label: "Mi piace"  },
  { id: "saved",  icon: Bookmark, label: "Salvati"   },
] as const;

export function ProfilePostTabs({ posts, likedPosts, savedPosts, isOwn }: Props) {
  const [tab, setTab] = useState<Tab>("posts");

  const visibleTabs = isOwn ? TABS : TABS.slice(0, 1);

  const feed =
    tab === "liked"  ? (likedPosts ?? []) :
    tab === "saved"  ? (savedPosts ?? []) :
    posts;

  const emptyMessages: Record<Tab, string> = {
    posts:  "Nessun post ancora",
    liked:  "Non hai ancora messo like a nessun post",
    saved:  "Non hai ancora salvato nessun post",
  };

  return (
    <div>
      {/* Tab bar */}
      <div
        className="flex items-center mb-4 rounded-2xl overflow-hidden"
        style={{ border: "1px solid var(--border)", background: "var(--card)" }}
      >
        {visibleTabs.map(({ id, icon: Icon, label }) => {
          const active = tab === id;
          const count = id === "liked" ? (likedPosts?.length ?? 0) : id === "saved" ? (savedPosts?.length ?? 0) : null;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id as Tab)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all"
              style={{
                color: active ? "var(--accent)" : "var(--muted)",
                background: active ? "var(--accent-soft)" : "transparent",
                borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
              }}
            >
              <Icon className="w-4 h-4" strokeWidth={active ? 2.2 : 1.7} />
              <span className="hidden sm:inline">{label}</span>
              {count !== null && count > 0 && (
                <span className="text-[10px] font-semibold px-1 py-0.5 rounded"
                  style={{ background: active ? "var(--accent)" : "var(--surface)", color: active ? "white" : "var(--muted)" }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Feed */}
      {feed.length === 0 ? (
        <div
          className="rounded-2xl border p-10 text-center"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <p className="text-sm" style={{ color: "var(--muted)" }}>{emptyMessages[tab]}</p>
        </div>
      ) : (
        <PostFeed posts={feed} />
      )}
    </div>
  );
}
