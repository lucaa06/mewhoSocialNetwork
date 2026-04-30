import type { Post } from "@/types/database";
import { PostCard } from "./PostCard";

export function PostFeed({ posts, emptyMessage, isLoggedIn }: {
  posts: Post[];
  emptyMessage?: string;
  isLoggedIn?: boolean;
}) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border p-14 text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <p className="text-sm" style={{ color: "var(--muted)" }}>{emptyMessage ?? "Nessun post ancora."}</p>
        {!emptyMessage && <p className="text-xs mt-1" style={{ color: "var(--subtle)" }}>Sii il primo a condividere un&apos;idea.</p>}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {posts.map(post => <PostCard key={post.id} post={post} isLoggedIn={isLoggedIn} />)}
    </div>
  );
}
