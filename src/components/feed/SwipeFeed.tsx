"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

const TABS = ["all", "following", "community"] as const;
type TabKey = typeof TABS[number];

function tabHref(tab: TabKey): string {
  return tab === "all" ? "/" : `/?tab=${tab}`;
}

export function SwipeFeed({ currentTab, children }: {
  currentTab: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const swiping = useRef(false);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    swiping.current = false;
  }

  function onTouchMove(e: React.TouchEvent) {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    // Only treat as horizontal swipe if movement is primarily horizontal
    if (dx > dy && dx > 12) swiping.current = true;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (!swiping.current) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) < 60) return;

    const idx = TABS.indexOf(currentTab as TabKey);
    if (dx < 0 && idx < TABS.length - 1) {
      router.push(tabHref(TABS[idx + 1]));
    } else if (dx > 0 && idx > 0) {
      router.push(tabHref(TABS[idx - 1]));
    }
  }

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: "pan-y" }}
    >
      {children}
    </div>
  );
}
