"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

const THRESHOLD = 72;

export function PullToRefresh() {
  const router = useRouter();
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      if (window.scrollY > 0) return;
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }

    function onTouchMove(e: TouchEvent) {
      if (!pulling.current) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0) setPullY(Math.min(dy * 0.45, THRESHOLD + 20));
    }

    function onTouchEnd() {
      if (!pulling.current) return;
      pulling.current = false;
      if (pullY >= THRESHOLD) {
        setRefreshing(true);
        setPullY(THRESHOLD);
        router.refresh();
        setTimeout(() => { setRefreshing(false); setPullY(0); }, 900);
      } else {
        setPullY(0);
      }
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [pullY, router]);

  if (pullY === 0 && !refreshing) return null;

  const progress = Math.min(pullY / THRESHOLD, 1);
  const ready = pullY >= THRESHOLD;

  return (
    <div
      className="fixed top-14 left-0 right-0 z-40 flex justify-center pointer-events-none"
      style={{ transform: `translateY(${pullY - 8}px)`, transition: pulling.current ? "none" : "transform 0.3s ease, opacity 0.3s ease" }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shadow-md"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          opacity: Math.max(0.3, progress),
        }}
      >
        <RefreshCw
          className="w-4 h-4"
          style={{
            color: ready ? "#FB7141" : "var(--muted)",
            transform: `rotate(${progress * 180}deg)`,
            transition: "color 0.2s",
            animation: refreshing ? "spin 0.7s linear infinite" : "none",
          }}
        />
      </div>
    </div>
  );
}
