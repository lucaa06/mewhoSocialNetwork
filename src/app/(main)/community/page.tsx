import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Community",
  description: "Esplora le community di me&who — startup, ricerca, creatività e molto altro.",
};

export default async function CommunityPage() {
  const supabase = await createClient();
  const { data: communities } = await supabase
    .from("communities")
    .select("id, slug, name, description, avatar_url, country_code")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-black">Community</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(communities ?? []).map((c) => (
          <Link
            key={c.id}
            href={`/community/${c.slug}`}
            className="bg-white rounded-xl border border-black/6 p-4 hover:border-black/18 transition-colors"
          >
            <h2 className="font-semibold text-black">{c.name}</h2>
            {c.description && (
              <p className="text-sm text-black/50 mt-1 line-clamp-2">{c.description}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
