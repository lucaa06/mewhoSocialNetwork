"use client";

import { useState, useTransition } from "react";
import { adminEditPost, adminDeletePost } from "@/app/actions/admin";
import { formatDate } from "@/lib/utils";
import { Pencil, Trash2, X, Check, EyeOff } from "lucide-react";

interface AdminPost {
  id: string;
  title: string | null;
  content: string;
  is_hidden: boolean;
  created_at: string;
  reactions_count?: number;
  comments_count?: number;
  author: { username: string; display_name: string } | null;
}

export function AdminPostsTable({ posts }: { posts: AdminPost[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isPending, startTransition] = useTransition();

  function startEdit(post: AdminPost) {
    setEditing(post.id);
    setEditTitle(post.title ?? "");
    setEditContent(post.content);
  }

  function saveEdit(postId: string) {
    startTransition(async () => {
      await adminEditPost(postId, editTitle, editContent);
      setEditing(null);
    });
  }

  function deletePost(postId: string) {
    if (!confirm("Eliminare questo post?")) return;
    startTransition(() => adminDeletePost(postId));
  }

  return (
    <div className="bg-white border border-black/6 rounded-2xl divide-y divide-black/4">
      {posts.length === 0 && (
        <p className="text-center text-black/30 py-12 text-sm">Nessun post</p>
      )}
      {posts.map(post => (
        <div key={post.id} className="p-4">
          {editing === post.id ? (
            <div className="space-y-2">
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                placeholder="Titolo (opzionale)"
                className="w-full px-3 py-2 bg-black/3 border border-black/10 rounded-xl text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-[var(--accent)]"
              />
              <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-black/3 border border-black/10 rounded-xl text-sm text-black focus:outline-none focus:border-[var(--accent)] resize-none"
              />
              <div className="flex gap-2">
                <button onClick={() => saveEdit(post.id)} disabled={isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50">
                  <Check className="w-3.5 h-3.5" /> Salva
                </button>
                <button onClick={() => setEditing(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black/6 text-black/60 rounded-lg text-xs hover:bg-black/10 transition-colors">
                  <X className="w-3.5 h-3.5" /> Annulla
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {post.is_hidden && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded-full mb-1.5">
                    <EyeOff className="w-3 h-3" /> Nascosto
                  </span>
                )}
                {post.title && <h3 className="font-semibold text-black text-sm mb-0.5">{post.title}</h3>}
                <p className="text-sm text-black/50 line-clamp-2">{post.content}</p>
                <p className="text-xs text-black/25 mt-1.5">
                  @{post.author?.username ?? "—"} · {formatDate(post.created_at)}
                  {` · ♥ ${post.reactions_count ?? 0} · 💬 ${post.comments_count ?? 0}`}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => startEdit(post)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-black/25 hover:text-black hover:bg-black/5 transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deletePost(post.id)} disabled={isPending}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-black/25 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
