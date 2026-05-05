"use client";

import { useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

const SECTIONS = ["/", "/community", "/notifications", "/messages", "/settings"];

function sectionIndex(pathname: string): number {
  for (let i = SECTIONS.length - 1; i >= 0; i--) {
    if (i === 0 ? pathname === "/" : pathname.startsWith(SECTIONS[i])) return i;
  }
  return -1;
}

export function SwipeNav({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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
    if (dx > dy && dx > 15) swiping.current = true;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (!swiping.current) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) < 70) return;

    const idx = sectionIndex(pathname);
    if (idx === -1) return; // not on a main section, don't navigate
    if (dx < 0 && idx < SECTIONS.length - 1) {
      router.push(SECTIONS[idx + 1]);
    } else if (dx > 0 && idx > 0) {
      router.push(SECTIONS[idx - 1]);
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
