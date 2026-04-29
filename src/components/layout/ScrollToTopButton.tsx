"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() { setVisible(window.scrollY > 400); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Torna su"
      className="fixed right-4 z-40 w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition-all active:scale-90"
      style={{
        bottom: "88px",
        background: "color-mix(in srgb, var(--fg) 88%, transparent)",
        color: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        border: "1px solid color-mix(in srgb, var(--fg) 20%, transparent)",
      }}
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  );
}
