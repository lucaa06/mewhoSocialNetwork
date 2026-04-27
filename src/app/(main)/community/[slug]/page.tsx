import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

export default async function CommunityPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: community } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (!community) notFound();

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-black/6 p-6">
        <h1 className="text-2xl font-bold text-black">{community.name}</h1>
        {community.description && (
          <p className="text-black/55 mt-2">{community.description}</p>
        )}
      </div>
      {/* TODO: community posts feed */}
    </div>
  );
}
