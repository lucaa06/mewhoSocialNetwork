"use client";

import type { Profile } from "@/types/database";
import { getAvatarFallback } from "@/lib/utils";
import { MapPin, BadgeCheck, Pencil, FlaskConical, Copy, Check, UserPlus, UserCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FollowModal } from "./FollowModal";
import { MessageButton } from "./MessageButton";

const ROLE: Record<string, { label: string; color: string; bg: string }> = {
  startupper: { label: "Startupper",  color: "#FF4A24", bg: "rgba(255,74,36,0.12)"  },
  researcher: { label: "Ricercatore", color: "#6D41FF", bg: "rgba(109,65,255,0.12)" },
  user:       { label: "Maker",       color: "#D97706", bg: "rgba(217,119,6,0.12)"  },
  admin:      { label: "Admin",       color: "#374151", bg: "rgba(55,65,81,0.12)"   },
};

function bannerBg(color: string | null) {
  return color ?? "linear-gradient(135deg,#FF4A24 0%,#C84FD0 50%,#6D41FF 100%)";
}

const avatarShared = (roleColor: string): React.CSSProperties => ({
  width: 92, height: 92,
  borderRadius: "50%",
  border: "4px solid var(--card)",
  background: "var(--card)",
  overflow: "hidden",
  boxShadow: `0 0 0 2px ${roleColor}40, 0 8px 24px rgba(0,0,0,0.18)`,
  flexShrink: 0,
  display: "flex", alignItems: "center", justifyContent: "center",
  position: "relative",
});

export function ProfileHeader({ profile, followersCount, followingCount, postsCount, isOwn }: {
  profile: Profile;
  followersCount: number;
  followingCount: number;
  postsCount?: number;
  isOwn: boolean;
}) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followers, setFollowers] = useState(followersCount);
  const [isFollowing, setIsFollowing]   = useState(false);
  const [theyFollowMe, setTheyFollowMe] = useState(false);
  const [followLoading, setFollowLoading]   = useState(false);
  const [removeLoading, setRemoveLoading]   = useState(false);
  const [modal, setModal] = useState<"followers" | "following" | null>(null);
  const [copied, setCopied]   = useState(false);
  const [hoverAt, setHoverAt] = useState(false);

  const role = ROLE[profile.role] ?? ROLE.user;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setCurrentUserId(user.id);
      if (!isOwn) {
        const [{ data: iFollow }, { data: theyFollow }] = await Promise.all([
          supabase.from("follows").select("follower_id")
            .eq("follower_id", user.id).eq("following_id", profile.id).maybeSingle(),
          supabase.from("follows").select("follower_id")
            .eq("follower_id", profile.id).eq("following_id", user.id).maybeSingle(),
        ]);
        setIsFollowing(!!iFollow);
        setTheyFollowMe(!!theyFollow);
      }
    });
  }, [profile.id, isOwn]);

  async function handleFollow() {
    if (!currentUserId) return;
    setFollowLoading(true);
    const supabase = createClient();
    if (isFollowing) {
      await supabase.from("follows").delete()
        .eq("follower_id", currentUserId).eq("following_id", profile.id);
      setIsFollowing(false);
      setFollowers(v => v - 1);
    } else {
      await supabase.from("follows").insert({ follower_id: currentUserId, following_id: profile.id });
      setIsFollowing(true);
      setFollowers(v => v + 1);
    }
    setFollowLoading(false);
  }

  async function handleRemoveFollower() {
    if (!currentUserId) return;
    setRemoveLoading(true);
    const supabase = createClient();
    await supabase.from("follows").delete()
      .eq("follower_id", profile.id).eq("following_id", currentUserId);
    setTheyFollowMe(false);
    setRemoveLoading(false);
  }

  /* ── Avatar inner content ─────────────────────────────────────── */
  const AvatarInner = () => (
    <>
      {!profile.avatar_url && !profile.avatar_emoji && (
        <div style={{ position: "absolute", inset: 0, background: role.bg.replace(/[\d.]+\)$/, "0.18)"), borderRadius: "50%" }} />
      )}
      {profile.avatar_emoji
        ? <span style={{ fontSize: 46, lineHeight: 1, position: "relative", zIndex: 1 }}>{profile.avatar_emoji}</span>
        : profile.avatar_url
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={profile.avatar_url} alt={profile.display_name} style={{ width: "100%", height: "100%", objectFit: "cover", position: "relative", zIndex: 1 }} />
        : <span style={{ fontSize: 30, fontWeight: 800, color: role.color, fontFamily: "var(--fh)", letterSpacing: "-1px", position: "relative", zIndex: 1 }}>
            {getAvatarFallback(profile.display_name)}
          </span>
      }
      {isOwn && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(0,0,0,0.35)", borderRadius: "50%", zIndex: 2 }}>
          <Pencil className="w-4 h-4 text-white" />
        </div>
      )}
    </>
  );

  return (
    <>
      <div style={{ borderRadius: 24, background: "var(--card)", boxShadow: "var(--shadow-md)", position: "relative" }}>

        {/* ── Banner ──────────────────────────────────────────────────── */}
        {isOwn ? (
          <Link
            href="/settings/profile"
            className="block overflow-hidden group"
            style={{ height: 140, borderRadius: "24px 24px 0 0", background: bannerBg(profile.banner_color ?? null), position: "relative", zIndex: 1 }}
          >
            <div className="absolute inset-0"
              style={{ background: "radial-gradient(ellipse at 20% 30%,rgba(255,255,255,0.20) 0%,transparent 55%)" }} />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(0,0,0,0.30)" }}>
              <Pencil className="w-5 h-5 text-white" />
            </div>
            <div className="absolute top-4 right-4">
              <span className="text-[11px] font-semibold px-3 py-1 rounded-full"
                style={{ background: "rgba(0,0,0,0.25)", color: "white", backdropFilter: "blur(8px)", letterSpacing: "0.05em" }}>
                {role.label}
              </span>
            </div>
          </Link>
        ) : (
          <div className="overflow-hidden"
            style={{ height: 140, borderRadius: "24px 24px 0 0", background: bannerBg(profile.banner_color ?? null), position: "relative", zIndex: 1 }}
          >
            <div className="absolute inset-0"
              style={{ background: "radial-gradient(ellipse at 20% 30%,rgba(255,255,255,0.20) 0%,transparent 55%)" }} />
            <div className="absolute top-4 right-4">
              <span className="text-[11px] font-semibold px-3 py-1 rounded-full"
                style={{ background: "rgba(0,0,0,0.25)", color: "white", backdropFilter: "blur(8px)", letterSpacing: "0.05em" }}>
                {role.label}
              </span>
            </div>
          </div>
        )}

        {/* ── Content ─────────────────────────────────────────────────── */}
        <div className="px-5 sm:px-6 pb-5" style={{ position: "relative", zIndex: 2 }}>

          {/* Avatar + action row */}
          <div className="flex items-end justify-between" style={{ marginTop: -48 }}>

            {isOwn ? (
              <Link href="/settings/profile" className="group" style={avatarShared(role.color)}>
                <AvatarInner />
              </Link>
            ) : (
              <div style={avatarShared(role.color)}>
                <AvatarInner />
              </div>
            )}

            <div className="flex flex-col items-end gap-1.5" style={{ marginBottom: 4 }}>
              {isOwn ? (
                <Link href="/settings/profile"
                  className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                  style={{ border: "1px solid var(--border)", color: "var(--muted)", background: "var(--card)" }}>
                  <Pencil className="w-3.5 h-3.5" />
                  Modifica
                </Link>
              ) : currentUserId && (
                <>
                  <MessageButton targetUserId={profile.id} />
                  {/* Bottone principale follow/unfollow */}
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className="flex items-center gap-1.5 text-sm font-semibold px-5 py-2 rounded-xl transition-all disabled:opacity-60 active:scale-95"
                    style={isFollowing
                      ? { border: "1px solid var(--border)", color: "var(--muted)", background: "var(--card)" }
                      : theyFollowMe
                      ? { background: "#FF4A24", color: "white", boxShadow: "0 2px 12px rgba(255,74,36,0.30)" }
                      : { background: "#FF4A24", color: "white", boxShadow: "0 2px 12px rgba(255,74,36,0.30)" }
                    }
                  >
                    {isFollowing
                      ? <><UserCheck className="w-3.5 h-3.5" />Smetti di seguire</>
                      : theyFollowMe
                      ? <><UserPlus className="w-3.5 h-3.5" />Segui anche tu</>
                      : <><UserPlus className="w-3.5 h-3.5" />Segui</>
                    }
                  </button>

                  {/* Rimuovi follower — solo se ci seguono */}
                  {theyFollowMe && (
                    <button
                      onClick={handleRemoveFollower}
                      disabled={removeLoading}
                      className="text-xs transition-colors disabled:opacity-50"
                      style={{ color: "var(--subtle)" }}
                    >
                      {removeLoading ? "..." : "Togli dai tuoi follower"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="mt-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.4px", color: "var(--fg)", fontFamily: "var(--fh)", lineHeight: 1.2 }}>
                {profile.display_name}
              </h1>
              {profile.is_verified && <BadgeCheck className="w-5 h-5 shrink-0" style={{ color: role.color }} />}
              {profile.is_beta && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: "linear-gradient(135deg,#6D41FF,#C84FD0)", color: "white" }}
                >
                  <FlaskConical className="w-2.5 h-2.5" />
                  Beta
                </span>
              )}
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 mt-0.5 w-fit"
              onMouseEnter={() => setHoverAt(true)}
              onMouseLeave={() => setHoverAt(false)}
              onClick={() => {
                navigator.clipboard.writeText(`@${profile.username}`);
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              }}
            >
              <span className="text-sm font-medium" style={{ color: "var(--subtle)" }}>@{profile.username}</span>
              <span
                className="flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-md transition-all duration-150"
                style={{
                  opacity: hoverAt || copied ? 1 : 0,
                  transform: hoverAt || copied ? "scale(1)" : "scale(0.85)",
                  background: copied ? "rgba(109,65,255,0.10)" : "var(--surface)",
                  color: copied ? "#6D41FF" : "var(--muted)",
                  border: `1px solid ${copied ? "rgba(109,65,255,0.20)" : "var(--border)"}`,
                }}
              >
                {copied
                  ? <><Check className="w-3 h-3" />Copiato!</>
                  : <><Copy className="w-3 h-3" />Copia</>
                }
              </span>
            </button>
          </div>

          {profile.bio && (
            <p className="text-sm leading-relaxed mt-2.5" style={{ color: "var(--muted)" }}>{profile.bio}</p>
          )}

          {(profile.city || profile.country_code) && (
            <div className="flex items-center gap-1 mt-2">
              <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--subtle)" }} />
              <span className="text-xs" style={{ color: "var(--subtle)" }}>
                {[profile.city, profile.country_code].filter(Boolean).join(", ")}
              </span>
            </div>
          )}

          {/* Stats */}
          <div className="flex mt-4" style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)", background: "var(--surface)" }}>
            {postsCount !== undefined && (
              <StatCell value={postsCount} label="Post" roleColor={role.color} />
            )}
            <StatCell value={Math.max(0, followers)} label="Followers" roleColor={role.color} onClick={() => setModal("followers")} />
            <StatCell value={followingCount} label="Following" roleColor={role.color} onClick={() => setModal("following")} last />
          </div>
        </div>
      </div>

      {modal && (
        <FollowModal
          userId={profile.id}
          currentUserId={currentUserId}
          type={modal}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

function StatCell({ value, label, roleColor, onClick, last }: {
  value: number; label: string; roleColor: string;
  onClick?: () => void; last?: boolean;
}) {
  const inner = (
    <>
      <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", color: "var(--fg)", fontFamily: "var(--fh)", lineHeight: 1 }}>
        {value.toLocaleString("it-IT")}
      </span>
      <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: roleColor, opacity: 0.75, marginTop: 3 }}>
        {label}
      </span>
    </>
  );

  const style: React.CSSProperties = {
    flex: 1,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    padding: "14px 8px",
    gap: 2,
    ...(last ? {} : { borderRight: "1px solid var(--border)" }),
    ...(onClick ? { cursor: "pointer" } : {}),
  };

  return onClick
    ? <button type="button" style={style} onClick={onClick} className="hover:bg-black/3 transition-colors">{inner}</button>
    : <div style={style}>{inner}</div>;
}
