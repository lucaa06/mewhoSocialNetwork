"use client";

import { useRef, useState } from "react";
import { MapPin, BadgeCheck, FlaskConical, X, Heart } from "lucide-react";
import { getAvatarFallback } from "@/lib/utils";
import type { Profile } from "@/types/database";

const ROLE: Record<string, { label: string; color: string; bg: string }> = {
  startupper: { label: "Startupper",  color: "#FB7141", bg: "rgba(251,113,65,0.12)"  },
  researcher: { label: "Ricercatore", color: "#6D41FF", bg: "rgba(109,65,255,0.12)" },
  user:       { label: "Maker",       color: "#D97706", bg: "rgba(217,119,6,0.12)"  },
  admin:      { label: "Admin",       color: "#374151", bg: "rgba(55,65,81,0.12)"   },
};

interface SwipeCardProps {
  profile: Profile;
  onConnect: () => void;
  onSkip: () => void;
  active: boolean;
}

export function SwipeCard({ profile, onConnect, onSkip, active }: SwipeCardProps) {
  const role = ROLE[profile.role] ?? ROLE.user;
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState(0);
  const [decision, setDecision] = useState<"connect" | "skip" | null>(null);
  const [exiting, setExiting] = useState(false);

  const threshold = 100;

  function onPointerDown(e: React.PointerEvent) {
    if (!active) return;
    startX.current = e.clientX;
    currentX.current = e.clientX;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging || !active) return;
    currentX.current = e.clientX;
    const dx = currentX.current - startX.current;
    setOffset(dx);
    if (dx > 40) setDecision("connect");
    else if (dx < -40) setDecision("skip");
    else setDecision(null);
  }

  function onPointerUp() {
    if (!dragging || !active) return;
    setDragging(false);
    const dx = currentX.current - startX.current;
    if (dx > threshold) { exit("connect"); }
    else if (dx < -threshold) { exit("skip"); }
    else { setOffset(0); setDecision(null); }
  }

  function exit(action: "connect" | "skip") {
    setExiting(true);
    setDecision(action);
    const target = action === "connect" ? 600 : -600;
    setOffset(target);
    setTimeout(() => {
      if (action === "connect") onConnect();
      else onSkip();
    }, 350);
  }

  const rotate = offset * 0.08;

  return (
    <div
      ref={cardRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        position: "absolute",
        inset: 0,
        transform: `translateX(${offset}px) rotate(${rotate}deg)`,
        transition: dragging ? "none" : exiting ? "transform 0.35s ease" : "transform 0.25s ease",
        cursor: active ? "grab" : "default",
        touchAction: "none",
        userSelect: "none",
      }}
    >
      {/* Card */}
      <div
        style={{
          height: "100%",
          borderRadius: 28,
          background: "var(--card)",
          boxShadow: "0 12px 48px rgba(0,0,0,0.14)",
          overflow: "hidden",
          position: "relative",
          border: decision === "connect"
            ? "2px solid #22c55e"
            : decision === "skip"
            ? "2px solid #ef4444"
            : "2px solid transparent",
          transition: "border-color 0.15s ease",
        }}
      >
        {/* Banner */}
        <div style={{
          height: 180,
          background: profile.banner_color ?? "linear-gradient(135deg,#FB7141,#1E386C)",
          position: "relative",
        }}>
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 20% 30%,rgba(255,255,255,0.18) 0%,transparent 55%)" }} />
          <div className="absolute top-3 right-3">
            <span style={{ background: "rgba(0,0,0,0.3)", color: "white", backdropFilter: "blur(8px)", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, letterSpacing: "0.05em" }}>
              {role.label}
            </span>
          </div>
        </div>

        {/* Avatar */}
        <div style={{
          position: "absolute",
          top: 140,
          left: 20,
          width: 80, height: 80,
          borderRadius: "28%",
          border: "4px solid var(--card)",
          background: "var(--card)",
          overflow: "hidden",
          boxShadow: `0 0 0 2px ${role.color}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {profile.avatar_emoji
            ? <span style={{ fontSize: 38, lineHeight: 1 }}>{profile.avatar_emoji}</span>
            : profile.avatar_url
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={profile.avatar_url} alt={profile.display_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ fontSize: 24, fontWeight: 800, color: role.color }}>{getAvatarFallback(profile.display_name)}</span>
          }
        </div>

        {/* Info */}
        <div style={{ padding: "52px 20px 20px" }}>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.4px", color: "var(--fg)", fontFamily: "var(--fh)" }}>
              {profile.display_name}
            </span>
            {profile.is_verified && <BadgeCheck className="w-5 h-5 shrink-0" style={{ color: role.color }} />}
            {profile.is_beta && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "linear-gradient(135deg,#1E386C,#FB7141)", color: "white" }}>
                <FlaskConical className="w-2.5 h-2.5" />Beta
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: "var(--subtle)", marginTop: 2 }}>@{profile.username}</p>

          {(profile.city || profile.country_code) && (
            <div className="flex items-center gap-1 mt-1.5">
              <MapPin className="w-3 h-3" style={{ color: "var(--subtle)" }} />
              <span style={{ fontSize: 12, color: "var(--subtle)" }}>
                {[profile.city, profile.country_code].filter(Boolean).join(", ")}
              </span>
            </div>
          )}

          {profile.bio && (
            <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 10, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {/* Decision overlays */}
      {decision === "connect" && (
        <div style={{
          position: "absolute", top: 20, left: 20,
          background: "#22c55e", color: "white",
          borderRadius: 12, padding: "6px 16px",
          fontSize: 16, fontWeight: 800, letterSpacing: "0.04em",
          transform: "rotate(-15deg)",
          boxShadow: "0 4px 16px rgba(34,197,94,0.4)",
        }}>
          COLLEGA ✓
        </div>
      )}
      {decision === "skip" && (
        <div style={{
          position: "absolute", top: 20, right: 20,
          background: "#ef4444", color: "white",
          borderRadius: 12, padding: "6px 16px",
          fontSize: 16, fontWeight: 800, letterSpacing: "0.04em",
          transform: "rotate(15deg)",
          boxShadow: "0 4px 16px rgba(239,68,68,0.4)",
        }}>
          SALTA ✗
        </div>
      )}

      {/* Action buttons */}
      {active && (
        <div style={{ position: "absolute", bottom: -70, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 24 }}>
          <button
            onClick={() => exit("skip")}
            style={{
              width: 56, height: 56, borderRadius: "28%",
              background: "var(--card)",
              border: "2px solid #ef4444",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              cursor: "pointer",
            }}
          >
            <X className="w-6 h-6" style={{ color: "#ef4444" }} />
          </button>
          <button
            onClick={() => exit("connect")}
            style={{
              width: 64, height: 64, borderRadius: "28%",
              background: "#FB7141",
              border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 20px rgba(251,113,65,0.40)",
              cursor: "pointer",
            }}
          >
            <Heart className="w-7 h-7" style={{ color: "white" }} fill="white" />
          </button>
        </div>
      )}
    </div>
  );
}
