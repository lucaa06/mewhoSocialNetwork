"use client";
import { ArrowLeft } from "lucide-react";

export function BackButton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <button
      onClick={() => window.history.back()}
      className={className}
      style={style}
    >
      <ArrowLeft strokeWidth={2} style={{ width: 16, height: 16 }} />
      Indietro
    </button>
  );
}
