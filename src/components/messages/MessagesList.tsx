"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Pencil, Search, X, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getAvatarFallback } from "@/lib/utils";
import Link from "next/link";

interface Profile { id: string; username: string; display_name: string; avatar_url: string | null; role: string; avatar_emoji?: string | null }
interface Membership { conversation_id: string; last_read_at: string; conversation: { id: string; theme: string; last_message_at: string } }
interface OtherMember { conversation_id: string; user_id: string; profiles: Profile }

export function MessagesList({ currentUserId, memberships, otherMembers, connections }: {
  currentUserId: string;
  memberships: Membership[];
  otherMembers: OtherMember[];
  connections: Profile[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [loadingChat, setLoadingChat] = useState<string | null>(null);

  const sorted = [...memberships].sort(
    (a, b) => new Date(b.conversation.last_message_at).getTime() - new Date(a.conversation.last_message_at).getTime()
  );

  function getOther(convId: string) {
    return otherMembers.find(m => m.conversation_id === convId)?.profiles ?? null;
  }

  async function startChat(userId: string) {
    if (loadingChat) return;
    setLoadingChat(userId);
    setShowNew(false);
    try {
      const supabase = createClient();
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from("conversation_members")
        .select("conversation_id")
        .eq("user_id", currentUserId);
      const myConvIds = (existing ?? []).map(e => e.conversation_id);

      if (myConvIds.length) {
        const { data: shared } = await supabase
          .from("conversation_members")
          .select("conversation_id")
          .eq("user_id", userId)
          .in("conversation_id", myConvIds);
        if (shared?.length) {
          router.push(`/messages/${shared[0].conversation_id}`);
          return;
        }
      }
      // Create new conversation
      const { data: conv, error: convErr } = await supabase
        .from("conversations")
        .insert({ theme: "default" })
        .select("id")
        .single();
      if (convErr || !conv) { console.error("conv error", convErr); return; }

      const { error: memErr } = await supabase.from("conversation_members").insert([
        { conversation_id: conv.id, user_id: currentUserId },
        { conversation_id: conv.id, user_id: userId },
      ]);
      if (memErr) { console.error("member error", memErr); return; }

      router.push(`/messages/${conv.id}`);
    } finally {
      setLoadingChat(null);
    }
  }

  const filteredUsers = connections.filter(u =>
    u.display_name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  function AvatarEl({ profile, size = "md" }: { profile: Profile; size?: "sm" | "md" }) {
    const sz = size === "sm" ? "w-9 h-9 text-base" : "w-11 h-11 text-xl";
    if (profile.avatar_emoji) return <div className={`${sz} squircle flex items-center justify-center bg-black/5 shrink-0`}>{profile.avatar_emoji}</div>;
    if (profile.avatar_url) return <img src={profile.avatar_url} alt="" className={`${sz} squircle object-cover shrink-0`} />;
    return <div className={`${sz} squircle bg-black/8 flex items-center justify-center font-semibold text-black/60 shrink-0`}>{getAvatarFallback(profile.display_name)}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-black">Messaggi</h1>
        <button onClick={() => setShowNew(v => !v)}
          className="w-9 h-9 flex items-center justify-center squircle-sm transition-colors"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
          <Pencil className="w-4 h-4" />
        </button>
      </div>

      {/* New chat search */}
      {showNew && (
        <div className="mb-4 rounded-2xl border border-black/8 overflow-hidden" style={{ background: "var(--card)" }}>
          <div className="flex items-center gap-2 px-3 py-2 border-b border-black/6">
            <Search className="w-4 h-4 text-black/30 shrink-0" />
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cerca utente..."
              className="flex-1 bg-transparent text-sm text-black placeholder:text-black/30 focus:outline-none" />
            <button onClick={() => { setShowNew(false); setSearch(""); }}><X className="w-4 h-4 text-black/30" /></button>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-black/4">
            {filteredUsers.map(u => (
              <button key={u.id} onClick={() => startChat(u.id)} disabled={!!loadingChat}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-black/3 transition-colors text-left disabled:opacity-60">
                <AvatarEl profile={u} size="sm" />
                <div>
                  <p className="text-sm font-medium text-black">{u.display_name}</p>
                  <p className="text-xs text-black/40">@{u.username}</p>
                </div>
              </button>
            ))}
            {filteredUsers.length === 0 && (
              <p className="px-4 py-8 text-sm text-center text-black/30">
                {connections.length === 0 ? "Segui qualcuno per chattare" : "Nessuna connessione trovata"}
              </p>
            )}
          </div>
        </div>
      )}

      {/* AI conversation - pinned */}
      <Link href="/messages/ai"
        className="flex items-center gap-3 p-4 rounded-2xl border border-black/6 mb-2 hover:border-black/12 transition-colors"
        style={{ background: "var(--card)" }}>
        <div className="w-11 h-11 squircle flex items-center justify-center shrink-0"
          style={{ background: "rgba(221,65,50,0.1)" }}>
          <Bot className="w-5 h-5" style={{ color: "var(--accent)" }} strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-black">who? AI</p>
            <span className="text-xs text-black/25">Sempre online</span>
          </div>
          <p className="text-xs text-black/40 truncate mt-0.5">Cerca post, scopri persone, esplora...</p>
        </div>
      </Link>

      {/* Separator */}
      {sorted.length > 0 && (
        <p className="text-[11px] font-semibold text-black/30 uppercase tracking-widest px-1 my-3">Conversazioni</p>
      )}

      {/* Conversations */}
      <div className="space-y-1.5">
        {sorted.map(m => {
          const other = getOther(m.conversation_id);
          if (!other) return null;
          return (
            <Link key={m.conversation_id} href={`/messages/${m.conversation_id}`}
              className="flex items-center gap-3 p-4 rounded-2xl border border-black/6 hover:border-black/12 transition-colors"
              style={{ background: "var(--card)" }}>
              <AvatarEl profile={other} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-black">{other.display_name}</p>
                  <span className="text-xs text-black/25">
                    {new Date(m.conversation.last_message_at).toLocaleDateString("it-IT")}
                  </span>
                </div>
                <p className="text-xs text-black/35 mt-0.5">🔒 Messaggio cifrato</p>
              </div>
            </Link>
          );
        })}
        {sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-black/4 flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-black/25" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-black/35">Nessuna conversazione</p>
            <button onClick={() => setShowNew(true)}
              className="text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
              Inizia una chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
