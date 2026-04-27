"use client";

import { useTransition } from "react";
import { adminDeleteComment } from "@/app/actions/admin";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Trash2 } from "lucide-react";

interface AdminComment {
  id: string;
  content: string;
  created_at: string;
  post_id: string;
  author: { username: string; display_name: string } | null;
}

export function AdminCommentsTable({ comments }: { comments: AdminComment[] }) {
  const [isPending, startTransition] = useTransition();

  function deleteComment(id: string) {
    if (!confirm("Rimuovere questo commento?")) return;
    startTransition(() => adminDeleteComment(id));
  }

  return (
    <div className="bg-white border border-black/6 rounded-2xl divide-y divide-black/4">
      {comments.length === 0 && (
        <p className="text-center text-black/30 py-12 text-sm">Nessun commento</p>
      )}
      {comments.map(c => (
        <div key={c.id} className="flex items-start gap-4 p-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-black/75 leading-relaxed">{c.content}</p>
            <p className="text-xs text-black/30 mt-1.5">
              @{c.author?.username ?? "—"} · {formatDate(c.created_at)} ·{" "}
              <Link href={`/post/${c.post_id}`} className="text-black/40 hover:text-black underline transition-colors" target="_blank">
                vai al post
              </Link>
            </p>
          </div>
          <button onClick={() => deleteComment(c.id)} disabled={isPending}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-black/25 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
