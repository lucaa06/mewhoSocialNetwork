import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getServerGeo } from "@/lib/geo";
import { PostFeed } from "@/components/feed/PostFeed";
import { GeoFilter } from "@/components/feed/GeoFilter";

export const metadata: Metadata = {
  title: "Home",
  description: "Il tuo feed personalizzato di idee e progetti vicino a te.",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; city?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const geo = await getServerGeo();
  const { data: { user } } = await supabase.auth.getUser();

  const country = params.country ?? geo.country_code ?? undefined;
  const city = params.city ?? geo.city ?? undefined;

  let query = supabase
    .from("posts")
    .select(`
      id, title, content, category, tags, country_code, city,
      visibility, created_at, reactions_count, comments_count,
      author:profiles!author_id(id, username, display_name, avatar_url, role, is_verified)
    `)
    .eq("visibility", "public")
    .eq("is_hidden", false)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(20);

  if (country) query = query.eq("country_code", country);
  if (city) query = query.ilike("city", city);

  const { data: posts } = await query;

  let likedIds = new Set<string>();
  let savedIds = new Set<string>();
  if (user && posts?.length) {
    const { data: reactions } = await supabase
      .from("reactions")
      .select("post_id, type")
      .eq("user_id", user.id)
      .in("post_id", posts.map(p => p.id));
    likedIds = new Set(reactions?.filter(r => r.type === "like").map(r => r.post_id));
    savedIds = new Set(reactions?.filter(r => r.type === "idea").map(r => r.post_id));
  }

  const postsWithReactions = posts?.map(p => ({
    ...p,
    user_reaction: likedIds.has(p.id) ? "like" as const : savedIds.has(p.id) ? "idea" as const : null,
  }));

  return (
    <div className="space-y-4">
      <GeoFilter currentCountry={country} currentCity={city} detectedCountry={geo.country_code} />
      <PostFeed posts={(postsWithReactions ?? []) as never[]} />
    </div>
  );
}
