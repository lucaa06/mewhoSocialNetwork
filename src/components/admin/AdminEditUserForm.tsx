"use client";

import { useState, useTransition } from "react";
import { adminEditProfile } from "@/app/actions/admin";
import { toast } from "sonner";
import { Pencil, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

const ROLES = [
  { value: "user",        label: "Maker"        },
  { value: "startupper",  label: "Startupper"   },
  { value: "researcher",  label: "Ricercatore"  },
  { value: "admin",       label: "Admin"        },
];

interface Props {
  profile: {
    id: string;
    display_name: string;
    username: string;
    bio: string | null;
    role: string;
  };
}

export function AdminEditUserForm({ profile }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    display_name: profile.display_name,
    username:     profile.username,
    bio:          profile.bio ?? "",
    role:         profile.role,
  });
  const [isPending, startTransition] = useTransition();

  function reset() {
    setForm({
      display_name: profile.display_name,
      username:     profile.username,
      bio:          profile.bio ?? "",
      role:         profile.role,
    });
    setEditing(false);
  }

  function save() {
    if (!form.display_name.trim() || !form.username.trim()) {
      toast.error("Nome e username sono obbligatori");
      return;
    }
    startTransition(async () => {
      await adminEditProfile(profile.id, form);
      toast.success("Profilo aggiornato");
      setEditing(false);
      router.refresh();
    });
  }

  if (!editing) {
    return (
      <div className="bg-white border border-black/6 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-semibold text-black/35 uppercase tracking-widest">Modifica profilo</p>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
            style={{ background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.6)" }}
          >
            <Pencil className="w-3 h-3" />
            Modifica
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["Nome visualizzato", profile.display_name],
            ["Username",          `@${profile.username}`],
            ["Ruolo",             ROLES.find(r => r.value === profile.role)?.label ?? profile.role],
            ["Bio",               profile.bio || "—"],
          ].map(([label, value]) => (
            <div key={label} className="bg-black/[0.02] rounded-xl px-3 py-2">
              <p className="text-[10px] text-black/35 uppercase tracking-widest font-medium mb-0.5">{label}</p>
              <p className="text-sm font-medium text-black truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[var(--accent)]/30 rounded-2xl p-5">
      <p className="text-[11px] font-semibold text-black/35 uppercase tracking-widest mb-4">Modifica profilo</p>

      <div className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label-xs mb-1 block">Nome visualizzato</label>
            <input
              value={form.display_name}
              onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
              className="w-full px-3 py-2.5 bg-black/3 border border-black/10 rounded-xl text-sm text-black focus:outline-none focus:border-[var(--accent)] transition-colors"
              placeholder="Nome visualizzato"
            />
          </div>
          <div>
            <label className="label-xs mb-1 block">Username</label>
            <input
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") }))}
              className="w-full px-3 py-2.5 bg-black/3 border border-black/10 rounded-xl text-sm text-black focus:outline-none focus:border-[var(--accent)] transition-colors font-mono"
              placeholder="username"
            />
          </div>
        </div>

        <div>
          <label className="label-xs mb-1 block">Ruolo</label>
          <select
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            className="w-full px-3 py-2.5 bg-black/3 border border-black/10 rounded-xl text-sm text-black focus:outline-none focus:border-[var(--accent)] transition-colors"
          >
            {ROLES.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-xs mb-1 block">Bio</label>
          <textarea
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2.5 bg-black/3 border border-black/10 rounded-xl text-sm text-black focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
            placeholder="Bio utente..."
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={save}
            disabled={isPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
            style={{ background: "#FB7141" }}
          >
            <Check className="w-3.5 h-3.5" />
            {isPending ? "Salvando..." : "Salva modifiche"}
          </button>
          <button
            onClick={reset}
            disabled={isPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.5)" }}
          >
            <X className="w-3.5 h-3.5" />
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
}
