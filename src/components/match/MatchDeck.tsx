"use client";

import { useState, useEffect } from "react";
import { SwipeCard } from "./SwipeCard";
import { MatchModal } from "./MatchModal";
import type { Profile } from "@/types/database";
import { LogoIcon } from "@/components/ui/Logo";
import { Loader2 } from "lucide-react";

export function MatchDeck() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch("/api/connections")
      .then(r => r.json())
      .then(d => { setProfiles(d.profiles ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleAction(profile: Profile, action: "connect" | "skip") {
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_id: profile.id, action }),
      });
      const data = await res.json();
      if (data.matched) setMatchedProfile(profile);
    } catch { /* silent */ }
    setCurrent(v => v + 1);
  }

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--accent)" }} />
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Caricamento profili…</p>
      </div>
    );
  }

  const remaining = profiles.slice(current);

  if (remaining.length === 0) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: "0 24px", textAlign: "center" }}>
        <LogoIcon size={100} />
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg)", fontFamily: "var(--fh)", letterSpacing: "-0.4px", margin: 0 }}>
          Hai visto tutti!
        </h2>
        <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
          Torna più tardi — ogni giorno nuove persone si uniscono a me&amp;who.
        </p>
        <button
          onClick={() => { setLoading(true); setCurrent(0); fetch("/api/connections").then(r => r.json()).then(d => { setProfiles(d.profiles ?? []); setLoading(false); }); }}
          style={{
            padding: "12px 28px", borderRadius: 14, fontSize: 14, fontWeight: 700,
            background: "#FB7141", color: "white", border: "none", cursor: "pointer",
            boxShadow: "0 4px 16px rgba(251,113,65,0.35)",
          }}
        >
          Ricarica
        </button>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, position: "relative" }}>
      {/* Stack: render up to 3 cards behind */}
      {remaining.slice(0, 3).map((profile, idx) => (
        <div
          key={profile.id}
          style={{
            position: "absolute",
            inset: 0,
            bottom: 80,
            transform: idx === 0 ? "none" : `scale(${1 - idx * 0.04}) translateY(${idx * 10}px)`,
            zIndex: 10 - idx,
            transition: "transform 0.3s ease",
          }}
        >
          <SwipeCard
            profile={profile}
            active={idx === 0}
            onConnect={() => handleAction(profile, "connect")}
            onSkip={() => handleAction(profile, "skip")}
          />
        </div>
      ))}

      {matchedProfile && (
        <MatchModal profile={matchedProfile} onClose={() => setMatchedProfile(null)} />
      )}
    </div>
  );
}
