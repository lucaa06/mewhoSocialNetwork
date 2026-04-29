import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNavActive } from "@/components/admin/AdminNavActive";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

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
      {/* Sidebar — desktop only */}
      <aside className="hidden lg:flex w-52 bg-white border-r border-black/6 shrink-0 flex-col fixed h-full z-10">
        <div className="px-4 py-4 border-b border-black/6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-black text-sm">
              me<span style={{ color: "#FF4A24", fontStyle: "italic" }}>&amp;</span>who
            </span>
            <span className="text-[9px] border border-[#FF4A24]/30 text-[#FF4A24] px-1.5 py-0.5 rounded uppercase tracking-widest">admin</span>
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
      <main className="flex-1 lg:ml-52 overflow-auto min-h-screen w-full">
        {/* Top bar with hamburger (mobile) + switch button */}
        <div className="sticky top-0 z-20 bg-[#f7f7f5] border-b border-black/6 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <AdminMobileNav displayName={profile.display_name} />
          <Link href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border border-black/10 bg-white hover:bg-black/5 ml-auto"
            style={{ color: "rgba(0,0,0,0.5)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            <span className="hidden sm:inline">Vista utente normale</span>
            <span className="sm:hidden">Vista utente</span>
          </Link>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8">{children}</div>
      </main>
    </div>
  );
}
