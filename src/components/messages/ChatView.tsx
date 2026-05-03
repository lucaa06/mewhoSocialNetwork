"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Palette, Check, CheckCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getAvatarFallback } from "@/lib/utils";

interface Profile { id: string; username: string; display_name: string; avatar_url: string | null; role: string; avatar_emoji?: string | null }
interface Message { id: string; conversation_id: string; sender_id: string; ciphertext: string; iv: string; created_at: string; is_deleted: boolean; text: string }

const THEMES: Record<string, { label: string; swatch: string; bg: string; sentBg: string; receivedBg: string; sentText: string; receivedText: string }> = {
  default:  { label: "Default",  swatch: "#111111",  bg: "var(--bg)",   sentBg: "#111",      receivedBg: "var(--card)", sentText: "#fff", receivedText: "var(--fg)" },
  night:    { label: "Notte",    swatch: "#FF4A24",  bg: "#0d0d14",     sentBg: "#FF4A24",   receivedBg: "#1e1e2e",     sentText: "#fff", receivedText: "#e8e8ff" },
  forest:   { label: "Foresta",  swatch: "#16a34a",  bg: "#0a160a",     sentBg: "#16a34a",   receivedBg: "#111d11",     sentText: "#fff", receivedText: "#d0f0d0" },
  ocean:    { label: "Oceano",   swatch: "#2563eb",  bg: "#070d1e",     sentBg: "#2563eb",   receivedBg: "#0c1530",     sentText: "#fff", receivedText: "#c8d8ff" },
  sunset:   { label: "Tramonto", swatch: "#f97316",  bg: "#130a04",     sentBg: "#f97316",   receivedBg: "#1e1108",     sentText: "#fff", receivedText: "#fde8cc" },
  lavender: { label: "Lavanda",  swatch: "#7c3aed",  bg: "#0e0a1a",     sentBg: "#7c3aed",   receivedBg: "#160f28",     sentText: "#fff", receivedText: "#e0d0ff" },
  rose:     { label: "Rosa",     swatch: "#e11d48",  bg: "#150509",     sentBg: "#e11d48",   receivedBg: "#200810",     sentText: "#fff", receivedText: "#ffd0da" },
  mint:     { label: "Menta",    swatch: "#0d9488",  bg: "#041210",     sentBg: "#0d9488",   receivedBg: "#081a18",     sentText: "#fff", receivedText: "#c0f0ec" },
};

function RainbowLink({ href, text }: { href: string; text: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ background: "linear-gradient(90deg,#FF4A24,#f59e0b,#10b981,#2563eb,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textDecoration: "underline" }}>
      {text}
    </a>
  );
}

function MessageText({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return <>{parts.map((p, i) => /^https?:\/\//.test(p) ? <RainbowLink key={i} href={p} text={p} /> : <span key={i}>{p}</span>)}</>;
}

function CollapsibleText({ text, long, color }: { text: string; long: boolean; color: string }) {
  const [expanded, setExpanded] = useState(false);
  if (!long) return <MessageText text={text} />;
  return (
    <>
      <MessageText text={expanded ? text : text.slice(0, 280) + "…"} />
      <button onClick={() => setExpanded(v => !v)}
        className="block mt-1 text-[11px] font-semibold underline underline-offset-2 opacity-70 hover:opacity-100 transition-opacity"
        style={{ color }}>
        {expanded ? "Mostra meno" : "Leggi di più"}
      </button>
    </>
  );
}

function AvatarEl({ profile, size = 9 }: { profile: Profile; size?: number }) {
  const cls = `w-${size} h-${size} rounded-full shrink-0 flex items-center justify-center overflow-hidden`;
  if (profile.avatar_emoji) return <div className={cls} style={{ background: "var(--surface)", fontSize: size * 2 }}>{profile.avatar_emoji}</div>;
  if (profile.avatar_url) return <img src={profile.avatar_url} alt="" className={`${cls} object-cover`} />;
  return (
    <div className={cls} style={{ background: "var(--accent)", color: "#fff", fontSize: size * 1.4, fontWeight: 600 }}>
      {getAvatarFallback(profile.display_name)}
    </div>
  );
}

function rawToMsg(m: Omit<Message, "text">): Message {
  return { ...m, text: m.iv === "PLAIN" ? m.ciphertext : "🔒 Messaggio precedente non leggibile" };
}

export function ChatView({ conversationId, currentUserId, otherUser, theme: initialTheme, otherLastReadAt: initialOtherLastReadAt }: {
  conversationId: string;
  currentUserId: string;
  otherUser: Profile | null;
  theme: string;
  otherLastReadAt: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [theme, setTheme] = useState(initialTheme || "default");
  const [showThemes, setShowThemes] = useState(false);
  const [otherLastReadAt, setOtherLastReadAt] = useState<string | null>(initialOtherLastReadAt);
  const [otherTyping, setOtherTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const broadcastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = THEMES[theme] ?? THEMES.default;

  // Pre-fill input when a post is shared via URL param
  useEffect(() => {
    const shareId = searchParams.get("share");
    if (!shareId) return;
    const title = searchParams.get("title");
    const url = `https://mewho.it/post/${shareId}`;
    setInput(title ? `📎 Post condiviso: ${title} — ${url}` : `📎 Post condiviso: ${url}`);
    router.replace(pathname);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    // Load messages
    supabase.from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setMessages((data ?? []).map(rawToMsg));
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      });

    // Mark as read
    supabase.from("conversation_members")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("user_id", currentUserId)
      .then(() => {});

    // Realtime: new messages + typing indicator
    const channel = supabase.channel(`chat:${conversationId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const m = rawToMsg(payload.new as Omit<Message, "text">);
          setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, m]);
          setOtherTyping(false);
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        })
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "conversation_members", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const row = payload.new as { user_id: string; last_read_at: string };
          if (row.user_id !== currentUserId) setOtherLastReadAt(row.last_read_at);
        })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if ((payload as { user_id: string }).user_id === currentUserId) return;
        setOtherTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setOtherTyping(false), 2500);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (broadcastTimeoutRef.current) clearTimeout(broadcastTimeoutRef.current);
    };
  }, [conversationId, currentUserId]);

  function broadcastTyping() {
    if (!channelRef.current) return;
    if (broadcastTimeoutRef.current) return; // debounce: send at most once per second
    channelRef.current.send({ type: "broadcast", event: "typing", payload: { user_id: currentUserId } });
    broadcastTimeoutRef.current = setTimeout(() => { broadcastTimeoutRef.current = null; }, 1000);
  }

  async function sendMessage(e?: React.FormEvent | React.KeyboardEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");

    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId, conversation_id: conversationId, sender_id: currentUserId,
      ciphertext: text, iv: "PLAIN", created_at: new Date().toISOString(), is_deleted: false, text,
    };
    setMessages(prev => [...prev, optimistic]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 30);

    const supabase = createClient();
    const { data } = await supabase.from("messages")
      .insert({ conversation_id: conversationId, sender_id: currentUserId, ciphertext: text, iv: "PLAIN" })
      .select("id").single();

    if (data?.id) {
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: data.id } : m));
    }
    await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversationId);
  }

  async function changeTheme(newTheme: string) {
    setTheme(newTheme);
    setShowThemes(false);
    const supabase = createClient();
    await supabase.from("conversations").update({ theme: newTheme }).eq("id", conversationId);
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="h-full flex flex-col" style={{ background: t.bg }}>

      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-3 py-2.5 relative z-10"
        style={{ background: t.bg, borderBottom: "1px solid var(--border)" }}>
        <button onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
          style={{ color: "var(--muted)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--surface)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
          <ArrowLeft className="w-5 h-5" />
        </button>

        {otherUser ? (
          <Link href={`/u/${otherUser.username}`} className="flex items-center gap-3 flex-1 min-w-0 group">
            <AvatarEl profile={otherUser} size={9} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate group-hover:underline" style={{ color: "var(--fg)" }}>
                {otherUser.display_name ?? otherUser.username}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-full shrink-0" style={{ background: "var(--surface)" }} />
            <p className="text-sm font-semibold truncate" style={{ color: "var(--fg)" }}>Utente</p>
          </div>
        )}

        {/* Theme picker */}
        <div className="relative">
          <button onClick={() => setShowThemes(v => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ color: "var(--muted)" }}>
            <Palette className="w-4 h-4" />
          </button>
          {showThemes && (
            <div className="absolute right-0 top-10 rounded-2xl border shadow-lg p-3 z-20 w-[200px]"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2 px-1" style={{ color: "var(--subtle)" }}>Tema chat</p>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(THEMES).map(([key, val]) => (
                  <button key={key} onClick={() => changeTheme(key)} title={val.label}
                    className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-xl transition-all"
                      style={{
                        background: val.swatch,
                        outline: theme === key ? "2px solid var(--accent)" : "2px solid transparent",
                        outlineOffset: 2,
                        transform: theme === key ? "scale(1.1)" : "scale(1)",
                      }} />
                    <span className="text-[9px] truncate w-full text-center"
                      style={{ color: theme === key ? "var(--accent)" : "var(--subtle)", fontWeight: theme === key ? 700 : 400 }}>
                      {val.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-20">
            <p className="text-xs text-center" style={{ color: "var(--subtle)" }}>
              Nessun messaggio ancora.<br />Scrivi qualcosa per iniziare!
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          const isRead = otherLastReadAt !== null && new Date(msg.created_at) <= new Date(otherLastReadAt);
          const isDelivered = otherLastReadAt !== null;
          const isTemp = msg.id.startsWith("temp-");
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[75%]">
                <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                  style={{
                    background: isMine ? t.sentBg : t.receivedBg,
                    color: isMine ? t.sentText : t.receivedText,
                    borderRadius: isMine ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                  }}>
                  <CollapsibleText text={msg.text} long={msg.text.length > 300} color={isMine ? t.sentText : t.receivedText} />
                </div>
                <div className={`flex items-center gap-1 mt-0.5 ${isMine ? "justify-end" : "justify-start"}`}>
                  <span className="text-[10px]" style={{ color: "var(--subtle)" }}>{formatTime(msg.created_at)}</span>
                  {isMine && !isTemp && (
                    isRead
                      ? <CheckCheck className="w-3 h-3" strokeWidth={2.5} style={{ color: "var(--accent)" }} />
                      : isDelivered
                        ? <CheckCheck className="w-3 h-3" strokeWidth={2} style={{ color: "var(--subtle)" }} />
                        : <Check className="w-3 h-3" strokeWidth={2} style={{ color: "var(--subtle)" }} />
                  )}
                  {isMine && isTemp && <Check className="w-3 h-3" strokeWidth={2} style={{ color: "var(--subtle)", opacity: 0.4 }} />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Typing indicator */}
      {otherTyping && (
        <div className="px-5 pb-1 flex items-center gap-2">
          <div className="flex gap-1 items-center px-3 py-2 rounded-2xl" style={{ background: t.receivedBg }}>
            <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--muted)", animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--muted)", animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--muted)", animationDelay: "300ms" }} />
          </div>
          <span className="text-[10px]" style={{ color: "var(--subtle)" }}>sta scrivendo…</span>
        </div>
      )}

      {/* Input */}
      <form onSubmit={sendMessage}
        className="shrink-0 px-3 py-3 flex gap-2 items-end"
        style={{ background: t.bg, borderTop: "1px solid var(--border)" }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => { setInput(e.target.value); broadcastTyping(); }}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Scrivi un messaggio…"
          className="flex-1 px-4 py-2.5 rounded-2xl text-sm focus:outline-none transition-colors"
          style={{
            background: "var(--surface)",
            border: "1.5px solid var(--border)",
            color: "var(--fg)",
          }}
          onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
          onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
          style={{ background: "var(--accent)" }}>
          <Send className="w-4 h-4 text-white" />
        </button>
      </form>
    </div>
  );
}
