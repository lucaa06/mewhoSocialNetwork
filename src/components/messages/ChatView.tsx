"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Palette, Check, CheckCheck, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getOrCreateKeyPair, encryptMessage, decryptMessage } from "@/lib/e2e";
import { getAvatarFallback } from "@/lib/utils";
import Link from "next/link";

interface Profile { id: string; username: string; display_name: string; avatar_url: string | null; role: string; avatar_emoji?: string | null; last_active_at?: string | null }

interface RawMessage { id: string; conversation_id: string; sender_id: string; ciphertext: string; iv: string; created_at: string; is_deleted: boolean }
interface DecryptedMessage extends RawMessage { text: string }

const THEMES: Record<string, { label: string; bg: string; sentBg: string; receivedBg: string }> = {
  default: { label: "Default",  bg: "var(--bg)",          sentBg: "#0a0a0a",              receivedBg: "var(--card)" },
  night:   { label: "Notte",    bg: "#0d0d14",            sentBg: "#FF4A24",              receivedBg: "#1a1a28" },
  forest:  { label: "Foresta",  bg: "#0d1a0d",            sentBg: "#16a34a",              receivedBg: "#152315" },
  ocean:   { label: "Oceano",   bg: "#0a0f1e",            sentBg: "#2563eb",              receivedBg: "#0f1929" },
  sunset:  { label: "Tramonto", bg: "#1a0e0a",            sentBg: "#FF4A24",              receivedBg: "#221510" },
  lavender:{ label: "Lavanda",  bg: "var(--bg)",          sentBg: "#7c3aed",              receivedBg: "var(--card)" },
};

function isUrl(text: string) {
  return /https?:\/\/[^\s]+/.test(text);
}

function RainbowLink({ href, text }: { href: string; text: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ background: "linear-gradient(90deg,#FF4A24,#f59e0b,#10b981,#2563eb,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textDecoration: "underline", textDecorationStyle: "wavy" }}>
      {text}
    </a>
  );
}

function MessageText({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? <RainbowLink key={i} href={part} text={part} /> : <span key={i}>{part}</span>
      )}
    </>
  );
}

function AvatarEl({ profile }: { profile: Profile }) {
  if (profile.avatar_emoji) return <div className="w-8 h-8 rounded-full flex items-center justify-center bg-black/8 text-lg shrink-0">{profile.avatar_emoji}</div>;
  if (profile.avatar_url) return <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />;
  return <div className="w-8 h-8 rounded-full bg-black/8 flex items-center justify-center text-xs font-semibold text-black/60 shrink-0">{getAvatarFallback(profile.display_name)}</div>;
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

  // Init: get/create E2E key pair and upload public key
  useEffect(() => {
    (async () => {
      const pair = await getOrCreateKeyPair();
      setKeyPair(pair);
      const supabase = createClient();
      // Upload public key if not already stored
      if (!myPublicKeyJwk) {
        await supabase.from("user_public_keys").upsert({ user_id: currentUserId, public_key_jwk: pair.publicJwk });
      }
      // Fetch other user's key if missing
      if (!otherPublicKeyJwk && otherUser) {
        const { data } = await supabase.from("user_public_keys").select("public_key_jwk").eq("user_id", otherUser.id).single();
        if (data) setOtherPubKey(data.public_key_jwk as JsonWebKey);
      }
    })();
  }, []);

  // Load messages + decrypt
  useEffect(() => {
    if (!keyPair || !otherUser) return;
    const supabase = createClient();
    supabase.from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .then(async ({ data }) => {
        const decrypted = await Promise.all((data ?? []).map(async (m: RawMessage) => {
          const isMine = m.sender_id === currentUserId;
          const theirKey = isMine ? otherPubKey : (otherPublicKeyJwk ?? otherPubKey);
          if (!theirKey) return { ...m, text: "[chiave mancante]" };
          const text = await decryptMessage(m.ciphertext, m.iv, keyPair.privateJwk, theirKey);
          return { ...m, text };
        }));
        setMessages(decrypted);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      });

    // Mark as read
    supabase.from("conversation_members").update({ last_read_at: new Date().toISOString() }).eq("conversation_id", conversationId).eq("user_id", currentUserId).then(() => {});

    // Realtime subscription
    const channel = supabase.channel(`chat:${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        async (payload) => {
          const m = payload.new as RawMessage;
          const isMine = m.sender_id === currentUserId;
          const theirKey = isMine ? otherPubKey : (otherPublicKeyJwk ?? otherPubKey);
          const text = theirKey ? await decryptMessage(m.ciphertext, m.iv, keyPair.privateJwk, theirKey) : "[chiave mancante]";
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

  const lastActive = otherUser?.last_active_at
    ? `Ultimo accesso ${new Date(otherUser.last_active_at).toLocaleDateString("it-IT")}`
    : null;

  return (
    <div className="h-full flex flex-col" style={{ background: t.bg }}>
      {/* E2E watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <p className="text-[11px] font-medium opacity-[0.04] rotate-[-30deg] text-black whitespace-nowrap scale-[3]">
          Chat crittografata end-to-end · Chat crittografata end-to-end
        </p>
      </div>

      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-black/6 relative z-10"
        style={{ background: t.bg }}>
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/6 transition-colors">
          <ArrowLeft className="w-4 h-4 text-black/60" />
        </button>
        {otherUser && <AvatarEl profile={otherUser} />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-black">{otherUser?.display_name ?? "Utente"}</p>
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-black/30" strokeWidth={1.5} />
            <p className="text-[10px] text-black/30">{lastActive ?? "Crittografia E2E attiva"}</p>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setShowThemes(v => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/6 transition-colors">
            <Palette className="w-4 h-4 text-black/40" />
          </button>
          {showThemes && (
            <div className="absolute right-0 top-10 rounded-2xl border border-black/8 shadow-lg py-2 z-20 min-w-[140px]"
              style={{ background: "var(--card)" }}>
              {Object.entries(THEMES).map(([key, val]) => (
                <button key={key} onClick={() => changeTheme(key)}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-black/4 transition-colors">
                  <span className={theme === key ? "font-semibold" : ""} style={{ color: theme === key ? "var(--accent)" : "var(--fg)" }}>{val.label}</span>
                  {theme === key && <Check className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 relative z-10">
        {messages.map((msg, i) => {
          const isMine = msg.sender_id === currentUserId;
          const isLast = i === messages.length - 1;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[75%]">
                <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                  style={{
                    background: isMine ? t.sentBg : t.receivedBg,
                    color: isMine ? "#fff" : "var(--fg)",
                    borderRadius: isMine ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
                  }}>
                  <MessageText text={msg.text} />
                </div>
                <div className={`flex items-center gap-1 mt-0.5 ${isMine ? "justify-end" : "justify-start"}`}>
                  <span className="text-[10px] text-black/25">{formatTime(msg.created_at)}</span>
                  {isMine && isLast && (
                    <CheckCheck className="w-3 h-3 text-black/30" strokeWidth={2} />
                  )}
                  {isMine && !isLast && (
                    <Check className="w-3 h-3 text-black/25" strokeWidth={2} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-20">
            <Lock className="w-6 h-6 text-black/20" strokeWidth={1.5} />
            <p className="text-xs text-black/25 text-center">Chat crittografata end-to-end<br />Nessuno tranne voi può leggere i messaggi</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="shrink-0 px-4 py-3 border-t border-black/6 relative z-10 flex gap-2 items-end"
        style={{ background: t.bg }}>
        {!otherPubKey && (
          <p className="text-xs text-black/40 flex-1 py-2">In attesa della chiave E2E dell&apos;altro utente...</p>
        )}
        {otherPubKey && (
          <input value={input} onChange={e => setInput(e.target.value)}
            placeholder="Scrivi un messaggio..."
            className="flex-1 px-4 py-2.5 rounded-2xl text-sm focus:outline-none border border-black/10 focus:border-[var(--accent)] transition-colors"
            style={{ background: "var(--card)", color: "var(--fg)" }}
          />
        )}
        <button type="submit" disabled={!input.trim() || !otherPubKey}
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
          style={{ background: "var(--accent)" }}>
          <Send className="w-4 h-4 text-white" />
        </button>
      </form>
    </div>
  );
}
