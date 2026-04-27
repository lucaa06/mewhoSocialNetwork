import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

const getProfile = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, role")
    .eq("id", user.id)
    .single();
  return data;
});

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={profile} />
      <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-16 pb-28">
        <main className="mt-4">{children}</main>
      </div>
      <BottomNav user={profile} />
    </div>
  );
}
