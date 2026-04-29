"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function MessageButton({ targetUserId }: { targetUserId: string }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Find existing shared conversation
    const { data: mine } = await supabase
      .from("conversation_members").select("conversation_id").eq("user_id", user.id);
    const myIds = (mine ?? []).map(x => x.conversation_id);

    if (myIds.length) {
      const { data: shared } = await supabase
        .from("conversation_members").select("conversation_id")
        .eq("user_id", targetUserId).in("conversation_id", myIds);
      if (shared?.length) {
        startTransition(() => router.push(`/messages/${shared[0].conversation_id}`));
        return;
      }
    }

    // Create new conversation
    const { data: conv } = await supabase
      .from("conversations").insert({ theme: "default" }).select("id").single();
    if (!conv) { setLoading(false); return; }
    await supabase.from("conversation_members").insert([
      { conversation_id: conv.id, user_id: user.id },
      { conversation_id: conv.id, user_id: targetUserId },
    ]);
    startTransition(() => router.push(`/messages/${conv.id}`));
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-60 active:scale-95"
      style={{ border: "1px solid var(--border)", color: "var(--fg)", background: "var(--card)" }}
    >
      <MessageCircle className="w-3.5 h-3.5" />
      {loading ? "…" : "Scrivi"}
    </button>
  );
}
