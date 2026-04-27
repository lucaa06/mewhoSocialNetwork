import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PostFeed } from "@/components/feed/PostFeed";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, bio, avatar_url")
    .eq("username", username)
    .single();

  if (!profile) return { title: "Profilo non trovato" };

  return {
    title: `${profile.display_name} (@${username})`,
    description: profile.bio ?? `Profilo di ${profile.display_name} su me&who`,
    openGraph: {
      title: `${profile.display_name} (@${username})`,
      description: profile.bio ?? undefined,
      images: profile.avatar_url ? [profile.avatar_url] : undefined,
      type: "profile",
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .eq("is_banned", false)
    .is("deleted_at", null)
    .single();

  if (!profile) notFound();

  const [{ data: posts }, { count: followersCount }, { count: followingCount }] =
    await Promise.all([
      supabase
        .from("posts")
        .select(`*, author:profiles!author_id(id, username, display_name, avatar_url, role, is_verified)`)
        .eq("author_id", profile.id)
        .eq("visibility", "public")
        .eq("is_hidden", false)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", profile.id),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", profile.id),
    ]);

  return (
    <div className="space-y-4">
      <ProfileHeader
        profile={profile}
        followersCount={followersCount ?? 0}
        followingCount={followingCount ?? 0}
      />
      <PostFeed posts={posts ?? []} />
    </div>
  );
}
