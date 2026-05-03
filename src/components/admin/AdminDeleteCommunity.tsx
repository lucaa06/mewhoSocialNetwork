"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";

export function AdminDeleteCommunity({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const res = await fetch(`/api/admin/community/${id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      const { error } = await res.json();
      toast.error(error ?? "Errore nell'eliminazione");
      return;
    }
    toast.success(`Community "${name}" eliminata`);
    setConfirm(false);
    router.refresh();
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-red-600 font-medium flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Sicuro?
        </span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-red-600 text-white disabled:opacity-40"
        >
          {loading ? "…" : "Sì"}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/5"
        >
          <X className="w-3 h-3 text-black/40" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-red-50"
      title="Elimina community"
    >
      <Trash2 className="w-3.5 h-3.5 text-red-400 hover:text-red-600" />
    </button>
  );
}
