import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostFeed } from "@/components/feed/PostFeed";
import { BackButton } from "@/components/layout/BackButton";

type Props = { params: Promise<{ username: string }> };

export default async function UserPostsPage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles").select("id").eq("username", username).single();
  if (!profile) notFound();

  const { data: posts } = await supabase
    .from("posts")
    .select(`*, author:profiles!author_id(id, username, display_name, avatar_url, avatar_emoji, role, is_verified)`)
    .eq("author_id", profile.id)
    .eq("visibility", "public")
    .eq("is_hidden", false)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <BackButton href={`/u/${username}`} label={`@${username}`} />
      <PostFeed posts={posts ?? []} />
    </div>
  );
}
