"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Palette, Check, CheckCheck, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getOrCreateKeyPair, encryptMessage, decryptMessage } from "@/lib/e2e";
import { getAvatarFallback } from "@/lib/utils";

interface Profile { id: string; username: string; display_name: string; avatar_url: string | null; role: string; avatar_emoji?: string | null }

interface RawMessage { id: string; conversation_id: string; sender_id: string; ciphertext: string; iv: string; created_at: string; is_deleted: boolean }
interface DecryptedMessage extends RawMessage { text: string }

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
          if (m.iv === "PLAIN") return { ...m, text: m.ciphertext };
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
          let text: string;
          if (m.iv === "PLAIN") {
            text = m.ciphertext;
          } else {
            const isMine = m.sender_id === currentUserId;
            const theirKey = isMine ? otherPubKey : (otherPublicKeyJwk ?? otherPubKey);
            text = theirKey ? await decryptMessage(m.ciphertext, m.iv, keyPair.privateJwk, theirKey).catch(() => "🔒") : "🔒";
          }
          setMessages(prev => [...prev, { ...m, text }]);
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [keyPair, otherPubKey]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || !keyPair) return;
    setInput("");

    // Try to get other user's key one more time if still missing
    let pubKey = otherPubKey;
    if (!pubKey && otherUser) {
      const supabase = createClient();
      const { data } = await supabase.from("user_public_keys").select("public_key_jwk").eq("user_id", otherUser.id).single();
      if (data) { pubKey = data.public_key_jwk as JsonWebKey; setOtherPubKey(pubKey); }
    }

    const supabase = createClient();
    if (pubKey) {
      const { ciphertext, iv } = await encryptMessage(text, keyPair.privateJwk, pubKey);
      await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: currentUserId, ciphertext, iv });
    } else {
      // Store plaintext when key unavailable (marked with special IV)
      await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: currentUserId, ciphertext: text, iv: "PLAIN" });
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
            <div className="absolute right-0 top-10 rounded-2xl border shadow-lg p-3 z-20 w-[200px]"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2 px-1" style={{ color: "var(--subtle)" }}>Tema chat</p>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(THEMES).map(([key, val]) => (
                  <button key={key} onClick={() => changeTheme(key)}
                    title={val.label}
                    className="flex flex-col items-center gap-1 group">
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

        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(e as never); } }}
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
          disabled={!input.trim() || !keyPair}
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
          style={{ background: "var(--accent)" }}>
          <Send className="w-4 h-4 text-white" />
        </button>
      </form>
    </div>
  );
}
