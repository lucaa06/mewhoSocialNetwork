import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatView } from "@/components/messages/ChatView";

type Props = { params: Promise<{ id: string }> };

export default async function ConversationPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify membership
  const { data: membership } = await supabase
    .from("conversation_members")
    .select("last_read_at, conversation:conversations(id, theme)")
    .eq("conversation_id", id)
    .eq("user_id", user.id)
    .single();
  if (!membership) notFound();

  // Get other member
  const { data: otherMember } = await supabase
    .from("conversation_members")
    .select("user_id, profiles(id, username, display_name, avatar_url, role, avatar_emoji)")
    .eq("conversation_id", id)
    .neq("user_id", user.id)
    .single();

  // Get other user's public key
  const otherId = otherMember?.user_id;
  const { data: otherKey } = otherId ? await supabase
    .from("user_public_keys")
    .select("public_key_jwk")
    .eq("user_id", otherId)
    .single() : { data: null };

  // Get my public key
  const { data: myKey } = await supabase
    .from("user_public_keys")
    .select("public_key_jwk")
    .eq("user_id", user.id)
    .single();

  const conv = (membership.conversation as unknown as { id: string; theme: string });

  return (
    <ChatView
      conversationId={id}
      currentUserId={user.id}
      otherUser={(otherMember?.profiles as never) ?? null}
      theme={conv.theme}
      myPublicKeyJwk={myKey?.public_key_jwk ?? null}
      otherPublicKeyJwk={otherKey?.public_key_jwk ?? null}
    />
  );
}
