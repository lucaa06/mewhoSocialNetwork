"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { BarChart2, Link2, AtSign, X, Plus } from "lucide-react";
import { createPost } from "@/app/actions/posts";
import { celebrate } from "@/lib/celebrate";
import { createClient } from "@/lib/supabase/client";

interface MentionSuggestion {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

export function CreatePostForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const [loading, setLoading] = useState(false);

  // Core fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"public" | "followers">("public");

  // Poll — pre-activate if mode=poll
  const [pollEnabled, setPollEnabled] = useState(mode === "poll");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);

  // Link — pre-activate if mode=link
  const [linkEnabled, setLinkEnabled] = useState(mode === "link");
  const [linkUrl, setLinkUrl] = useState("");

  // Mention autocomplete
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionSuggestion[]>([]);
  const [mentionCursorPos, setMentionCursorPos] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  // Detect @mention at cursor
  const detectMention = useCallback((text: string, cursorPos: number) => {
    const before = text.slice(0, cursorPos);
    const match = before.match(/@([a-z0-9_]*)$/i);
    if (match) {
      const partial = match[1].toLowerCase();
      if (partial.length >= 1) {
        setMentionQuery(partial);
        setMentionCursorPos(cursorPos);
        return;
      }
    }
    setMentionQuery(null);
    setMentionSuggestions([]);
  }, []);

  // Fetch suggestions when mentionQuery changes
  useEffect(() => {
    if (!mentionQuery) {
      setMentionSuggestions([]);
      return;
    }
    let cancelled = false;
    supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .ilike("username", `${mentionQuery}%`)
      .limit(5)
      .then(({ data }) => {
        if (!cancelled && data) {
          setMentionSuggestions(data as MentionSuggestion[]);
        }
      });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mentionQuery]);

  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setContent(val);
    detectMention(val, e.target.selectionStart ?? val.length);
  }

  function handleContentKeyUp(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    detectMention(el.value, el.selectionStart ?? el.value.length);
  }

  function selectMention(suggestion: MentionSuggestion) {
    if (!textareaRef.current) return;
    const before = content.slice(0, mentionCursorPos);
    const after = content.slice(mentionCursorPos);
    // Replace the @partial at cursor with @username + space
    const replaced = before.replace(/@([a-z0-9_]*)$/i, `@${suggestion.username} `);
    const newContent = replaced + after;
    setContent(newContent);
    setMentionQuery(null);
    setMentionSuggestions([]);
    // Restore focus and move cursor after inserted mention
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const pos = replaced.length;
        textareaRef.current.setSelectionRange(pos, pos);
      }
    }, 0);
  }

  function handleAtSign() {
    if (!textareaRef.current) return;
    textareaRef.current.focus();
    const start = textareaRef.current.selectionStart ?? content.length;
    const before = content.slice(0, start);
    const after = content.slice(start);
    const newContent = before + "@" + after;
    setContent(newContent);
    const newPos = start + 1;
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(newPos, newPos);
        detectMention(newContent, newPos);
      }
    }, 0);
  }

  function addPollOption() {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, ""]);
    }
  }

  function removePollOption(idx: number) {
    if (pollOptions.length <= 2) return;
    setPollOptions(pollOptions.filter((_, i) => i !== idx));
  }

  function updatePollOption(idx: number, value: string) {
    const next = [...pollOptions];
    next[idx] = value;
    setPollOptions(next);
  }

  function isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Il contenuto non può essere vuoto");
      return;
    }

    if (pollEnabled) {
      if (!pollQuestion.trim()) {
        toast.error("Inserisci la domanda del sondaggio");
        return;
      }
      const validOpts = pollOptions.filter((o) => o.trim().length > 0);
      if (validOpts.length < 2) {
        toast.error("Aggiungi almeno 2 opzioni al sondaggio");
        return;
      }
    }

    if (linkEnabled && linkUrl.trim() && !isValidUrl(linkUrl.trim())) {
      toast.error("L'URL inserito non è valido");
      return;
    }

    setLoading(true);

    const result = await createPost({
      title: title.trim() || undefined,
      content: content.trim(),
      visibility,
      linkUrl: linkEnabled && linkUrl.trim() ? linkUrl.trim() : undefined,
      poll: pollEnabled
        ? { question: pollQuestion.trim(), options: pollOptions }
        : undefined,
    });

    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Post pubblicato!");
    celebrate();
    router.back();
  }

  const toolbarActiveStyle = { background: "var(--accent-soft)", color: "var(--accent)" };
  const toolbarInactiveStyle = { color: "var(--muted)" };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border p-4 sm:p-6 space-y-4"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      {/* Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titolo (opzionale)"
        className="input-base"
        style={{ background: "var(--surface)" }}
      />

      {/* Textarea + mention autocomplete */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onKeyUp={handleContentKeyUp}
          onClick={handleContentKeyUp as unknown as React.MouseEventHandler<HTMLTextAreaElement>}
          placeholder="Condividi un'idea, un progetto, una domanda..."
          rows={6}
          className="input-base resize-none"
          style={{ background: "var(--surface)" }}
        />
        <div className="flex justify-end mt-1">
          <span className="text-xs" style={{ color: "var(--subtle)" }}>
            {content.length}/5000
          </span>
        </div>

        {/* Mention suggestion dropdown */}
        {mentionSuggestions.length > 0 && (
          <div
            className="absolute left-0 right-0 rounded-xl border shadow-lg z-50 overflow-hidden"
            style={{
              bottom: "calc(100% - 1.5rem)",
              background: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            {mentionSuggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectMention(s);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:opacity-80"
                style={{ background: "var(--card)" }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden"
                  style={{ background: "var(--surface)" }}
                >
                  {s.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.avatar_url} alt={s.display_name} className="w-full h-full object-cover" />
                  ) : (
                    <span style={{ color: "var(--muted)" }}>
                      {s.display_name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--fg)" }}>
                    {s.display_name}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--subtle)" }}>
                    @{s.username}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Poll section */}
      {pollEnabled && (
        <div
          className="rounded-xl border p-4 space-y-3"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <p className="text-xs font-semibold label-xs" style={{ color: "var(--muted)" }}>
            SONDAGGIO
          </p>
          <input
            value={pollQuestion}
            onChange={(e) => setPollQuestion(e.target.value)}
            placeholder="Domanda del sondaggio..."
            className="input-base"
            style={{ background: "var(--card)" }}
          />
          <div className="space-y-2">
            {pollOptions.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  value={opt}
                  onChange={(e) => updatePollOption(idx, e.target.value)}
                  placeholder={`Opzione ${idx + 1}`}
                  className="input-base flex-1"
                  style={{ background: "var(--card)" }}
                />
                {pollOptions.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removePollOption(idx)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0"
                    style={{ background: "var(--surface)", color: "var(--muted)" }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {pollOptions.length < 4 && (
            <button
              type="button"
              onClick={addPollOption}
              className="flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{ color: "var(--accent)" }}
            >
              <Plus className="w-4 h-4" />
              Aggiungi opzione
            </button>
          )}
        </div>
      )}

      {/* Link section */}
      {linkEnabled && (
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <p className="text-xs font-semibold label-xs mb-2" style={{ color: "var(--muted)" }}>
            LINK
          </p>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://..."
            className="input-base"
            style={{ background: "var(--card)" }}
          />
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-1 pt-1 border-t" style={{ borderColor: "var(--border)" }}>
        <button
          type="button"
          onClick={() => setPollEnabled((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
          style={pollEnabled ? toolbarActiveStyle : toolbarInactiveStyle}
          title="Aggiungi sondaggio"
        >
          <BarChart2 className="w-4 h-4" />
          <span className="hidden sm:inline">Sondaggio</span>
        </button>
        <button
          type="button"
          onClick={() => setLinkEnabled((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
          style={linkEnabled ? toolbarActiveStyle : toolbarInactiveStyle}
          title="Aggiungi link"
        >
          <Link2 className="w-4 h-4" />
          <span className="hidden sm:inline">Link</span>
        </button>
        <button
          type="button"
          onClick={handleAtSign}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
          style={toolbarInactiveStyle}
          title="Menziona qualcuno"
        >
          <AtSign className="w-4 h-4" />
          <span className="hidden sm:inline">Menziona</span>
        </button>

        {/* Spacer + right controls */}
        <div className="flex-1" />
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as "public" | "followers")}
          className="px-3 py-2 rounded-xl text-sm focus:outline-none transition-colors"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--muted)",
          }}
        >
          <option value="public">Pubblico</option>
          <option value="followers">Solo follower</option>
        </select>
        <button type="submit" disabled={loading} className="btn-primary px-5 py-2">
          {loading ? "Pubblicando..." : "Pubblica"}
        </button>
      </div>
    </form>
  );
}
