import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfilePostTabs } from "@/components/profile/ProfilePostTabs";

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
        .select(`*, author:profiles!author_id(id, username, display_name, avatar_url, avatar_emoji, role, is_verified)`)
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

  const { data: { user: currentUser } } = await supabase.auth.getUser();
  const isOwn = currentUser?.id === profile.id;

  const postAuthorSelect = `*, author:profiles!author_id(id, username, display_name, avatar_url, avatar_emoji, role, is_verified)`;

  // Only fetch liked/saved for own profile
  const [likedResult, savedResult] = isOwn
    ? await Promise.all([
        supabase
          .from("reactions")
          .select(`post:posts(${postAuthorSelect})`)
          .eq("user_id", profile.id)
          .eq("type", "like")
          .order("created_at", { ascending: false })
          .limit(30),
        supabase
          .from("reactions")
          .select(`post:posts(${postAuthorSelect})`)
          .eq("user_id", profile.id)
          .eq("type", "idea")
          .order("created_at", { ascending: false })
          .limit(30),
      ])
    : [{ data: null }, { data: null }];

  const likedPosts = (likedResult.data ?? []).map((r: { post: unknown }) => r.post).filter(Boolean).filter((p) => !(p as { deleted_at?: string | null }).deleted_at) as never[];
  const savedPosts = (savedResult.data ?? []).map((r: { post: unknown }) => r.post).filter(Boolean).filter((p) => !(p as { deleted_at?: string | null }).deleted_at) as never[];

  return (
    <div className="space-y-5">
      <ProfileHeader
        profile={profile}
        followersCount={followersCount ?? 0}
        followingCount={followingCount ?? 0}
        postsCount={posts?.length ?? 0}
        isOwn={isOwn}
      />

      <ProfilePostTabs
        posts={posts ?? []}
        likedPosts={likedPosts}
        savedPosts={savedPosts}
        isOwn={isOwn}
      />
    </div>
  );
}
