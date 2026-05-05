"use client";

import { useEffect, useState } from "react";

type Phase = "in" | "logo" | "text" | "hold" | "out" | "gone";

export function SplashScreen() {
  const [phase, setPhase] = useState<Phase>("in");

  useEffect(() => {
    const t0 = setTimeout(() => setPhase("logo"),  80);
    const t1 = setTimeout(() => setPhase("text"),  380);
    const t2 = setTimeout(() => setPhase("hold"),  700);
    const t3 = setTimeout(() => setPhase("out"),  1800);
    const t4 = setTimeout(() => setPhase("gone"), 2350);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  if (phase === "gone") return null;

  const logoVisible  = phase !== "in";
  const textVisible  = phase !== "in" && phase !== "logo";
  const dotsVisible  = phase === "hold";
  const isExiting    = phase === "out";

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "#FAFAFA",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 0,
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? "scale(1.04)" : "scale(1)",
        transition: "opacity 0.45s ease, transform 0.45s ease",
        pointerEvents: isExiting ? "none" : "auto",
      }}
    >
      {/* Logo mark */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.svg"
        alt="me&who"
        style={{
          width: 100,
          height: 88,
          display: "block",
          opacity: logoVisible ? 1 : 0,
          transform: logoVisible ? "scale(1) rotate(0deg)" : "scale(0.5) rotate(-12deg)",
          transition: "opacity 0.4s cubic-bezier(.34,1.56,.64,1), transform 0.4s cubic-bezier(.34,1.56,.64,1)",
        }}
      />

      {/* Brand name */}
      <div
        style={{
          marginTop: 18,
          display: "flex", alignItems: "center",
          fontFamily: "var(--font-outfit, system-ui)",
          fontSize: 30, fontWeight: 800, letterSpacing: "-0.5px",
          color: "#1E386C",
          opacity: textVisible ? 1 : 0,
          transform: textVisible ? "translateY(0)" : "translateY(14px)",
          transition: "opacity 0.35s ease, transform 0.35s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        me
        <span style={{
          fontFamily: "var(--font-playfair, Georgia)",
          fontStyle: "italic", fontWeight: 700,
          color: "#FB7141",
          display: "inline-block",
          opacity: textVisible ? 1 : 0,
          transform: textVisible ? "rotate(0deg) scale(1)" : "rotate(-20deg) scale(0.6)",
          transition: "opacity 0.35s ease 0.07s, transform 0.4s cubic-bezier(.34,1.56,.64,1) 0.07s",
        }}>
          &amp;
        </span>
        who
      </div>

      {/* Pulsing dots */}
      <div style={{
        display: "flex", gap: 7, marginTop: 36,
        opacity: dotsVisible ? 1 : 0,
        transition: "opacity 0.25s ease",
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 7, height: 7, borderRadius: "50%",
            background: i === 1 ? "#1E386C" : "#FB7141",
            animation: "splashDot 1.1s ease-in-out infinite",
            animationDelay: `${i * 0.18}s`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes splashDot {
          0%, 80%, 100% { transform: scale(0.55); opacity: 0.3; }
          40% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
