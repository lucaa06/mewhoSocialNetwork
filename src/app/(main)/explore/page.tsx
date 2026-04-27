import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PostFeed } from "@/components/feed/PostFeed";
import { getAvatarFallback } from "@/lib/utils";
import { Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Esplora",
  description: "Scopri post, persone e community da tutto il mondo.",
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; country?: string; category?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const q = params.q?.trim();

  const [postsResult, peopleResult, communitiesResult] = await Promise.all([
    // Posts
    (() => {
      let query = supabase
        .from("posts")
        .select(`
          id, title, content, category, tags, country_code, city, created_at,
          reactions_count, comments_count,
          author:profiles!author_id(id, username, display_name, avatar_url, role, is_verified)
        `)
        .eq("visibility", "public")
        .eq("is_hidden", false)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(q ? 10 : 30);
      if (q) query = query.or(`content.ilike.%${q}%,title.ilike.%${q}%,tags.cs.{${q}}`);
      if (params.country) query = query.eq("country_code", params.country);
      return query;
    })(),

    // Persone
    q
      ? supabase
          .from("profiles")
          .select("id, username, display_name, bio, avatar_url, role, is_verified, country_code, city")
          .or(`username.ilike.%${q}%,display_name.ilike.%${q}%,bio.ilike.%${q}%`)
          .eq("is_banned", false)
          .is("deleted_at", null)
          .limit(6)
      : Promise.resolve({ data: [] }),

    // Community
    q
      ? supabase
          .from("communities")
          .select("id, slug, name, description, avatar_url, members_count")
          .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
          .eq("is_public", true)
          .limit(4)
      : Promise.resolve({ data: [] }),
  ]);

  const posts = postsResult.data ?? [];
  const people = (peopleResult.data ?? []) as Array<{
    id: string; username: string; display_name: string; bio: string | null;
    avatar_url: string | null; role: string; is_verified: boolean;
    country_code: string | null; city: string | null;
  }>;
  const communities = (communitiesResult.data ?? []) as Array<{
    id: string; slug: string; name: string; description: string | null;
    avatar_url: string | null; members_count: number | null;
  }>;

  const hasResults = posts.length > 0 || people.length > 0 || communities.length > 0;

  return (
    <div className="space-y-6">
      {/* Query label */}
      {q ? (
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-black/30" />
          <span className="text-sm text-black/50">
            Risultati per <span className="font-semibold text-black">&ldquo;{q}&rdquo;</span>
          </span>
          <Link href="/explore" className="ml-auto text-xs text-black/30 hover:text-black transition-colors">
            Cancella
          </Link>
        </div>
      ) : (
        <p className="text-sm text-black/40">Post recenti da tutto il mondo</p>
      )}

      {q && !hasResults && (
        <div className="bg-white rounded-2xl border border-black/6 p-12 text-center">
          <Search className="w-8 h-8 text-black/15 mx-auto mb-3" />
          <p className="text-black/40 text-sm">Nessun risultato per &ldquo;{q}&rdquo;</p>
        </div>
      )}

      {/* Persone */}
      {people.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-3">Persone</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {people.map(person => (
              <Link
                key={person.id}
                href={`/u/${person.username}`}
                className="flex items-center gap-3 bg-white rounded-2xl border border-black/6 p-3.5 hover:border-black/12 hover:bg-black/1 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-black/6 text-black font-semibold flex items-center justify-center overflow-hidden shrink-0 text-sm">
                  {person.avatar_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={person.avatar_url} alt={person.display_name} className="w-full h-full object-cover" />
                    : getAvatarFallback(person.display_name)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-black truncate">{person.display_name}</span>
                    {person.is_verified && <span className="text-[var(--accent)] text-[10px]">✓</span>}
                  </div>
                  <p className="text-xs text-black/40 truncate">
                    @{person.username}
                    {person.city && ` · ${person.city}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Community */}
      {communities.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-3">Community</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {communities.map(c => (
              <Link
                key={c.id}
                href={`/community/${c.slug}`}
                className="flex items-center gap-3 bg-white rounded-2xl border border-black/6 p-3.5 hover:border-black/12 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-black/6 text-black font-bold flex items-center justify-center overflow-hidden shrink-0 text-sm">
                  {c.avatar_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={c.avatar_url} alt={c.name} className="w-full h-full object-cover" />
                    : c.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-black truncate">{c.name}</p>
                  <p className="text-xs text-black/40 truncate">
                    {c.members_count ?? 0} membri
                    {c.description && ` · ${c.description}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Post */}
      {posts.length > 0 && (
        <section>
          {q && <h2 className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-3">Post</h2>}
          <PostFeed posts={posts as never[]} />
        </section>
      )}
    </div>
  );
}
