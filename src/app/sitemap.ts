import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600; // re-generate hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://meandwho.com";
  const supabase = await createClient();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "always", priority: 1 },
    { url: `${baseUrl}/explore`, changeFrequency: "always", priority: 0.9 },
    { url: `${baseUrl}/community`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/legal/terms`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/legal/privacy`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/legal/community-guidelines`, changeFrequency: "monthly", priority: 0.3 },
  ];

  // Public profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("username, updated_at")
    .eq("is_banned", false)
    .is("deleted_at", null)
    .limit(5000);

  const profileRoutes: MetadataRoute.Sitemap = (profiles ?? []).map((p) => ({
    url: `${baseUrl}/u/${p.username}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Public posts
  const { data: posts } = await supabase
    .from("posts")
    .select("id, updated_at")
    .eq("visibility", "public")
    .eq("is_hidden", false)
    .is("deleted_at", null)
    .limit(50000);

  const postRoutes: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url: `${baseUrl}/post/${p.id}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "daily",
    priority: 0.6,
  }));

  // Communities
  const { data: communities } = await supabase
    .from("communities")
    .select("slug, created_at")
    .eq("is_public", true);

  const communityRoutes: MetadataRoute.Sitemap = (communities ?? []).map((c) => ({
    url: `${baseUrl}/community/${c.slug}`,
    lastModified: new Date(c.created_at),
    changeFrequency: "daily",
    priority: 0.65,
  }));

  return [...staticRoutes, ...profileRoutes, ...postRoutes, ...communityRoutes];
}
