import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNavActive } from "@/components/admin/AdminNavActive";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-[#f7f7f5] flex">
      {/* Sidebar */}
      <aside className="w-52 bg-white border-r border-black/6 shrink-0 flex flex-col fixed h-full z-10">
        <div className="px-4 py-4 border-b border-black/6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-black text-sm">
              me<span style={{ color: "#DD4132", fontStyle: "italic" }}>&amp;</span>who
            </span>
            <span className="text-[9px] border border-[#DD4132]/30 text-[#DD4132] px-1.5 py-0.5 rounded uppercase tracking-widest">admin</span>
          </div>
          <p className="text-[11px] text-black/35 mt-1 truncate">{profile.display_name}</p>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          <AdminNavActive />
        </nav>
        <div className="px-4 py-3 border-t border-black/6">
          <Link href="/" className="text-xs text-black/30 hover:text-black transition-colors">← Torna al sito</Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-52 overflow-auto min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
