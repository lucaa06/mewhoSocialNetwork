"use client";

import type { Profile } from "@/types/database";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { BadgeCheck, Ban, UserX, ShieldAlert } from "lucide-react";

type AdminUserRow = Pick<
  Profile,
  "id" | "username" | "display_name" | "avatar_url" | "role" | "country_code" | "is_verified" | "is_suspended" | "is_banned" | "created_at"
>;

interface AdminUserTableProps {
  users: AdminUserRow[];
}

export function AdminUserTable({ users }: AdminUserTableProps) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left border-b border-gray-100">
          <th className="px-4 py-3 text-gray-500 font-medium">Utente</th>
          <th className="px-4 py-3 text-gray-500 font-medium">Ruolo</th>
          <th className="px-4 py-3 text-gray-500 font-medium">Paese</th>
          <th className="px-4 py-3 text-gray-500 font-medium">Stato</th>
          <th className="px-4 py-3 text-gray-500 font-medium">Registrato</th>
          <th className="px-4 py-3 text-gray-500 font-medium">Azioni</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {users.map((user) => (
          <tr key={user.id} className="hover:bg-gray-50">
            <td className="px-4 py-3">
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-gray-900">{user.display_name}</span>
                  {user.is_verified && <BadgeCheck className="w-3 h-3 text-brand-500" />}
                </div>
                <span className="text-xs text-gray-400">@{user.username}</span>
              </div>
            </td>
            <td className="px-4 py-3">
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                {user.role}
              </span>
            </td>
            <td className="px-4 py-3 text-gray-500">{user.country_code ?? "—"}</td>
            <td className="px-4 py-3">
              {user.is_banned ? (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Bannato</span>
              ) : user.is_suspended ? (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Sospeso</span>
              ) : (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Attivo</span>
              )}
            </td>
            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
              {formatDate(user.created_at)}
            </td>
            <td className="px-4 py-3">
              <Link
                href={`/admin/users/${user.id}`}
                className="text-xs text-brand-600 hover:underline"
              >
                Gestisci
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
