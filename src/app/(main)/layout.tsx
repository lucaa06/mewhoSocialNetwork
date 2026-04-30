import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { AiFloatingButton } from "@/components/layout/AiFloatingButton";
import { BetaButton } from "@/components/beta/BetaButton";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { PullToRefresh } from "@/components/layout/PullToRefresh";
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

const getProfile = cache(async () => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, avatar_emoji, role, is_beta")
      .eq("id", user.id)
      .single();
    if (error) {
      const { data: base } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, role")
        .eq("id", user.id)
        .single();
      return base ? { ...base, avatar_emoji: null, is_beta: false } : null;
    }
    return data;
  } catch {
    return null;
  }
});

const getUnreadCount = cache(async () => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    return count ?? 0;
  } catch {
    return 0;
  }
});

const getUnreadMessages = cache(async () => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;
    const { data: memberships } = await supabase
      .from("conversation_members")
      .select("conversation_id, last_read_at")
      .eq("user_id", user.id);
    if (!memberships?.length) return 0;
    const convIds = memberships.map(m => m.conversation_id);
    const { data: msgs } = await supabase
      .from("messages")
      .select("conversation_id, created_at, sender_id")
      .in("conversation_id", convIds)
      .neq("sender_id", user.id);
    if (!msgs) return 0;
    let total = 0;
    for (const m of memberships) {
      const lastRead = m.last_read_at ? new Date(m.last_read_at) : new Date(0);
      total += msgs.filter(msg => msg.conversation_id === m.conversation_id && new Date(msg.created_at) > lastRead).length;
    }
    return total;
  } catch {
    return 0;
  }
});

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const [profile, unreadCount, unreadMessages] = await Promise.all([getProfile(), getUnreadCount(), getUnreadMessages()]);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar user={profile} unreadCount={unreadCount} unreadMessages={unreadMessages} />
      <div className="max-w-2xl lg:max-w-3xl mx-auto px-3 sm:px-4 lg:px-6 pt-16 pb-28">
        <main className="mt-4">{children}</main>
      </div>
      <BottomNav user={profile} unreadCount={unreadCount} unreadMessages={unreadMessages} />
      <ScrollToTopButton />
      <PullToRefresh />
      {profile && <AiFloatingButton />}
      {profile?.is_beta && <BetaButton userId={profile.id} />}
    </div>
  );
}
