"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useRef } from "react";

export function AdminUserFilters({ q, role, suspended }: { q?: string; role?: string; suspended?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { q, role, suspended, ...overrides };
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v); });
    const qs = params.toString();
    return qs ? `/admin/users?${qs}` : "/admin/users";
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    router.push(buildUrl({
      q: fd.get("q") as string || undefined,
      role: fd.get("role") as string || undefined,
      suspended: fd.get("suspended") as string || undefined,
    }));
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex gap-2 flex-wrap">
      <div className="flex flex-1 min-w-48 items-center gap-2 bg-white border border-black/10 rounded-xl px-3 py-2 focus-within:border-[var(--accent)] transition-colors">
        <Search className="w-4 h-4 text-black/25 shrink-0" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Cerca per username o nome..."
          className="flex-1 bg-transparent text-sm text-black placeholder:text-black/30 focus:outline-none"
        />
      </div>
      <select
        name="role"
        defaultValue={role ?? ""}
        onChange={() => formRef.current?.requestSubmit()}
        className="px-3 py-2 bg-white border border-black/10 rounded-xl text-sm text-black focus:outline-none focus:border-[var(--accent)]"
      >
        <option value="">Tutti i ruoli</option>
        <option value="user">Maker</option>
        <option value="startupper">Startupper</option>
        <option value="researcher">Ricercatore</option>
        <option value="admin">Admin</option>
      </select>
      <select
        name="suspended"
        defaultValue={suspended ?? ""}
        onChange={() => formRef.current?.requestSubmit()}
        className="px-3 py-2 bg-white border border-black/10 rounded-xl text-sm text-black focus:outline-none focus:border-[var(--accent)]"
      >
        <option value="">Tutti</option>
        <option value="1">Sospesi</option>
      </select>
      <button type="submit"
        className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-black/80 transition-colors">
        Cerca
      </button>
    </form>
  );
}
