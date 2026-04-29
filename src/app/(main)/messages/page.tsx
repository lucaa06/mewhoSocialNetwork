import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessagesList } from "@/components/messages/MessagesList";

export const metadata: Metadata = { title: "Messaggi", robots: { index: false, follow: false } };

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Existing conversations
  const { data: memberships } = await supabase
    .from("conversation_members")
    .select("conversation_id, last_read_at, conversation:conversations(id, theme, last_message_at)")
    .eq("user_id", user.id);

  const convIds = (memberships ?? []).map(m => m.conversation_id);
  const { data: allMembers } = convIds.length
    ? await supabase
        .from("conversation_members")
        .select("conversation_id, user_id, profiles(id, username, display_name, avatar_url, role, avatar_emoji)")
        .in("conversation_id", convIds)
        .neq("user_id", user.id)
    : { data: [] };

  // Only people I follow OR who follow me (connections)
  const [{ data: iFollow }, { data: followMe }] = await Promise.all([
    supabase.from("follows").select("following_id").eq("follower_id", user.id),
    supabase.from("follows").select("follower_id").eq("following_id", user.id),
  ]);

  const connectionIds = [
    ...new Set([
      ...(iFollow ?? []).map(f => f.following_id),
      ...(followMe ?? []).map(f => f.follower_id),
    ]),
  ].filter(id => id !== user.id);

  const { data: connections } = connectionIds.length
    ? await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, role, avatar_emoji")
        .in("id", connectionIds)
        .is("deleted_at", null)
        .eq("is_banned", false)
        .order("display_name")
    : { data: [] };

  return (
    <MessagesList
      currentUserId={user.id}
      memberships={(memberships ?? []) as never[]}
      otherMembers={(allMembers ?? []) as never[]}
      connections={(connections ?? []) as never[]}
    />
  );
}
