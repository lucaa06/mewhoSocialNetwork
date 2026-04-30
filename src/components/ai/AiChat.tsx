"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Sparkles, Search, FileText, Users, ArrowLeft, RotateCcw } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  { icon: Search,    text: "Trovami post sulle startup fintech" },
  { icon: FileText,  text: "Riassumi i post di un utente specifico" },
  { icon: Users,     text: "Chi lavora nel campo dell'AI qui?" },
  { icon: Sparkles,  text: "Cosa sta succedendo nella community?" },
];

export function AiChat({ userId }: { userId: string | null }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Pre-fill when a post is shared via URL param
  useEffect(() => {
    const shareId = searchParams.get("share");
    if (!shareId) return;
    const title = searchParams.get("title");
    const url = `https://mewho.it/post/${shareId}`;
    const msg = title
      ? `Ho trovato questo post interessante: "${title}" — ${url} — cosa ne pensi?`
      : `Ho trovato questo post interessante: ${url} — cosa ne pensi?`;
    setInput(msg);
    router.replace(pathname);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || streaming) return;
    setInput("");

    const userMsg: Message = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setStreaming(true);
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, userId }),
      });

      if (!res.ok || !res.body) {
        setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: "Errore nella risposta. Riprova." }; return u; });
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: full }; return u; });
      }
    } catch {
      setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: "Errore di connessione. Riprova." }; return u; });
    }
    setStreaming(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  function clearChat() {
    setMessages([]);
    setInput("");
    inputRef.current?.focus();
  }

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--bg)" }}>

      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-3 py-2.5 relative z-10"
        style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
        <button onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
          style={{ color: "var(--muted)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--surface)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)" }}>
          <Bot className="w-5 h-5" style={{ color: "var(--accent)" }} strokeWidth={1.8} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>who? AI</p>
          <p className="text-[10px]" style={{ color: "var(--subtle)" }}>Cerca post, scopri persone, esplora</p>
        </div>

        {messages.length > 0 && (
          <button onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
            style={{ background: "var(--surface)", color: "var(--muted)" }}>
            <RotateCcw className="w-3.5 h-3.5" />
            Nuova chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="pt-4 space-y-2">
            <p className="text-center text-xs mb-4" style={{ color: "var(--subtle)" }}>Cosa vuoi esplorare?</p>
            {SUGGESTIONS.map(({ icon: Icon, text }) => (
              <button key={text} onClick={() => { setInput(text); inputRef.current?.focus(); }}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl border text-sm transition-all text-left"
                style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--muted)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--fg)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--muted)"; }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "color-mix(in srgb, var(--accent) 10%, transparent)" }}>
                  <Icon className="w-4 h-4" style={{ color: "var(--accent)" }} strokeWidth={1.8} />
                </div>
                {text}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)" }}>
                <Bot className="w-4 h-4" style={{ color: "var(--accent)" }} strokeWidth={2} />
              </div>
            )}
            <div className="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
              style={msg.role === "user"
                ? { background: "#111", color: "#fff", borderRadius: "1rem 1rem 0.25rem 1rem" }
                : { background: "var(--card)", border: "1px solid var(--border)", color: "var(--fg)", borderRadius: "1rem 1rem 1rem 0.25rem" }
              }>
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none" style={{ color: "var(--fg)" }}>
                  <ReactMarkdown>{msg.content || (streaming && i === messages.length - 1 ? "▌" : "")}</ReactMarkdown>
                </div>
              ) : msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={e => { e.preventDefault(); send(); }}
        className="shrink-0 px-3 py-3 flex gap-2 items-end"
        style={{ background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Chiedi qualcosa…"
          rows={1}
          disabled={streaming}
          className="flex-1 px-4 py-2.5 rounded-2xl text-sm focus:outline-none resize-none transition-colors disabled:opacity-50"
          style={{
            background: "var(--surface)",
            border: "1.5px solid var(--border)",
            color: "var(--fg)",
            maxHeight: 128,
            fieldSizing: "content",
          } as React.CSSProperties}
          onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
          onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
        />
        <button
          type="submit"
          disabled={!input.trim() || streaming}
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
          style={{ background: "var(--accent)" }}>
          <Send className="w-4 h-4 text-white" />
        </button>
      </form>
    </div>
  );
}
