"use client";

import Link from "next/link";
import { Bot } from "lucide-react";
import { usePathname } from "next/navigation";

export function AiFloatingButton() {
  const pathname = usePathname();
  // Hide on messages pages
  if (pathname.startsWith("/messages") || pathname.startsWith("/admin")) return null;
  return (
    <Link href="/messages/ai"
      className="hidden sm:flex fixed bottom-24 right-4 z-40 w-12 h-12 rounded-2xl items-center justify-center shadow-[0_4px_20px_rgba(221,65,50,0.35)] transition-all hover:scale-105 active:scale-95"
      style={{ background: "#FF4A24" }}
      title="Chatta con who? AI"
    >
      <Bot className="w-5 h-5 text-white" strokeWidth={1.8} />
    </Link>
  );
}
