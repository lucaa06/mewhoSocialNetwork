import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Users, FileText, Flag, TrendingUp, Activity, MessageCircle } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Dashboard" };

export default async function AdminDashboard() {
  const supabase = createAdminClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const [
    { count: totalUsers },
    { count: newUsers30d },
    { count: totalPosts },
    { count: pendingReports },
    { count: totalComments },
    { count: activeUsers7d },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).is("deleted_at", null).eq("is_banned", false),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    supabase.from("posts").select("*", { count: "exact", head: true }).is("deleted_at", null).eq("is_hidden", false),
    supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("comments").select("*", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("posts").select("author_id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
  ]);

  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("id, username, display_name, role, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentPosts } = await supabase
    .from("posts")
    .select("id, title, content, created_at, author:profiles!author_id(username)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    { label: "Utenti totali",  value: totalUsers ?? 0,     icon: Users,         href: "/admin/users",    bg: "#eff6ff", color: "#2563eb" },
    { label: "Nuovi (30gg)",   value: newUsers30d ?? 0,    icon: TrendingUp,    href: "/admin/users",    bg: "#f0fdf4", color: "#16a34a" },
    { label: "Attivi (7gg)",   value: activeUsers7d ?? 0,  icon: Activity,      href: "/admin/users",    bg: "#faf5ff", color: "#7c3aed" },
    { label: "Post totali",    value: totalPosts ?? 0,     icon: FileText,      href: "/admin/posts",    bg: "#fffbeb", color: "#d97706" },
    { label: "Commenti",       value: totalComments ?? 0,  icon: MessageCircle, href: "/admin/comments", bg: "#f9fafb", color: "#4b5563" },
    { label: "Segnalazioni",   value: pendingReports ?? 0, icon: Flag,          href: "/admin/reports",  bg: pendingReports ? "#fef2f2" : "#f9fafb", color: pendingReports ? "#dc2626" : "#4b5563" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-black">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon, href, bg, color }) => (
          <Link key={label} href={href}
            className="rounded-2xl p-4 border border-black/6 hover:border-black/12 transition-colors"
            style={{ background: bg }}
          >
            <Icon className="w-4 h-4 mb-3" style={{ color }} strokeWidth={1.8} />
            <div className="text-2xl font-bold text-black">{value.toLocaleString("it-IT")}</div>
            <div className="text-xs text-black/40 mt-1">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-black/60">Ultimi utenti</h2>
            <Link href="/admin/users" className="text-xs text-black/30 hover:text-black transition-colors">Vedi tutti →</Link>
          </div>
          <div className="bg-white border border-black/6 rounded-2xl divide-y divide-black/4">
            {(recentUsers ?? []).map(u => (
              <Link key={u.id} href={`/admin/users/${u.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-black/2 transition-colors"
              >
                <div>
                  <p className="text-sm text-black font-medium">{u.display_name}</p>
                  <p className="text-xs text-black/35">@{u.username} · {u.role}</p>
                </div>
                <span className="text-[11px] text-black/25">
                  {new Date(u.created_at).toLocaleDateString("it-IT")}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-black/60">Post recenti</h2>
            <Link href="/admin/posts" className="text-xs text-black/30 hover:text-black transition-colors">Vedi tutti →</Link>
          </div>
          <div className="bg-white border border-black/6 rounded-2xl divide-y divide-black/4">
            {(recentPosts ?? []).map(p => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm text-black font-medium truncate">
                    {p.title ?? (p.content as string).slice(0, 40)}
                  </p>
                  <p className="text-xs text-black/35">
                    @{(p.author as unknown as { username: string } | null)?.username}
                  </p>
                </div>
                <span className="text-[11px] text-black/25 shrink-0 ml-2">
                  {new Date(p.created_at).toLocaleDateString("it-IT")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
