import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostDetail } from "@/components/feed/PostDetail";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("title, content, author:profiles!author_id(display_name)")
    .eq("id", id)
    .single();

  if (!post) return { title: "Post non trovato" };

  const title = post.title ?? (post.content as string).slice(0, 60);
  const author = (post.author as unknown as { display_name: string } | null)?.display_name ?? "";

  return {
    title,
    description: `${author} su me&who — ${(post.content as string).slice(0, 150)}`,
    openGraph: { title, type: "article", images: [`/api/og?id=${id}`] },
  };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: post } = await supabase
    .from("posts")
    .select(`
      *, reactions_count, comments_count,
      author:profiles!author_id(id, username, display_name, avatar_url, role, is_verified, country_code, city)
    `)
    .eq("id", id)
    .eq("is_hidden", false)
    .is("deleted_at", null)
    .single();

  if (!post) notFound();

  const [{ data: comments }, { data: reaction }] = await Promise.all([
    supabase
      .from("comments")
      .select(`*, author:profiles!author_id(id, username, display_name, avatar_url)`)
      .eq("post_id", id)
      .eq("is_hidden", false)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
    user
      ? supabase
          .from("reactions")
          .select("type")
          .eq("post_id", id)
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const postWithReaction = {
    ...post,
    user_reaction: (reaction as { type: string } | null)?.type ?? null,
  };

  return (
    <PostDetail
      post={postWithReaction as never}
      comments={comments ?? []}
      currentUserId={user?.id}
    />
  );
}
