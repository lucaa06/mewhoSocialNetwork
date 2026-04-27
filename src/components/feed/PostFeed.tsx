import type { Post } from "@/types/database";
import { PostCard } from "./PostCard";

export function PostFeed({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-black/6 p-14 text-center">
        <p className="text-black/35 text-sm">Nessun post ancora.</p>
        <p className="text-black/20 text-xs mt-1">Sii il primo a condividere un&apos;idea.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {posts.map(post => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
