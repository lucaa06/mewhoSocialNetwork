"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function CommunityJoinButton({
  communityId,
  isMember,
  isLoggedIn,
}: {
  communityId: string;
  isMember: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [member, setMember] = useState(isMember);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    if (!isLoggedIn) { router.push("/login"); return; }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    if (member) {
      await supabase.from("community_members")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", user.id);
      setMember(false);
    } else {
      await supabase.from("community_members")
        .insert({ community_id: communityId, user_id: user.id });
      setMember(true);
    }
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-60 active:scale-95"
      style={member
        ? { border: "1px solid var(--border)", color: "var(--muted)", background: "var(--card)" }
        : { background: "#FB7141", color: "white", boxShadow: "0 2px 12px rgba(251,113,65,0.25)" }
      }
    >
      {loading ? (
        <span className="w-3.5 h-3.5 rounded-full border-2 animate-spin"
          style={{ borderColor: "currentColor", borderTopColor: "transparent" }} />
      ) : member ? (
        <LogIn className="w-3.5 h-3.5" />
      ) : (
        <UserPlus className="w-3.5 h-3.5" />
      )}
      {member ? "Iscritto" : "Unisciti"}
    </button>
  );
}
