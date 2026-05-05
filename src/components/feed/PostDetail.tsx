"use client";

import Link from "next/link";
import { useRef, useState, useTransition, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Post, Comment, PollData } from "@/types/database";
import { formatDate, getAvatarFallback } from "@/lib/utils";
import { CornerDownRight, ExternalLink, Flag, Heart, Link as LinkIcon, Send, X } from "lucide-react";
import { toggleLike, addComment, votePoll } from "@/app/actions/posts";
import { celebrate } from "@/lib/celebrate";
import { BackButton } from "@/components/layout/BackButton";

interface PostDetailProps {
  post: Post;
  comments: Comment[];
  currentUserId?: string;
  pollData?: PollData | null;
}

// Render text with clickable @mentions
function renderContent(text: string): React.ReactNode {
  const parts = text.split(/(@[a-z0-9_]+)/gi);
  return parts.map((part, i) => {
    const mentionMatch = part.match(/^@([a-z0-9_]+)$/i);
    if (mentionMatch) {
      const username = mentionMatch[1].toLowerCase();
      return (
        <Link
          key={i}
          href={`/u/${username}`}
          className="font-semibold hover:underline"
          style={{ color: "var(--accent)" }}
        >
          {part}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

interface PollWidgetProps {
  data: PollData;
  currentUserId?: string;
}

function PollWidget({ data, currentUserId }: PollWidgetProps) {
  const [localPoll, setLocalPoll] = useState<PollData>(data);
  const [voting, setVoting] = useState(false);

  async function handleVote(optionId: string) {
    if (!currentUserId || voting) return;
    const wasVoted = localPoll.userVote === optionId;

    // Optimistic update
    const newCounts = { ...localPoll.voteCounts };
    if (localPoll.userVote) {
      newCounts[localPoll.userVote] = Math.max(0, (newCounts[localPoll.userVote] ?? 1) - 1);
    }
    if (!wasVoted) {
      newCounts[optionId] = (newCounts[optionId] ?? 0) + 1;
    }
    const totalDelta = wasVoted ? -1 : localPoll.userVote ? 0 : 1;
    setLocalPoll({
      ...localPoll,
      voteCounts: newCounts,
      userVote: wasVoted ? null : optionId,
      totalVotes: localPoll.totalVotes + totalDelta,
    });

    setVoting(true);
    await votePoll(localPoll.id, optionId);
    setVoting(false);
  }

  const hasVoted = localPoll.userVote !== null;

  return (
    <div
      className="rounded-xl border p-4 mt-4 space-y-3"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
        {localPoll.question}
      </p>
      <div className="space-y-2">
        {localPoll.options.map((opt) => {
          const count = localPoll.voteCounts[opt.id] ?? 0;
          const pct = localPoll.totalVotes > 0 ? Math.round((count / localPoll.totalVotes) * 100) : 0;
          const isChosen = localPoll.userVote === opt.id;

          if (hasVoted) {
            return (
              <div
                key={opt.id}
                className="relative rounded-xl overflow-hidden px-3 py-2.5 border"
                style={{
                  borderColor: isChosen ? "var(--accent)" : "var(--border)",
                  background: "var(--card)",
                }}
              >
                {/* Bar fill */}
                <div
                  className="absolute inset-0 rounded-xl transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: isChosen ? "rgba(251,113,65,0.12)" : "var(--surface)",
                  }}
                />
                <div className="relative flex items-center justify-between gap-2">
                  <span
                    className="text-sm font-medium"
                    style={{ color: isChosen ? "var(--accent)" : "var(--fg)" }}
                  >
                    {opt.text}
                    {isChosen && <span className="ml-1.5 text-xs opacity-70">✓</span>}
                  </span>
                  <span className="text-xs font-semibold tabular-nums shrink-0" style={{ color: "var(--muted)" }}>
                    {pct}%
                  </span>
                </div>
              </div>
            );
          }

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleVote(opt.id)}
              disabled={!currentUserId || voting}
              className="w-full text-left px-3 py-2.5 rounded-xl border text-sm font-medium transition-all hover:opacity-80 disabled:opacity-50"
              style={{
                borderColor: "var(--border)",
                background: "var(--card)",
                color: "var(--fg)",
              }}
            >
              {opt.text}
            </button>
          );
        })}
      </div>
      <p className="text-xs" style={{ color: "var(--subtle)" }}>
        {localPoll.totalVotes} {localPoll.totalVotes === 1 ? "voto" : "voti"}
      </p>
    </div>
  );
}

export function PostDetail({
  post,
  comments: initialComments,
  currentUserId,
  pollData,
}: PostDetailProps) {
  const author = post.author;
  const [isPending, startTransition] = useTransition();
  const [liked, setLiked] = useState(post.user_reaction === "like");
  const [likeCount, setLikeCount] = useState(post.reactions_count ?? 0);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [commentText, setCommentText] = useState("");
  const [replyTarget, setReplyTarget] = useState<{ commentId: string; username: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionSuggestions, setMentionSuggestions] = useState<Array<{ id: string; username: string; display_name: string; avatar_url: string | null }>>([]);
  const [mentionCursorPos, setMentionCursorPos] = useState(0);
  const supabase = createClient();

  const detectMention = useCallback((text: string, cursorPos: number) => {
    const before = text.slice(0, cursorPos);
    const match = before.match(/@([a-z0-9_]*)$/i);
    if (match) {
      setMentionQuery(match[1].toLowerCase());
      setMentionCursorPos(cursorPos);
      return;
    }
    setMentionQuery(null);
    setMentionSuggestions([]);
  }, []);

  useEffect(() => {
    if (mentionQuery === null) { setMentionSuggestions([]); return; }
    let cancelled = false;
    const q = supabase.from("profiles").select("id, username, display_name, avatar_url").order("username", { ascending: true }).limit(3);
    const filtered = mentionQuery.length > 0 ? q.or(`username.ilike.${mentionQuery}%,display_name.ilike.${mentionQuery}%`) : q;
    filtered.then(({ data }) => { if (!cancelled && data) setMentionSuggestions(data as typeof mentionSuggestions); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mentionQuery]);

  function selectMention(suggestion: { username: string }) {
    if (!textareaRef.current) return;
    const before = commentText.slice(0, mentionCursorPos);
    const after = commentText.slice(mentionCursorPos);
    const replaced = before.replace(/@([a-z0-9_]*)$/i, `@${suggestion.username} `);
    setCommentText(replaced + after);
    setMentionQuery(null);
    setMentionSuggestions([]);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(replaced.length, replaced.length);
      }
    }, 0);
  }

  function handleLike() {
    if (!liked) celebrate();
    startTransition(async () => {
      setLiked((v) => !v);
      setLikeCount((v) => (liked ? v - 1 : v + 1));
      await toggleLike(post.id);
    });
  }

  function handleReply(commentId: string, username: string) {
    setReplyTarget({ commentId, username });
    const prefix = `@${username} `;
    setCommentText(prefix);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(prefix.length, prefix.length);
      }
    }, 0);
  }

  function clearReply() {
    setReplyTarget(null);
    setCommentText("");
    textareaRef.current?.focus();
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || isPending) return;
    const text = commentText;
    const parentId = replyTarget?.commentId;
    setCommentText("");
    setReplyTarget(null);
    startTransition(async () => {
      const result = await addComment(post.id, text, parentId);
      if (!result.error) {
        celebrate();
        const newComment: Comment = {
          id: crypto.randomUUID(),
          post_id: post.id,
          author_id: currentUserId ?? "",
          content: text,
          parent_id: parentId ?? null,
          is_hidden: false,
          deleted_at: null,
          created_at: new Date().toISOString(),
        };
        setComments((prev) => [...prev, newComment]);
      }
    });
  }

  // Build comment threads
  const topLevel = comments.filter((c) => !c.parent_id);
  function getReplies(commentId: string): Comment[] {
    return comments.filter((c) => c.parent_id === commentId);
  }

  function CommentItem({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) {
    const authorProfile = comment.author as { username?: string; display_name?: string; avatar_url?: string } | undefined;
    const username = authorProfile?.username ?? "";
    const displayName = authorProfile?.display_name ?? "Utente";
    const avatarUrl = authorProfile?.avatar_url;
    const replies = isReply ? [] : getReplies(comment.id);

    return (
      <div className={isReply ? "ml-10 sm:ml-12 border-l-2 pl-4" : ""} style={isReply ? { borderColor: "var(--border)" } : {}}>
        <div className="flex gap-3 py-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden"
            style={{ background: "var(--surface)", color: "var(--muted)" }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              getAvatarFallback(displayName)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              {username ? (
                <Link
                  href={`/u/${username}`}
                  className="text-sm font-semibold hover:opacity-70 transition-opacity"
                  style={{ color: "var(--fg)" }}
                >
                  {displayName}
                </Link>
              ) : (
                <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
                  {displayName}
                </span>
              )}
              <span className="text-[11px]" style={{ color: "var(--subtle)" }}>
                {formatDate(comment.created_at)}
              </span>
            </div>
            <p
              className="text-sm mt-0.5 leading-relaxed"
              style={{ color: "var(--muted)", overflowWrap: "break-word", wordBreak: "break-word" }}
            >
              {renderContent(comment.content)}
            </p>
            {currentUserId && !isReply && username && (
              <button
                type="button"
                onClick={() => handleReply(comment.id, username)}
                className="flex items-center gap-1 mt-1 text-xs font-medium transition-colors hover:opacity-80"
                style={{ color: "var(--subtle)" }}
              >
                <CornerDownRight className="w-3 h-3" />
                Rispondi
              </button>
            )}
          </div>
        </div>
        {replies.length > 0 && (
          <div className="space-y-0">
            {replies.map((r) => (
              <CommentItem key={r.id} comment={r} isReply />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 px-0 sm:px-0">
      <BackButton />

      {/* Post */}
      <article
        className="rounded-2xl border p-5 sm:p-6"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        {/* Author header */}
        <div className="flex items-center gap-3 mb-5">
          <Link
            href={`/u/${author?.username ?? "#"}`}
            className="flex items-center gap-2.5 group min-w-0 flex-1"
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center font-bold overflow-hidden shrink-0"
              style={{ background: "var(--surface)", color: "var(--fg)" }}
            >
              {author?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={author.avatar_url}
                  alt={author.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                getAvatarFallback(author?.display_name ?? "?")
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span
                  className="font-semibold group-hover:opacity-70 transition-opacity truncate"
                  style={{ color: "var(--fg)" }}
                >
                  {author?.display_name}
                </span>
                {author?.is_verified && (
                  <span className="text-xs shrink-0" style={{ color: "var(--accent)" }}>
                    ✓
                  </span>
                )}
              </div>
              <p className="text-xs truncate" style={{ color: "var(--subtle)" }}>
                @{author?.username} · {formatDate(post.created_at)}
              </p>
            </div>
          </Link>
          <Link
            href={`/report?type=post&id=${post.id}`}
            className="shrink-0 p-1 transition-colors hover:opacity-60"
            style={{ color: "var(--subtle)" }}
          >
            <Flag className="w-4 h-4" />
          </Link>
        </div>

        {/* Title */}
        {post.title && (
          <h1
            className="text-xl sm:text-2xl font-bold mb-3 leading-tight"
            style={{ color: "var(--fg)", fontFamily: "var(--fh)" }}
          >
            {post.title}
          </h1>
        )}

        {/* Content */}
        <p
          className="whitespace-pre-wrap leading-relaxed text-[15px]"
          style={{
            color: "var(--muted)",
            overflowWrap: "break-word",
            wordBreak: "break-word",
          }}
        >
          {renderContent(post.content)}
        </p>

        {/* Link card */}
        {post.link_url && (
          <a
            href={post.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 mt-4 rounded-xl border p-3.5 transition-all hover:opacity-80"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <LinkIcon className="w-4 h-4 shrink-0" style={{ color: "var(--accent)" }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate" style={{ color: "var(--fg)" }}>
                {post.link_url}
              </p>
              <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "var(--subtle)" }}>
                Apri link <ExternalLink className="w-3 h-3" />
              </p>
            </div>
          </a>
        )}

        {/* Poll */}
        {pollData && <PollWidget data={pollData} currentUserId={currentUserId} />}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/explore?q=${tag}`}
                className="text-xs px-2.5 py-1 rounded-full transition-colors"
                style={{
                  color: "var(--muted)",
                  background: "var(--surface)",
                }}
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Like row */}
        <div
          className="flex items-center gap-4 mt-5 pt-4 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            onClick={handleLike}
            disabled={isPending}
            className="flex items-center gap-2 transition-all active:scale-95"
            style={{ color: liked ? "var(--accent)" : "var(--subtle)" }}
          >
            <Heart
              className="w-5 h-5"
              strokeWidth={liked ? 0 : 1.7}
              fill={liked ? "var(--accent)" : "none"}
            />
            <span className="text-sm tabular-nums font-medium">{likeCount}</span>
            <span className="text-sm">{liked ? "Ti piace" : "Mi piace"}</span>
          </button>
          <span className="text-sm" style={{ color: "var(--subtle)" }}>
            {comments.length} commenti
          </span>
        </div>
      </article>

      {/* Comments section */}
      <section
        className="rounded-2xl border overflow-hidden"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-semibold text-[15px]" style={{ color: "var(--fg)" }}>
            Commenti
          </h2>
        </div>

        {/* Comment form */}
        {currentUserId ? (
          <div className="border-b" style={{ borderColor: "var(--border)" }}>
            {replyTarget && (
              <div
                className="flex items-center justify-between px-5 pt-3 pb-0 gap-2"
                style={{ color: "var(--muted)" }}
              >
                <span className="text-xs flex items-center gap-1">
                  <CornerDownRight className="w-3 h-3" />
                  Rispondi a{" "}
                  <strong style={{ color: "var(--accent)" }}>@{replyTarget.username}</strong>
                </span>
                <button
                  type="button"
                  onClick={clearReply}
                  className="w-5 h-5 rounded-full flex items-center justify-center transition-colors hover:opacity-70"
                  style={{ background: "var(--surface)", color: "var(--muted)" }}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <form
              onSubmit={handleComment}
              className="flex items-end gap-3 px-5 py-4"
            >
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={commentText}
                  onChange={(e) => { setCommentText(e.target.value); detectMention(e.target.value, e.target.selectionStart ?? e.target.value.length); }}
                  onKeyUp={(e) => { const el = e.currentTarget; detectMention(el.value, el.selectionStart ?? el.value.length); }}
                  onClick={(e) => { const el = e.currentTarget; detectMention(el.value, el.selectionStart ?? el.value.length); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleComment(e as unknown as React.FormEvent);
                    }
                  }}
                  placeholder={replyTarget ? `Rispondi a @${replyTarget.username}...` : "Scrivi un commento..."}
                  rows={1}
                  className="w-full resize-none input-base py-2.5 text-sm"
                  style={{ minHeight: 44, background: "var(--surface)" }}
                />
                {mentionSuggestions.length > 0 && (
                  <div
                    className="absolute left-0 right-0 bottom-full mb-1 rounded-xl border shadow-lg z-50 overflow-hidden"
                    style={{ background: "var(--card)", borderColor: "var(--border)" }}
                  >
                    {mentionSuggestions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); selectMention(s); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors hover:opacity-80"
                        style={{ background: "var(--card)" }}
                      >
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden" style={{ background: "var(--surface)" }}>
                          {s.avatar_url
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={s.avatar_url} alt={s.display_name} className="w-full h-full object-cover" />
                            : <span style={{ color: "var(--muted)" }}>{s.display_name.slice(0, 2).toUpperCase()}</span>}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: "var(--fg)" }}>{s.display_name}</p>
                          <p className="text-xs truncate" style={{ color: "var(--subtle)" }}>@{s.username}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={!commentText.trim() || isPending}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 disabled:opacity-30"
                style={{
                  background: commentText.trim() ? "var(--accent)" : "var(--surface)",
                  color: commentText.trim() ? "white" : "var(--subtle)",
                }}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="px-5 py-4 border-b text-sm" style={{ borderColor: "var(--border)", color: "var(--subtle)" }}>
            <Link href="/login" className="font-medium hover:underline" style={{ color: "var(--accent)" }}>
              Accedi
            </Link>{" "}
            per commentare
          </div>
        )}

        {/* Comments list */}
        <div className="divide-y" style={{ "--tw-divide-opacity": "1" } as React.CSSProperties}>
          {topLevel.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm" style={{ color: "var(--subtle)" }}>
              Nessun commento ancora. Sii il primo!
            </p>
          ) : (
            topLevel.map((comment) => (
              <div key={comment.id} className="px-5 border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                <CommentItem comment={comment} />
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
