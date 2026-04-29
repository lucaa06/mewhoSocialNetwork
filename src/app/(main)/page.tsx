import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getServerGeo } from "@/lib/geo";
import { PostFeed } from "@/components/feed/PostFeed";
import { GeoFilter } from "@/components/feed/GeoFilter";
import { CreatePostBar } from "@/components/feed/CreatePostBar";
import { FeedTabs } from "@/components/feed/FeedTabs";
import { LandingPage } from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Home",
  description: "Il tuo feed personalizzato di idee e progetti vicino a te.",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; city?: string; tab?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const geo = await getServerGeo();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <LandingPage />;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, avatar_emoji, role")
    .eq("id", user.id)
    .single();

  const country = params.country ?? geo.country_code ?? undefined;
  const city    = params.city ?? geo.city ?? undefined;
  const tab     = params.tab ?? "all";

  let posts: Record<string, unknown>[] | null = null;

  if (tab === "following" && user) {
    // Fetch IDs of people the user follows
    const { data: follows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);

    const followingIds = (follows ?? []).map(f => f.following_id);

    if (followingIds.length > 0) {
      let q = supabase
        .from("posts")
        .select(`
          id, title, content, category, tags, country_code, city,
          visibility, created_at, reactions_count, comments_count,
          author:profiles!author_id(id, username, display_name, avatar_url, avatar_emoji, role, is_verified)
        `)
        .eq("visibility", "public")
        .eq("is_hidden", false)
        .is("deleted_at", null)
        .in("author_id", followingIds)
        .order("created_at", { ascending: false })
        .limit(20);

      if (country) q = q.eq("country_code", country);
      if (city)    q = q.ilike("city", city);

      const { data } = await q;
      posts = data;
    } else {
      posts = [];
    }
  } else if (tab === "community") {
    const [{ data: createdCommunities }, { data: joinedCommunities }] = await Promise.all([
      supabase.from("communities").select("id").eq("created_by", user.id),
      supabase.from("community_members").select("community_id").eq("user_id", user.id),
    ]);

    const communityIds = [
      ...(createdCommunities ?? []).map(c => c.id),
      ...(joinedCommunities ?? []).map((c: { community_id: string }) => c.community_id),
    ];

    if (communityIds.length === 0) {
      posts = [];
    } else {
      let q = supabase
        .from("posts")
        .select(`
          id, title, content, category, tags, country_code, city,
          visibility, created_at, reactions_count, comments_count,
          community:communities!community_id(id, name, slug, avatar_emoji, category),
          author:profiles!author_id(id, username, display_name, avatar_url, avatar_emoji, role, is_verified)
        `)
        .eq("visibility", "public")
        .eq("is_hidden", false)
        .is("deleted_at", null)
        .in("community_id", communityIds)
        .order("created_at", { ascending: false })
        .limit(20);

      if (country) q = q.eq("country_code", country);
      if (city)    q = q.ilike("city", city);

      const { data } = await q;
      posts = data;
    }
  } else {
    // "all" tab — default behavior
    let q = supabase
      .from("posts")
      .select(`
        id, title, content, category, tags, country_code, city,
        visibility, created_at, reactions_count, comments_count,
        author:profiles!author_id(id, username, display_name, avatar_url, avatar_emoji, role, is_verified)
      `)
      .eq("visibility", "public")
      .eq("is_hidden", false)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(20);

    if (country) q = q.eq("country_code", country);
    if (city)    q = q.ilike("city", city);

    const { data } = await q;
    posts = data;
  }

  let likedIds = new Set<string>();
  let savedIds = new Set<string>();
  if (user && posts?.length) {
    const { data: reactions } = await supabase
      .from("reactions")
      .select("post_id, type")
      .eq("user_id", user.id)
      .in("post_id", posts.map(p => p.id as string));
    likedIds = new Set(reactions?.filter(r => r.type === "like").map(r => r.post_id));
    savedIds = new Set(reactions?.filter(r => r.type === "idea").map(r => r.post_id));
  }

  const postsWithReactions = (posts ?? []).map(p => ({
    ...p,
    user_reaction: likedIds.has(p.id as string) ? "like" as const : savedIds.has(p.id as string) ? "idea" as const : null,
  }));

  return (
    <div className="space-y-3">
      <CreatePostBar user={profile} />
      <Suspense>
        <FeedTabs currentTab={tab} />
      </Suspense>
      {tab !== "community" && (
        <GeoFilter currentCountry={country} currentCity={city} detectedCountry={geo.country_code} />
      )}
      <PostFeed
        posts={postsWithReactions as never[]}
        isLoggedIn={!!user}
        emptyMessage={
          tab === "following"
            ? "Non segui ancora nessuno — inizia a seguire qualcuno per vedere i loro post qui."
            : tab === "community"
            ? "Non hai ancora unito nessuna community — esplora e unisciti a una per vedere i post qui."
            : undefined
        }
      />
    </div>
  );
}
