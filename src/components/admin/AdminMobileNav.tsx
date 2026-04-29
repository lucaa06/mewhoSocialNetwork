"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AdminNavActive } from "./AdminNavActive";

export function AdminMobileNav({ displayName }: { displayName: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Apri menu"
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-black/10 bg-white text-black/60"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-[78%] max-w-[280px] bg-white flex flex-col shadow-2xl">
            <div className="px-4 py-4 border-b border-black/6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-black text-sm">
                    me<span style={{ color: "#FF4A24", fontStyle: "italic" }}>&amp;</span>who
                  </span>
                  <span className="text-[9px] border border-[#FF4A24]/30 text-[#FF4A24] px-1.5 py-0.5 rounded uppercase tracking-widest">admin</span>
                </div>
                <p className="text-[11px] text-black/35 mt-1 truncate">{displayName}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Chiudi menu"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-black/40 hover:bg-black/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
              <AdminNavActive />
            </nav>
            <div className="px-4 py-3 border-t border-black/6">
              <Link href="/" className="text-xs text-black/40 hover:text-black transition-colors">← Torna al sito</Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
