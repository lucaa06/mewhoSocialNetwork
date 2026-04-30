"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Pencil, Search, X, MessageCircle, Check, UserX, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getAvatarFallback } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

interface Profile { id: string; username: string; display_name: string; avatar_url: string | null; role: string; avatar_emoji?: string | null }
interface Membership { conversation_id: string; last_read_at: string; conversation: { id: string; theme: string; last_message_at: string } }
interface OtherMember { conversation_id: string; user_id: string; profiles: Profile }
interface ChatRequest { id: string; sender_id: string; created_at: string; sender: Profile }

export function MessagesList({ currentUserId, memberships, otherMembers, connections, unreadMap, incomingRequests }: {
  currentUserId: string;
  memberships: Membership[];
  otherMembers: OtherMember[];
  connections: Profile[];
  unreadMap: Record<string, number>;
  incomingRequests: ChatRequest[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [loadingChat, setLoadingChat] = useState<string | null>(null);
  const [requests, setRequests] = useState<ChatRequest[]>(incomingRequests);

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
      const { data: existing } = await supabase.from("conversation_members").select("conversation_id").eq("user_id", currentUserId);
      const myConvIds = (existing ?? []).map(e => e.conversation_id);
      if (myConvIds.length) {
        const { data: shared } = await supabase.from("conversation_members").select("conversation_id").eq("user_id", userId).in("conversation_id", myConvIds);
        if (shared?.length) { router.push(`/messages/${shared[0].conversation_id}`); return; }
      }
      const { data: conv, error } = await supabase.from("conversations").insert({ theme: "default" }).select("id").single();
      if (error || !conv) { toast.error("Errore nella creazione della chat"); return; }
      await supabase.from("conversation_members").insert([
        { conversation_id: conv.id, user_id: currentUserId },
        { conversation_id: conv.id, user_id: userId },
      ]);
      router.push(`/messages/${conv.id}`);
    } finally {
      setLoadingChat(null);
    }
  }

  async function acceptRequest(req: ChatRequest) {
    const supabase = createClient();
    // Create conversation
    const { data: conv, error } = await supabase.from("conversations").insert({ theme: "default" }).select("id").single();
    if (error || !conv) { toast.error("Errore"); return; }
    await supabase.from("conversation_members").insert([
      { conversation_id: conv.id, user_id: currentUserId },
      { conversation_id: conv.id, user_id: req.sender_id },
    ]);
    await supabase.from("chat_requests").update({ status: "accepted" }).eq("id", req.id);
    setRequests(prev => prev.filter(r => r.id !== req.id));
    router.push(`/messages/${conv.id}`);
  }

  async function rejectRequest(reqId: string) {
    const supabase = createClient();
    await supabase.from("chat_requests").update({ status: "rejected" }).eq("id", reqId);
    setRequests(prev => prev.filter(r => r.id !== reqId));
    toast.success("Richiesta rifiutata");
  }

  const filteredUsers = connections.filter(u =>
    u.display_name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  function Avatar({ profile, size = "md" }: { profile: Profile; size?: "sm" | "md" | "lg" }) {
    const sz = size === "sm" ? "w-9 h-9" : size === "lg" ? "w-12 h-12" : "w-11 h-11";
    const fs = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-xl";
    if (profile.avatar_emoji) return <div className={`${sz} ${fs} squircle flex items-center justify-center shrink-0`} style={{ background: "var(--surface)" }}>{profile.avatar_emoji}</div>;
    if (profile.avatar_url) return <img src={profile.avatar_url} alt="" className={`${sz} squircle object-cover shrink-0`} />;
    return <div className={`${sz} squircle flex items-center justify-center font-semibold shrink-0`} style={{ background: "var(--accent)", color: "#fff" }}>{getAvatarFallback(profile.display_name)}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: "var(--fg)" }}>Messaggi</h1>
        <button onClick={() => setShowNew(v => !v)}
          className="w-9 h-9 flex items-center justify-center squircle-sm transition-colors"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
          <Pencil className="w-4 h-4" />
        </button>
      </div>

      {/* New chat search */}
      {showNew && (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 px-3 py-2.5 border-b" style={{ borderColor: "var(--border)" }}>
            <Search className="w-4 h-4 shrink-0" style={{ color: "var(--muted)" }} />
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cerca utente..."
              className="flex-1 bg-transparent text-sm focus:outline-none" style={{ color: "var(--fg)" }} />
            <button onClick={() => { setShowNew(false); setSearch(""); }}><X className="w-4 h-4" style={{ color: "var(--muted)" }} /></button>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y" style={{ borderColor: "var(--border)" }}>
            {filteredUsers.map(u => (
              <button key={u.id} onClick={() => startChat(u.id)} disabled={!!loadingChat}
                className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left disabled:opacity-60"
                style={{ background: loadingChat === u.id ? "var(--surface)" : "transparent" }}>
                <Avatar profile={u} size="sm" />
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--fg)" }}>{u.display_name}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>@{u.username}</p>
                </div>
                {loadingChat === u.id && <span className="ml-auto text-xs" style={{ color: "var(--muted)" }}>…</span>}
              </button>
            ))}
            {filteredUsers.length === 0 && (
              <p className="px-4 py-8 text-sm text-center" style={{ color: "var(--muted)" }}>
                {connections.length === 0 ? "Segui qualcuno per chattare" : "Nessun utente trovato"}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Incoming chat requests */}
      {requests.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Bell className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
              Richieste chat ({requests.length})
            </p>
          </div>
          {requests.map(req => (
            <div key={req.id} className="flex items-center gap-3 p-4 rounded-2xl border"
              style={{ background: "var(--card)", borderColor: "var(--accent)", boxShadow: "0 0 0 1px color-mix(in srgb, var(--accent) 15%, transparent)" }}>
              <Avatar profile={req.sender} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{req.sender.display_name}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>@{req.sender.username} vuole chattare con te</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => rejectRequest(req.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                  style={{ background: "var(--surface)", color: "var(--muted)" }}>
                  <UserX className="w-4 h-4" />
                </button>
                <button onClick={() => acceptRequest(req)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white transition-all active:scale-95"
                  style={{ background: "var(--accent)" }}>
                  <Check className="w-3.5 h-3.5" />
                  Accetta
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI chat — pinned */}
      <Link href="/messages/ai"
        className="flex items-center gap-3 p-4 rounded-2xl border transition-all"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="w-11 h-11 squircle flex items-center justify-center shrink-0"
          style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)" }}>
          <Bot className="w-5 h-5" style={{ color: "var(--accent)" }} strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>who? AI</p>
          <p className="text-xs truncate mt-0.5" style={{ color: "var(--muted)" }}>Cerca post, scopri persone, esplora...</p>
        </div>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "color-mix(in srgb, #16a34a 15%, transparent)", color: "#16a34a" }}>
          Online
        </span>
      </Link>

      {/* Conversations */}
      {sorted.length > 0 && (
        <p className="text-[11px] font-bold uppercase tracking-widest px-1" style={{ color: "var(--muted)" }}>
          Conversazioni
        </p>
      )}
      <div className="space-y-1.5">
        {sorted.map(m => {
          const other = getOther(m.conversation_id);
          if (!other) return null;
          const unread = unreadMap[m.conversation_id] ?? 0;
          const lastMsg = new Date(m.conversation.last_message_at);
          const isToday = new Date().toDateString() === lastMsg.toDateString();
          const timeLabel = isToday
            ? lastMsg.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
            : lastMsg.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" });

          return (
            <Link key={m.conversation_id} href={`/messages/${m.conversation_id}`}
              className="flex items-center gap-3 p-4 rounded-2xl border transition-all"
              style={{
                background: unread > 0 ? "color-mix(in srgb, var(--accent) 6%, var(--card))" : "var(--card)",
                borderColor: unread > 0 ? "color-mix(in srgb, var(--accent) 30%, var(--border))" : "var(--border)",
              }}>
              {/* Avatar with unread dot */}
              <div className="relative shrink-0">
                <Avatar profile={other} size="md" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1"
                    style={{ background: "var(--accent)" }}>
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm truncate" style={{ color: "var(--fg)", fontWeight: unread > 0 ? 700 : 500 }}>
                    {other.display_name}
                  </p>
                  <span className="text-[10px] shrink-0" style={{ color: unread > 0 ? "var(--accent)" : "var(--subtle)" }}>{timeLabel}</span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: unread > 0 ? "var(--muted)" : "var(--subtle)" }}>
                  {unread > 0 ? `${unread} nuov${unread === 1 ? "o" : "i"} messagg${unread === 1 ? "io" : "i"}` : "🔒 Chat cifrata"}
                </p>
              </div>
            </Link>
          );
        })}

        {sorted.length === 0 && requests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "var(--surface)" }}>
              <MessageCircle className="w-7 h-7" style={{ color: "var(--subtle)" }} strokeWidth={1.5} />
            </div>
            <p className="text-sm" style={{ color: "var(--muted)" }}>Nessuna conversazione</p>
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
