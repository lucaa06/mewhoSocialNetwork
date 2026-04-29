import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackButton } from "@/components/layout/BackButton";
import { CommunityPostForm } from "@/components/community/CommunityPostForm";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { CommunityJoinButton } from "@/components/community/CommunityJoinButton";
import { PostFeed } from "@/components/feed/PostFeed";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("communities")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!data) return { title: "Community non trovata" };
  return { title: data.name, description: data.description ?? undefined };
}

export default async function CommunitySlugPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: community } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (!community) notFound();

  const [{ data: posts }, memberResult] = await Promise.all([
    supabase
      .from("posts")
      .select(`*, author:profiles!author_id(id, username, display_name, avatar_url, avatar_emoji, role, is_verified)`)
      .eq("community_id", community.id)
      .eq("is_hidden", false)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(50),
    user
      ? supabase
          .from("community_members")
          .select("user_id")
          .eq("community_id", community.id)
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const isCreator = user?.id === community.created_by;
  const isMember = !!memberResult.data;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <BackButton href="/community" label="Community" />
        {!isCreator && (
          <CommunityJoinButton
            communityId={community.id}
            isMember={isMember}
            isLoggedIn={!!user}
          />
        )}
      </div>

      <CommunityHeader
        communityId={community.id}
        name={community.name}
        description={community.description}
        category={community.category ?? null}
        avatarEmoji={community.avatar_emoji ?? null}
        isCreator={isCreator}
      />

      {user && (
        <CommunityPostForm communityId={community.id} communityName={community.name} />
      )}

      <PostFeed
        posts={(posts ?? []) as never[]}
        isLoggedIn={!!user}
        emptyMessage="Nessun post ancora — sii il primo a scrivere qualcosa!"
      />
    </div>
  );
}
