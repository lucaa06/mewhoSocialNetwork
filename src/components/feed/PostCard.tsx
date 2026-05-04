"use client";

import Link from "next/link";
import { Heart, MessageCircle, Bookmark, Flag, MoreHorizontal, Share2, Languages, Loader2 } from "lucide-react";
import type { Post } from "@/types/database";
import { formatDate, getAvatarFallback } from "@/lib/utils";
import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toggleLike, toggleSave } from "@/app/actions/posts";
import { SharePostModal } from "@/components/messages/SharePostModal";

const ROLE_COLOR: Record<string, string> = {
  startupper: "#FF4A24",
  researcher: "#6D41FF",
  user:       "#D97706",
  admin:      "#374151",
};

export function PostCard({ post, isLoggedIn }: { post: Post; isLoggedIn?: boolean }) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  const [liked, setLiked] = useState(post.user_reaction === "like");
  const [likeCount, setLikeCount] = useState(post.reactions_count ?? 0);
  const [saved, setSaved] = useState(post.user_reaction === "idea");
  const [showShareModal, setShowShareModal] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [translated, setTranslated] = useState<{ title?: string; content: string } | null>(null);
  const [translating, setTranslating] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (el) setIsTruncated(el.scrollHeight > el.clientHeight + 2);
  }, [post.content]);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  const author = post.author as (typeof post.author & { avatar_emoji?: string | null }) | undefined;
  const roleColor = ROLE_COLOR[author?.role ?? "user"] ?? "#10b981";

  async function handleTranslate() {
    if (translated) { setTranslated(null); return; }
    setTranslating(true);
    const targetLang = (navigator.language ?? "en").slice(0, 2);
    const sourceLang = "it";
    if (targetLang === sourceLang) { setTranslating(false); return; }

    async function translate(text: string): Promise<string> {
      try {
        const res = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=${sourceLang}|${targetLang}`,
          { signal: AbortSignal.timeout(8000) }
        );
        const json = await res.json();
        return (json.responseData?.translatedText as string) || text;
      } catch {
        return text;
      }
    }

    try {
      const [content, title] = await Promise.all([
        translate(post.content),
        post.title ? translate(post.title) : Promise.resolve(undefined),
      ]);
      setTranslated({ content, title });
    } finally {
      setTranslating(false);
    }
  }

  function requireAuth() {
    router.push("/login?next=" + encodeURIComponent(window.location.pathname));
    return false;
  }

  function handleLike() {
    if (isLoggedIn === false) { requireAuth(); return; }
    startTransition(async () => {
      setLiked(v => !v);
      setLikeCount(v => liked ? v - 1 : v + 1);
      const res = await toggleLike(post.id);
      if (res?.error) { setLiked(v => !v); setLikeCount(v => liked ? v + 1 : v - 1); requireAuth(); }
    });
  }

  function handleSave() {
    if (isLoggedIn === false) { requireAuth(); return; }
    startTransition(async () => {
      setSaved(v => !v);
      const res = await toggleSave(post.id);
      if (res?.error) { setSaved(v => !v); requireAuth(); }
    });
  }

  return (
    <article
      className="border transition-all"
      style={{
        background: "var(--card)",
        borderColor: "var(--border)",
        borderRadius: "1.75rem",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Subtle role-colored gradient at the bottom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `linear-gradient(to top, ${roleColor}14 0%, ${roleColor}05 35%, transparent 65%)`, borderRadius: "inherit" }}
      />

      {/* ── Author header ── */}
      <div
        className="flex items-center justify-between px-4 pt-3.5 pb-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <Link href={`/u/${author?.username ?? "#"}`} className="flex items-center gap-3 group min-w-0">
          {/* Avatar: emoji > image > initials */}
          <div
            className="w-10 h-10 squircle flex items-center justify-center overflow-hidden shrink-0 text-sm font-bold"
            style={{
              background: author?.avatar_emoji ? "var(--surface)" : `${roleColor}18`,
              border: `1.5px solid ${roleColor}35`,
              color: roleColor,
            }}
          >
            {author?.avatar_emoji ? (
              <span style={{ fontSize: 20, lineHeight: 1 }}>{author.avatar_emoji}</span>
            ) : author?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={author.avatar_url} alt={author.display_name} className="w-full h-full object-cover" />
            ) : (
              <span style={{ color: roleColor }}>{getAvatarFallback(author?.display_name ?? "?")}</span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1 leading-none">
              <span className="text-sm font-semibold group-hover:opacity-70 transition-opacity truncate" style={{ color: "var(--fg)" }}>
                {author?.display_name}
              </span>
              {author?.is_verified && (
                <span className="text-[10px] shrink-0" style={{ color: "var(--accent)" }}>✓</span>
              )}
            </div>
            <p className="text-[11px] mt-0.5 truncate" style={{ color: "var(--muted)" }}>
              @{author?.username}
              {(post.city || post.country_code) && ` · ${post.city ?? post.country_code}`}
            </p>
          </div>
        </Link>

        {/* Date + menu */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <span className="text-[11px] hidden sm:block" style={{ color: "var(--subtle)" }}>{formatDate(post.created_at)}</span>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(v => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-black/5"
              style={{ color: "var(--subtle)" }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showMenu && (
              <div
                className="absolute right-0 top-9 rounded-xl shadow-lg py-1 z-10 min-w-[130px]"
                style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}
              >
                <Link
                  href={`/report?type=post&id=${post.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-black/4"
                  style={{ color: "var(--muted)" }}
                  onClick={() => setShowMenu(false)}
                >
                  <Flag className="w-3.5 h-3.5" /> Segnala
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Post body ── */}
      <div className="px-4 py-3.5">
        {/* Community badge */}
        {post.community && (
          <div className="mb-2.5">
            <Link
              href={`/community/${post.community.slug}`}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full transition-opacity hover:opacity-75"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}
              onClick={e => e.stopPropagation()}
            >
              {post.community.avatar_emoji ? (
                <span style={{ fontSize: 12, lineHeight: 1 }}>{post.community.avatar_emoji}</span>
              ) : (
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: roleColor }} />
              )}
              <span className="truncate max-w-[120px]">{post.community.name}</span>
            </Link>
          </div>
        )}

        {/* Title */}
        {post.title && (
          <Link href={`/post/${post.id}`}>
            <h2 className="font-semibold mb-1.5 leading-snug hover:opacity-70 transition-opacity text-base sm:text-[15px]" style={{ color: "var(--fg)" }}>
              {translated?.title ?? post.title}
            </h2>
          </Link>
        )}

        {/* Content */}
        <div className="relative">
          <p
            ref={contentRef}
            className="text-sm leading-relaxed whitespace-pre-wrap overflow-hidden transition-[max-height] duration-300"
            style={{
              color: "var(--muted)",
              maxHeight: expanded ? "20rem" : "5.6rem",
              overflowY: expanded ? "auto" : "hidden",
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            {translated?.content ?? post.content}
          </p>
          {isTruncated && !expanded && (
            <div
              className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
              style={{ background: "linear-gradient(to bottom, transparent, var(--card))" }}
            />
          )}
        </div>
        {isTruncated && (
          <button
            onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
            className="text-xs mt-1.5 underline underline-offset-2 transition-colors"
            style={{ color: "var(--subtle)" }}
          >
            {expanded ? "Meno" : "Leggi tutto"}
          </button>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tags.map(tag => (
              <Link
                key={tag}
                href={`/explore?q=${encodeURIComponent(tag)}`}
                className="text-[11px] px-2 py-0.5 rounded-full transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                style={{ background: "var(--surface)", color: "var(--subtle)" }}
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer actions ── */}
      <div
        className="flex items-center justify-between px-4 pb-3.5 pt-2.5"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            disabled={isPending}
            className="flex items-center gap-1.5 transition-colors min-h-[36px] px-1"
            style={{ color: liked ? "var(--accent)" : "var(--subtle)" }}
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
            className="flex items-center gap-1.5 transition-colors min-h-[36px] px-1"
            style={{ color: "var(--subtle)" }}
          >
            <MessageCircle className="w-4 h-4" strokeWidth={1.7} />
            <span className="text-xs tabular-nums">{post.comments_count ?? 0}</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] sm:hidden" style={{ color: "var(--subtle)" }}>{formatDate(post.created_at)}</span>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="min-h-[36px] px-1 transition-colors"
            style={{ color: saved ? "var(--accent)" : "var(--subtle)" }}
          >
            <Bookmark
              className="w-4 h-4"
              strokeWidth={saved ? 0 : 1.7}
              fill={saved ? "var(--accent)" : "none"}
            />
          </button>
          <button
            onClick={handleTranslate}
            disabled={translating}
            className="min-h-[36px] px-1 transition-colors"
            style={{ color: translated ? "var(--accent)" : "var(--subtle)" }}
            title={translated ? "Mostra originale" : "Traduci"}
          >
            {translating
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Languages className="w-4 h-4" strokeWidth={1.7} />
            }
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            className="min-h-[36px] px-1 transition-colors"
            style={{ color: "var(--subtle)" }}
          >
            <Share2 className="w-4 h-4" strokeWidth={1.7} />
          </button>
        </div>
      </div>

      {showShareModal && (
        <SharePostModal
          postId={post.id}
          postTitle={post.title ?? null}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </article>
  );
}
