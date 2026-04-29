"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Profile } from "@/types/database";
import { getAvatarFallback } from "@/lib/utils";

interface MatchModalProps {
  profile: Profile;
  onClose: () => void;
}

export function MatchModal({ profile, onClose }: MatchModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => { setTimeout(() => setShow(true), 50); }, []);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: show ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--card)",
          borderRadius: 28,
          padding: "40px 32px",
          maxWidth: 340,
          width: "90%",
          textAlign: "center",
          transform: show ? "scale(1)" : "scale(0.8)",
          transition: "transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Animated hearts */}
        <div style={{ fontSize: 52, marginBottom: 16, animation: "pulse 0.6s ease infinite alternate" }}>
          🎉
        </div>

        <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--fg)", marginBottom: 4, fontFamily: "var(--fh)", letterSpacing: "-0.5px" }}>
          È un collegamento!
        </h2>
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24, lineHeight: 1.6 }}>
          Tu e <strong style={{ color: "var(--fg)" }}>{profile.display_name}</strong> vi siete collegati!
          Iniziate a parlarvi.
        </p>

        {/* Both avatars overlapping */}
        <div style={{ display: "flex", justifyContent: "center", gap: -20, marginBottom: 24 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "28%",
            border: "3px solid #FF4A24",
            background: "var(--surface)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(255,74,36,0.3)",
            zIndex: 2,
          }}>
            {profile.avatar_emoji
              ? <span style={{ fontSize: 34 }}>{profile.avatar_emoji}</span>
              : profile.avatar_url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={profile.avatar_url} alt={profile.display_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: 24, fontWeight: 800, color: "#FF4A24" }}>{getAvatarFallback(profile.display_name)}</span>
            }
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "12px 0", borderRadius: 14, fontSize: 14, fontWeight: 600,
              background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)",
              cursor: "pointer",
            }}
          >
            Continua
          </button>
          <Link
            href={`/messages`}
            onClick={onClose}
            style={{
              flex: 1, padding: "12px 0", borderRadius: 14, fontSize: 14, fontWeight: 700,
              background: "linear-gradient(135deg,#FF4A24,#C84FD0)",
              color: "white", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(255,74,36,0.35)",
            }}
          >
            Messaggi 💬
          </Link>
        </div>
      </div>
    </div>
  );
}
