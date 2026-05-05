import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostDetail } from "@/components/feed/PostDetail";
import type { PollData, PollOption } from "@/types/database";

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  // Fetch poll if exists
  const { data: poll } = await supabase
    .from("polls")
    .select("*")
    .eq("post_id", id)
    .maybeSingle();

  let pollData: PollData | null = null;
  if (poll) {
    const [{ data: votes }, { data: userVoteRow }] = await Promise.all([
      supabase.from("poll_votes").select("option_id").eq("poll_id", poll.id),
      user
        ? supabase
            .from("poll_votes")
            .select("option_id")
            .eq("poll_id", poll.id)
            .eq("user_id", user.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const voteCounts: Record<string, number> = {};
    (votes ?? []).forEach((v: { option_id: string }) => {
      voteCounts[v.option_id] = (voteCounts[v.option_id] ?? 0) + 1;
    });

    pollData = {
      id: poll.id as string,
      post_id: poll.post_id as string,
      question: poll.question as string,
      options: poll.options as PollOption[],
      voteCounts,
      userVote: (userVoteRow as { option_id: string } | null)?.option_id ?? null,
      totalVotes: (votes ?? []).length,
    };
  }

  return (
    <PostDetail
      post={postWithReaction as never}
      comments={comments ?? []}
      currentUserId={user?.id}
      pollData={pollData}
    />
  );
}
