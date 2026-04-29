"use client";

import { useState, useTransition } from "react";
import { adminDeleteComment } from "@/app/actions/admin";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Trash2, X, Check } from "lucide-react";

interface AdminComment {
  id: string;
  content: string;
  created_at: string;
  post_id: string;
  author: { username: string; display_name: string } | null;
}

export function AdminCommentsTable({ comments }: { comments: AdminComment[] }) {
  const [isPending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  function confirmDelete(id: string) {
    setDeleting(id);
    setReason("");
  }

  function executeDelete(id: string) {
    if (!reason.trim()) return;
    startTransition(async () => {
      await adminDeleteComment(id, reason);
      setDeleting(null);
      setReason("");
    });
  }

  return (
    <div className="bg-white border border-black/6 rounded-2xl divide-y divide-black/4">
      {comments.length === 0 && (
        <p className="text-center text-black/30 py-12 text-sm">Nessun commento</p>
      )}
      {comments.map(c => (
        <div key={c.id} className="p-4">
          {deleting === c.id ? (
            <div className="space-y-2">
              <p className="text-xs text-black/50 line-clamp-2 italic">&ldquo;{c.content}&rdquo;</p>
              <input
                autoFocus
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Motivo eliminazione (obbligatorio)..."
                className="w-full px-3 py-2 bg-black/3 border border-black/10 rounded-xl text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-red-400 transition-colors"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => executeDelete(c.id)}
                  disabled={isPending || !reason.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-40"
                  style={{ background: "#dc2626" }}
                >
                  <Trash2 className="w-3 h-3" />
                  {isPending ? "..." : "Elimina"}
                </button>
                <button
                  onClick={() => setDeleting(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black/5 text-black/50 rounded-lg text-xs hover:bg-black/10 transition-colors"
                >
                  <X className="w-3 h-3" /> Annulla
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-black/75 leading-relaxed">{c.content}</p>
                <p className="text-xs text-black/30 mt-1.5">
                  @{c.author?.username ?? "—"} · {formatDate(c.created_at)} ·{" "}
                  <Link href={`/post/${c.post_id}`} className="text-black/40 hover:text-black underline transition-colors" target="_blank">
                    vai al post
                  </Link>
                </p>
              </div>
              <button
                onClick={() => confirmDelete(c.id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-black/25 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
