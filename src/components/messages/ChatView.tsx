"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Palette, Check, CheckCheck, Lock, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getOrCreateKeyPair, encryptMessage, decryptMessage } from "@/lib/e2e";
import { getAvatarFallback } from "@/lib/utils";

interface Profile { id: string; username: string; display_name: string; avatar_url: string | null; role: string; avatar_emoji?: string | null }

interface RawMessage { id: string; conversation_id: string; sender_id: string; ciphertext: string; iv: string; created_at: string; is_deleted: boolean }
interface DecryptedMessage extends RawMessage { text: string }

const THEMES: Record<string, { label: string; bg: string; sentBg: string; receivedBg: string; sentText: string; receivedText: string }> = {
  default:  { label: "Default",  bg: "var(--bg)",   sentBg: "#111",      receivedBg: "var(--card)", sentText: "#fff", receivedText: "var(--fg)" },
  night:    { label: "Notte",    bg: "#0d0d14",     sentBg: "#FF4A24",   receivedBg: "#1a1a28",     sentText: "#fff", receivedText: "#e0e0f0" },
  forest:   { label: "Foresta",  bg: "#0d1a0d",     sentBg: "#16a34a",   receivedBg: "#152315",     sentText: "#fff", receivedText: "#c0e0c0" },
  ocean:    { label: "Oceano",   bg: "#0a0f1e",     sentBg: "#2563eb",   receivedBg: "#0f1929",     sentText: "#fff", receivedText: "#c0d0f0" },
  sunset:   { label: "Tramonto", bg: "#1a0e0a",     sentBg: "#FF4A24",   receivedBg: "#221510",     sentText: "#fff", receivedText: "#f0d0c0" },
  lavender: { label: "Lavanda",  bg: "var(--bg)",   sentBg: "#7c3aed",   receivedBg: "var(--card)", sentText: "#fff", receivedText: "var(--fg)" },
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

export function ChatView({ conversationId, currentUserId, otherUser, theme: initialTheme, myPublicKeyJwk, otherPublicKeyJwk }: {
  conversationId: string;
  currentUserId: string;
  otherUser: Profile | null;
  theme: string;
  myPublicKeyJwk: JsonWebKey | null;
  otherPublicKeyJwk: JsonWebKey | null;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<DecryptedMessage[]>([]);
  const [input, setInput] = useState("");
  const [theme, setTheme] = useState(initialTheme || "default");
  const [showThemes, setShowThemes] = useState(false);
  const [keyPair, setKeyPair] = useState<{ privateJwk: JsonWebKey; publicJwk: JsonWebKey } | null>(null);
  const [otherPubKey, setOtherPubKey] = useState<JsonWebKey | null>(otherPublicKeyJwk);
  const [, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const t = THEMES[theme] ?? THEMES.default;

  useEffect(() => {
    (async () => {
      const pair = await getOrCreateKeyPair();
      setKeyPair(pair);
      const supabase = createClient();
      if (!myPublicKeyJwk) {
        await supabase.from("user_public_keys").upsert({ user_id: currentUserId, public_key_jwk: pair.publicJwk });
      }
      if (!otherPublicKeyJwk && otherUser) {
        const { data } = await supabase.from("user_public_keys").select("public_key_jwk").eq("user_id", otherUser.id).single();
        if (data) setOtherPubKey(data.public_key_jwk as JsonWebKey);
      }
    })();
  }, []);

  useEffect(() => {
    if (!keyPair) return;
    const supabase = createClient();
    supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true })
      .then(async ({ data }) => {
        const decrypted = await Promise.all((data ?? []).map(async (m: RawMessage) => {
          const isMine = m.sender_id === currentUserId;
          const theirKey = isMine ? otherPubKey : (otherPublicKeyJwk ?? otherPubKey);
          if (!theirKey) return { ...m, text: "🔒" };
          try { return { ...m, text: await decryptMessage(m.ciphertext, m.iv, keyPair.privateJwk, theirKey) }; }
          catch { return { ...m, text: "🔒" }; }
        }));
        setMessages(decrypted);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      });

    supabase.from("conversation_members").update({ last_read_at: new Date().toISOString() }).eq("conversation_id", conversationId).eq("user_id", currentUserId).then(() => {});

    const channel = supabase.channel(`chat:${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        async (payload) => {
          const m = payload.new as RawMessage;
          const isMine = m.sender_id === currentUserId;
          const theirKey = isMine ? otherPubKey : (otherPublicKeyJwk ?? otherPubKey);
          const text = theirKey ? await decryptMessage(m.ciphertext, m.iv, keyPair.privateJwk, theirKey).catch(() => "🔒") : "🔒";
          setMessages(prev => [...prev, { ...m, text }]);
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [keyPair, otherPubKey]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || !keyPair || !otherPubKey) return;
    setInput("");
    startTransition(async () => {
      const { ciphertext, iv } = await encryptMessage(text, keyPair.privateJwk, otherPubKey);
      const supabase = createClient();
      await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: currentUserId, ciphertext, iv });
      await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversationId);
    });
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
              <div className="flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" style={{ color: "var(--subtle)" }} strokeWidth={1.5} />
                <p className="text-[10px]" style={{ color: "var(--subtle)" }}>Chat cifrata</p>
              </div>
            </div>
          </Link>
        ) : (
          <>
            <div className="w-9 h-9 rounded-full shrink-0" style={{ background: "var(--surface)" }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "var(--fg)" }}>Utente</p>
            </div>
          </>
        )}

        {/* Theme picker */}
        <div className="relative">
          <button onClick={() => setShowThemes(v => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ color: "var(--muted)" }}>
            <Palette className="w-4 h-4" />
          </button>
          {showThemes && (
            <div className="absolute right-0 top-10 rounded-2xl border shadow-lg py-2 z-20 min-w-[140px]"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              {Object.entries(THEMES).map(([key, val]) => (
                <button key={key} onClick={() => changeTheme(key)}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm transition-colors hover:opacity-80">
                  <span style={{ color: theme === key ? "var(--accent)" : "var(--fg)", fontWeight: theme === key ? 600 : 400 }}>{val.label}</span>
                  {theme === key && <Check className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-20">
            <Lock className="w-5 h-5" style={{ color: "var(--subtle)" }} strokeWidth={1.5} />
            <p className="text-xs text-center" style={{ color: "var(--subtle)" }}>
              Chat cifrata end-to-end<br />Solo voi due potete leggere i messaggi
            </p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMine = msg.sender_id === currentUserId;
          const isLast = i === messages.length - 1;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[75%]">
                <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                  style={{
                    background: isMine ? t.sentBg : t.receivedBg,
                    color: isMine ? t.sentText : t.receivedText,
                    borderRadius: isMine ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
                  }}>
                  <MessageText text={msg.text} />
                </div>
                <div className={`flex items-center gap-1 mt-0.5 ${isMine ? "justify-end" : "justify-start"}`}>
                  <span className="text-[10px]" style={{ color: "var(--subtle)" }}>{formatTime(msg.created_at)}</span>
                  {isMine && (isLast
                    ? <CheckCheck className="w-3 h-3" style={{ color: "var(--accent)" }} strokeWidth={2} />
                    : <Check className="w-3 h-3" style={{ color: "var(--subtle)" }} strokeWidth={2} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage}
        className="shrink-0 px-3 py-3 flex gap-2 items-end"
        style={{ background: t.bg, borderTop: "1px solid var(--border)" }}>

        {!otherPubKey ? (
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-2xl" style={{ background: "var(--surface)" }}>
            <Clock className="w-4 h-4 shrink-0" style={{ color: "var(--muted)" }} />
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              {otherUser
                ? `${otherUser.display_name} non ha ancora aperto la chat — manda prima un saluto dopo che entra`
                : "In attesa che l'altro utente apra la chat…"}
            </p>
          </div>
        ) : (
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
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
        )}

        <button
          type="submit"
          disabled={!input.trim() || !otherPubKey}
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
          style={{ background: "var(--accent)" }}>
          <Send className="w-4 h-4 text-white" />
        </button>
      </form>
    </div>
  );
}
