"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function AdminReviewedToggle({ count, children }: { count: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white border border-black/6 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-black/[0.015] transition-colors"
      >
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-black">Già revisionate</p>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/8 text-black/50">{count}</span>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-black/30" />
          : <ChevronDown className="w-4 h-4 text-black/30" />
        }
      </button>

      {open && (
        <div className="border-t border-black/5 p-3 space-y-2 max-h-72 overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );
}
