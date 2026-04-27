"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import type { Post, Comment } from "@/types/database";
import { formatDate, getAvatarFallback } from "@/lib/utils";
import { Flag, Heart, Send } from "lucide-react";
import { toggleLike, addComment } from "@/app/actions/posts";

interface PostDetailProps {
  post: Post;
  comments: Comment[];
  currentUserId?: string;
}

export function PostDetail({ post, comments: initialComments, currentUserId }: PostDetailProps) {
  const author = post.author;
  const [isPending, startTransition] = useTransition();
  const [liked, setLiked] = useState(post.user_reaction === "like");
  const [likeCount, setLikeCount] = useState(post.reactions_count ?? 0);
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleLike() {
    startTransition(async () => {
      setLiked(v => !v);
      setLikeCount(v => liked ? v - 1 : v + 1);
      await toggleLike(post.id);
    });
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || isPending) return;
    const text = commentText;
    setCommentText("");
    startTransition(async () => {
      const result = await addComment(post.id, text);
      if (!result.error) {
        setComments(prev => [...prev, {
          id: crypto.randomUUID(),
          post_id: post.id,
          author_id: currentUserId ?? "",
          content: text,
          parent_id: null,
          is_hidden: false,
          deleted_at: null,
          created_at: new Date().toISOString(),
        }]);
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 px-0 sm:px-0">
      {/* Post */}
      <article className="bg-white rounded-2xl border border-black/6 p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <Link href={`/u/${author?.username ?? "#"}`} className="flex items-center gap-2.5 group min-w-0 flex-1">
            <div className="w-11 h-11 rounded-full bg-black/6 text-black flex items-center justify-center font-bold overflow-hidden shrink-0">
              {author?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={author.avatar_url} alt={author.display_name} className="w-full h-full object-cover" />
              ) : (
                getAvatarFallback(author?.display_name ?? "?")
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-black group-hover:opacity-70 transition-opacity truncate">
                  {author?.display_name}
                </span>
                {author?.is_verified && <span className="text-[#DD4132] text-xs shrink-0">✓</span>}
              </div>
              <p className="text-xs text-black/35 truncate">
                @{author?.username} · {formatDate(post.created_at)}
              </p>
            </div>
          </Link>
          <Link href={`/report?type=post&id=${post.id}`} className="shrink-0 text-black/20 hover:text-black/50 transition-colors p-1">
            <Flag className="w-4 h-4" />
          </Link>
        </div>

        {post.title && (
          <h1 className="text-xl sm:text-2xl font-bold text-black mb-3 leading-tight">{post.title}</h1>
        )}
        <p className="text-black/80 whitespace-pre-wrap leading-relaxed text-[15px]">{post.content}</p>

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {post.tags.map(tag => (
              <Link
                key={tag}
                href={`/explore?q=${tag}`}
                className="text-xs text-black/50 bg-black/5 hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] px-2.5 py-1 rounded-full transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Like row */}
        <div className="flex items-center gap-4 mt-5 pt-4 border-t border-black/5">
          <button
            onClick={handleLike}
            disabled={isPending}
            className="flex items-center gap-2 transition-all active:scale-95"
            style={{ color: liked ? "var(--accent)" : "rgba(0,0,0,0.35)" }}
          >
            <Heart
              className="w-5 h-5"
              strokeWidth={liked ? 0 : 1.7}
              fill={liked ? "var(--accent)" : "none"}
            />
            <span className="text-sm tabular-nums font-medium">{likeCount}</span>
            <span className="text-sm">{liked ? "Ti piace" : "Mi piace"}</span>
          </button>
          <span className="text-sm text-black/30">{comments.length} commenti</span>
        </div>
      </article>

      {/* Comments */}
      <section className="bg-white rounded-2xl border border-black/6 overflow-hidden">
        <div className="px-5 py-4 border-b border-black/5">
          <h2 className="font-semibold text-black text-[15px]">Commenti</h2>
        </div>

        {/* Comment form */}
        {currentUserId ? (
          <form onSubmit={handleComment} className="flex items-end gap-3 px-5 py-4 border-b border-black/5">
            <textarea
              ref={textareaRef}
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleComment(e as unknown as React.FormEvent); } }}
              placeholder="Scrivi un commento..."
              rows={1}
              className="flex-1 resize-none input-base py-2.5 text-sm"
              style={{ minHeight: 44 }}
            />
            <button
              type="submit"
              disabled={!commentText.trim() || isPending}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 disabled:opacity-30"
              style={{ background: commentText.trim() ? "var(--accent)" : "rgba(0,0,0,0.06)", color: commentText.trim() ? "white" : "rgba(0,0,0,0.3)" }}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="px-5 py-4 border-b border-black/5 text-sm text-black/40">
            <Link href="/login" className="text-[var(--accent)] font-medium hover:underline">Accedi</Link> per commentare
          </div>
        )}

        {/* Comments list */}
        <div className="divide-y divide-black/4">
          {comments.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-black/30">Nessun commento ancora. Sii il primo!</p>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="flex gap-3 px-5 py-4">
                <div className="w-8 h-8 rounded-full bg-black/6 text-black/60 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                  {(comment.author as { avatar_url?: string } | null)?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={(comment.author as { avatar_url: string }).avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    getAvatarFallback((comment.author as { display_name: string } | null)?.display_name ?? "?")
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <Link
                      href={`/u/${(comment.author as { username: string } | null)?.username ?? "#"}`}
                      className="text-sm font-semibold text-black hover:opacity-70 transition-opacity"
                    >
                      {(comment.author as { display_name: string } | null)?.display_name ?? "Utente"}
                    </Link>
                    <span className="text-[11px] text-black/30">{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="text-sm text-black/75 mt-0.5 leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
