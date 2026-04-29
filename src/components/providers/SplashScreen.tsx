"use client";

import { useEffect, useState } from "react";

export function SplashScreen() {
  const [phase, setPhase] = useState<"in" | "hold" | "out" | "gone">("in");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 300);
    const t2 = setTimeout(() => setPhase("out"),  1500);
    const t3 = setTimeout(() => setPhase("gone"), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#FFFCFA",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        opacity: phase === "out" ? 0 : 1,
        transition: "opacity 0.5s ease",
        pointerEvents: phase === "out" ? "none" : "auto",
      }}
    >
      {/* Logo mark */}
      <div style={{
        opacity: phase === "in" ? 0 : 1,
        transform: phase === "in" ? "scale(0.78)" : "scale(1)",
        transition: "opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logoNoText.svg"
          alt="me&who"
          style={{ width: 120, height: 74, display: "block" }}
        />
      </div>

      {/* Brand name */}
      <div style={{
        marginTop: 16,
        opacity: phase === "in" ? 0 : 1,
        transform: phase === "in" ? "translateY(8px)" : "translateY(0)",
        transition: "opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s",
        display: "flex",
        alignItems: "center",
        fontFamily: "var(--font-outfit, system-ui)",
        fontSize: 28,
        fontWeight: 800,
        letterSpacing: "-0.5px",
        color: "#180E09",
      }}>
        me
        <span style={{ fontFamily: "var(--font-playfair, Georgia)", fontStyle: "italic", fontWeight: 700, color: "#FF4A24" }}>
          &amp;
        </span>
        who
      </div>

      {/* Pulsing dots loader */}
      <div style={{ display: "flex", gap: 6, marginTop: 32, opacity: phase === "hold" ? 1 : 0, transition: "opacity 0.3s ease" }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: "50%", background: "#FF4A24",
            animation: "splashDot 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
            opacity: 0.35,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes splashDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.25; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
