import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPostsTable } from "@/components/admin/AdminPostsTable";

export const metadata: Metadata = { title: "Admin — Post" };

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const supabase = createAdminClient();

  let query = supabase
    .from("posts")
    .select(`id, title, content, is_hidden, created_at, reactions_count, comments_count,
      author:profiles!author_id(id, username, display_name)`)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  if (params.q) query = query.or(`title.ilike.%${params.q}%,content.ilike.%${params.q}%`);

  const { data: posts } = await query;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-black">Post</h1>
      <form method="GET" className="flex gap-2">
        <input name="q" defaultValue={params.q} placeholder="Cerca post..."
          className="flex-1 px-3 py-2.5 bg-white border border-black/10 rounded-xl text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-[var(--accent)]"
        />
        <button type="submit" className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-black/80 transition-colors">
          Cerca
        </button>
      </form>
      <AdminPostsTable posts={(posts ?? []) as never[]} />
    </div>
  );
}
