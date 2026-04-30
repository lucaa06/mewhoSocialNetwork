"use client";

import type { Profile } from "@/types/database";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { useState, useCallback } from "react";

type AdminUserRow = Pick<
  Profile,
  "id" | "username" | "display_name" | "avatar_url" | "role" | "country_code" | "is_verified" | "is_suspended" | "is_banned" | "created_at"
> & { email?: string };

const ROLE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  admin:      { bg: "rgba(55,65,81,0.1)",   color: "#374151", label: "Admin" },
  startupper: { bg: "rgba(255,74,36,0.1)",  color: "#FF4A24", label: "Startupper" },
  researcher: { bg: "rgba(109,65,255,0.1)", color: "#6D41FF", label: "Ricercatore" },
  user:       { bg: "rgba(217,119,6,0.1)",  color: "#D97706", label: "Maker" },
};

function CopyEmailCell({ email }: { email?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!email) return;
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [email]);

  if (!email) {
    return <span className="text-black/25">—</span>;
  }

  return (
    <button
      onClick={handleCopy}
      title="Copia email"
      className="text-xs text-black/40 hover:text-black/70 transition-colors flex items-center gap-1 cursor-pointer"
    >
      {copied ? (
        <span className="text-green-600 font-semibold">✓</span>
      ) : (
        <span className="truncate max-w-[180px]">{email}</span>
      )}
    </button>
  );
}

export function AdminUserTable({ users }: { users: AdminUserRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-black/6">
            <th className="px-4 py-3 text-[11px] font-semibold text-black/35 uppercase tracking-widest">Utente</th>
            <th className="px-4 py-3 text-[11px] font-semibold text-black/35 uppercase tracking-widest">Ruolo</th>
            <th className="px-4 py-3 text-[11px] font-semibold text-black/35 uppercase tracking-widest hidden sm:table-cell">Email</th>
            <th className="px-4 py-3 text-[11px] font-semibold text-black/35 uppercase tracking-widest hidden sm:table-cell">Paese</th>
            <th className="px-4 py-3 text-[11px] font-semibold text-black/35 uppercase tracking-widest">Stato</th>
            <th className="px-4 py-3 text-[11px] font-semibold text-black/35 uppercase tracking-widest hidden md:table-cell">Registrato</th>
            <th className="px-4 py-3 text-[11px] font-semibold text-black/35 uppercase tracking-widest">Azioni</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/4">
          {users.map((user) => {
            const role = ROLE_STYLE[user.role] ?? ROLE_STYLE.user;
            return (
              <tr key={user.id} className="hover:bg-black/[0.015] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-black">{user.display_name}</span>
                    {user.is_verified && <BadgeCheck className="w-3.5 h-3.5 shrink-0" style={{ color: "#FF4A24" }} />}
                  </div>
                  <span className="text-xs text-black/30">@{user.username}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: role.bg, color: role.color }}>
                    {role.label}
                  </span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <CopyEmailCell email={user.email} />
                </td>
                <td className="px-4 py-3 text-black/40 text-xs hidden sm:table-cell">{user.country_code ?? "—"}</td>
                <td className="px-4 py-3">
                  {user.is_banned ? (
                    <span className="text-[11px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">Bannato</span>
                  ) : user.is_suspended ? (
                    <span className="text-[11px] bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full">Sospeso</span>
                  ) : (
                    <span className="text-[11px] bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full">Attivo</span>
                  )}
                </td>
                <td className="px-4 py-3 text-black/30 text-xs whitespace-nowrap hidden md:table-cell">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${user.id}`}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors"
                    style={{ background: "rgba(221,65,50,0.08)", color: "#FF4A24" }}
                  >
                    Gestisci →
                  </Link>
                </td>
              </tr>
            );
          })}
          {users.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-black/25 text-sm">Nessun utente trovato</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
