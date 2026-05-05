"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, UserPlus, UserCheck, UserMinus } from "lucide-react";
import Link from "next/link";

interface FollowUser {
  id: string; username: string; display_name: string;
  avatar_url: string | null; avatar_emoji: string | null; role: string;
}

const ROLE_COLOR: Record<string, string> = {
  startupper: "#FB7141", researcher: "#6D41FF", user: "#D97706", admin: "#374151",
};

export function FollowModal({ userId, currentUserId, type, onClose }: {
  userId: string;
  currentUserId: string | null;
  type: "followers" | "following";
  onClose: () => void;
}) {
  const [users, setUsers]             = useState<FollowUser[]>([]);
  const [loading, setLoading]         = useState(true);
  const [myFollowing, setMyFollowing] = useState<Set<string>>(new Set());
  // chi segue ME (currentUserId) — per sapere se fare "Segui anche tu"
  const [followsMe, setFollowsMe]     = useState<Set<string>>(new Set());

  const isOwnList = currentUserId === userId;

  const load = useCallback(async () => {
    const sb = createClient();
    setLoading(true);

    if (type === "followers") {
      const { data } = await sb.from("follows")
        .select("follower:profiles!follower_id(id,username,display_name,avatar_url,avatar_emoji,role)")
        .eq("following_id", userId);
      setUsers((data ?? []).map(d => d.follower as unknown as FollowUser).filter(Boolean));
    } else {
      const { data } = await sb.from("follows")
        .select("following:profiles!following_id(id,username,display_name,avatar_url,avatar_emoji,role)")
        .eq("follower_id", userId);
      setUsers((data ?? []).map(d => d.following as unknown as FollowUser).filter(Boolean));
    }

    if (currentUserId) {
      const [{ data: iFollow }, { data: theyFollow }] = await Promise.all([
        sb.from("follows").select("following_id").eq("follower_id", currentUserId),
        sb.from("follows").select("follower_id").eq("following_id", currentUserId),
      ]);
      setMyFollowing(new Set((iFollow ?? []).map(x => x.following_id)));
      setFollowsMe(new Set((theyFollow ?? []).map(x => x.follower_id)));
    }
    setLoading(false);
  }, [userId, type, currentUserId]);

  useEffect(() => {
    load();
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [load, onClose]);

  async function toggleFollow(targetId: string) {
    if (!currentUserId) return;
    const sb = createClient();
    if (myFollowing.has(targetId)) {
      await sb.from("follows").delete().eq("follower_id", currentUserId).eq("following_id", targetId);
      setMyFollowing(prev => { const s = new Set(prev); s.delete(targetId); return s; });
    } else {
      await sb.from("follows").insert({ follower_id: currentUserId, following_id: targetId });
      setMyFollowing(prev => new Set([...prev, targetId]));
    }
  }

  async function removeFollower(followerId: string) {
    if (!currentUserId) return;
    const sb = createClient();
    await sb.from("follows").delete().eq("follower_id", followerId).eq("following_id", currentUserId);
    setUsers(prev => prev.filter(u => u.id !== followerId));
    setFollowsMe(prev => { const s = new Set(prev); s.delete(followerId); return s; });
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      />

      <div
        className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[420px] sm:rounded-2xl"
        style={{
          background: "var(--card)",
          borderRadius: "20px 20px 0 0",
          maxHeight: "78vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -8px 48px rgba(0,0,0,0.18)",
        }}
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--border)" }} />
        </div>

        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-base font-bold" style={{ color: "var(--fg)", fontFamily: "var(--fh)" }}>
            {type === "followers" ? "Followers" : "Following"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 squircle-sm flex items-center justify-center" style={{ background: "var(--surface)" }}>
            <X className="w-4 h-4" style={{ color: "var(--muted)" }} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "#FB7141" }} />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center py-16 text-sm" style={{ color: "var(--muted)" }}>
              {type === "followers" ? "Nessun follower ancora" : "Non segue nessuno ancora"}
            </p>
          ) : (
            <div className="py-2">
              {users.map(u => {
                const isMe      = currentUserId === u.id;
                const following = myFollowing.has(u.id);
                const theyFollowCurrentUser = followsMe.has(u.id);
                const color     = ROLE_COLOR[u.role] ?? "#D97706";

                return (
                  <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-black/3 transition-colors">
                    <Link href={`/u/${u.username}`} onClick={onClose} className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-11 h-11 squircle flex items-center justify-center shrink-0 overflow-hidden"
                        style={{ background: `${color}18`, border: `1.5px solid ${color}30` }}
                      >
                        {u.avatar_emoji
                          ? <span style={{ fontSize: 22 }}>{u.avatar_emoji}</span>
                          : u.avatar_url
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                          : <span className="text-sm font-bold" style={{ color }}>{u.display_name[0]?.toUpperCase()}</span>
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "var(--fg)", fontFamily: "var(--fh)" }}>
                          {u.display_name}
                        </p>
                        <p className="text-xs truncate" style={{ color: "var(--subtle)" }}>@{u.username}</p>
                      </div>
                    </Link>

                    {!isMe && currentUserId && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Follow / Segui anche tu / Smetti */}
                        <button
                          onClick={() => toggleFollow(u.id)}
                          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
                          style={following
                            ? { border: "1px solid var(--border)", color: "var(--muted)", background: "transparent" }
                            : { background: "#FB7141", color: "white", border: "none", boxShadow: "0 2px 8px rgba(251,113,65,0.25)" }
                          }
                        >
                          {following
                            ? <><UserCheck className="w-3 h-3" />Segui</>
                            : theyFollowCurrentUser
                            ? <><UserPlus className="w-3 h-3" />Segui anche tu</>
                            : <><UserPlus className="w-3 h-3" />Segui</>
                          }
                        </button>

                        {/* Togli follower — solo nella propria lista followers */}
                        {isOwnList && type === "followers" && (
                          <button
                            onClick={() => removeFollower(u.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-xl transition-colors"
                            style={{ background: "var(--surface)", color: "var(--muted)" }}
                            title="Togli follower"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
