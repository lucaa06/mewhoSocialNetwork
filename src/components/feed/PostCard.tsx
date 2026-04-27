"use client";

import Link from "next/link";
import { Heart, MessageCircle, Bookmark, Flag, MoreHorizontal } from "lucide-react";
import type { Post } from "@/types/database";
import { formatDate, getAvatarFallback } from "@/lib/utils";
import { useState, useTransition } from "react";
import { toggleLike, toggleSave } from "@/app/actions/posts";

export function PostCard({ post }: { post: Post }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [liked, setLiked] = useState(post.user_reaction === "like");
  const [likeCount, setLikeCount] = useState(post.reactions_count ?? 0);
  const [saved, setSaved] = useState(post.user_reaction === "idea");

  const author = post.author;

  function handleLike() {
    startTransition(async () => {
      setLiked(v => !v);
      setLikeCount(v => liked ? v - 1 : v + 1);
      await toggleLike(post.id);
    });
  }

  function handleSave() {
    startTransition(async () => {
      setSaved(v => !v);
      await toggleSave(post.id);
    });
  }

  return (
    <article className="bg-white rounded-2xl border border-black/6 p-4 hover:border-black/12 transition-colors">

      {/* Author row */}
      <div className="flex items-center justify-between mb-3">
        <Link href={`/u/${author?.username ?? "#"}`} className="flex items-center gap-2.5 group min-w-0">
          <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-black/6 text-black text-xs font-semibold flex items-center justify-center overflow-hidden shrink-0">
            {author?.avatar_url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={author.avatar_url} alt={author.display_name} className="w-full h-full object-cover" />
              : getAvatarFallback(author?.display_name ?? "?")}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 leading-none">
              <span className="text-sm font-medium text-black/90 group-hover:text-black transition-colors truncate">
                {author?.display_name}
              </span>
              {author?.is_verified && <span className="text-[#DD4132] text-[10px] shrink-0">✓</span>}
            </div>
            <p className="text-[11px] text-black/35 mt-0.5 truncate">
              @{author?.username}
              {(post.city || post.country_code) && ` · ${post.city ?? post.country_code}`}
            </p>
          </div>
        </Link>

        <div className="relative shrink-0 ml-2">
          <button
            onClick={() => setShowMenu(v => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-black/20 hover:text-black/50 hover:bg-black/5 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-9 bg-white border border-black/8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] py-1 z-10 min-w-[130px]">
              <Link
                href={`/report?type=post&id=${post.id}`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-black/60 hover:text-black hover:bg-black/4 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <Flag className="w-3.5 h-3.5" /> Segnala
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <Link href={`/post/${post.id}`} className="block group">
        {post.title && (
          <h2 className="font-semibold text-black mb-1.5 leading-snug group-hover:opacity-70 transition-opacity text-base sm:text-[15px]">
            {post.title}
          </h2>
        )}
        <p className="text-sm text-black/60 line-clamp-4 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </Link>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {post.tags.map(tag => (
            <Link
              key={tag}
              href={`/explore?q=${encodeURIComponent(tag)}`}
              className="text-[11px] text-black/45 bg-black/4 hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] px-2 py-0.5 rounded-full transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/5">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            disabled={isPending}
            className="flex items-center gap-1.5 transition-colors min-h-[36px] px-1"
            style={{ color: liked ? "var(--accent)" : "rgba(0,0,0,0.25)" }}
          >
            <Heart
              className="w-4 h-4 transition-transform active:scale-90"
              strokeWidth={liked ? 0 : 1.7}
              fill={liked ? "var(--accent)" : "none"}
            />
            <span className="text-xs tabular-nums">{likeCount}</span>
          </button>
          <Link
            href={`/post/${post.id}`}
            className="flex items-center gap-1.5 text-black/25 hover:text-black/60 transition-colors min-h-[36px] px-1"
          >
            <MessageCircle className="w-4 h-4" strokeWidth={1.7} />
            <span className="text-xs tabular-nums">{post.comments_count ?? 0}</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-black/25 hidden sm:block">{formatDate(post.created_at)}</span>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="min-h-[36px] px-1 transition-colors"
            style={{ color: saved ? "var(--accent)" : "rgba(0,0,0,0.25)" }}
          >
            <Bookmark
              className="w-4 h-4"
              strokeWidth={saved ? 0 : 1.7}
              fill={saved ? "var(--accent)" : "none"}
            />
          </button>
        </div>
      </div>
    </article>
  );
}
