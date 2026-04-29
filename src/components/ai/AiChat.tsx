"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Send, Bot, Sparkles, Search, FileText, Users, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  { icon: Search,   text: "Trovami post sulle startup fintech" },
  { icon: FileText, text: "Riassumi i post di un utente specifico" },
  { icon: Users,    text: "Chi lavora nel campo dell'AI qui?" },
  { icon: Sparkles, text: "Cosa sta succedendo nella community?" },
];

export function AiChat({ userId, embedded }: { userId: string | null; embedded?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages(prev => [...prev, assistantMsg]);

    startTransition(async () => {
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages, userId }),
        });

        if (!res.ok || !res.body) {
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: "Errore nella risposta. Riprova." };
            return updated;
          });
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
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: full };
            return updated;
          });
        }
      } catch {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: "Errore di connessione. Riprova." };
          return updated;
        });
      }
      setStreaming(false);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const router = useRouter();

  return (
    <div className={`flex flex-col ${embedded ? "h-full" : "h-[calc(100vh-56px)] max-w-2xl mx-auto"}`}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-black/6 shrink-0" style={{ background: "color-mix(in srgb, var(--bg) 92%, transparent)" }}>
        {embedded && (
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/6 transition-colors">
            <ArrowLeft className="w-4 h-4 text-black/60" />
          </button>
        )}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(221,65,50,0.1)" }}>
          <Bot className="w-5 h-5" style={{ color: "#FF4A24" }} strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-sm font-semibold text-black">who? AI</p>
          <p className="text-xs text-black/35">Cerca post, scopri persone, esplora</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="pt-4 space-y-3">
            <p className="text-center text-xs text-black/30 mb-6">Cosa vuoi esplorare?</p>
            {SUGGESTIONS.map(({ icon: Icon, text }) => (
              <button key={text} onClick={() => { setInput(text); inputRef.current?.focus(); }}
                className="w-full flex items-center gap-3 p-3.5 bg-white border border-black/6 rounded-2xl text-sm text-black/60 hover:border-black/15 hover:text-black transition-all text-left">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(221,65,50,0.08)" }}>
                  <Icon className="w-4 h-4" style={{ color: "#FF4A24" }} strokeWidth={1.8} />
                </div>
                {text}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mr-2 mt-0.5"
                style={{ background: "rgba(221,65,50,0.1)" }}>
                <Bot className="w-3.5 h-3.5" style={{ color: "#FF4A24" }} strokeWidth={2} />
              </div>
            )}
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-black text-white rounded-br-sm"
                : "bg-white border border-black/6 text-black/80 rounded-bl-sm"
            }`}>
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none prose-a:text-[#FF4A24] prose-a:no-underline hover:prose-a:underline">
                  <ReactMarkdown>{msg.content || (streaming ? "▌" : "")}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 p-4 border-t border-black/6 bg-white/80 backdrop-blur-sm">
        <div className="flex items-end gap-2 bg-white border border-black/10 rounded-2xl px-4 py-3 focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_3px_var(--accent-soft)] transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Chiedi qualcosa..."
            rows={1}
            disabled={streaming}
            className="flex-1 bg-transparent text-sm text-black placeholder:text-black/30 focus:outline-none resize-none max-h-32 disabled:opacity-50"
            style={{ field_sizing: "content" } as React.CSSProperties}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || streaming}
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
            style={{ background: "#FF4A24" }}
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
        <p className="text-[10px] text-black/20 text-center mt-2">Premi Invio per inviare · Shift+Invio per andare a capo</p>
      </div>
    </div>
  );
}
