import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ChatView } from "@/components/messages/ChatView";

type Props = { params: Promise<{ id: string }> };

export default async function ConversationPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("conversation_members")
    .select("conversation:conversations(id, theme)")
    .eq("conversation_id", id)
    .eq("user_id", user.id)
    .single();
  if (!membership) notFound();

  const { data: otherMember } = await supabase
    .from("conversation_members")
    .select("user_id, last_read_at, profiles(id, username, display_name, avatar_url, role, avatar_emoji)")
    .eq("conversation_id", id)
    .neq("user_id", user.id)
    .single();

  const conv = (membership.conversation as unknown as { id: string; theme: string });

  return (
    <Suspense>
      <ChatView
        conversationId={id}
        currentUserId={user.id}
        otherUser={(otherMember?.profiles as never) ?? null}
        theme={conv.theme}
        otherLastReadAt={otherMember?.last_read_at ?? null}
      />
    </Suspense>
  );
}
