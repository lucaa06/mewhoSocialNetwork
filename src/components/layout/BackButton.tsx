"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export function BackButton({ href, label, className = "" }: BackButtonProps) {
  const router = useRouter();

  const cls = `inline-flex items-center gap-1.5 text-sm font-medium px-2 py-1.5 rounded-xl transition-all hover:bg-black/6 active:scale-95 ${className}`;
  const style = { color: "var(--muted)" };
  const inner = (
    <>
      <ArrowLeft className="w-4 h-4 shrink-0" />
      <span>{label ?? "Indietro"}</span>
    </>
  );

  if (href) {
    return <Link href={href} className={cls} style={style}>{inner}</Link>;
  }
  return (
    <button type="button" onClick={() => router.back()} className={cls} style={style}>
      {inner}
    </button>
  );
}
