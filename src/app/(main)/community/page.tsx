import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CommunityRequestButton } from "@/components/community/CommunityRequestModal";
import { CommunitySearch } from "@/components/community/CommunitySearch";
import { CommunityGrid } from "@/components/community/CommunityGrid";

export const metadata: Metadata = {
  title: "Community",
  description: "Esplora le community di me&who — startup, ricerca, creatività e molto altro.",
};

export default async function CommunityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: allCommunities } = await supabase
    .from("communities")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(100);

  let myCommunities: typeof allCommunities = [];
  let joinedCommunities: typeof allCommunities = [];

  if (user) {
    const [createdResult, joinedResult] = await Promise.all([
      supabase
        .from("communities")
        .select("*")
        .eq("created_by", user.id)
        .eq("is_public", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("community_members")
        .select("community:communities(*)")
        .eq("user_id", user.id)
        .order("joined_at", { ascending: false }),
    ]);

    myCommunities = createdResult.data ?? [];
    joinedCommunities = (joinedResult.data ?? [])
      .map((r: { community: unknown }) => r.community)
      .filter(Boolean) as typeof allCommunities;
  }

  const myIds = new Set([...(myCommunities ?? []).map(c => c.id), ...(joinedCommunities ?? []).map(c => c.id)]);
  const exploreCommunities = (allCommunities ?? []).filter(c => !myIds.has(c.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: "var(--fg)", fontFamily: "var(--fh)" }}>
          Community
        </h1>
        <CommunityRequestButton />
      </div>

      {/* Le tue community */}
      {user && (myCommunities?.length ?? 0) > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Le tue community
          </h2>
          <CommunityGrid communities={myCommunities ?? []} />
        </section>
      )}

      {/* Community che segui */}
      {user && (joinedCommunities?.length ?? 0) > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Community che segui
          </h2>
          <CommunityGrid communities={joinedCommunities ?? []} />
        </section>
      )}

      {/* Esplora */}
      <section className="space-y-3">
        {user && (
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Esplora community
          </h2>
        )}
        <CommunitySearch communities={exploreCommunities} />
      </section>
    </div>
  );
}
