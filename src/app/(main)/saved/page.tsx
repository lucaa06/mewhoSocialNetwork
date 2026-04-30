import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostFeed } from "@/components/feed/PostFeed";
import { BackButton } from "@/components/layout/BackButton";

export const metadata: Metadata = {
  title: "Salvati",
  robots: { index: false, follow: false },
};

export default async function SavedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("reactions")
    .select(`
      post:posts(
        *, author:profiles!author_id(id, username, display_name, avatar_url, avatar_emoji, role, is_verified)
      )
    `)
    .eq("user_id", user.id)
    .eq("type", "idea")
    .order("created_at", { ascending: false })
    .limit(50);

  const posts = (data ?? []).map((d) => d.post).filter(Boolean).filter((p) => !(p as { deleted_at?: string | null }).deleted_at);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <BackButton href="/" />
        <h1 className="text-xl font-bold" style={{ color: "var(--fg)" }}>Post salvati</h1>
      </div>
      <PostFeed posts={posts as never[]} />
      {posts.length === 0 && (
        <p className="text-center text-black/40 py-12">Nessun post salvato.</p>
      )}
    </div>
  );
}
