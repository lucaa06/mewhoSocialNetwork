import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminCommentsTable } from "@/components/admin/AdminCommentsTable";

export const metadata: Metadata = { title: "Admin — Commenti" };

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const supabase = createAdminClient();

  let query = supabase
    .from("comments")
    .select(`id, content, created_at, post_id,
      author:profiles!author_id(id, username, display_name)`)
    .is("deleted_at", null)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(100);

  if (params.q) query = query.ilike("content", `%${params.q}%`);

  const { data: comments } = await query;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">Commenti</h1>
      <form method="GET" className="flex gap-2">
        <input name="q" defaultValue={params.q} placeholder="Cerca nel contenuto..."
          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30"
        />
        <button type="submit" className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm transition-colors">
          Cerca
        </button>
      </form>
      <AdminCommentsTable comments={(comments ?? []) as never[]} />
    </div>
  );
}
