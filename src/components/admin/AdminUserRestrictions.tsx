"use client";

import { useState } from "react";
import { toast } from "sonner";

interface Restrictions {
  can_comment: boolean;
  can_post: boolean;
  can_react: boolean;
  restriction_note: string | null;
}

const RESTRICTION_ITEMS: { key: keyof Pick<Restrictions, "can_comment" | "can_post" | "can_react">; label: string; description: string }[] = [
  { key: "can_comment", label: "Commenti",  description: "Può lasciare commenti" },
  { key: "can_post",    label: "Post",      description: "Può pubblicare post" },
  { key: "can_react",   label: "Reazioni",  description: "Può mettere like/react" },
];

export function AdminUserRestrictions({ userId, current }: {
  userId: string;
  current: Restrictions | null;
}) {
  const [state, setState] = useState<Restrictions>({
    can_comment:      current?.can_comment ?? true,
    can_post:         current?.can_post ?? true,
    can_react:        current?.can_react ?? true,
    restriction_note: current?.restriction_note ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState(current?.restriction_note ?? "");

  async function save() {
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}/restrictions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...state, restriction_note: note }),
    });
    setLoading(false);
    if (!res.ok) toast.error("Errore nel salvataggio");
    else toast.success("Restrizioni aggiornate");
  }

  const hasRestrictions = !state.can_comment || !state.can_post || !state.can_react;

  return (
    <div className="bg-white border border-black/6 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-semibold text-black/35 uppercase tracking-widest">Restrizioni account</p>
        {hasRestrictions && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(251,113,65,0.1)", color: "#FB7141" }}>
            Attive
          </span>
        )}
      </div>

      <div className="space-y-3 mb-4">
        {RESTRICTION_ITEMS.map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between py-2 border-b border-black/4 last:border-0">
            <div>
              <p className="text-sm font-medium text-black">{label}</p>
              <p className="text-xs text-black/40">{description}</p>
            </div>
            <Toggle
              checked={state[key]}
              onChange={v => setState(s => ({ ...s, [key]: v }))}
            />
          </div>
        ))}
      </div>

      <div className="mb-4">
        <label className="text-[11px] text-black/40 uppercase tracking-widest font-medium block mb-1.5">
          Nota restrizione (visibile all&apos;admin)
        </label>
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Es. Segnalato 3 volte, commenti disabilitati"
          className="w-full px-3 py-2 bg-black/3 border border-black/10 rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
          style={{ color: "var(--fg)" }}
        />
      </div>

      <button
        onClick={save}
        disabled={loading}
        className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40"
        style={{ background: "var(--accent)", color: "white" }}
      >
        {loading ? "Salvando..." : "Salva restrizioni"}
      </button>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative w-11 h-6 rounded-full transition-colors shrink-0"
      style={{ background: checked ? "#22c55e" : "rgba(0,0,0,0.15)" }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
        style={{ left: checked ? "calc(100% - 1.375rem)" : "0.125rem" }}
      />
    </button>
  );
}
