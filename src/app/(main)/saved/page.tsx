import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostFeed } from "@/components/feed/PostFeed";

export const metadata: Metadata = {
  title: "Salvati",
  robots: { index: false, follow: false },
};

export default async function SavedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("saved_posts")
    .select(`
      post:posts(
        *, author:profiles!author_id(id, username, display_name, avatar_url, role, is_verified)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const posts = (data ?? []).map((d) => d.post).filter(Boolean);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold text-black">Post salvati</h1>
      <PostFeed posts={posts as never[]} />
      {posts.length === 0 && (
        <p className="text-center text-black/40 py-12">Nessun post salvato.</p>
      )}
    </div>
  );
}
