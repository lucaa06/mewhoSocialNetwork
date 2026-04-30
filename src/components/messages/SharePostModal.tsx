"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Bot } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getAvatarFallback } from "@/lib/utils";

interface OtherUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  avatar_emoji?: string | null;
}

interface Conversation {
  id: string;
  otherUser: OtherUser | null;
}

export function SharePostModal({
  postId,
  postTitle,
  onClose,
}: {
  postId: string;
  postTitle: string | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConversations() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: memberships } = await supabase
        .from("conversation_members")
        .select("conversation_id")
        .eq("user_id", user.id);

      if (!memberships?.length) { setLoading(false); return; }

      const convIds = memberships.map((m: { conversation_id: string }) => m.conversation_id);

      const { data: otherMembers } = await supabase
        .from("conversation_members")
        .select("conversation_id, profiles(id, username, display_name, avatar_url, avatar_emoji)")
        .in("conversation_id", convIds)
        .neq("user_id", user.id);

      const convList: Conversation[] = convIds.map((cid: string) => {
        const member = (otherMembers ?? []).find(
          (m: { conversation_id: string }) => m.conversation_id === cid
        );
        const p = member?.profiles as OtherUser | undefined;
        return { id: cid, otherUser: p ?? null };
      });

      setConversations(convList);
      setLoading(false);
    }
    fetchConversations();
  }, []);

  function handleSelectConversation(convId: string) {
    router.push(`/messages/${convId}?share=${postId}`);
    onClose();
  }

  function handleSelectAi() {
    router.push(`/messages/ai?share=${postId}`);
    onClose();
  }

  function renderAvatar(user: OtherUser) {
    const cls = "w-10 h-10 rounded-full shrink-0 flex items-center justify-center overflow-hidden text-sm font-bold";
    if (user.avatar_emoji) {
      return (
        <div className={cls} style={{ background: "var(--surface)", fontSize: 20 }}>
          {user.avatar_emoji}
        </div>
      );
    }
    if (user.avatar_url) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={user.avatar_url} alt={user.display_name} className={cls + " object-cover"} />;
    }
    return (
      <div className={cls} style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
        {getAvatarFallback(user.display_name)}
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto"
        style={{
          background: "var(--card)",
          borderRadius: "1.5rem 1.5rem 0 0",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
          animation: "slideUp 0.22s cubic-bezier(.4,0,.2,1)",
          maxHeight: "75vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
        `}</style>

        {/* Handle + header */}
        <div className="shrink-0 px-5 pt-4 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
          {/* Drag handle */}
          <div className="w-10 h-1 rounded-full mx-auto mb-3" style={{ background: "var(--border)" }} />
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
              Condividi post
            </p>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
              style={{ color: "var(--muted)", background: "var(--surface)" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {postTitle && (
            <p className="text-xs mt-1 truncate" style={{ color: "var(--muted)" }}>
              &ldquo;{postTitle}&rdquo;
            </p>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-2">
          {/* AI chat option */}
          <button
            onClick={handleSelectAi}
            className="w-full flex items-center gap-3 px-5 py-3 transition-colors text-left"
            style={{ color: "var(--fg)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--surface)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)" }}
            >
              <Bot className="w-5 h-5" style={{ color: "var(--accent)" }} strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>who? AI</p>
              <p className="text-xs" style={{ color: "var(--subtle)" }}>Analizza o discuti con l&apos;AI</p>
            </div>
          </button>

          {/* Separator */}
          {conversations.length > 0 && (
            <div className="px-5 my-1">
              <div style={{ height: 1, background: "var(--border)" }} />
            </div>
          )}

          {loading && (
            <div className="px-5 py-4">
              <p className="text-xs" style={{ color: "var(--subtle)" }}>Caricamento conversazioni…</p>
            </div>
          )}

          {!loading && conversations.length === 0 && (
            <div className="px-5 py-4">
              <p className="text-xs" style={{ color: "var(--subtle)" }}>Nessuna conversazione trovata.</p>
            </div>
          )}

          {conversations.map(conv => {
            const u = conv.otherUser;
            if (!u) return null;
            return (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className="w-full flex items-center gap-3 px-5 py-3 transition-colors text-left"
                style={{ color: "var(--fg)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--surface)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {renderAvatar(u)}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--fg)" }}>
                    {u.display_name ?? u.username}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--subtle)" }}>
                    @{u.username}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom safe area */}
        <div className="shrink-0 h-4 sm:h-2" />
      </div>
    </>
  );
}
