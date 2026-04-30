"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Clock, CheckCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function MessageButton({ targetUserId }: { targetUserId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<"idle" | "requested" | "chatting">("idle");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Check existing conversation
      const { data: mine } = await supabase.from("conversation_members").select("conversation_id").eq("user_id", user.id);
      const myIds = (mine ?? []).map(x => x.conversation_id);
      if (myIds.length) {
        const { data: shared } = await supabase.from("conversation_members").select("conversation_id").eq("user_id", targetUserId).in("conversation_id", myIds);
        if (shared?.length) { setState("chatting"); return; }
      }
      // Check pending request
      const { data: req } = await supabase.from("chat_requests").select("id, status").eq("sender_id", user.id).eq("receiver_id", targetUserId).maybeSingle();
      if (req?.status === "pending") setState("requested");
    })();
  }, [targetUserId]);

  async function handleClick() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // If already in a conversation, go there
      const { data: mine } = await supabase.from("conversation_members").select("conversation_id").eq("user_id", user.id);
      const myIds = (mine ?? []).map(x => x.conversation_id);
      if (myIds.length) {
        const { data: shared } = await supabase.from("conversation_members").select("conversation_id").eq("user_id", targetUserId).in("conversation_id", myIds);
        if (shared?.length) { router.push(`/messages/${shared[0].conversation_id}`); return; }
      }

      // Send chat request
      const { error } = await supabase.from("chat_requests").upsert({ sender_id: user.id, receiver_id: targetUserId, status: "pending" }, { onConflict: "sender_id,receiver_id" });
      if (error) { toast.error("Errore nell'invio della richiesta"); return; }
      setState("requested");
      toast.success("Richiesta di chat inviata!");
    } finally {
      setLoading(false);
    }
  }

  if (state === "chatting") {
    return (
      <button onClick={handleClick} disabled={loading}
        className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-60 active:scale-95"
        style={{ border: "1px solid var(--border)", color: "var(--fg)", background: "var(--card)" }}>
        <MessageCircle className="w-3.5 h-3.5" />
        {loading ? "…" : "Scrivi"}
      </button>
    );
  }

  if (state === "requested") {
    return (
      <div className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl"
        style={{ background: "var(--surface)", color: "var(--muted)" }}>
        <Clock className="w-3.5 h-3.5" />
        Richiesta inviata
      </div>
    );
  }

  return (
    <button onClick={handleClick} disabled={loading}
      className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-60 active:scale-95"
      style={{ border: "1px solid var(--border)", color: "var(--fg)", background: "var(--card)" }}>
      <MessageCircle className="w-3.5 h-3.5" />
      {loading ? "…" : "Scrivi"}
    </button>
  );
}
